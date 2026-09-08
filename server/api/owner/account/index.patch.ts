import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { ownerApplications, users } from '~~/db/schema'
import { requireOwner } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)
  const body = await readBody(event)

  const {
    name,
    phone,
    shopName,
    description,
    logoUrl,
    imageUrl,
    currentPassword,
    newPassword,
  } = body

  // 1. Update user name if provided
  if (name && name.trim()) {
    await db
      .update(users)
      .set({
        name: name.trim(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
  }

  // 2. Update shop details if provided
  const existingShop = await db.query.ownerApplications.findFirst({
    where: and(
      eq(ownerApplications.userId, user.id),
      eq(ownerApplications.status, 'APPROVED')
    ),
  })

  if (existingShop) {
    const shopUpdate: Record<string, any> = { updatedAt: new Date() }
    if (shopName !== undefined) shopUpdate.shopName = shopName.trim()
    if (description !== undefined) shopUpdate.description = description.trim()
    if (phone !== undefined) shopUpdate.phone = phone.trim()
    if (logoUrl !== undefined) shopUpdate.logoUrl = logoUrl || null
    if (imageUrl !== undefined) shopUpdate.imageUrl = imageUrl || null

    await db
      .update(ownerApplications)
      .set(shopUpdate)
      .where(eq(ownerApplications.id, existingShop.id))
  }

  // 3. Password change if requested
  if (currentPassword && newPassword) {
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (dbUser) {
      const isValid = await verifyPassword(dbUser.passwordHash, currentPassword)
      if (!isValid) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Current password does not match',
        })
      }

      if (newPassword.length < 6) {
        throw createError({
          statusCode: 400,
          statusMessage: 'New password must be at least 6 characters long',
        })
      }

      const newHash = await hashPassword(newPassword)
      await db
        .update(users)
        .set({
          passwordHash: newHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
    }
  }

  return {
    success: true,
    message: 'Account details updated successfully',
  }
})
