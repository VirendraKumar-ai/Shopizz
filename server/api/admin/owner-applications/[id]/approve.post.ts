import { and, eq } from 'drizzle-orm'

import { db } from '~~/server/utils/db'
import {
  ownerApplications,
  users
} from '~~/db/schema'
import { sendOwnerApprovedEmail } from '~~/server/utils/mailer'
import { createNotification } from '~~/server/utils/notifications'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const applicationId = getRouterParam(
    event,
    'id'
  )

  if (!applicationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Application ID is required'
    })
  }

  const application =
    await db.query.ownerApplications.findFirst({
      where: eq(
        ownerApplications.id,
        applicationId
      )
    })

  if (!application) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Owner application not found'
    })
  }

  if (application.status !== 'PENDING') {
    throw createError({
      statusCode: 409,
      statusMessage: 'This application has already been reviewed'
    })
  }

  // Promote buyer → owner.
  await db
    .update(users)
    .set({
      role: 'OWNER',
      updatedAt: new Date()
    })
    .where(
      and(
        eq(users.id, application.userId),
        eq(users.role, 'BUYER')
      )
    )

  await db
    .update(ownerApplications)
    .set({
      status: 'APPROVED',
      reviewedBy: admin.id,
      reviewedAt: new Date(),
      updatedAt: new Date()
    })
    .where(
      eq(
        ownerApplications.id,
        application.id
      )
    )

  // Asynchronously notify the applicant
  db.query.users.findFirst({
    where: eq(users.id, application.userId)
  }).then((applicantUser) => {
    if (applicantUser?.email) {
      sendOwnerApprovedEmail(applicantUser.email, applicantUser.name, application.shopName).catch((err) =>
        console.error('[Owner Approved Email Error]:', err)
      )
    }
  }).catch(() => {})

  createNotification({
    userId: application.userId,
    type: 'OWNER_APPLICATION_APPROVED',
    title: 'Maker Application Approved! 🎉',
    message: `Congratulations! Your shop "${application.shopName}" has been approved. You can now access your seller dashboard.`,
    link: '/owner',
  }).catch((err) => console.error('[Owner Approved Notification Error]:', err))

  return {
    success: true,
    message: 'Owner application approved'
  }
})