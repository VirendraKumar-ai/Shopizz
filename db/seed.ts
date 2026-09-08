import 'dotenv/config'

import { eq } from 'drizzle-orm'

import { db } from '../server/utils/db'
import { users } from './schema/users'

const adminEmail = process.env.ADMIN_EMAIL
const adminName = process.env.ADMIN_NAME
const adminPassword = process.env.ADMIN_PASSWORD

if (!adminEmail || !adminName || !adminPassword) {
  throw new Error(
    'ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD must be configured'
  )
}

async function seedAdmin() {
  console.log('Checking admin account...')

  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, adminEmail)
  })

  if (existingAdmin) {
    if (existingAdmin.role !== 'ADMIN') {
      await db
        .update(users)
        .set({
          role: 'ADMIN',
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, existingAdmin.id))

      console.log('Existing account promoted to ADMIN.')
    } else {
      console.log('Admin account already exists.')
    }

    return
  }

  const passwordHash = await hashPassword(adminPassword)

  await db.insert(users).values({
    name: adminName,
    email: adminEmail,
    passwordHash,
    role: 'ADMIN',
    isActive: true
  })

  console.log('Admin account created successfully.')
}

seedAdmin()
  .then(() => {
    console.log('Seed completed.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })