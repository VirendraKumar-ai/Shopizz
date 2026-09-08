import { inArray, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  orders,
  orderItems,
  orderStatusHistory,
  products,
  productImages,
  inventory,
} from '~~/db/schema'

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
    shippingCountry = 'India',
    paymentMethod = 'ONLINE',
    notes,
  } = body

  if (!Array.isArray(items) || items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot create order with an empty bag',
    })
  }

  if (!shippingName || !shippingPhone || !shippingAddress || !shippingCity || !shippingState || !shippingPostalCode) {
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

  // 1. Fetch live products from DB
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

  const productMap = new Map<string, typeof dbProducts[0]>()
  for (const p of dbProducts) {
    if (!productMap.has(p.id)) {
      productMap.set(p.id, p)
    }
  }

  // 2. Validate all items & stock server-side
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

    if (!dbProduct || dbProduct.status !== 'ACTIVE') {
      throw createError({
        statusCode: 400,
        statusMessage: `Product "${dbProduct?.name || item.productId}" is no longer active or available`,
      })
    }

    const availableStock = dbProduct.stock ?? 0
    if (item.quantity <= 0 || item.quantity > availableStock) {
      throw createError({
        statusCode: 400,
        statusMessage: `Insufficient stock for "${dbProduct.name}". Only ${availableStock} left in inventory.`,
      })
    }

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

  // Free shipping over ₹5,000 (500000 paise)
  const shippingFee = subtotal >= 500000 ? 0 : 15000
  const taxAmount = 0
  const discountAmount = 0
  const totalAmount = subtotal + shippingFee + taxAmount - discountAmount

  // 3. Generate human readable Order Number: SZ-YYYYMMDD-XXXX
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const orderNumber = `SZ-${dateStr}-${randomSuffix}`

  // 4. Create Order in database
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
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      paymentMethod: String(paymentMethod).trim(),
      notes: notes ? String(notes).trim() : null,
    })
    .returning()

  // 5. Insert initial status history
  await db.insert(orderStatusHistory).values({
    orderId: createdOrder.id,
    status: 'PLACED',
    message: 'Order placed successfully by buyer.',
    updatedBy: user.id,
  })

  // 6. Insert snapshotted order items & decrement inventory
  for (const item of validatedOrderItems) {
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

    // Decrement inventory stock
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

  return {
    success: true,
    orderId: createdOrder.id,
    orderNumber: createdOrder.orderNumber,
    totalAmount: createdOrder.totalAmount,
  }
})
