import 'dotenv/config'
import { db } from '../server/utils/db'
import { categories } from '../db/schema/categories'

async function run() {
  const all = await db.select().from(categories)
  console.log('Categories in DB count:', all.length)
  console.log('Categories in DB:', JSON.stringify(all, null, 2))
  process.exit(0)
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})
