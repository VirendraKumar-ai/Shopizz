<script setup lang="ts">
interface OrderItem {
  id: string
  orderId: string
  orderNumber: string
  orderStatus: string
  productName: string
  quantity: number
  totalPrice: number
  customerName: string
  customerCity: string
  createdAt: string
}

interface Props {
  orders: OrderItem[]
}

defineProps<Props>()

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'SHIPPED':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'PROCESSING':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    default:
      return 'bg-[var(--shopizz-stone)] text-[var(--shopizz-obsidian)]/70 border-[var(--shopizz-obsidian)]/10'
  }
}
</script>

<template>
  <div class="flex flex-col justify-between rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-6 sm:p-7">
    <div>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--shopizz-saffron)]">
            Fulfillment
          </p>
          <h3 class="mt-1 text-lg font-medium tracking-tight text-[var(--shopizz-obsidian)]">
            Recent Orders
          </h3>
        </div>

        <NuxtLink
          to="/owner/orders"
          class="text-xs font-medium text-[var(--shopizz-obsidian)]/60 hover:text-[var(--shopizz-obsidian)] hover:underline"
        >
          All orders →
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div
        v-if="!orders.length"
        class="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--shopizz-obsidian)]/15 bg-white/30 py-12 text-center"
      >
        <span class="text-2xl">🛍️</span>
        <p class="mt-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70">
          No orders received yet
        </p>
        <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/40">
          When buyers order your products, they will appear here.
        </p>
      </div>

      <!-- Orders Table -->
      <div
        v-else
        class="mt-5 overflow-x-auto rounded-2xl border border-[var(--shopizz-obsidian)]/8 bg-white/70"
      >
        <table class="w-full text-left text-xs">
          <thead class="border-b border-[var(--shopizz-obsidian)]/8 bg-white/50 text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/45">
            <tr>
              <th class="px-4 py-3">Order</th>
              <th class="px-4 py-3">Product</th>
              <th class="px-4 py-3">Buyer</th>
              <th class="px-4 py-3 text-center">Qty</th>
              <th class="px-4 py-3">Total</th>
              <th class="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--shopizz-obsidian)]/8">
            <tr
              v-for="order in orders"
              :key="order.id"
              class="transition-colors hover:bg-white"
            >
              <td class="px-4 py-3 font-medium text-[var(--shopizz-obsidian)]">
                {{ order.orderNumber }}
              </td>
              <td class="px-4 py-3 font-medium text-[var(--shopizz-obsidian)]/80 max-w-[140px] truncate">
                {{ order.productName }}
              </td>
              <td class="px-4 py-3 text-[var(--shopizz-obsidian)]/60 max-w-[120px] truncate">
                {{ order.customerName }}
              </td>
              <td class="px-4 py-3 text-center font-medium">
                {{ order.quantity }}
              </td>
              <td class="px-4 py-3 font-semibold text-[var(--shopizz-obsidian)]">
                {{ formatPrice(order.totalPrice) }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="rounded-md border px-2 py-0.5 text-[9px] font-semibold uppercase"
                  :class="getStatusBadgeClass(order.orderStatus)"
                >
                  {{ order.orderStatus }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="mt-6 pt-4 border-t border-[var(--shopizz-obsidian)]/10 text-right">
      <NuxtLink
        to="/owner/orders"
        class="text-xs font-medium text-[var(--shopizz-saffron)] hover:underline"
      >
        Manage all incoming shop orders →
      </NuxtLink>
    </div>
  </div>
</template>
