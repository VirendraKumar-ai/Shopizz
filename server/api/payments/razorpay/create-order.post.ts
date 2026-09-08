import { eq, inArray } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { products, inventory, productImages } from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'
import { getRazorpay } from '~~/server/utils/razorpay'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const {
    items = [],
    shippingName,
    shippingPhone,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingPostalCode,
  } = body

  if (!Array.isArray(items) || items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot create payment order with an empty shopping bag',
    })
  }

  if (
    !shippingName ||
    !shippingPhone ||
    !shippingAddress ||
    !shippingCity ||
    !shippingState ||
    !shippingPostalCode
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide complete delivery details',
    })
  }

  const productIds = items.map((i: any) => i.productId).filter(Boolean)
  if (productIds.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid order items',
    })
  }

  // 1. Fetch live products from DB to prevent client-side price tampering
  const dbProducts = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      price: products.price,
      ownerId: products.ownerId,
      status: products.status,
      stock: inventory.quantity,
    })
    .from(products)
    .leftJoin(inventory, eq(products.id, inventory.productId))
    .where(inArray(products.id, productIds))

  const productMap = new Map<string, (typeof dbProducts)[0]>()
  for (const p of dbProducts) {
    if (!productMap.has(p.id)) {
      productMap.set(p.id, p)
    }
  }

  // 2. Validate stock & calculate subtotal server-side in paise
  let subtotal = 0
  for (const item of items) {
    const dbProduct = productMap.get(item.productId)

    if (!dbProduct || dbProduct.status !== 'ACTIVE') {
      throw createError({
        statusCode: 400,
        statusMessage: `Product "${dbProduct?.name || item.productId}" is no longer available`,
      })
    }

    const availableStock = dbProduct.stock ?? 0
    if (item.quantity <= 0 || item.quantity > availableStock) {
      throw createError({
        statusCode: 400,
        statusMessage: `Insufficient stock for "${dbProduct.name}". Only ${availableStock} left in studio inventory.`,
      })
    }

    subtotal += dbProduct.price * item.quantity
  }

  // Free shipping over ₹5,000 (500,000 paise)
  const shippingFee = subtotal >= 500000 ? 0 : 15000
  const taxAmount = 0
  const discountAmount = 0
  const totalAmount = subtotal + shippingFee + taxAmount - discountAmount

  // 3. Generate human readable receipt / Order Number
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const orderNumber = `SZ-${dateStr}-${randomSuffix}`

  // 4. Create Razorpay Order
  const razorpay = getRazorpay()
  const config = useRuntimeConfig()

  try {
    const rzpOrder = await razorpay.orders.create({
      amount: totalAmount, // Amount in paise
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        buyerId: user.id,
        buyerEmail: user.email,
        orderNumber,
        shippingName: String(shippingName).trim(),
      },
    })

    return {
      success: true,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      orderNumber,
      keyId: config.public.razorpayKeyId || config.razorpayKeyId,
    }
  } catch (err: any) {
    console.error('[Razorpay Order Creation Error]:', err)
    throw createError({
      statusCode: 500,
      statusMessage: err?.error?.description || err?.message || 'Failed to initialize Razorpay payment order',
    })
  }
})
