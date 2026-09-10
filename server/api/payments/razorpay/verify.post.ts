import crypto from 'node:crypto'
import { eq, inArray } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  orders,
  orderItems,
  orderStatusHistory,
  products,
  productImages,
  inventory,
} from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'
import { createNotification } from '~~/server/utils/notifications'
import { sendOrderConfirmedEmail } from '~~/server/utils/mailer'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    orderNumber: clientOrderNumber,
    items = [],
    shippingName,
    shippingPhone,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingPostalCode,
    shippingCountry = 'India',
    notes,
  } = body

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing Razorpay payment verification parameters',
    })
  }

  // 1. Cryptographic HMAC SHA256 Signature Verification
  const config = useRuntimeConfig()
  const secret = config.razorpayKeySecret
  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Razorpay secret key configuration is missing',
    })
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  if (generatedSignature !== razorpaySignature) {
    console.error('[Razorpay Signature Mismatch]', {
      generated: generatedSignature,
      received: razorpaySignature,
    })
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid payment signature. Verification failed.',
    })
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot complete order with an empty shopping bag',
    })
  }

  const productIds = items.map((i: any) => i.productId).filter(Boolean)
  if (productIds.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid order items',
    })
  }

  // 2. Fetch live products from DB & recalculate exact server-side totals
  const dbProducts = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      price: products.price,
      ownerId: products.ownerId,
      status: products.status,
      stock: inventory.quantity,
      inventoryId: inventory.id,
      imageUrl: productImages.url,
    })
    .from(products)
    .leftJoin(inventory, eq(products.id, inventory.productId))
    .leftJoin(productImages, eq(products.id, productImages.productId))
    .where(inArray(products.id, productIds))

  const productMap = new Map<string, (typeof dbProducts)[0]>()
  for (const p of dbProducts) {
    if (!productMap.has(p.id)) {
      productMap.set(p.id, p)
    }
  }

  let subtotal = 0
  const validatedOrderItems: {
    productId: string
    ownerId: string
    productName: string
    productSku: string
    productImageUrl?: string | null
    quantity: number
    unitPrice: number
    totalPrice: number
    inventoryId?: string | null
    currentStock: number
  }[] = []

  for (const item of items) {
    const dbProduct = productMap.get(item.productId)

    if (!dbProduct) {
      throw createError({
        statusCode: 400,
        statusMessage: `Product ${item.productId} not found`,
      })
    }

    const availableStock = dbProduct.stock ?? 0
    const itemTotal = dbProduct.price * item.quantity
    subtotal += itemTotal

    validatedOrderItems.push({
      productId: dbProduct.id,
      ownerId: dbProduct.ownerId,
      productName: dbProduct.name,
      productSku: dbProduct.sku,
      productImageUrl: dbProduct.imageUrl,
      quantity: item.quantity,
      unitPrice: dbProduct.price,
      totalPrice: itemTotal,
      inventoryId: dbProduct.inventoryId,
      currentStock: availableStock,
    })
  }

  const shippingFee = subtotal >= 500000 ? 0 : 15000
  const taxAmount = 0
  const discountAmount = 0
  const totalAmount = subtotal + shippingFee + taxAmount - discountAmount

  // Order Number
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const orderNumber = clientOrderNumber || `SZ-${dateStr}-${randomSuffix}`

  // 3. Insert confirmed Order into Database
  const [createdOrder] = await db
    .insert(orders)
    .values({
      orderNumber,
      buyerId: user.id,
      status: 'PLACED',
      subtotal,
      shippingFee,
      taxAmount,
      discountAmount,
      totalAmount,
      shippingName: String(shippingName).trim(),
      shippingPhone: String(shippingPhone).trim(),
      shippingAddress: String(shippingAddress).trim(),
      shippingCity: String(shippingCity).trim(),
      shippingState: String(shippingState).trim(),
      shippingPostalCode: String(shippingPostalCode).trim(),
      shippingCountry: String(shippingCountry).trim() || 'India',
      paymentStatus: 'PAID',
      paymentMethod: 'RAZORPAY',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      notes: notes ? String(notes).trim() : null,
    })
    .returning()

  if (!createdOrder) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create order in database',
    })
  }

  // 4. Insert status history
  await db.insert(orderStatusHistory).values({
    orderId: createdOrder.id,
    status: 'PLACED',
    message: `Payment verified via Razorpay (${razorpayPaymentId}). Order confirmed.`,
    updatedBy: user.id,
  })

  // 5. Insert order items & decrement inventory
  const uniqueOwnerIds = new Set<string>()
  for (const item of validatedOrderItems) {
    uniqueOwnerIds.add(item.ownerId)

    await db.insert(orderItems).values({
      orderId: createdOrder.id,
      productId: item.productId,
      ownerId: item.ownerId,
      productName: item.productName,
      productSku: item.productSku,
      productImageUrl: item.productImageUrl,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })

    if (item.inventoryId) {
      const newStock = Math.max(0, item.currentStock - item.quantity)
      await db
        .update(inventory)
        .set({
          quantity: newStock,
          updatedAt: new Date(),
        })
        .where(eq(inventory.id, item.inventoryId))
    }
  }

  // 6. Notifications & Emails
  try {
    const totalRupees = Math.round(totalAmount / 100)

    // A. Personal notification for the Buyer
    await createNotification({
      userId: user.id,
      type: 'ORDER_PLACED',
      title: 'Order Confirmed 🎉',
      message: `Your payment of ₹${totalRupees.toLocaleString('en-IN')} for Order #${orderNumber} was successful. Studios are preparing your order.`,
      link: `/account/orders/${createdOrder.id}`,
    })

    // B. Notifications for studio Owners
    for (const ownerId of uniqueOwnerIds) {
      await createNotification({
        userId: ownerId,
        type: 'ORDER_RECEIVED',
        title: 'New Order Received',
        message: `New order #${orderNumber} received. Please review pieces and prepare dispatch.`,
        link: `/owner/orders/${createdOrder.id}`,
      })
    }

    // C. Notification for Admin
    await createNotification({
      role: 'ADMIN',
      type: 'ORDER_PLACED',
      title: 'New Paid Order',
      message: `Order #${orderNumber} paid via Razorpay (₹${totalRupees.toLocaleString('en-IN')}).`,
      link: `/admin`,
    })

    // D. Email receipt to Buyer
    if (user.email) {
      await sendOrderConfirmedEmail(
        user.email,
        user.name,
        orderNumber,
        totalRupees,
        validatedOrderItems.length,
        String(shippingCity).trim()
      )
    }
  } catch (notifErr) {
    console.error('[Order Notification Error]:', notifErr)
  }

  return {
    success: true,
    orderId: createdOrder.id,
    orderNumber: createdOrder.orderNumber,
    totalAmount: createdOrder.totalAmount,
  }
})
