import 'dotenv/config'
import { db } from '../server/utils/db'
import { ownerApplications } from '../db/schema/owner-applications'
import { users } from '../db/schema/users'
import { eq } from 'drizzle-orm'

async function run() {
  const existingPending = await db
    .select()
    .from(ownerApplications)
    .where(eq(ownerApplications.status, 'PENDING'))

  if (existingPending.length < 2) {
    // Get test buyer
    const [buyer] = await db
      .select()
      .from(users)
      .where(eq(users.role, 'BUYER'))
      .limit(1)

    if (buyer) {
      await db.insert(ownerApplications).values([
        {
          userId: buyer.id,
          shopName: 'Bare & Bone Studio',
          description: 'Handcrafted ceramic tableware and organic stone home objects.',
          phone: '+91 98765 43210',
          address: 'Fort Kochi, Kerala',
          reason: 'We want to reach conscious collectors seeking intentional handmade ceramics.',
          status: 'PENDING',
        },
        {
          userId: buyer.id,
          shopName: 'Fovea Botanical Living',
          description: 'Cold-pressed botanical fragrances and slow-living herbal wellness.',
          phone: '+91 91234 56789',
          address: 'Auroville, Tamil Nadu',
          reason: 'Our apothecary blends pure botanicals with traditional slow distillation.',
          status: 'PENDING',
        },
      ])
      console.log('Inserted sample pending owner applications for realistic preview!')
    }
  } else {
    console.log('Already have pending applications:', existingPending.length)
  }
  process.exit(0)
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})
