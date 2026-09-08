import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { platformSettings } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const { announcementText, commissionRatePercent, supportEmail, supportPhone } = body

  let settings = await db.query.platformSettings.findFirst()

  if (!settings) {
    const [created] = await db
      .insert(platformSettings)
      .values({
        announcementText: announcementText || '✦ Complimentary shipping on all artisanal orders above ₹1,499 • 7-day handcrafted returns ✦',
        commissionRatePercent: Number(commissionRatePercent) || 10,
        supportEmail: supportEmail || 'concierge@shopizz.com',
        supportPhone: supportPhone || '+91 1800 123 4567',
      })
      .returning()
    return {
      success: true,
      message: 'Platform settings saved successfully',
      settings: created,
    }
  }

  const updates: Record<string, any> = {
    updatedAt: new Date(),
  }

  if (announcementText !== undefined) {
    updates.announcementText = String(announcementText).trim()
  }

  if (commissionRatePercent !== undefined) {
    const rate = Number(commissionRatePercent)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Commission rate must be a percentage between 0 and 100',
      })
    }
    updates.commissionRatePercent = rate
  }

  if (supportEmail !== undefined) {
    updates.supportEmail = String(supportEmail).trim()
  }

  if (supportPhone !== undefined) {
    updates.supportPhone = String(supportPhone).trim()
  }

  const [updated] = await db
    .update(platformSettings)
    .set(updates)
    .where(eq(platformSettings.id, settings.id))
    .returning()

  return {
    success: true,
    message: 'Platform settings updated successfully',
    settings: updated,
  }
})
