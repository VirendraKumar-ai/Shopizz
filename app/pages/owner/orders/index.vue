<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'owner'],
})

const {
  data,
  pending,
  error,
  refresh,
} = await useFetch<{
  success: boolean
  orders: any[]
}>('/api/owner/orders')

const orders = computed(() => data.value?.orders ?? [])

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
      o.customerName.toLowerCase().includes(query) ||
      o.customerCity.toLowerCase().includes(query) ||
      o.items.some((i: any) => i.productName?.toLowerCase().includes(query))
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
            Owner / Orders
          </p>

          <h1 class="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
            Customer Orders
          </h1>

          <p class="mt-3 max-w-xl text-sm leading-7 text-[var(--shopizz-obsidian)]/55">
            Manage fulfillment, update shipment milestones, and track customer dispatches for your shop.
          </p>
        </div>
      </div>
    </section>

    <!-- Filters Bar -->
    <section class="flex flex-col gap-4 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div class="w-full sm:w-80">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search by Order #, Customer, City..."
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
    <AppLoading v-if="pending" text="Loading customer orders..." />

    <!-- Error -->
    <div
      v-else-if="error"
      class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-8"
    >
      <p class="text-sm text-[var(--shopizz-obsidian)]/60">
        Failed to load orders.
      </p>
      <AppButton class="mt-4" size="sm" @click="refresh()">
        Try again
      </AppButton>
    </div>

    <!-- Empty State -->
    <AppEmptyState
      v-else-if="!filteredOrders.length"
      title="No orders found"
      description="No customer orders match your current filter."
    />

    <!-- Orders Table -->
    <section v-else class="overflow-hidden rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30">
      <table class="w-full text-left text-xs">
        <thead class="border-b border-[var(--shopizz-obsidian)]/10 bg-white/40 text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">
          <tr>
            <th class="px-6 py-4">Order / Date</th>
            <th class="px-6 py-4">Customer & Destination</th>
            <th class="px-6 py-4">Your Items Sold</th>
            <th class="px-6 py-4">Shop Revenue</th>
            <th class="px-6 py-4">Fulfillment Status</th>
            <th class="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--shopizz-obsidian)]/10">
          <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-white/40 transition-colors">
            <!-- Order / Date -->
            <td class="px-6 py-4">
              <p class="font-mono font-semibold text-sm text-[var(--shopizz-obsidian)]">
                {{ order.orderNumber }}
              </p>
              <p class="text-[10px] text-[var(--shopizz-obsidian)]/45 mt-0.5">
                {{ formatDate(order.createdAt) }}
              </p>
            </td>

            <!-- Customer -->
            <td class="px-6 py-4">
              <p class="font-medium text-[var(--shopizz-obsidian)]">{{ order.customerName }}</p>
              <p class="text-[11px] text-[var(--shopizz-obsidian)]/55">{{ order.customerCity }}, {{ order.customerState }}</p>
              <p class="text-[10px] text-[var(--shopizz-obsidian)]/40 font-mono">{{ order.customerPhone }}</p>
            </td>

            <!-- Product Items -->
            <td class="px-6 py-4">
              <div class="space-y-1 max-w-xs">
                <div
                  v-for="item in order.items"
                  :key="item.id"
                  class="flex items-center gap-2 text-xs"
                >
                  <span class="font-mono text-[10px] bg-white/60 px-1 py-0.2 rounded border border-[var(--shopizz-obsidian)]/10">
                    {{ item.quantity }}x
                  </span>
                  <span class="truncate font-medium">{{ item.productName }}</span>
                </div>
              </div>
            </td>

            <!-- Revenue -->
            <td class="px-6 py-4">
              <p class="font-semibold text-sm">₹{{ formatRupees(order.ownerSubtotal) }}</p>
              <div class="mt-0.5">
                <OrderStatusBadge :status="order.paymentStatus" type="payment" />
              </div>
            </td>

            <!-- Status -->
            <td class="px-6 py-4">
              <OrderStatusBadge :status="order.status" />
            </td>

            <!-- Action -->
            <td class="px-6 py-4 text-right">
              <NuxtLink
                :to="`/owner/orders/${order.id}`"
                class="rounded-xl border border-[var(--shopizz-obsidian)]/10 bg-white px-3.5 py-1.5 font-medium text-[var(--shopizz-obsidian)] hover:bg-[var(--shopizz-obsidian)] hover:text-white transition-all shadow-sm"
              >
                Manage →
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
