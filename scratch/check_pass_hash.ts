import 'dotenv/config'
import { db } from '../server/utils/db'
import { users } from '../db/schema/users'

async function run() {
  const allUsers = await db.select().from(users)
  for (const u of allUsers) {
    console.log(u.email, u.role, u.passwordHash.substring(0, 20))
  }
  process.exit(0)
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})
