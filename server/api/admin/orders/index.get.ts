import { desc, eq, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  orders,
  orderItems,
  products,
  users,
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  // 1. Fetch all orders with buyer and item count
  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      buyerId: orders.buyerId,
      buyerName: users.name,
      buyerEmail: users.email,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      paymentMethod: orders.paymentMethod,
      subtotal: orders.subtotal,
      shippingFee: orders.shippingFee,
      totalAmount: orders.totalAmount,
      shippingName: orders.shippingName,
      shippingCity: orders.shippingCity,
      shippingState: orders.shippingState,
      createdAt: orders.createdAt,

      itemId: orderItems.id,
      productName: orderItems.productName,
      quantity: orderItems.quantity,
      ownerId: orderItems.ownerId,
    })
    .from(orders)
    .leftJoin(users, eq(orders.buyerId, users.id))
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .orderBy(desc(orders.createdAt))

  const orderMap = new Map<string, any>()

  for (const r of rows) {
    if (!orderMap.has(r.id)) {
      orderMap.set(r.id, {
        id: r.id,
        orderNumber: r.orderNumber,
        buyerId: r.buyerId,
        buyerName: r.buyerName || r.shippingName,
        buyerEmail: r.buyerEmail || '',
        status: r.status,
        paymentStatus: r.paymentStatus,
        paymentMethod: r.paymentMethod,
        subtotal: r.subtotal,
        shippingFee: r.shippingFee,
        totalAmount: r.totalAmount,
        shippingName: r.shippingName,
        shippingCity: r.shippingCity,
        shippingState: r.shippingState,
        createdAt: r.createdAt,
        totalItemsCount: 0,
        itemsSummary: [],
      })
    }

    if (r.itemId) {
      const order = orderMap.get(r.id)
      order.totalItemsCount += r.quantity || 1
      if (!order.itemsSummary.includes(r.productName)) {
        order.itemsSummary.push(r.productName)
      }
    }
  }

  const allOrders = Array.from(orderMap.values())

  // Calculate metrics
  const totalOrders = allOrders.length
  const placedCount = allOrders.filter((o) => o.status === 'PLACED').length
  const processingCount = allOrders.filter((o) => ['CONFIRMED', 'PROCESSING'].includes(o.status)).length
  const shippedCount = allOrders.filter((o) => ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status)).length
  const deliveredCount = allOrders.filter((o) => o.status === 'DELIVERED').length
  const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)

  return {
    success: true,
    orders: allOrders,
    metrics: {
      totalOrders,
      placedCount,
      processingCount,
      shippedCount,
      deliveredCount,
      totalRevenue,
    },
  }
})
