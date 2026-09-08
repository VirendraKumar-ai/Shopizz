import { desc, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  orders,
  orderItems,
  products,
  productImages,
  users,
  returnRequests,
} from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      subtotal: orders.subtotal,
      shippingFee: orders.shippingFee,
      totalAmount: orders.totalAmount,
      shippingName: orders.shippingName,
      shippingCity: orders.shippingCity,
      shippingState: orders.shippingState,
      paymentStatus: orders.paymentStatus,
      paymentMethod: orders.paymentMethod,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,

      itemId: orderItems.id,
      productId: orderItems.productId,
      productSku: orderItems.productSku,
      productName: products.name,
      productSlug: products.slug,
      productImage: productImages.url,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      totalPrice: orderItems.totalPrice,
      ownerId: orderItems.ownerId,
      ownerName: users.name,

      returnId: returnRequests.id,
      returnStatus: returnRequests.status,
      returnNumber: returnRequests.returnNumber,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(productImages, eq(products.id, productImages.productId))
    .leftJoin(users, eq(orderItems.ownerId, users.id))
    .leftJoin(returnRequests, eq(orderItems.id, returnRequests.orderItemId))
    .where(eq(orders.buyerId, user.id))
    .orderBy(desc(orders.createdAt))

  const orderMap = new Map<string, any>()

  for (const r of rows) {
    if (!orderMap.has(r.id)) {
      const orderDate = new Date(r.updatedAt || r.createdAt)
      const daysSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
      const isDelivered = r.status === 'DELIVERED'
      const isOrderEligible = isDelivered && daysSinceOrder <= 7

      const eligibleUntilDate = new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      const eligibleUntilFormatted = new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(eligibleUntilDate)

      orderMap.set(r.id, {
        id: r.id,
        orderNumber: r.orderNumber,
        status: r.status,
        subtotal: r.subtotal,
        shippingFee: r.shippingFee,
        totalAmount: r.totalAmount,
        shippingName: r.shippingName,
        shippingCity: r.shippingCity,
        shippingState: r.shippingState,
        paymentStatus: r.paymentStatus,
        paymentMethod: r.paymentMethod,
        createdAt: r.createdAt,
        isEligible: isOrderEligible,
        eligibleUntil: eligibleUntilFormatted,
        items: [],
      })
    }

    if (r.itemId) {
      const order = orderMap.get(r.id)
      const existing = order.items.find((i: any) => i.id === r.itemId)
      if (!existing) {
        const hasActiveReturn = r.returnStatus && r.returnStatus !== 'REJECTED'
        const isItemEligible = order.isEligible && !hasActiveReturn

        order.items.push({
          id: r.itemId,
          productId: r.productId,
          productName: r.productName || 'Artisan Creation',
          productSku: r.productSku,
          productSlug: r.productSlug,
          imageUrl: r.productImage || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300&q=80',
          shopName: r.ownerName || 'The Studio',
          variant: r.productSku ? `SKU: ${r.productSku}` : 'Standard Edition',
          quantity: r.quantity,
          unitPrice: r.unitPrice,
          price: r.totalPrice,
          totalPrice: r.totalPrice,
          isEligible: isItemEligible,
          eligibleUntil: order.eligibleUntil,
          returnStatus: r.returnStatus || null,
          returnNumber: r.returnNumber || null,
        })
      }
    }
  }

  return {
    success: true,
    orders: Array.from(orderMap.values()),
  }
})
