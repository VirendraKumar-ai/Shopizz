import { db } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { platformSettings } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  // Fetch current platform settings or seed default
  let settings = await db.query.platformSettings.findFirst()

  if (!settings) {
    const [inserted] = await db
      .insert(platformSettings)
      .values({
        announcementText: '✦ Complimentary shipping on all artisanal orders above ₹1,499 • 7-day handcrafted returns ✦',
        commissionRatePercent: 10,
        supportEmail: 'concierge@shopizz.com',
        supportPhone: '+91 1800 123 4567',
      })
      .returning()
    settings = inserted
  }

  return {
    success: true,
    settings,
  }
})
