import { and, asc, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  orders,
  orderItems,
  orderStatusHistory,
  products,
  productImages,
  users,
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)
  const orderId = getRouterParam(event, 'id')

  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID is required',
    })
  }

  // 1. Fetch order details
  const existingOrder = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  })

  if (!existingOrder) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found',
    })
  }

  // 2. Fetch owner's line items in this order
  const itemsRows = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      ownerId: orderItems.ownerId,
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
    .leftJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(productImages, eq(products.id, productImages.productId))
    .where(and(eq(orderItems.orderId, orderId), eq(orderItems.ownerId, user.id)))

  if (itemsRows.length === 0) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You do not have any items in this order',
    })
  }

  // 3. Fetch buyer info
  const buyer = await db.query.users.findFirst({
    where: eq(users.id, existingOrder.buyerId),
  })

  // 4. Fetch status history
  const history = await db
    .select({
      id: orderStatusHistory.id,
      status: orderStatusHistory.status,
      message: orderStatusHistory.message,
      updatedBy: orderStatusHistory.updatedBy,
      createdAt: orderStatusHistory.createdAt,
    })
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, orderId))
    .orderBy(asc(orderStatusHistory.createdAt))

  const ownerSubtotal = itemsRows.reduce((sum, item) => sum + item.totalPrice, 0)

  return {
    success: true,
    order: {
      id: existingOrder.id,
      orderNumber: existingOrder.orderNumber,
      status: existingOrder.status,
      subtotal: existingOrder.subtotal,
      shippingFee: existingOrder.shippingFee,
      totalAmount: existingOrder.totalAmount,
      ownerSubtotal,
      shippingName: existingOrder.shippingName,
      shippingPhone: existingOrder.shippingPhone,
      shippingAddress: existingOrder.shippingAddress,
      shippingCity: existingOrder.shippingCity,
      shippingState: existingOrder.shippingState,
      shippingPostalCode: existingOrder.shippingPostalCode,
      shippingCountry: existingOrder.shippingCountry,
      paymentStatus: existingOrder.paymentStatus,
      paymentMethod: existingOrder.paymentMethod,
      notes: existingOrder.notes,
      createdAt: existingOrder.createdAt,
      updatedAt: existingOrder.updatedAt,
      buyer: {
        name: buyer?.name || existingOrder.shippingName,
        email: buyer?.email || '',
      },
      items: itemsRows.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName || item.liveProductName,
        productSku: item.productSku,
        productSlug: item.liveProductSlug,
        productImage: item.productImageUrl || item.liveProductImage,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      history,
    },
  }
})
