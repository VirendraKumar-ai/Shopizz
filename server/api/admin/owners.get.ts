import { desc, eq } from 'drizzle-orm'

import { db } from '~~/server/utils/db'
import { users } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const owners = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      isActive: users.isActive,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt
    })
    .from(users)
    .where(eq(users.role, 'OWNER'))
    .orderBy(desc(users.createdAt))

  return {
    owners
  }
})