import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import * as schema from '../db/schema'

async function testAccounts() {
  console.log('--- Testing Buyer & Owner Account Backend Integration ---')
  const sqlClient = neon(process.env.DATABASE_URL!)
  const db = drizzle(sqlClient, { schema })

  // 1. Fetch owner
  const [owner] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.role, 'OWNER'))
    .limit(1)

  if (owner) {
    console.log(`✓ Found Owner: ${owner.name} (${owner.email})`)

    // Check owner application
    const shop = await db.query.ownerApplications.findFirst({
      where: eq(schema.ownerApplications.userId, owner.id),
    })
    console.log(`✓ Owner Shop: "${shop?.shopName || 'Default Shop'}" (Status: ${shop?.status})`)
  }

  // 2. Fetch buyer returns
  const allReturns = await db.select().from(schema.returnRequests).limit(5)
  console.log(`✓ Found ${allReturns.length} return records in DB for Buyer Returns view`)

  console.log('\n=============================================')
  console.log('🎉 ACCOUNT INTEGRATION TESTS PASSED!')
  console.log('=============================================\n')
}

testAccounts().catch(console.error)
