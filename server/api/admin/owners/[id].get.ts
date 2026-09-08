import { eq } from 'drizzle-orm'

import { db } from '~~/server/utils/db'
import {
  ownerApplications,
  users
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const ownerId = getRouterParam(
    event,
    'id'
  )

  if (!ownerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Owner ID is required'
    })
  }

  const owner = await db.query.users.findFirst({
    where: eq(users.id, ownerId)
  })

  if (!owner || owner.role !== 'OWNER') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Owner not found'
    })
  }

  const application =
    await db.query.ownerApplications.findFirst({
      where: eq(
        ownerApplications.userId,
        owner.id
      )
    })

  return {
    owner: {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      isActive: owner.isActive,
      createdAt: owner.createdAt,
      lastLoginAt: owner.lastLoginAt
    },

    shop: application
      ? {
          id: application.id,
          shopName: application.shopName,
          description: application.description,
          phone: application.phone,
          address: application.address,
          reason: application.reason,
          status: application.status,
          reviewedAt: application.reviewedAt
        }
      : null
  }
})