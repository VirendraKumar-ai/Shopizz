import { desc, eq, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  orderItems,
  products,
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)

  // 1. Overall financial summary
  const [salesSummary] = await db
    .select({
      totalRevenue: sql<number>`coalesce(sum(${orderItems.totalPrice}), 0)`.mapWith(Number),
      totalUnitsSold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`.mapWith(Number),
      ordersCount: sql<number>`count(distinct ${orderItems.orderId})`.mapWith(Number),
      totalCost: sql<number>`coalesce(sum(${products.costPrice} * ${orderItems.quantity}), 0)`.mapWith(Number),
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.ownerId, user.id))

  const totalRevenue = salesSummary?.totalRevenue ?? 0
  const totalCost = salesSummary?.totalCost ?? 0
  const grossProfit = Math.max(0, totalRevenue - totalCost)
  const profitMargin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0

  // 2. Product-by-product breakdown
  const productPerformance = await db
    .select({
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      unitPrice: products.price,
      costPrice: products.costPrice,
      unitsSold: sql<number>`sum(${orderItems.quantity})`.mapWith(Number),
      revenue: sql<number>`sum(${orderItems.totalPrice})`.mapWith(Number),
      profit: sql<number>`sum(${orderItems.totalPrice} - (${products.costPrice} * ${orderItems.quantity}))`.mapWith(Number),
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.ownerId, user.id))
    .groupBy(products.id)
    .orderBy(desc(sql`sum(${orderItems.totalPrice})`))

  return {
    success: true,
    summary: {
      totalRevenue,
      totalUnitsSold: salesSummary?.totalUnitsSold ?? 0,
      ordersCount: salesSummary?.ordersCount ?? 0,
      totalCost,
      grossProfit,
      profitMargin,
    },
    performance: productPerformance,
  }
})
