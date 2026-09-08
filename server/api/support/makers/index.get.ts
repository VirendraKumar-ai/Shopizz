import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { users, ownerApplications } from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  // Fetch approved shop owners
  const makers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      shopName: ownerApplications.shopName,
      shopLogo: ownerApplications.logoUrl,
      shopDescription: ownerApplications.description,
    })
    .from(users)
    .innerJoin(ownerApplications, eq(users.id, ownerApplications.userId))
    .where(eq(ownerApplications.status, 'APPROVED'))

  return {
    success: true,
    makers,
  }
})
