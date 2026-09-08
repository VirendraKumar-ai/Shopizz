<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const authStore = useAuthStore()

const { data, pending, error, refresh } = await useFetch<{
  success: boolean
  stats: {
    pendingRequests: number
    activeOwners: number
    totalProducts: number
    totalCategories: number
  }
  recentRequests: any[]
  recentOrders: any[]
}>('/api/admin/overview')

const stats = computed(() => data.value?.stats || {
  pendingRequests: 0,
  activeOwners: 0,
  totalProducts: 0,
  totalCategories: 0,
})

const recentRequests = computed(() => data.value?.recentRequests || [])
const recentOrders = computed(() => data.value?.recentOrders || [])
</script>

<template>
  <div class="space-y-8">
    <!-- Page heading -->
    <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--shopizz-saffron)]">
          Admin / Marketplace Overview
        </p>

        <h1 class="mt-2 font-serif text-3xl font-medium tracking-tight text-[var(--shopizz-obsidian)] sm:text-4xl">
          Marketplace Overview
        </h1>

        <p class="mt-2 max-w-xl text-xs leading-relaxed text-[var(--shopizz-obsidian)]/60">
          Manage makers, curate categories and oversee marketplace operations and ecosystem health.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="text-right">
          <p class="text-xs font-semibold text-[var(--shopizz-obsidian)]">
            {{ authStore.user?.name || 'Administrator' }}
          </p>
          <p class="text-[10px] text-[var(--shopizz-obsidian)]/50">
            Marketplace Director
          </p>
        </div>

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

    <!-- Loading State -->
    <AppLoading
      v-if="pending"
      text="Loading marketplace statistics..."
    />

    <!-- Error State -->
    <div
      v-else-if="error"
      class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-8 text-center"
    >
      <p class="text-sm text-[var(--shopizz-obsidian)]/70">
        Unable to load marketplace overview.
      </p>
      <AppButton
        class="mt-4"
        size="sm"
        @click="refresh()"
      >
        Retry
      </AppButton>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- 4 KPI Metrics -->
      <AdminOverviewMetrics
        :pending-requests="stats.pendingRequests"
        :active-owners="stats.activeOwners"
        :total-products="stats.totalProducts"
        :total-categories="stats.totalCategories"
      />

      <!-- Quick Actions -->
      <AdminQuickActions />

      <!-- Two-Column Feed: Recent Requests & Recent Activity -->
      <section class="grid gap-6 lg:grid-cols-2">
        <AdminRecentRequests :requests="recentRequests" />
        <AdminRecentActivity :orders="recentOrders" />
      </section>
    </template>
  </div>
</template>