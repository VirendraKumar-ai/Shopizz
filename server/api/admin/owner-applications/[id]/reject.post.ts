import { eq } from 'drizzle-orm'

import { db } from '~~/server/utils/db'
import { ownerApplications, users } from '~~/db/schema'
import { sendOwnerRejectedEmail } from '~~/server/utils/mailer'
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

  const body = await readBody(event)

  const rejectionReason =
    String(body.reason ?? '').trim()

  if (!rejectionReason) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Rejection reason is required'
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

  await db
    .update(ownerApplications)
    .set({
      status: 'REJECTED',
      rejectionReason,
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

  // Asynchronously notify applicant
  db.query.users.findFirst({
    where: eq(users.id, application.userId)
  }).then((applicantUser) => {
    if (applicantUser?.email) {
      sendOwnerRejectedEmail(applicantUser.email, applicantUser.name, application.shopName, rejectionReason).catch((err) =>
        console.error('[Owner Rejected Email Error]:', err)
      )
    }
  }).catch(() => {})

  createNotification({
    userId: application.userId,
    type: 'OWNER_APPLICATION_REJECTED',
    title: 'Maker Application Update',
    message: `Your application for "${application.shopName}" was reviewed. Reason: ${rejectionReason}`,
    link: '/account/settings',
  }).catch((err) => console.error('[Owner Rejected Notification Error]:', err))


  return {
    success: true,
    message: 'Owner application rejected'
  }
})