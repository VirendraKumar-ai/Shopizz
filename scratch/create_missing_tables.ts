import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

async function migrateMissingTables() {
  const sql = neon(process.env.DATABASE_URL!)

  console.log('--- Creating Missing Tables in DB ---')

  // 1. addresses table
  await sql`
    CREATE TABLE IF NOT EXISTS "addresses" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "full_name" text NOT NULL,
      "phone" text NOT NULL,
      "address_line1" text NOT NULL,
      "address_line2" text,
      "city" text NOT NULL,
      "state" text NOT NULL,
      "postal_code" text NOT NULL,
      "country" text NOT NULL DEFAULT 'India',
      "type" text NOT NULL DEFAULT 'HOME',
      "is_default" boolean NOT NULL DEFAULT false,
      "created_at" timestamp with time zone NOT NULL DEFAULT now(),
      "updated_at" timestamp with time zone NOT NULL DEFAULT now()
    );
  `
  console.log('✓ "addresses" table verified/created.')

  // 2. wishlists table
  await sql`
    CREATE TABLE IF NOT EXISTS "wishlists" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
      "created_at" timestamp with time zone NOT NULL DEFAULT now(),
      CONSTRAINT "user_product_unique" UNIQUE ("user_id", "product_id")
    );
  `
  console.log('✓ "wishlists" table verified/created.')

  // 3. payment_type enum and payment_methods table
  await sql`
    DO $$ BEGIN
      CREATE TYPE "payment_type" AS ENUM ('CARD', 'UPI', 'NET_BANKING');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `

  await sql`
    CREATE TABLE IF NOT EXISTS "payment_methods" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "type" "payment_type" NOT NULL,
      "provider" text NOT NULL,
      "identifier" text NOT NULL,
      "holder_name" text,
      "expiry_month" text,
      "expiry_year" text,
      "is_default" boolean NOT NULL DEFAULT false,
      "details" jsonb,
      "created_at" timestamp with time zone NOT NULL DEFAULT now(),
      "updated_at" timestamp with time zone NOT NULL DEFAULT now()
    );
  `
  console.log('✓ "payment_methods" table verified/created.')

  // 4. platform_settings table
  await sql`
    CREATE TABLE IF NOT EXISTS "platform_settings" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "announcement_text" text NOT NULL DEFAULT '✦ Free shipping on orders above ₹1499 • Easy returns ✦',
      "commission_rate_percent" integer NOT NULL DEFAULT 10,
      "support_email" text NOT NULL DEFAULT 'support@shopizz.com',
      "support_phone" text NOT NULL DEFAULT '+91 1800 123 4567',
      "updated_at" timestamp with time zone NOT NULL DEFAULT now()
    );
  `
  console.log('✓ "platform_settings" table verified/created.')

  // Insert default platform_settings row if none exists
  const existingSettings = await sql`SELECT id FROM "platform_settings" LIMIT 1`
  if (existingSettings.length === 0) {
    await sql`
      INSERT INTO "platform_settings" ("announcement_text", "commission_rate_percent", "support_email", "support_phone")
      VALUES ('✦ Free shipping on orders above ₹1499 • Easy returns ✦', 10, 'support@shopizz.com', '+91 1800 123 4567');
    `
    console.log('✓ Default platform settings row inserted.')
  }

  console.log('🎉 ALL TABLES CREATED AND READY!')
}

migrateMissingTables().catch(console.error)
