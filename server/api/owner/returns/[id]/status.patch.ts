import { eq, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  returnRequests,
  orders,
  orderItems,
  orderStatusHistory,
  inventory,
  users,
} from '~~/db/schema'
import { requireOwner } from '~~/server/utils/auth'
import { createNotification } from '~~/server/utils/notifications'
import {
  sendReturnApprovedEmail,
  sendRefundProcessedEmail,
  sendReturnRejectedEmail,
} from '~~/server/utils/mailer'

export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)
  const returnId = getRouterParam(event, 'id')

  if (!returnId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Return ID is required',
    })
  }

  const body = await readBody(event)
  const { status, sellerNotes, rejectionReason, refundTransactionId } = body

  if (!status || !['APPROVED', 'ITEM_RECEIVED', 'REFUNDED', 'REJECTED'].includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid status provided',
    })
  }

  if (status === 'REJECTED' && !rejectionReason) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Rejection reason is required when rejecting a return',
    })
  }

  // 1. Fetch return request
  const [returnReq] = await db
    .select()
    .from(returnRequests)
    .where(eq(returnRequests.id, returnId))
    .limit(1)

  if (!returnReq) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Return request not found',
    })
  }

  if (returnReq.ownerId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You are not authorized to update this return request',
    })
  }

  // 2. Fetch associated order & buyer
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, returnReq.orderId))
    .limit(1)

  const [buyer] = await db
    .select()
    .from(users)
    .where(eq(users.id, returnReq.buyerId))
    .limit(1)

  // 3. Prepare updates
  const updateData: Record<string, any> = {
    status,
    updatedAt: new Date(),
  }

  if (sellerNotes !== undefined) {
    updateData.sellerNotes = sellerNotes
  }

  if (status === 'APPROVED') {
    updateData.approvedAt = new Date()
  } else if (status === 'ITEM_RECEIVED') {
    updateData.receivedAt = new Date()
  } else if (status === 'REFUNDED') {
    updateData.refundedAt = new Date()
    const finalTxnId = refundTransactionId || `TXN-REF-${Date.now().toString(36).toUpperCase()}`
    updateData.refundTransactionId = finalTxnId

    // Mark order status and payment as REFUNDED if full order or latest
    await db
      .update(orders)
      .set({
        status: 'REFUNDED',
        paymentStatus: 'REFUNDED',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, returnReq.orderId))

    // Record order status history
    await db.insert(orderStatusHistory).values({
      orderId: returnReq.orderId,
      status: 'REFUNDED',
      message: `Return #${returnReq.returnNumber} refunded (₹${(returnReq.refundAmount / 100).toFixed(2)}). Reference: ${finalTxnId}`,
      updatedBy: user.id,
    })

    // Restock Inventory
    try {
      if (returnReq.orderItemId) {
        const [item] = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.id, returnReq.orderItemId))
          .limit(1)

        if (item) {
          await db
            .update(inventory)
            .set({
              quantity: sql`${inventory.quantity} + ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(eq(inventory.productId, item.productId))
        }
      } else {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, returnReq.orderId))

        for (const item of items) {
          await db
            .update(inventory)
            .set({
              quantity: sql`${inventory.quantity} + ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(eq(inventory.productId, item.productId))
        }
      }
    } catch (err) {
      console.error('[Inventory Restock Error]:', err)
    }
  } else if (status === 'REJECTED') {
    updateData.rejectedAt = new Date()
    updateData.rejectionReason = rejectionReason
  }

  // 4. Update return request in DB
  const [updatedReturn] = await db
    .update(returnRequests)
    .set(updateData)
    .where(eq(returnRequests.id, returnId))
    .returning()

  // 5. Trigger Notifications & Emails
  try {
    const buyerEmail = buyer?.email
    const buyerName = buyer?.name || order?.shippingName || 'Valued Collector'
    const orderNumber = order?.orderNumber || 'N/A'

    if (status === 'APPROVED') {
      await createNotification({
        userId: returnReq.buyerId,
        role: 'BUYER',
        type: 'RETURN_APPROVED',
        title: 'Return Request Approved',
        message: `Your return request #${returnReq.returnNumber} for Order #${orderNumber} has been approved. Pickup instructions have been sent.`,
        link: `/account/orders/${returnReq.orderId}`,
      })

      if (buyerEmail) {
        await sendReturnApprovedEmail(
          buyerEmail,
          buyerName,
          returnReq.returnNumber,
          orderNumber,
          sellerNotes || 'Please ensure original tags & packaging are intact. Courier pickup will be scheduled.'
        )
      }
    } else if (status === 'ITEM_RECEIVED') {
      await createNotification({
        userId: returnReq.buyerId,
        role: 'BUYER',
        type: 'RETURN_ITEM_RECEIVED',
        title: 'Returned Item Received',
        message: `The studio maker has received the returned piece for Return #${returnReq.returnNumber} and is verifying quality inspection.`,
        link: `/account/orders/${returnReq.orderId}`,
      })
    } else if (status === 'REFUNDED') {
      const refundAmountRupees = Math.round(returnReq.refundAmount / 100)
      await createNotification({
        userId: returnReq.buyerId,
        role: 'BUYER',
        type: 'REFUND_PROCESSED',
        title: 'Refund Successfully Processed',
        message: `₹${refundAmountRupees.toLocaleString('en-IN')} has been refunded for Return #${returnReq.returnNumber}.`,
        link: `/account/orders/${returnReq.orderId}`,
      })

      if (buyerEmail) {
        await sendRefundProcessedEmail(
          buyerEmail,
          buyerName,
          returnReq.returnNumber,
          orderNumber,
          refundAmountRupees,
          updateData.refundTransactionId
        )
      }
    } else if (status === 'REJECTED') {
      await createNotification({
        userId: returnReq.buyerId,
        role: 'BUYER',
        type: 'RETURN_REJECTED',
        title: 'Return Request Not Approved',
        message: `Return request #${returnReq.returnNumber} could not be approved. Reason: ${rejectionReason}`,
        link: `/account/orders/${returnReq.orderId}`,
      })

      if (buyerEmail) {
        await sendReturnRejectedEmail(
          buyerEmail,
          buyerName,
          returnReq.returnNumber,
          orderNumber,
          rejectionReason
        )
      }
    }
  } catch (err) {
    console.error('[Return Status Update Notification Error]:', err)
  }

  return {
    success: true,
    returnRequest: updatedReturn,
  }
})
