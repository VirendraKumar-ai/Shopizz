import { and, eq } from 'drizzle-orm'

import { db } from '~~/server/utils/db'
import {
  ownerApplications,
  users
} from '~~/db/schema'
import { sendOwnerApplicationReceivedEmail, sendAdminNewApplicationEmail } from '~~/server/utils/mailer'
import { createNotification } from '~~/server/utils/notifications'


export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  if (user.role === 'OWNER') {
    throw createError({
      statusCode: 409,
      statusMessage: 'You are already an approved shop owner'
    })
  }

  if (user.role === 'ADMIN') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Admin accounts cannot submit owner applications'
    })
  }

  const body = await readBody(event)

  const shopName = String(body.shopName ?? '').trim()
  const description = String(body.description ?? '').trim()
  const phone = String(body.phone ?? '').trim()
  const address = String(body.address ?? '').trim()
  const reason = String(body.reason ?? '').trim()

  if (!shopName || shopName.length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Shop name is required'
    })
  }

  if (shopName.length > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Shop name is too long'
    })
  }

  const existingApplication =
    await db.query.ownerApplications.findFirst({
      where: and(
        eq(ownerApplications.userId, user.id),
        eq(ownerApplications.status, 'PENDING')
      )
    })

  if (existingApplication) {
    throw createError({
      statusCode: 409,
      statusMessage: 'You already have a pending owner application'
    })
  }

  const [application] = await db
    .insert(ownerApplications)
    .values({
      userId: user.id,
      shopName,
      description: description || null,
      phone: phone || null,
      address: address || null,
      reason: reason || null,
      status: 'PENDING'
    })
    .returning()

  // Asynchronous Emails & Notifications
  sendOwnerApplicationReceivedEmail(user.email, user.name, shopName).catch((err) =>
    console.error('[Owner Application Email Error]:', err)
  )

  createNotification({
    userId: user.id,
    type: 'APPLICATION_SUBMITTED',
    title: 'Application Submitted',
    message: `Your application for "${shopName}" is under review by our curation team.`,
    link: '/account/settings',
  }).catch((err) => console.error('[Owner App Notification Error]:', err))


  createNotification({
    role: 'ADMIN',
    type: 'APPLICATION_SUBMITTED',
    title: 'New Maker Application',
    message: `${user.name} submitted an application to open "${shopName}".`,
    link: '/admin/requests',
  }).catch((err) => console.error('[Admin App Notification Error]:', err))

  // Find admin to send email alert
  db.query.users.findFirst({
    where: eq(users.role, 'ADMIN')
  }).then((adminUser) => {
    if (adminUser?.email) {
      sendAdminNewApplicationEmail(adminUser.email, shopName, user.name).catch((err) =>
        console.error('[Admin Email Error]:', err)
      )
    }
  }).catch(() => {})

  return {
    success: true,
    application
  }
})