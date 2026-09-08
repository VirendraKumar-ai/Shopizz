import { eq, desc } from 'drizzle-orm'
import { ownerApplications } from '~~/db/schema/owner-applications'
import { users } from '~~/db/schema/users'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const applications = await db
    .select({
      id: ownerApplications.id,
      userId: ownerApplications.userId,

      shopName: ownerApplications.shopName,
      description: ownerApplications.description,
      phone: ownerApplications.phone,
      address: ownerApplications.address,
      reason: ownerApplications.reason,

      status: ownerApplications.status,
      rejectionReason: ownerApplications.rejectionReason,

      reviewedBy: ownerApplications.reviewedBy,
      reviewedAt: ownerApplications.reviewedAt,

      createdAt: ownerApplications.createdAt,
      updatedAt: ownerApplications.updatedAt,

      userName: users.name,
      userEmail: users.email,
    })
    .from(ownerApplications)
    .innerJoin(
      users,
      eq(ownerApplications.userId, users.id),
    )
    .where(
      eq(ownerApplications.status, 'PENDING'),
    )
    .orderBy(
      desc(ownerApplications.createdAt),
    )

  return {
    success: true,
    applications,
  }
})