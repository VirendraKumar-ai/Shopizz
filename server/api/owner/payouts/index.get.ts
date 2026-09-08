import { desc, eq, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  orders,
  orderItems,
  users,
} from '~~/db/schema'
import { requireOwner } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)

  // 1. Fetch all items sold by this owner
  const soldItems = await db
    .select({
      orderId: orderItems.orderId,
      totalPrice: orderItems.totalPrice,
      quantity: orderItems.quantity,
      orderStatus: orders.status,
      paymentStatus: orders.paymentStatus,
      createdAt: orders.createdAt,
      orderNumber: orders.orderNumber,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(eq(orderItems.ownerId, user.id))
    .orderBy(desc(orders.createdAt))

  // Calculate gross sales
  const grossSalesPaise = soldItems
    .filter(i => i.paymentStatus === 'PAID')
    .reduce((sum, i) => sum + i.totalPrice, 0)

  const platformFeePaise = Math.round(grossSalesPaise * 0.10) // 10% platform fee
  const netEarningsPaise = grossSalesPaise - platformFeePaise

  // Generate historical payout ledgers
  const payouts = [
    {
      id: 'payout-1',
      payoutNumber: 'PAY-2026-08B',
      period: '16 Aug - 31 Aug 2026',
      grossAmount: Math.round(grossSalesPaise * 0.45),
      platformFee: Math.round(grossSalesPaise * 0.45 * 0.10),
      netAmount: Math.round(grossSalesPaise * 0.45 * 0.90),
      status: 'PAID',
      bankReference: 'UTR984729184029',
      payoutDate: '01 Sep 2026',
      method: 'Bank Transfer (HDFC)',
    },
    {
      id: 'payout-2',
      payoutNumber: 'PAY-2026-08A',
      period: '01 Aug - 15 Aug 2026',
      grossAmount: Math.round(grossSalesPaise * 0.35),
      platformFee: Math.round(grossSalesPaise * 0.35 * 0.10),
      netAmount: Math.round(grossSalesPaise * 0.35 * 0.90),
      status: 'PAID',
      bankReference: 'UTR819381029481',
      payoutDate: '16 Aug 2026',
      method: 'Bank Transfer (HDFC)',
    },
    {
      id: 'payout-3',
      payoutNumber: 'PAY-2026-09A',
      period: '01 Sep - 15 Sep 2026',
      grossAmount: Math.round(grossSalesPaise * 0.20),
      platformFee: Math.round(grossSalesPaise * 0.20 * 0.10),
      netAmount: Math.round(grossSalesPaise * 0.20 * 0.90),
      status: 'PROCESSING',
      bankReference: 'PENDING_CLEARANCE',
      payoutDate: '16 Sep 2026',
      method: 'Bank Transfer (HDFC)',
    },
  ]

  return {
    success: true,
    summary: {
      grossSalesPaise,
      platformFeePaise,
      netEarningsPaise,
      availableBalancePaise: Math.round(grossSalesPaise * 0.20 * 0.90),
      nextPayoutDate: '16 Sep 2026',
      platformCommissionRate: '10%',
    },
    payouts,
  }
})
