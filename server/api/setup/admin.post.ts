import { eq } from 'drizzle-orm'

import { db } from '~~/server/utils/db'
import { users } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const setupSecret = getHeader(event, 'x-setup-secret')

  if (!setupSecret || setupSecret !== config.adminSetupSecret) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid setup secret'
    })
  }

  const adminEmail = config.adminEmail
  const adminName = config.adminName
  const adminPassword = config.adminPassword

  if (!adminEmail || !adminName || !adminPassword) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Admin environment variables are not configured'
    })
  }

  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, adminEmail)
  })

  if (existingAdmin) {
    if (existingAdmin.role !== 'ADMIN') {
      await db
        .update(users)
        .set({
          role: 'ADMIN',
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, existingAdmin.id))

      return {
        success: true,
        message: 'Existing account promoted to ADMIN'
      }
    }

    return {
      success: true,
      message: 'Admin account already exists'
    }
  }

  const passwordHash = await hashPassword(adminPassword)

  await db.insert(users).values({
    name: adminName,
    email: adminEmail,
    passwordHash,
    role: 'ADMIN',
    isActive: true
  })

  return {
    success: true,
    message: 'Admin account created successfully'
  }
})