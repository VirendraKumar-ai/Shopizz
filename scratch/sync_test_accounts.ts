import 'dotenv/config'
import { db } from '../server/utils/db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'
import { Hash } from '@adonisjs/hash'

async function syncAllTestAccounts() {
  const scrypt = new Scrypt()
  const hash = new Hash(scrypt)

  const accounts = [
    { email: 'sharadmaurya4600@gmail.com', role: 'ADMIN', name: 'Sharad Mourya', pass: 'Admin@123' },
    { email: 'owner@shopizz.com', role: 'OWNER', name: 'Artisan Owner', pass: 'Owner@123' },
    { email: 'buyer@shopizz.com', role: 'BUYER', name: 'Artisan Buyer', pass: 'Buyer@123' },
  ]

  for (const acc of accounts) {
    const existing = await db.query.users.findFirst({ where: eq(users.email, acc.email) })
    const passwordHash = await hash.make(acc.pass)

    if (existing) {
      await db.update(users).set({
        passwordHash,
        role: acc.role as any,
        isActive: true,
        updatedAt: new Date(),
      }).where(eq(users.id, existing.id))
      console.log(`✓ Updated ${acc.email} (${acc.role}) with password "${acc.pass}"`)
    } else {
      await db.insert(users).values({
        name: acc.name,
        email: acc.email,
        passwordHash,
        role: acc.role as any,
        isActive: true,
      })
      console.log(`✓ Created ${acc.email} (${acc.role}) with password "${acc.pass}"`)
    }
  }
}

syncAllTestAccounts().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
