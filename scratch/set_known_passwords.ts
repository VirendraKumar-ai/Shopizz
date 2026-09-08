import 'dotenv/config'
import { db } from '../server/utils/db'
import { users } from '../db/schema/users'
import { Hash } from '@adonisjs/hash'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'
import { eq } from 'drizzle-orm'

async function run() {
  const hash = new Hash(new Scrypt())
  const passwordHash = await hash.make('password123')
  console.log('Generated hash for password123:', passwordHash)

  // Update all users with password123
  await db.update(users).set({ passwordHash })
  console.log('All test users password updated to: password123')
  process.exit(0)
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})
