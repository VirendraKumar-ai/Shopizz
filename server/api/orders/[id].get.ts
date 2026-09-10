import { asc, eq } from 'drizzle-orm'
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
  const user = await requireAuth(event)
  const orderId = getRouterParam(event, 'id')

  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID is required',
    })
  }

  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      buyerId: orders.buyerId,
      status: orders.status,
      subtotal: orders.subtotal,
      shippingFee: orders.shippingFee,
      taxAmount: orders.taxAmount,
      discountAmount: orders.discountAmount,
      totalAmount: orders.totalAmount,
      shippingName: orders.shippingName,
      shippingPhone: orders.shippingPhone,
      shippingAddress: orders.shippingAddress,
      shippingCity: orders.shippingCity,
      shippingState: orders.shippingState,
      shippingPostalCode: orders.shippingPostalCode,
      shippingCountry: orders.shippingCountry,
      paymentStatus: orders.paymentStatus,
      paymentMethod: orders.paymentMethod,
      notes: orders.notes,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,

      itemId: orderItems.id,
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
      ownerName: users.name,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(productImages, eq(products.id, productImages.productId))
    .leftJoin(users, eq(orderItems.ownerId, users.id))
    .where(eq(orders.id, orderId))

  if (rows.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found',
    })
  }

  const first = rows[0]
  if (!first) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found',
    })
  }

  // Security check: Only buyer, admin, or item owner
  const isBuyerOwner = user.id === first.buyerId
  const isAdmin = user.role === 'ADMIN'
  const isItemOwner = user.role === 'OWNER' && rows.some((r) => r.ownerId === user.id)

  if (!isBuyerOwner && !isAdmin && !isItemOwner) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You are not authorized to view this order',
    })
  }

  // Fetch status history
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

  const itemsMap = new Map<string, any>()
  for (const r of rows) {
    if (r.itemId && !itemsMap.has(r.itemId)) {
      itemsMap.set(r.itemId, {
        id: r.itemId,
        productId: r.productId,
        ownerId: r.ownerId,
        productName: r.productName || r.liveProductName,
        productSku: r.productSku,
        productSlug: r.liveProductSlug,
        productImage: r.productImageUrl || r.liveProductImage,
        quantity: r.quantity,
        unitPrice: r.unitPrice,
        totalPrice: r.totalPrice,
        ownerName: r.ownerName,
      })
    }
  }

  return {
    success: true,
    order: {
      id: first.id,
      orderNumber: first.orderNumber,
      status: first.status,
      subtotal: first.subtotal,
      shippingFee: first.shippingFee,
      taxAmount: first.taxAmount,
      discountAmount: first.discountAmount,
      totalAmount: first.totalAmount,
      shippingName: first.shippingName,
      shippingPhone: first.shippingPhone,
      shippingAddress: first.shippingAddress,
      shippingCity: first.shippingCity,
      shippingState: first.shippingState,
      shippingPostalCode: first.shippingPostalCode,
      shippingCountry: first.shippingCountry,
      paymentStatus: first.paymentStatus,
      paymentMethod: first.paymentMethod,
      notes: first.notes,
      createdAt: first.createdAt,
      updatedAt: first.updatedAt,
      items: Array.from(itemsMap.values()),
      history: history,
    },
  }
})
