import { db } from './db'
import { orders, orderItems, supportMessages, supportConversations } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'

interface BotReplyParams {
  conversationId: string
  userId: string
  userName: string
  userMessage: string
  subject?: string
  category?: string
}

export async function generateAndSaveBotReply(params: BotReplyParams) {
  const { conversationId, userId, userName, userMessage, subject = '', category = '' } = params
  const text = userMessage.toLowerCase().trim()
  const sub = subject.toLowerCase().trim()

  let replyText = ''

  try {
    // 1. Check for Order Tracking / Status Queries
    const isOrderQuery =
      text.includes('order') ||
      text.includes('status') ||
      text.includes('track') ||
      text.includes('delivery') ||
      text.includes('where is') ||
      text.includes('play station') ||
      text.includes('playstation') ||
      text.includes('nintendo') ||
      sub.includes('order') ||
      category === 'ORDER_TRACKING'

    if (isOrderQuery) {
      // Fetch user's latest orders
      const userOrders = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          totalAmount: orders.totalAmount,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(eq(orders.buyerId, userId))
        .orderBy(desc(orders.createdAt))
        .limit(3)

      if (userOrders.length > 0) {
        // Fetch items for the latest order
        const latestOrder = userOrders[0]
        const items = await db
          .select({
            productName: orderItems.productName,
            quantity: orderItems.quantity,
          })
          .from(orderItems)
          .where(eq(orderItems.orderId, latestOrder.id))

        const itemNames = items.map((i) => i.productName).filter(Boolean).join(', ') || 'Artisanal Piece'
        const orderDate = new Date(latestOrder.createdAt).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })

        const statusMap: Record<string, string> = {
          PLACED: 'Order Placed & Confirmed',
          CONFIRMED: 'Order Confirmed & Preparing for Dispatch',
          PROCESSING: 'In Production / Artisan Packaging',
          SHIPPED: 'Dispatched via Courier Partner',
          OUT_FOR_DELIVERY: 'Out for Delivery Today',
          DELIVERED: 'Delivered to your address',
          CANCELLED: 'Cancelled',
          REFUNDED: 'Refunded',
        }

        const friendlyStatus = statusMap[latestOrder.status] || latestOrder.status
        const formattedTotal = (Number(latestOrder.totalAmount) / 100).toLocaleString('en-IN')

        replyText = `Hello ${userName}! 🌿 I looked up your account and retrieved your recent order details:

📦 **Order Details:**
• **Order Number:** #${latestOrder.orderNumber}
• **Item(s):** ${itemNames}
• **Total:** ₹${formattedTotal}
• **Order Date:** ${orderDate}
• **Current Status:** ${friendlyStatus}

🚚 **Delivery Timeline:** Standard dispatch takes 1-2 business days, followed by 3-5 days delivery to your doorstep.

Our concierge and maker team are overseeing your shipment. If you have any further questions or need custom assistance, feel free to reply!`
      } else {
        replyText = `Hello ${userName}! 🌿 I checked your profile but couldn't find an active order placed under your account yet.

If you recently completed checkout with a different email or order number, please share the Order ID (e.g. #SZ-20260908-XXXX) and I will look it up right away!`
      }
    }
    // 2. Returns & Refunds Queries
    else if (
      text.includes('return') ||
      text.includes('refund') ||
      text.includes('exchange') ||
      text.includes('damaged') ||
      text.includes('broken') ||
      category === 'RETURNS_REFUNDS'
    ) {
      replyText = `Hello ${userName}! 🌿 We offer a **14-Day Hassle-Free Return Policy** on all delivered pieces.

• **How to initiate:** Go to your [My Orders](/account/orders) page, select the delivered order, and click **"Request Return / Refund"**.
• **Doorstep Pickup:** Our courier partner will schedule pickup within 24-48 hours.
• **Refund Timeline:** Once the artisan inspects the piece, the refund is processed directly to your original payment method (Cards/UPI/Bank) within 3-5 business days.

Our support team is also on standby to assist if the item arrived damaged or defective.`
    }
    // 3. Custom Studio / Sizing / Bespoke Queries
    else if (
      text.includes('custom') ||
      text.includes('size') ||
      text.includes('engrav') ||
      text.includes('bespoke') ||
      text.includes('maker') ||
      category === 'CUSTOM_INQUIRY'
    ) {
      replyText = `Hello ${userName}! 🌿 We love creating bespoke artisanal items!

I have routed your custom inquiry directly to our Studio Concierge and Maker Desk.
Please share any specific requirements:
1. Desired dimensions or sizing
2. Material or finish preferences (e.g. Linen, Terracotta, Stoneware, Brass)
3. Target delivery timeline

The artisan will review your requirements and respond with a timeline and customization quote.`
    }
    // 4. Payment & Razorpay Queries
    else if (
      text.includes('payment') ||
      text.includes('razorpay') ||
      text.includes('upi') ||
      text.includes('card') ||
      text.includes('failed') ||
      text.includes('deducted')
    ) {
      replyText = `Hello ${userName}! 🌿 Shopizz supports 100% secure payments via **Razorpay**:

• **Accepted Modes:** UPI (GPay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, Mastercard, RuPay), and NetBanking.
• **Failed / Debited Amount:** If your bank debited money but the order did not complete, Razorpay automatically reverses the funds within 24-48 hours.
• **Receipts:** All confirmed payments generate an instant tax invoice sent to your email.

Let me know if you need help verifying a specific transaction ID!`
    }
    // 5. General / Default Greeting
    else {
      replyText = `Hello ${userName}! 🌿 Welcome to **Shopizz AI Artisan Concierge**.

I can instantly help you with:
• 📦 **Order Status & Tracking** (Ask about your recent purchases)
• 🔄 **Returns & Refund Policies**
• 🎨 **Custom Sizing & Bespoke Studio Requests**
• 💳 **Payment & Checkout Assistance**

How may I assist you with your Shopizz experience today?`
    }

    // Save Bot Reply to Database
    const [botMsg] = await db
      .insert(supportMessages)
      .values({
        conversationId,
        senderId: userId, // AI Assistant in user's thread
        senderRole: 'SYSTEM',
        senderName: '🌿 Shopizz AI Concierge',
        message: replyText,
        isRead: false,
        createdAt: new Date(),
      })
      .returning()

    // Update conversation lastMessageAt
    await db
      .update(supportConversations)
      .set({
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(supportConversations.id, conversationId))

    return botMsg
  } catch (err) {
    console.error('[Bot Reply Error]:', err)
    return null
  }
}
