<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'owner'],
})

const authStore = useAuthStore()

const {
  data,
  pending,
  error,
  refresh,
} = await useFetch<{
  success: boolean
  stats: {
    totalRevenue: number
    totalItemsSold: number
    ordersCount: number
    totalProducts: number
    activeProducts: number
    lowStockCount: number
    shopViews: number
  }
  recentOrders: any[]
  lowStockProducts: any[]
}>('/api/owner/overview')

const stats = computed(() => data.value?.stats || {
  totalRevenue: 0,
  totalItemsSold: 0,
  ordersCount: 0,
  totalProducts: 0,
  activeProducts: 0,
  lowStockCount: 0,
  shopViews: 0,
})

const recentOrders = computed(() => data.value?.recentOrders ?? [])
const lowStockProducts = computed(() => data.value?.lowStockProducts ?? [])
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--shopizz-saffron)]">
          Owner / Workspace Overview
        </p>

        <h1 class="mt-2 font-serif text-3xl font-medium tracking-tight text-[var(--shopizz-obsidian)] sm:text-4xl">
          Welcome back, {{ authStore.user?.name }}
        </h1>

        <p class="mt-2 max-w-xl text-xs leading-relaxed text-[var(--shopizz-obsidian)]/60">
          Here's what's happening with your shop today. Monitor your sales, incoming orders, and inventory.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink
          to="/owner/products/new"
          class="flex items-center gap-2 rounded-full bg-[var(--shopizz-obsidian)] px-5 py-2.5 text-xs font-medium text-white transition-all hover:bg-[var(--shopizz-moss)] hover:scale-105 shadow-sm"
        >
          <span>+ Add Product</span>
        </NuxtLink>

        <NuxtLink
          to="/owner/shop"
          class="flex items-center gap-1.5 rounded-full border border-[var(--shopizz-obsidian)]/15 bg-white/60 px-4 py-2.5 text-xs font-medium text-[var(--shopizz-obsidian)] transition-colors hover:bg-white"
        >
          <span>Go to my shop</span>
          <span class="text-xs">→</span>
        </NuxtLink>

        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--shopizz-obsidian)]/10 bg-white/60 text-xs text-[var(--shopizz-obsidian)] transition-colors hover:bg-white"
          title="Refresh Data"
          @click="refresh()"
        >
          🔄
        </button>
      </div>
    </section>

    <!-- Loading -->
    <AppLoading
      v-if="pending"
      text="Loading shop analytics..."
    />

    <!-- Error -->
    <div
      v-else-if="error"
      class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-8 text-center"
    >
      <p class="text-sm text-[var(--shopizz-obsidian)]/70">
        Unable to load shop overview data.
      </p>
      <AppButton
        class="mt-4"
        size="sm"
        @click="refresh()"
      >
        Try again
      </AppButton>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- 4 KPI Metrics -->
      <OwnerOverviewMetrics
        :total-revenue="stats.totalRevenue"
        :orders-count="stats.ordersCount"
        :total-products="stats.totalProducts"
        :low-stock-count="stats.lowStockCount"
        :shop-views="stats.shopViews"
      />

      <!-- Two-Column Feed: Recent Orders & Low Stock Alert -->
      <section class="grid gap-6 lg:grid-cols-2">
        <OwnerRecentOrders :orders="recentOrders" />
        <OwnerLowStock :products="lowStockProducts" />
      </section>

      <!-- Growth & Editorial Banner -->
      <OwnerGrowthBanner />
    </template>
  </div>
</template>
