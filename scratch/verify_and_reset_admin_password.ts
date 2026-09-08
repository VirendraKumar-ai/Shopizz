import 'dotenv/config'
import { db } from '../server/utils/db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'
import { Hash } from '@adonisjs/hash'

async function checkAndResetAdmin() {
  const scrypt = new Scrypt()
  const hash = new Hash(scrypt)

  const adminEmail = 'sharadmaurya4600@gmail.com'
  const expectedPassword = 'Admin@123'

  const user = await db.query.users.findFirst({
    where: eq(users.email, adminEmail)
  })

  if (!user) {
    console.log(`User ${adminEmail} not found! Creating admin account...`)
    const passwordHash = await hash.make(expectedPassword)
    const [created] = await db.insert(users).values({
      name: 'Sharad Mourya',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      isActive: true
    }).returning()
    console.log('Created Admin User:', created)
    return
  }

  console.log(`Found user:`, { id: user.id, email: user.email, role: user.role, isActive: user.isActive })

  // Check if current password matches Admin@123
  let matches = false
  try {
    matches = await hash.verify(user.passwordHash, expectedPassword)
  } catch (err) {
    console.log('Verify error:', err)
  }

  console.log(`Does current password hash match "${expectedPassword}"? ->`, matches)

  if (!matches || user.role !== 'ADMIN' || !user.isActive) {
    console.log(`Updating password to "${expectedPassword}", role to "ADMIN", isActive to true...`)
    const newHash = await hash.make(expectedPassword)
    await db.update(users).set({
      passwordHash: newHash,
      role: 'ADMIN',
      isActive: true,
      updatedAt: new Date()
    }).where(eq(users.id, user.id))
    console.log(`✓ Password and Admin status updated successfully for ${adminEmail}!`)
  } else {
    console.log(`✓ User is already configured as active ADMIN with password "${expectedPassword}".`)
  }
}

checkAndResetAdmin().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
