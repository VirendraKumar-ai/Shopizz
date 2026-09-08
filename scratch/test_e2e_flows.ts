import 'dotenv/config'
import { db } from '../server/utils/db'
import { users, products, addresses, wishlists, paymentMethods, platformSettings } from '../db/schema'
import { eq } from 'drizzle-orm'

async function runDirectDbVerification() {
  console.log('--- Direct Database Verification ---')

  // 1. Verify schema tables exist and queryable
  const userList = await db.query.users.findMany({ limit: 3 })
  console.log(`✓ Users table queryable (${userList.length} samples found)`)

  const productList = await db.query.products.findMany({ limit: 3 })
  console.log(`✓ Products table queryable (${productList.length} samples found)`)

  const addrList = await db.query.addresses.findMany({ limit: 3 })
  console.log(`✓ Addresses table queryable (${addrList.length} rows)`)

  const wishList = await db.query.wishlists.findMany({ limit: 3 })
  console.log(`✓ Wishlists table queryable (${wishList.length} rows)`)

  const pmList = await db.query.paymentMethods.findMany({ limit: 3 })
  console.log(`✓ Payment Methods table queryable (${pmList.length} rows)`)

  const settings = await db.query.platformSettings.findFirst()
  console.log(`✓ Platform settings loaded: Announcement="${settings?.announcementText}", Commission=${settings?.commissionRatePercent}%`)

  console.log('--- All Database Table Structures Verified Successfully! ---')
}

runDirectDbVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Direct DB test error:', err)
    process.exit(1)
  })
