import 'dotenv/config'
import { db } from '../server/utils/db'
import { ownerApplications } from '../db/schema/owner-applications'

async function run() {
  const apps = await db.select().from(ownerApplications)
  console.log('Owner Applications in DB count:', apps.length)
  console.log('Applications:', JSON.stringify(apps, null, 2))
  process.exit(0)
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})
