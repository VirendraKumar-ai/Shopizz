import 'dotenv/config'
import { db } from '../server/utils/db'
import { users, supportConversations, supportMessages } from '../db/schema'
import { eq, desc } from 'drizzle-orm'

async function verifySupportSystem() {
  console.log('--- Verifying Support System ---')

  // 1. Get an existing user
  const [testUser] = await db.select().from(users).limit(1)
  if (!testUser) {
    console.error('No users found in database.')
    process.exit(1)
  }
  console.log(`Using test user: ${testUser.name} (${testUser.id})`)

  // 2. Insert a test support conversation
  const [newConv] = await db
    .insert(supportConversations)
    .values({
      buyerId: testUser.id,
      subject: 'Verification Ticket - Order Query',
      category: 'ORDER_TRACKING',
      status: 'OPEN',
      lastMessageAt: new Date(),
    })
    .returning()

  console.log('Created conversation:', newConv.id, newConv.subject, newConv.status)

  // 3. Buyer posts message
  const [buyerMsg] = await db
    .insert(supportMessages)
    .values({
      conversationId: newConv.id,
      senderId: testUser.id,
      senderRole: 'BUYER',
      senderName: testUser.name,
      message: 'Hello, where is my package #SPZ-1004?',
      isRead: false,
    })
    .returning()

  console.log('Buyer message sent:', buyerMsg.id, buyerMsg.message)

  // 4. Admin replies
  const [adminMsg] = await db
    .insert(supportMessages)
    .values({
      conversationId: newConv.id,
      senderId: testUser.id, // Using existing user ID
      senderRole: 'ADMIN',
      senderName: 'Shopizz Support Staff',
      message: 'Hello! Your package has been dispatched via courier with tracking ID TRK-8899.',
      isRead: false,
    })
    .returning()

  console.log('Admin reply sent:', adminMsg.id, adminMsg.message)

  // 5. Update conversation status
  const [updatedConv] = await db
    .update(supportConversations)
    .set({
      status: 'RESOLVED',
      updatedAt: new Date(),
    })
    .where(eq(supportConversations.id, newConv.id))
    .returning()

  console.log('Updated conversation status to:', updatedConv.status)

  // 6. Query messages for conversation
  const convMessages = await db
    .select()
    .from(supportMessages)
    .where(eq(supportMessages.conversationId, newConv.id))
    .orderBy(supportMessages.createdAt)

  console.log(`Fetched ${convMessages.length} messages for ticket:`)
  for (const m of convMessages) {
    console.log(`  [${m.senderRole} - ${m.senderName}]: ${m.message}`)
  }

  console.log('Support system database verification SUCCESSFUL!')
}

verifySupportSystem()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Verification failed:', err)
    process.exit(1)
  })
