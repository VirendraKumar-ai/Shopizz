import { db } from '~~/server/utils/db'
import { platformSettings } from '~~/db/schema'

export default defineEventHandler(async () => {
  const settings = await db.query.platformSettings.findFirst({
    columns: {
      announcementText: true,
      supportEmail: true,
      supportPhone: true,
    },
  })

  return {
    success: true,
    announcementText: settings?.announcementText || '✦ Complimentary shipping on all artisanal orders above ₹1,499 • Easy returns ✦',
    supportEmail: settings?.supportEmail || 'support@shopizz.com',
    supportPhone: settings?.supportPhone || '+91 1800 123 4567',
  }
})
