import 'dotenv/config'
import { db } from '../server/utils/db'
import { users } from '../db/schema/users'
import { eq } from 'drizzle-orm'
import { scryptSync, randomBytes } from 'node:crypto'

// nuxt-auth-utils scrypt format: $scrypt$N=...,r=...,p=...$salt$hash or similar
// Or let's just copy the known working password hash from testbuyer to sharad if needed
async function run() {
  // Let's copy the testbuyer password hash to sharad and reyphenoix so they all share the exact same known password
  const [buyer] = await db.select().from(users).where(eq(users.email, 'testbuyer@yopmail.com'))
  if (buyer) {
    console.log('Sample hash:', buyer.passwordHash)
    await db.update(users).set({ passwordHash: buyer.passwordHash }).where(eq(users.email, 'sharadmaurya4600@gmail.com'))
    await db.update(users).set({ passwordHash: buyer.passwordHash }).where(eq(users.email, 'reyphenoixbuyer@yopmail.com'))
    console.log('Synced password hash across test users successfully!')
  }
  process.exit(0)
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})
