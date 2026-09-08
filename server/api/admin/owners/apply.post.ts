import { z } from 'zod'
import { eq } from 'drizzle-orm'

import { db } from '~~/server/utils/db'
import { ownerApplications } from '~~/db/schema/owner-applications'

const schema = z.object({
  shopName: z.string().min(2),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  reason: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  if (session.user.role !== 'BUYER') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Only buyers can apply to become owners.',
    })
  }

  const body = await readBody(event)
  const data = schema.parse(body)

  const existingApplication =
    await db.query.ownerApplications.findFirst({
      where: eq(
        ownerApplications.userId,
        session.user.id
      ),
    })

  if (existingApplication?.status === 'PENDING') {
    throw createError({
      statusCode: 409,
      statusMessage: 'You already have a pending application.',
    })
  }

  const [application] = await db
    .insert(ownerApplications)
    .values({
      userId: session.user.id,
      shopName: data.shopName,
      description: data.description,
      phone: data.phone,
      address: data.address,
      reason: data.reason,
      status: 'PENDING',
    })
    .returning()

  return {
    success: true,
    application,
  }
})