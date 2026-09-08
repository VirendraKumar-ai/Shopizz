import 'dotenv/config'
import { db } from '../server/utils/db'
import { sql } from 'drizzle-orm'

async function migrateSupportChannels() {
  console.log('Migrating support channels in Neon PostgreSQL...')

  // 1. Create support_channel enum
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE support_channel AS ENUM ('BUYER_TO_OWNER', 'OWNER_TO_ADMIN', 'BUYER_TO_ADMIN', 'AI_ASSISTANT');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)
  console.log('support_channel enum verified.')

  // 2. Add recipient_id column
  await db.execute(sql`
    ALTER TABLE support_conversations
    ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES users(id) ON DELETE SET NULL;
  `)

  // 3. Add channel_type column
  await db.execute(sql`
    ALTER TABLE support_conversations
    ADD COLUMN IF NOT EXISTS channel_type support_channel DEFAULT 'BUYER_TO_ADMIN' NOT NULL;
  `)

  // 4. Add shop_id column
  await db.execute(sql`
    ALTER TABLE support_conversations
    ADD COLUMN IF NOT EXISTS shop_id UUID;
  `)

  console.log('support_conversations columns migrated successfully!')
}

migrateSupportChannels()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })
