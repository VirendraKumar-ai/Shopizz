import 'dotenv/config'
import { sql } from 'drizzle-orm'
import { db } from '../server/utils/db'

async function run() {
  console.log('Ensuring shop image columns exist in database...')
  await db.execute(sql`ALTER TABLE owner_applications ADD COLUMN IF NOT EXISTS image_url text`)
  await db.execute(sql`ALTER TABLE owner_applications ADD COLUMN IF NOT EXISTS logo_url text`)
  console.log('Columns verified/added successfully!')
  process.exit(0)
}

run().catch((err) => {
  console.error('Migration error:', err)
  process.exit(1)
})
