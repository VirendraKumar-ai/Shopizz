import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, sql } from 'drizzle-orm'
import * as schema from '../db/schema'
import {
  sendReturnRequestedEmail,
  sendReturnApprovedEmail,
  sendRefundProcessedEmail,
  sendReturnRejectedEmail,
} from '../server/utils/mailer'

async function runTest() {
  console.log('--- Testing Return & Refund Flow ---')
  const sqlClient = neon(process.env.DATABASE_URL!)
  const db = drizzle(sqlClient, { schema })

  // 1. Fetch an existing user or owner
  const allUsers = await db.select().from(schema.users).limit(5)
  console.log(`Found ${allUsers.length} users in DB`)

  const buyer = allUsers.find(u => u.role === 'BUYER') || allUsers[0]
  const owner = allUsers.find(u => u.role === 'OWNER') || allUsers[0]

  // 2. Fetch or create a test product and inventory
  let [product] = await db.select().from(schema.products).limit(1)
  if (!product) {
    console.log('No product found, creating one...')
    const [insertedProd] = await db.insert(schema.products).values({
      name: 'Test Terracotta Vase',
      slug: `test-terracotta-vase-${Date.now()}`,
      description: 'Handcrafted terracotta vase for test',
      price: 250000,
      ownerId: owner.id,
      categoryId: (await db.select().from(schema.categories).limit(1))[0]?.id,
    }).returning()
    product = insertedProd
  }

  // Check initial inventory
  let [inv] = await db.select().from(schema.inventory).where(eq(schema.inventory.productId, product.id)).limit(1)
  if (!inv) {
    const [newInv] = await db.insert(schema.inventory).values({
      productId: product.id,
      quantity: 10,
    }).returning()
    inv = newInv
  }
  const initialQuantity = inv.quantity
  console.log(`Product "${product.name}" initial inventory quantity: ${initialQuantity}`)

  // 3. Create a test delivered order
  const orderNumber = `ORD-TEST-${Date.now().toString(36).toUpperCase()}`
  const [testOrder] = await db.insert(schema.orders).values({
    orderNumber,
    buyerId: buyer.id,
    status: 'DELIVERED',
    subtotal: 250000,
    shippingFee: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 250000,
    shippingName: buyer.name || 'Test Collector',
    shippingPhone: '9876543210',
    shippingAddress: '123 Heritage Lane',
    shippingCity: 'Jaipur',
    shippingState: 'Rajasthan',
    shippingPostalCode: '302001',
    paymentStatus: 'PAID',
    paymentMethod: 'ONLINE',
  }).returning()

  // Add order item
  const [orderItem] = await db.insert(schema.orderItems).values({
    orderId: testOrder.id,
    productId: product.id,
    ownerId: owner.id,
    productName: product.name,
    productSku: 'VASE-01',
    quantity: 2,
    unitPrice: 125000,
    totalPrice: 250000,
  }).returning()

  console.log(`Created test order #${orderNumber} (ID: ${testOrder.id}) with 2 items`)

  // 4. Test Return Request Submission (Step 1: REQUESTED)
  const returnNumber = `RET-TEST-${Date.now().toString(36).toUpperCase()}`
  const [retReq] = await db.insert(schema.returnRequests).values({
    returnNumber,
    orderId: testOrder.id,
    orderItemId: orderItem.id,
    buyerId: buyer.id,
    ownerId: owner.id,
    reason: 'DEFECTIVE_DAMAGED',
    reasonDetails: 'Slight hairline fissure on base',
    refundAmount: 250000,
    payoutDetails: { method: 'UPI', upiId: 'collector@okhdfc' },
    status: 'REQUESTED',
  }).returning()

  console.log(`✓ Return request created: #${returnNumber} (Status: ${retReq.status})`)

  // Test mailer trigger 1: Return Requested
  await sendReturnRequestedEmail(
    buyer.email,
    buyer.name || 'Collector',
    returnNumber,
    orderNumber,
    'Defective Piece',
    2500
  )
  console.log('✓ Return requested email simulated successfully')

  // 5. Test Owner Approval (Step 2: APPROVED)
  const [approvedRet] = await db.update(schema.returnRequests).set({
    status: 'APPROVED',
    sellerNotes: 'Please ensure original wooden box is securely taped.',
    approvedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(schema.returnRequests.id, retReq.id)).returning()

  console.log(`✓ Return approved: #${approvedRet.returnNumber} (Status: ${approvedRet.status})`)

  // Test mailer trigger 2: Return Approved
  await sendReturnApprovedEmail(
    buyer.email,
    buyer.name || 'Collector',
    returnNumber,
    orderNumber,
    approvedRet.sellerNotes || undefined
  )
  console.log('✓ Return approved email simulated successfully')

  // 6. Test Piece Arrival (Step 3: ITEM_RECEIVED)
  const [receivedRet] = await db.update(schema.returnRequests).set({
    status: 'ITEM_RECEIVED',
    receivedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(schema.returnRequests.id, retReq.id)).returning()

  console.log(`✓ Piece received at studio: #${receivedRet.returnNumber} (Status: ${receivedRet.status})`)

  // 7. Test Refund Authorization & Inventory Restock (Step 4: REFUNDED)
  const txnRef = `TXN-REF-${Date.now().toString(36).toUpperCase()}`
  const [refundedRet] = await db.update(schema.returnRequests).set({
    status: 'REFUNDED',
    refundTransactionId: txnRef,
    refundedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(schema.returnRequests.id, retReq.id)).returning()

  // Update order status
  await db.update(schema.orders).set({
    status: 'REFUNDED',
    paymentStatus: 'REFUNDED',
  }).where(eq(schema.orders.id, testOrder.id))

  // Restock inventory (+2)
  await db.update(schema.inventory).set({
    quantity: sql`${schema.inventory.quantity} + ${orderItem.quantity}`,
    updatedAt: new Date(),
  }).where(eq(schema.inventory.productId, product.id))

  // Verify Restocked Inventory
  const [updatedInv] = await db.select().from(schema.inventory).where(eq(schema.inventory.productId, product.id)).limit(1)
  console.log(`✓ Inventory restocked! New quantity: ${updatedInv.quantity} (was ${initialQuantity}, expected ${initialQuantity + orderItem.quantity})`)

  if (updatedInv.quantity !== initialQuantity + orderItem.quantity) {
    throw new Error(`Inventory mismatch: expected ${initialQuantity + orderItem.quantity}, got ${updatedInv.quantity}`)
  }

  // Test mailer trigger 3: Refund Processed
  await sendRefundProcessedEmail(
    buyer.email,
    buyer.name || 'Collector',
    returnNumber,
    orderNumber,
    2500,
    txnRef
  )
  console.log('✓ Refund processed email simulated successfully')

  // Test mailer trigger 4: Rejection simulation
  await sendReturnRejectedEmail(
    buyer.email,
    buyer.name || 'Collector',
    'RET-REJECT-TEST',
    orderNumber,
    'Returned past 7-day policy window'
  )
  console.log('✓ Return rejection email simulated successfully')

  console.log('\n=============================================')
  console.log('🎉 ALL RETURN & REFUND FLOW TESTS PASSED!')
  console.log('=============================================\n')
}

runTest().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
