import { inArray, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { products, inventory } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const clientItems: { productId: string; quantity: number }[] = body?.items ?? []

  if (!Array.isArray(clientItems) || clientItems.length === 0) {
    return {
      success: true,
      validation: {
        valid: true,
        items: [],
        subtotal: 0,
        shipping: 0,
        total: 0,
      },
    }
  }

  const productIds = clientItems.map((item) => item.productId).filter(Boolean)

  if (productIds.length === 0) {
    return {
      success: true,
      validation: {
        valid: false,
        items: [],
        subtotal: 0,
        shipping: 0,
        total: 0,
      },
    }
  }

  // Fetch live products and inventory from DB
  const dbProducts = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      status: products.status,
      stock: inventory.quantity,
    })
    .from(products)
    .leftJoin(inventory, eq(products.id, inventory.productId))
    .where(inArray(products.id, productIds))

  const productMap = new Map<string, typeof dbProducts[0]>()
  for (const p of dbProducts) {
    productMap.set(p.id, p)
  }

  let isCartValid = true
  let subtotal = 0
  const validatedItems = []

  for (const item of clientItems) {
    const dbProduct = productMap.get(item.productId)

    if (!dbProduct || dbProduct.status !== 'ACTIVE') {
      isCartValid = false
      validatedItems.push({
        productId: item.productId,
        name: dbProduct?.name || 'Unknown Item',
        requestedQuantity: item.quantity,
        availableQuantity: 0,
        unitPrice: 0,
        totalPrice: 0,
        isValid: false,
        message: 'Product is no longer available.',
      })
      continue
    }

    const availableStock = dbProduct.stock ?? 0
    const qtyValid = item.quantity > 0 && item.quantity <= availableStock

    if (!qtyValid) {
      isCartValid = false
    }

    const itemTotalPrice = dbProduct.price * item.quantity
    subtotal += itemTotalPrice

    validatedItems.push({
      productId: dbProduct.id,
      name: dbProduct.name,
      requestedQuantity: item.quantity,
      availableQuantity: availableStock,
      unitPrice: dbProduct.price,
      totalPrice: itemTotalPrice,
      isValid: qtyValid,
      message:
        availableStock < item.quantity
          ? `Only ${availableStock} available in stock.`
          : undefined,
    })
  }

  // Free shipping over ₹5,000 (500000 paise)
  const shipping = subtotal >= 500000 || subtotal === 0 ? 0 : 15000
  const total = subtotal + shipping

  return {
    success: true,
    validation: {
      valid: isCartValid,
      items: validatedItems,
      subtotal,
      shipping,
      total,
    },
  }
})
