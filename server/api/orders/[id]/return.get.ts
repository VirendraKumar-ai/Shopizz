import { desc, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { returnRequests, users } from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const orderId = getRouterParam(event, 'id')

  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID is required',
    })
  }

  // Fetch returns for this order
  const returns = await db
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
      buyerName: users.name,
      buyerEmail: users.email,
    })
    .from(returnRequests)
    .leftJoin(users, eq(returnRequests.buyerId, users.id))
    .where(eq(returnRequests.orderId, orderId))
    .orderBy(desc(returnRequests.requestedAt))

  if (returns.length === 0) {
    return {
      success: true,
      returnRequest: null,
      returns: [],
    }
  }

  const latestReturn = returns[0]

  // Authorization check
  if (
    user.id !== latestReturn.buyerId &&
    user.id !== latestReturn.ownerId &&
    user.role !== 'ADMIN'
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized to view return details for this order',
    })
  }

  return {
    success: true,
    returnRequest: latestReturn,
    returns,
  }
})
