<script setup lang="ts">
interface OrderActivity {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  shippingName: string
  shippingCity: string
  createdAt: string
}

interface Props {
  orders: OrderActivity[]
}

defineProps<Props>()

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

const formatRelativeTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 60) {
    return `${Math.max(1, diffInMinutes)}m ago`
  }
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
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
            Live Feed
          </p>
          <h3 class="mt-1 text-lg font-medium tracking-tight text-[var(--shopizz-obsidian)]">
            Recent Marketplace Activity
          </h3>
        </div>

        <div class="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="!orders.length"
        class="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--shopizz-obsidian)]/15 bg-white/30 py-10 text-center"
      >
        <span class="text-2xl">📦</span>
        <p class="mt-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70">
          No marketplace orders yet
        </p>
        <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/40">
          New customer orders will stream in live.
        </p>
      </div>

      <!-- Orders Activity List -->
      <div
        v-else
        class="mt-5 space-y-3"
      >
        <div
          v-for="order in orders"
          :key="order.id"
          class="flex items-center justify-between rounded-2xl border border-[var(--shopizz-obsidian)]/8 bg-white/80 p-4 transition-all hover:bg-white hover:shadow-sm"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--shopizz-stone)] text-base">
              🛍️
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <p class="truncate text-xs font-semibold text-[var(--shopizz-obsidian)]">
                  {{ order.orderNumber }}
                </p>
                <span
                  class="rounded-md border px-1.5 py-0.5 text-[9px] font-medium uppercase"
                  :class="getStatusBadgeClass(order.status)"
                >
                  {{ order.status }}
                </span>
              </div>
              <p class="mt-0.5 truncate text-[11px] text-[var(--shopizz-obsidian)]/55">
                {{ order.shippingName }} ({{ order.shippingCity }}) • {{ formatRelativeTime(order.createdAt) }}
              </p>
            </div>
          </div>

          <div class="text-right shrink-0">
            <p class="text-xs font-semibold text-[var(--shopizz-obsidian)]">
              {{ formatPrice(order.totalAmount) }}
            </p>
            <NuxtLink
              :to="`/admin/orders/${order.id}`"
              class="mt-0.5 inline-block text-[10px] font-medium text-[var(--shopizz-saffron)] hover:underline"
            >
              Details →
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 pt-4 border-t border-[var(--shopizz-obsidian)]/10 text-right">
      <NuxtLink
        to="/admin/orders"
        class="text-xs font-medium text-[var(--shopizz-saffron)] hover:underline"
      >
        View all marketplace orders →
      </NuxtLink>
    </div>
  </div>
</template>
