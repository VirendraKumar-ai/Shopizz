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
  summary: {
    totalRevenue: number
    totalUnitsSold: number
    ordersCount: number
    totalCost: number
    grossProfit: number
    profitMargin: number
  }
  performance: {
    productId: string
    productName: string
    productSlug: string
    unitPrice: number
    costPrice: number
    unitsSold: number
    revenue: number
    profit: number
  }[]
}>('/api/owner/sales')

const summary = computed(() => data.value?.summary)
const performance = computed(() => data.value?.performance ?? [])

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount / 100)
}
</script>

<template>
  <div class="space-y-10">
    <!-- Header -->
    <section>
      <p class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]">
        Owner / 004
      </p>

      <h1 class="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
        Sales & Financials
      </h1>

      <p class="mt-3 max-w-xl text-sm leading-7 text-[var(--shopizz-obsidian)]/55">
        Detailed revenue analysis, units sold and gross margin estimation for your shop.
      </p>
    </section>

    <!-- Loading -->
    <AppLoading v-if="pending" text="Calculating shop financial metrics..." />

    <!-- Error -->
    <div
      v-else-if="error"
      class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-8"
    >
      <p class="text-sm text-[var(--shopizz-obsidian)]/60">
        Failed to load sales analytics.
      </p>
      <AppButton class="mt-4" size="sm" @click="refresh()">
        Try again
      </AppButton>
    </div>

    <!-- Content -->
    <template v-else-if="summary">
      <!-- Financial Summary Cards -->
      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStat
          label="Total Revenue"
          :value="formatPrice(summary.totalRevenue)"
          description="Gross earnings from all customer sales"
        />

        <DashboardStat
          label="Estimated Gross Profit"
          :value="formatPrice(summary.grossProfit)"
          description="Revenue minus recorded cost of goods"
        />

        <DashboardStat
          label="Gross Margin"
          :value="`${summary.profitMargin}%`"
          description="Average profitability ratio"
        />

        <DashboardStat
          label="Total Units Sold"
          :value="summary.totalUnitsSold"
          description="Total individual products dispatched"
        />
      </section>

      <!-- Product-by-Product Performance -->
      <section class="space-y-4">
        <h2 class="text-xl font-medium tracking-tight">
          Product Performance Breakdown
        </h2>

        <div class="overflow-hidden rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30">
          <div v-if="!performance.length" class="p-16 text-center text-sm text-[var(--shopizz-obsidian)]/50">
            No sales recorded yet. Once your pieces are sold, financial margins will appear here.
          </div>

          <table v-else class="w-full text-left text-xs">
            <thead class="border-b border-[var(--shopizz-obsidian)]/10 bg-white/40 text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">
              <tr>
                <th class="px-6 py-4">Piece</th>
                <th class="px-6 py-4">Selling Price</th>
                <th class="px-6 py-4">Cost Price</th>
                <th class="px-6 py-4">Units Sold</th>
                <th class="px-6 py-4">Total Revenue</th>
                <th class="px-6 py-4">Gross Profit</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--shopizz-obsidian)]/10">
              <tr v-for="item in performance" :key="item.productId" class="hover:bg-white/40 transition-colors">
                <td class="px-6 py-4 font-medium text-sm">
                  <NuxtLink :to="`/product/${item.productSlug}`" class="hover:underline">
                    {{ item.productName }}
                  </NuxtLink>
                </td>
                <td class="px-6 py-4">{{ formatPrice(item.unitPrice) }}</td>
                <td class="px-6 py-4 text-[var(--shopizz-obsidian)]/50">{{ formatPrice(item.costPrice) }}</td>
                <td class="px-6 py-4 font-medium">{{ item.unitsSold }}</td>
                <td class="px-6 py-4 font-medium">{{ formatPrice(item.revenue) }}</td>
                <td class="px-6 py-4 font-medium text-[var(--shopizz-moss)]">{{ formatPrice(item.profit) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>
