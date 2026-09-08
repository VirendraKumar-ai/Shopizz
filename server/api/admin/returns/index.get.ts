import { desc, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  returnRequests,
  orders,
  orderItems,
  products,
  productImages,
  users,
} from '~~/db/schema'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const statusFilter = query.status ? String(query.status) : undefined
  const search = query.search ? String(query.search).trim().toLowerCase() : ''

  const rows = await db
    .select({
      id: returnRequests.id,
      returnNumber: returnRequests.returnNumber,
      orderId: returnRequests.orderId,
      orderItemId: returnRequests.orderItemId,
      buyerId: returnRequests.buyerId,
      ownerId: returnRequests.ownerId,
      reason: returnRequests.reason,
      reasonDetails: returnRequests.reasonDetails,
      images: returnRequests.images,
      refundAmount: returnRequests.refundAmount,
      payoutDetails: returnRequests.payoutDetails,
      status: returnRequests.status,
      sellerNotes: returnRequests.sellerNotes,
      rejectionReason: returnRequests.rejectionReason,
      refundTransactionId: returnRequests.refundTransactionId,
      requestedAt: returnRequests.requestedAt,
      approvedAt: returnRequests.approvedAt,
      receivedAt: returnRequests.receivedAt,
      refundedAt: returnRequests.refundedAt,
      rejectedAt: returnRequests.rejectedAt,
      updatedAt: returnRequests.updatedAt,

      orderNumber: orders.orderNumber,
      orderStatus: orders.status,
      orderTotalAmount: orders.totalAmount,
      shippingName: orders.shippingName,
      shippingPhone: orders.shippingPhone,
      shippingCity: orders.shippingCity,
      shippingAddress: orders.shippingAddress,
      buyerName: users.name,
      buyerEmail: users.email,

      itemProductName: orderItems.productName,
      itemProductSku: orderItems.productSku,
      itemProductImageUrl: orderItems.productImageUrl,
      itemQuantity: orderItems.quantity,
      itemUnitPrice: orderItems.unitPrice,
      itemTotalPrice: orderItems.totalPrice,
      liveProductName: products.name,
      liveProductSlug: products.slug,
      liveProductImage: productImages.url,
    })
    .from(returnRequests)
    .innerJoin(orders, eq(returnRequests.orderId, orders.id))
    .innerJoin(users, eq(returnRequests.buyerId, users.id))
    .leftJoin(orderItems, eq(returnRequests.orderItemId, orderItems.id))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(productImages, eq(products.id, productImages.productId))
    .orderBy(desc(returnRequests.requestedAt))

  // Fetch Studio Owner details
  const ownerIds = Array.from(new Set(rows.map(r => r.ownerId)))
  const ownersList = ownerIds.length > 0
    ? await db.select({ id: users.id, name: users.name, email: users.email }).from(users)
    : []
  const ownerMap = new Map(ownersList.map(o => [o.id, o]))

  const returnMap = new Map<string, any>()
  for (const r of rows) {
    if (!returnMap.has(r.id)) {
      const studioOwner = ownerMap.get(r.ownerId)
      returnMap.set(r.id, {
        id: r.id,
        returnNumber: r.returnNumber,
        orderId: r.orderId,
        orderNumber: r.orderNumber,
        orderStatus: r.orderStatus,
        orderTotalAmount: r.orderTotalAmount,
        buyerId: r.buyerId,
        buyerName: r.buyerName || r.shippingName,
        buyerEmail: r.buyerEmail,
        shippingPhone: r.shippingPhone,
        shippingCity: r.shippingCity,
        shippingAddress: r.shippingAddress,
        ownerId: r.ownerId,
        ownerName: studioOwner?.name || 'Studio Maker',
        ownerEmail: studioOwner?.email,
        reason: r.reason,
        reasonDetails: r.reasonDetails,
        images: r.images || [],
        refundAmount: r.refundAmount,
        payoutDetails: r.payoutDetails || {},
        status: r.status,
        sellerNotes: r.sellerNotes,
        rejectionReason: r.rejectionReason,
        refundTransactionId: r.refundTransactionId,
        requestedAt: r.requestedAt,
        approvedAt: r.approvedAt,
        receivedAt: r.receivedAt,
        refundedAt: r.refundedAt,
        rejectedAt: r.rejectedAt,
        updatedAt: r.updatedAt,
        item: r.orderItemId ? {
          id: r.orderItemId,
          name: r.itemProductName || r.liveProductName,
          sku: r.itemProductSku,
          slug: r.liveProductSlug,
          imageUrl: r.itemProductImageUrl || r.liveProductImage,
          quantity: r.itemQuantity,
          unitPrice: r.itemUnitPrice,
          totalPrice: r.itemTotalPrice,
        } : null,
      })
    }
  }

  const allReturns = Array.from(returnMap.values())

  let filtered = allReturns
  if (statusFilter && statusFilter !== 'ALL') {
    filtered = filtered.filter(r => r.status === statusFilter)
  }
  if (search) {
    filtered = filtered.filter(r =>
      r.returnNumber.toLowerCase().includes(search) ||
      r.orderNumber.toLowerCase().includes(search) ||
      r.buyerName.toLowerCase().includes(search) ||
      (r.buyerEmail && r.buyerEmail.toLowerCase().includes(search)) ||
      (r.ownerName && r.ownerName.toLowerCase().includes(search))
    )
  }

  const metrics = {
    total: allReturns.length,
    pending: allReturns.filter(r => r.status === 'REQUESTED').length,
    approved: allReturns.filter(r => r.status === 'APPROVED').length,
    itemReceived: allReturns.filter(r => r.status === 'ITEM_RECEIVED').length,
    refunded: allReturns.filter(r => r.status === 'REFUNDED').length,
    rejected: allReturns.filter(r => r.status === 'REJECTED').length,
    refundedTotalPaise: allReturns
      .filter(r => r.status === 'REFUNDED')
      .reduce((sum, r) => sum + (r.refundAmount || 0), 0),
  }

  return {
    success: true,
    returns: filtered,
    metrics,
  }
})
