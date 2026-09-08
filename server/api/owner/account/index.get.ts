import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { ownerApplications, users } from '~~/db/schema'
import { requireOwner } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)

  const [dbUser] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  const shop = await db.query.ownerApplications.findFirst({
    where: and(
      eq(ownerApplications.userId, user.id),
      eq(ownerApplications.status, 'APPROVED')
    ),
  })

  // Mock / default structured data for owner profile & bank details if not stored in separate tables
  return {
    success: true,
    user: {
      id: dbUser?.id,
      name: dbUser?.name || 'Studio Owner',
      email: dbUser?.email || 'owner@shopizz.com',
      role: dbUser?.role || 'OWNER',
      phone: shop?.phone || '+91 98765 43210',
      isVerified: true,
    },
    shop: {
      id: shop?.id,
      shopName: shop?.shopName || 'The Loom Studio',
      shopSlug: shop?.shopName ? shop.shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'the-loom-studio',
      category: 'Fashion',
      description: shop?.description || 'Thoughtful clothing for everyday living. Rooted in craft, made for modern life.',
      logoUrl: shop?.logoUrl || '',
      imageUrl: shop?.imageUrl || '',
      address: shop?.address || '',
    },
    bank: {
      accountHolder: dbUser?.name || 'Studio Owner',
      bankName: 'HDFC Bank',
      accountNumber: '•••• •••• 4587',
      rawAccountNumber: '50100234894587',
      ifscCode: 'HDFC0001234',
      upiId: 'owner@okhdfcbank',
    },
    notifications: {
      orderNotifications: true,
      customerMessages: true,
      payoutUpdates: true,
      marketingUpdates: false,
      emailNotifications: true,
    },
  }
})
