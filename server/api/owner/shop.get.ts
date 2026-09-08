import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { ownerApplications } from '~~/db/schema'
import { requireOwner } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)

  const shop = await db.query.ownerApplications.findFirst({
    where: and(
      eq(ownerApplications.userId, user.id),
      eq(ownerApplications.status, 'APPROVED')
    ),
  })

  if (!shop) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Approved shop application not found',
    })
  }

  return {
    success: true,
    shop: {
      id: shop.id,
      shopName: shop.shopName,
      description: shop.description || '',
      phone: shop.phone || '',
      address: shop.address || '',
      reason: shop.reason || '',
      imageUrl: shop.imageUrl || '',
      logoUrl: shop.logoUrl || '',
      status: shop.status,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt,
    },
  }
})
