import type { H3Event } from 'h3'

export type AppRole = 'ADMIN' | 'BUYER' | 'OWNER'

export async function requireAuth(event: H3Event) {
  const session = await requireUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  return session.user
}

export async function requireAdmin(event: H3Event) {
  const user = await requireAuth(event)

  if (user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }

  return user
}

export async function requireOwner(event: H3Event) {
  const user = await requireAuth(event)

  if (user.role !== 'OWNER') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Approved owner access required'
    })
  }

  return user
}