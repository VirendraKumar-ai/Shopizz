import { desc, eq } from 'drizzle-orm'

import { db } from '~~/server/utils/db'
import { ownerApplications } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const application =
    await db.query.ownerApplications.findFirst({
      where: eq(ownerApplications.userId, user.id),

      orderBy: desc(ownerApplications.createdAt)
    })

  return {
    application: application ?? null
  }
})