import 'dotenv/config'
import { db } from '../server/utils/db'
import { sql } from 'drizzle-orm'

async function run() {
  console.log('Creating return_status and return_reason enums and return_requests table...')

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE return_status AS ENUM ('REQUESTED', 'APPROVED', 'ITEM_RECEIVED', 'REFUNDED', 'REJECTED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE return_reason AS ENUM ('DEFECTIVE_DAMAGED', 'SIZE_FIT_ISSUE', 'NOT_AS_DESCRIBED', 'CHANGED_MIND', 'LATE_DELIVERY', 'OTHER');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS return_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      return_number TEXT NOT NULL UNIQUE,
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
      buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      reason return_reason NOT NULL,
      reason_details TEXT,
      images JSONB,
      refund_amount INTEGER NOT NULL,
      payout_details JSONB,
      status return_status NOT NULL DEFAULT 'REQUESTED',
      seller_notes TEXT,
      rejection_reason TEXT,
      refund_transaction_id TEXT,
      requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      approved_at TIMESTAMPTZ,
      received_at TIMESTAMPTZ,
      refunded_at TIMESTAMPTZ,
      rejected_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  console.log('return_requests table created successfully!')
  process.exit(0)
}

run().catch(err => {
  console.error('Migration error:', err)
  process.exit(1)
})
