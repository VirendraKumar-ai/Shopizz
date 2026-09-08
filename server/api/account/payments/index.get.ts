import { desc, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { paymentMethods } from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const rows = await db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.userId, user.id))
    .orderBy(desc(paymentMethods.isDefault), desc(paymentMethods.createdAt))

  return {
    success: true,
    paymentMethods: rows,
  }
})
