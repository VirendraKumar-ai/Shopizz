import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  orders,
  orderItems,
  orderStatusHistory,
} from '~~/db/schema'

const VALID_TRANSITIONS: Record<string, string[]> = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
}

const DEFAULT_MESSAGES: Record<string, string> = {
  CONFIRMED: 'Order confirmed by shop owner.',
  PROCESSING: 'Piece is currently in crafting and packaging.',
  SHIPPED: 'Package dispatched and in transit with logistics carrier.',
  OUT_FOR_DELIVERY: 'Shipment is out for delivery today.',
  DELIVERED: 'Order successfully delivered to customer.',
  CANCELLED: 'Order cancelled by shop owner.',
}

export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)
  const orderId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID is required',
    })
  }

  const { nextStatus, message, carrierName, trackingNumber, trackingUrl } = body

  if (!nextStatus) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Next status is required',
    })
  }

  // 1. Verify order exists
  const existingOrder = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  })

  if (!existingOrder) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found',
    })
  }

  // 2. Verify owner has items in this order
  const ownerItem = await db.query.orderItems.findFirst({
    where: and(eq(orderItems.orderId, orderId), eq(orderItems.ownerId, user.id)),
  })

  if (!ownerItem) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You are not authorized to manage this order',
    })
  }

  // 3. Validate state machine transition
  const currentStatus = existingOrder.status
  const allowedNext = VALID_TRANSITIONS[currentStatus] || []

  if (!allowedNext.includes(nextStatus)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid status transition: Cannot change from ${currentStatus} to ${nextStatus}. Allowed transitions: ${allowedNext.join(', ') || 'None (Terminal state)'}`,
    })
  }

  // 4. Format status message with tracking details if shipped
  let statusMessage = message ? String(message).trim() : (DEFAULT_MESSAGES[nextStatus] || `Status changed to ${nextStatus}`)
  if (nextStatus === 'SHIPPED' && (carrierName || trackingNumber)) {
    const carrier = carrierName || 'Logistics Carrier'
    const trk = trackingNumber ? ` (AWB: ${trackingNumber})` : ''
    statusMessage = `Dispatched with ${carrier}${trk}. In transit to destination.`
  }

  // 5. Update order status and notes
  const updatePayload: any = {
    status: nextStatus as any,
    updatedAt: new Date(),
  }

  if (nextStatus === 'SHIPPED' && trackingNumber) {
    updatePayload.notes = `Carrier: ${carrierName || 'Standard'} | Tracking: ${trackingNumber}${trackingUrl ? ` | URL: ${trackingUrl}` : ''}`
  }

  const [updatedOrder] = await db
    .update(orders)
    .set(updatePayload)
    .where(eq(orders.id, orderId))
    .returning()

  // 6. Insert order status history entry
  await db.insert(orderStatusHistory).values({
    orderId,
    status: nextStatus,
    message: statusMessage,
    updatedBy: user.id,
  })

  // 7. Notify buyer
  try {
    const { createNotification } = await import('~~/server/utils/notifications')
    await createNotification({
      userId: existingOrder.buyerId,
      role: 'BUYER',
      type: `ORDER_${nextStatus}` as any,
      title: `Order #${existingOrder.orderNumber} ${nextStatus === 'SHIPPED' ? 'Shipped 🚚' : nextStatus === 'DELIVERED' ? 'Delivered 🎉' : 'Update'}`,
      message: statusMessage,
      link: `/account/orders/${existingOrder.id}`,
    })
  } catch (err) {
    console.error('Failed to notify buyer:', err)
  }

  return {
    success: true,
    order: updatedOrder,
    status: nextStatus,
    message: statusMessage,
  }
})
