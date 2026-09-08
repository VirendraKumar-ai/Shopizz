import 'dotenv/config'
import { db } from '../server/utils/db'
import { users } from '../db/schema'

async function checkUsers() {
  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    isActive: users.isActive,
    createdAt: users.createdAt,
  }).from(users)

  console.log('All Users in DB:', JSON.stringify(allUsers, null, 2))
}

checkUsers().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
