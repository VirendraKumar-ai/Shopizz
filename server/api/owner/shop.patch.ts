import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { ownerApplications } from '~~/db/schema'
import { requireOwner } from '~~/server/utils/auth'

const updateShopSchema = z.object({
  shopName: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  logoUrl: z.string().url().optional().nullable().or(z.literal('')),
})

export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)
  const body = await readBody(event)
  const validated = updateShopSchema.parse(body)

  const existing = await db.query.ownerApplications.findFirst({
    where: and(
      eq(ownerApplications.userId, user.id),
      eq(ownerApplications.status, 'APPROVED')
    ),
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Approved shop application not found',
    })
  }

  const [updated] = await db
    .update(ownerApplications)
    .set({
      ...(validated.shopName ? { shopName: validated.shopName } : {}),
      ...(validated.description !== undefined ? { description: validated.description } : {}),
      ...(validated.phone !== undefined ? { phone: validated.phone } : {}),
      ...(validated.address !== undefined ? { address: validated.address } : {}),
      ...(validated.imageUrl !== undefined ? { imageUrl: validated.imageUrl || null } : {}),
      ...(validated.logoUrl !== undefined ? { logoUrl: validated.logoUrl || null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(ownerApplications.id, existing.id))
    .returning()

  return {
    success: true,
    shop: updated,
  }
})
