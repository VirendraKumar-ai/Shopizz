<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const {
  data,
  pending,
  error,
  refresh,
} = await useFetch<{
  success: boolean
  orders: any[]
  metrics: {
    totalOrders: number
    placedCount: number
    processingCount: number
    shippedCount: number
    deliveredCount: number
    totalRevenue: number
  }
}>('/api/admin/orders')

const orders = computed(() => data.value?.orders ?? [])
const metrics = computed(() => data.value?.metrics ?? {
  totalOrders: 0,
  placedCount: 0,
  processingCount: 0,
  shippedCount: 0,
  deliveredCount: 0,
  totalRevenue: 0,
})

const searchQuery = ref('')
const selectedStatus = ref('ALL')

const filteredOrders = computed(() => {
  let result = orders.value

  if (selectedStatus.value !== 'ALL') {
    result = result.filter((o) => o.status === selectedStatus.value)
  }

  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    result = result.filter((o) =>
      o.orderNumber.toLowerCase().includes(query) ||
      o.buyerName.toLowerCase().includes(query) ||
      o.buyerEmail.toLowerCase().includes(query) ||
      o.shippingCity.toLowerCase().includes(query) ||
      o.itemsSummary.some((item: string) => item.toLowerCase().includes(query))
    )
  }

  return result
})

const formatRupees = (paise: number) => {
  return (paise / 100).toLocaleString('en-IN')
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="space-y-10">
    <!-- Header -->
    <section>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]">
            Admin / 005
          </p>

          <h1 class="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
            Marketplace Orders
          </h1>

          <p class="mt-3 max-w-xl text-sm leading-7 text-[var(--shopizz-obsidian)]/55">
            Audit all platform transactions, delivery fulfillment milestones, and multi-vendor settlements.
          </p>
        </div>
      </div>
    </section>

    <!-- Metrics Cards -->
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardStat
        label="Total Orders"
        :value="metrics.totalOrders"
        description="All-time marketplace transactions"
      />

      <DashboardStat
        label="Awaiting Confirmation"
        :value="metrics.placedCount"
        description="New orders placed by buyers"
      />

      <DashboardStat
        label="In Craft & Dispatch"
        :value="metrics.processingCount + metrics.shippedCount"
        description="Active fulfillment in progress"
      />

      <DashboardStat
        label="Gross Marketplace Volume"
        :value="`₹${formatRupees(metrics.totalRevenue)}`"
        description="Cumulative gross transaction value"
      />
    </section>

    <!-- Filters Bar -->
    <section class="flex flex-col gap-4 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div class="w-full sm:w-80">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Filter by Order #, Buyer, City, Piece..."
          class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-[var(--shopizz-obsidian)]"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="status in ['ALL', 'PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']"
          :key="status"
          type="button"
          class="rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider transition-all"
          :class="
            selectedStatus === status
              ? 'bg-[var(--shopizz-obsidian)] text-white shadow-sm'
              : 'bg-white/40 text-[var(--shopizz-obsidian)]/60 hover:bg-white'
          "
          @click="selectedStatus = status"
        >
          {{ status }}
        </button>
      </div>
    </section>

    <!-- Loading -->
    <AppLoading v-if="pending" text="Loading platform transactions..." />

    <!-- Error -->
    <div
      v-else-if="error"
      class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-8"
    >
      <p class="text-sm text-[var(--shopizz-obsidian)]/60">
        Failed to load marketplace orders.
      </p>
      <AppButton class="mt-4" size="sm" @click="refresh()">
        Try again
      </AppButton>
    </div>

    <!-- Empty State -->
    <AppEmptyState
      v-else-if="!filteredOrders.length"
      title="No orders found"
      description="No marketplace orders match your query or filter."
    />

    <!-- Orders Table -->
    <section v-else class="overflow-hidden rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30">
      <table class="w-full text-left text-xs">
        <thead class="border-b border-[var(--shopizz-obsidian)]/10 bg-white/40 text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">
          <tr>
            <th class="px-6 py-4">Order / Placed</th>
            <th class="px-6 py-4">Buyer Details</th>
            <th class="px-6 py-4">Summary of Pieces</th>
            <th class="px-6 py-4">Total (₹ INR)</th>
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4 text-right">Audit</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--shopizz-obsidian)]/10">
          <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-white/40 transition-colors">
            <!-- Order Number & Date -->
            <td class="px-6 py-4">
              <p class="font-mono font-semibold text-sm text-[var(--shopizz-obsidian)]">
                {{ order.orderNumber }}
              </p>
              <p class="text-[10px] text-[var(--shopizz-obsidian)]/45 mt-0.5">
                {{ formatDate(order.createdAt) }}
              </p>
            </td>

            <!-- Buyer Details -->
            <td class="px-6 py-4">
              <p class="font-medium text-[var(--shopizz-obsidian)]">{{ order.buyerName }}</p>
              <p class="text-[10px] text-[var(--shopizz-obsidian)]/45 truncate max-w-[180px]">{{ order.buyerEmail }}</p>
              <p class="text-[10px] text-[var(--shopizz-obsidian)]/60 mt-0.5">{{ order.shippingCity }}, {{ order.shippingState }}</p>
            </td>

            <!-- Pieces Summary -->
            <td class="px-6 py-4">
              <p class="font-medium text-xs">{{ order.totalItemsCount }} {{ order.totalItemsCount === 1 ? 'item' : 'items' }}</p>
              <p class="text-[10px] text-[var(--shopizz-obsidian)]/50 truncate max-w-[200px]">
                {{ order.itemsSummary.join(', ') }}
              </p>
            </td>

            <!-- Total Amount & Payment -->
            <td class="px-6 py-4">
              <p class="font-bold text-sm">₹{{ formatRupees(order.totalAmount) }}</p>
              <div class="mt-0.5">
                <OrderStatusBadge :status="order.paymentStatus" type="payment" />
              </div>
            </td>

            <!-- Lifecycle Status -->
            <td class="px-6 py-4">
              <OrderStatusBadge :status="order.status" />
            </td>

            <!-- Inspect Link -->
            <td class="px-6 py-4 text-right">
              <NuxtLink
                :to="`/admin/orders/${order.id}`"
                class="rounded-xl border border-[var(--shopizz-obsidian)]/10 bg-white px-3.5 py-1.5 font-medium text-[var(--shopizz-obsidian)] hover:bg-[var(--shopizz-obsidian)] hover:text-white transition-all shadow-sm"
              >
                Inspect →
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
