import { and, eq, ne } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  orders,
  orderItems,
  returnRequests,
  users,
} from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'
import { createNotification } from '~~/server/utils/notifications'
import { sendReturnRequestedEmail } from '~~/server/utils/mailer'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const orderId = getRouterParam(event, 'id')

  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID is required',
    })
  }

  const body = await readBody(event)
  const {
    orderItemId,
    reason,
    reasonDetails,
    images = [],
    payoutDetails = {},
  } = body

  if (!reason) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Return reason is required',
    })
  }

  const validReasons = [
    'DEFECTIVE_DAMAGED',
    'SIZE_FIT_ISSUE',
    'NOT_AS_DESCRIBED',
    'CHANGED_MIND',
    'LATE_DELIVERY',
    'OTHER',
  ]
  let normalizedReason = reason
  if (reason === 'DIDNT_FIT') normalizedReason = 'SIZE_FIT_ISSUE'
  else if (reason === 'WRONG_ITEM' || reason === 'QUALITY_ISSUE') normalizedReason = 'NOT_AS_DESCRIBED'
  else if (!validReasons.includes(reason)) normalizedReason = 'OTHER'

  // 1. Fetch Order and verify ownership
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found',
    })
  }

  if (order.buyerId !== user.id && user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'You are not authorized to request return for this order',
    })
  }

  // Order must be DELIVERED to request a return
  if (order.status !== 'DELIVERED') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Returns can only be requested for delivered orders',
    })
  }

  // Check 7-day return eligibility window
  const orderDate = new Date(order.updatedAt || order.createdAt)
  const daysSinceDelivery = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceDelivery > 7) {
    throw createError({
      statusCode: 400,
      statusMessage: 'The 7-day return window for this order has expired',
    })
  }

  // 2. Check if an active return request already exists
  const existingReturns = await db
    .select()
    .from(returnRequests)
    .where(
      and(
        eq(returnRequests.orderId, orderId),
        ne(returnRequests.status, 'REJECTED')
      )
    )

  if (existingReturns.length > 0) {
    if (orderItemId) {
      const itemExisting = existingReturns.find(r => r.orderItemId === orderItemId)
      if (itemExisting) {
        throw createError({
          statusCode: 400,
          statusMessage: 'An active return request already exists for this item',
        })
      }
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'An active return request already exists for this order',
      })
    }
  }

  // 3. Fetch item or order items to determine ownerId and refund amount
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))

  if (items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No items found in this order',
    })
  }

  let selectedItem = null
  let refundAmount = order.totalAmount
  let ownerId = items[0].ownerId

  if (orderItemId) {
    selectedItem = items.find(i => i.id === orderItemId)
    if (!selectedItem) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Order item not found in this order',
      })
    }
    refundAmount = selectedItem.totalPrice
    ownerId = selectedItem.ownerId
  }

  // 4. Generate unique return number
  const returnNumber = `RET-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  // 5. Insert return request
  const [createdReturn] = await db
    .insert(returnRequests)
    .values({
      returnNumber,
      orderId,
      orderItemId: orderItemId || null,
      buyerId: order.buyerId,
      ownerId,
      reason: normalizedReason as any,
      reasonDetails: reasonDetails || '',
      images: Array.isArray(images) ? images : [],
      refundAmount,
      payoutDetails: payoutDetails || {},
      status: 'REQUESTED',
    })
    .returning()

  // 6. Notifications & Mailer
  try {
    // Notify Owner
    await createNotification({
      userId: ownerId,
      role: 'OWNER',
      type: 'RETURN_REQUESTED',
      title: 'New Return Request',
      message: `Return request #${returnNumber} submitted for Order #${order.orderNumber}.`,
      link: '/owner/returns',
    })

    // Notify Admin
    await createNotification({
      role: 'ADMIN',
      type: 'RETURN_REQUESTED',
      title: 'Return Request Created',
      message: `Return #${returnNumber} initiated for Order #${order.orderNumber}.`,
      link: '/admin/returns',
    })

    // Notify Buyer via email
    const [buyerUser] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, order.buyerId))
      .limit(1)

    if (buyerUser?.email) {
      const reasonLabel = reason.replace(/_/g, ' ')
      const refundAmountRupees = Math.round(refundAmount / 100)
      await sendReturnRequestedEmail(
        buyerUser.email,
        buyerUser.name || 'Valued Collector',
        returnNumber,
        order.orderNumber,
        reasonLabel,
        refundAmountRupees
      )
    }
  } catch (err) {
    console.error('[Return Request Notification Error]:', err)
  }

  return {
    success: true,
    returnRequest: createdReturn,
  }
})
