import { desc, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { addresses } from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const rows = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, user.id))
    .orderBy(desc(addresses.isDefault), desc(addresses.createdAt))

  return {
    success: true,
    addresses: rows,
  }
})
