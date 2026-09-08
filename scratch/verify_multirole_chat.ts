import 'dotenv/config'
import { db } from '../server/utils/db'
import { users, supportConversations, supportMessages, ownerApplications } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { generateAndSaveBotReply } from '../server/utils/conciergeBot'

async function verifyMultiRoleChat() {
  console.log('--- Verifying WhatsApp-Style Multi-Role Chat System ---')

  // 1. Fetch Buyer, Owner, and Admin users
  const allUsers = await db.select().from(users)
  const buyer = allUsers.find((u) => u.role === 'BUYER')
  const owner = allUsers.find((u) => u.role === 'OWNER')
  const admin = allUsers.find((u) => u.role === 'ADMIN')

  if (!buyer || !owner || !admin) {
    console.error('Missing buyer, owner, or admin test user.')
    process.exit(1)
  }

  console.log(`Buyer: ${buyer.name} (${buyer.email})`)
  console.log(`Owner: ${owner.name} (${owner.email})`)
  console.log(`Admin: ${admin.name} (${admin.email})`)

  // ----------------------------------------------------
  // Channel 1: Buyer ↔ Shop Owner
  // ----------------------------------------------------
  console.log('\n[Testing Channel 1: Buyer ↔ Shop Owner]')
  const [makerConv] = await db
    .insert(supportConversations)
    .values({
      buyerId: buyer.id,
      recipientId: owner.id,
      channelType: 'BUYER_TO_OWNER',
      subject: 'Custom Stoneware Vase Inquiry',
      category: 'CUSTOM_INQUIRY',
      status: 'OPEN',
      lastMessageAt: new Date(),
    })
    .returning()

  console.log('Created Maker Chat thread:', makerConv.id)

  const [buyerToOwnerMsg] = await db
    .insert(supportMessages)
    .values({
      conversationId: makerConv.id,
      senderId: buyer.id,
      senderRole: 'BUYER',
      senderName: buyer.name,
      message: 'Hello! Do you have this vase available in a matte black finish?',
      isRead: false,
    })
    .returning()
  console.log('  Buyer -> Owner:', buyerToOwnerMsg.message)

  const [ownerReplyMsg] = await db
    .insert(supportMessages)
    .values({
      conversationId: makerConv.id,
      senderId: owner.id,
      senderRole: 'OWNER',
      senderName: owner.name,
      message: 'Yes! We can craft a custom matte black edition for you in 3-4 days.',
      isRead: false,
    })
    .returning()
  console.log('  Owner -> Buyer:', ownerReplyMsg.message)

  // ----------------------------------------------------
  // Channel 2: Owner ↔ Admin
  // ----------------------------------------------------
  console.log('\n[Testing Channel 2: Owner ↔ Admin]')
  const [ownerAdminConv] = await db
    .insert(supportConversations)
    .values({
      buyerId: owner.id,
      recipientId: admin.id,
      channelType: 'OWNER_TO_ADMIN',
      subject: 'Payout Schedule Inquiry',
      category: 'GENERAL',
      status: 'OPEN',
      lastMessageAt: new Date(),
    })
    .returning()

  console.log('Created Owner-Admin thread:', ownerAdminConv.id)

  const [ownerToAdminMsg] = await db
    .insert(supportMessages)
    .values({
      conversationId: ownerAdminConv.id,
      senderId: owner.id,
      senderRole: 'OWNER',
      senderName: owner.name,
      message: 'Hi Admin, when will the payout for SZ-20260908 be disbursed to my bank?',
      isRead: false,
    })
    .returning()
  console.log('  Owner -> Admin:', ownerToAdminMsg.message)

  const [adminToOwnerMsg] = await db
    .insert(supportMessages)
    .values({
      conversationId: ownerAdminConv.id,
      senderId: admin.id,
      senderRole: 'ADMIN',
      senderName: 'Shopizz Platform Admin',
      message: 'Hello! Payouts are settled automatically every Wednesday to your verified bank account.',
      isRead: false,
    })
    .returning()
  console.log('  Admin -> Owner:', adminToOwnerMsg.message)

  // ----------------------------------------------------
  // Channel 3: Dedicated AI Concierge
  // ----------------------------------------------------
  console.log('\n[Testing Channel 3: Dedicated AI Concierge]')
  const [aiConv] = await db
    .insert(supportConversations)
    .values({
      buyerId: buyer.id,
      channelType: 'AI_ASSISTANT',
      subject: '🤖 Shopizz AI Concierge',
      category: 'GENERAL',
      status: 'OPEN',
      lastMessageAt: new Date(),
    })
    .returning()

  const aiBotReply = await generateAndSaveBotReply({
    conversationId: aiConv.id,
    userId: buyer.id,
    userName: buyer.name,
    userMessage: 'What is your return policy?',
    subject: 'Return Policy Query',
    category: 'RETURNS_REFUNDS',
  })

  console.log('  AI Bot Generated Reply:\n', aiBotReply?.message)

  console.log('\n--- Multi-Role WhatsApp Chat System Verified Successfully! ---')
}

verifyMultiRoleChat()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Verification failed:', err)
    process.exit(1)
  })
