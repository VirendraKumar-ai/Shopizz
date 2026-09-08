import 'dotenv/config'
import { db } from '../server/utils/db'
import { sql } from 'drizzle-orm'

async function run() {
  console.log('Creating email_verifications and notifications tables if not exist...')

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS email_verifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL,
      otp TEXT NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      is_verified BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      role TEXT,
      type TEXT NOT NULL DEFAULT 'SYSTEM',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT,
      is_read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  console.log('Tables created successfully in PostgreSQL!')
  process.exit(0)
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})
