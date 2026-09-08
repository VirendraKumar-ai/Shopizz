import { desc, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  orders,
  orderItems,
  products,
  productImages,
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)

  const rows = await db
    .select({
      orderItemId: orderItems.id,
      orderId: orderItems.orderId,
      orderNumber: orders.orderNumber,
      orderStatus: orders.status,
      paymentStatus: orders.paymentStatus,
      paymentMethod: orders.paymentMethod,
      createdAt: orders.createdAt,
      customerName: orders.shippingName,
      customerPhone: orders.shippingPhone,
      customerCity: orders.shippingCity,
      customerState: orders.shippingState,
      customerAddress: orders.shippingAddress,
      customerPostalCode: orders.shippingPostalCode,

      productId: orderItems.productId,
      productName: orderItems.productName,
      productSku: orderItems.productSku,
      productImageUrl: orderItems.productImageUrl,
      liveProductName: products.name,
      liveProductSlug: products.slug,
      liveProductImage: productImages.url,

      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      totalPrice: orderItems.totalPrice,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(productImages, eq(products.id, productImages.productId))
    .where(eq(orderItems.ownerId, user.id))
    .orderBy(desc(orders.createdAt))

  const orderMap = new Map<string, any>()

  for (const r of rows) {
    if (!orderMap.has(r.orderId)) {
      orderMap.set(r.orderId, {
        id: r.orderId,
        orderNumber: r.orderNumber,
        status: r.orderStatus,
        paymentStatus: r.paymentStatus,
        paymentMethod: r.paymentMethod,
        createdAt: r.createdAt,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        customerCity: r.customerCity,
        customerState: r.customerState,
        customerAddress: r.customerAddress,
        customerPostalCode: r.customerPostalCode,
        ownerSubtotal: 0,
        items: [],
      })
    }

    const order = orderMap.get(r.orderId)
    const existing = order.items.find((i: any) => i.id === r.orderItemId)
    if (!existing) {
      order.ownerSubtotal += r.totalPrice
      order.items.push({
        id: r.orderItemId,
        productId: r.productId,
        productName: r.productName || r.liveProductName,
        productSku: r.productSku,
        productSlug: r.liveProductSlug,
        productImage: r.productImageUrl || r.liveProductImage,
        quantity: r.quantity,
        unitPrice: r.unitPrice,
        totalPrice: r.totalPrice,
      })
    }
  }

  return {
    success: true,
    orders: Array.from(orderMap.values()),
  }
})
