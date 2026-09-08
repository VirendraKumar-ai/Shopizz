<script setup lang="ts">
interface Props {
  totalRevenue: number
  ordersCount: number
  totalProducts: number
  lowStockCount: number
  shopViews: number
}

const props = defineProps<Props>()

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount / 100)
}
</script>

<template>
  <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <!-- 1. Total Sales -->
    <div class="relative flex flex-col justify-between rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-6 transition-all duration-300 hover:border-[var(--shopizz-obsidian)]/20 hover:bg-white hover:shadow-sm">
      <div>
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--shopizz-obsidian)]/50">
            Total Sales
          </p>
          <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
            +18% mo
          </span>
        </div>
        <div class="mt-3 font-serif text-3xl font-semibold tracking-tight text-[var(--shopizz-obsidian)]">
          {{ formatPrice(totalRevenue) }}
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-[var(--shopizz-obsidian)]/10 text-xs text-[var(--shopizz-obsidian)]/55">
        Gross customer earnings
      </div>
    </div>

    <!-- 2. Total Orders -->
    <NuxtLink
      to="/owner/orders"
      class="group relative flex flex-col justify-between rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-6 transition-all duration-300 hover:border-[var(--shopizz-obsidian)]/20 hover:bg-white hover:shadow-sm"
    >
      <div>
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--shopizz-obsidian)]/50">
            Total Orders
          </p>
          <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
            +8% wk
          </span>
        </div>
        <div class="mt-3 font-serif text-3xl font-semibold tracking-tight text-[var(--shopizz-obsidian)]">
          {{ ordersCount }}
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between pt-3 border-t border-[var(--shopizz-obsidian)]/10">
        <span class="text-xs text-[var(--shopizz-obsidian)]/55">Fulfilled & live</span>
        <span class="text-xs font-bold text-[var(--shopizz-obsidian)] transition-transform group-hover:translate-x-1">→</span>
      </div>
    </NuxtLink>

    <!-- 3. Active Products & Low Stock -->
    <NuxtLink
      to="/owner/products"
      class="group relative flex flex-col justify-between rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-6 transition-all duration-300 hover:border-[var(--shopizz-obsidian)]/20 hover:bg-white hover:shadow-sm"
    >
      <div>
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--shopizz-obsidian)]/50">
            Products
          </p>
          <span
            v-if="lowStockCount > 0"
            class="rounded-full bg-[#faece7] px-2 py-0.5 text-[9px] font-semibold text-[#94442a]"
          >
            {{ lowStockCount }} low stock
          </span>
          <span
            v-else
            class="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700"
          >
            In stock
          </span>
        </div>
        <div class="mt-3 font-serif text-3xl font-semibold tracking-tight text-[var(--shopizz-obsidian)]">
          {{ totalProducts }}
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between pt-3 border-t border-[var(--shopizz-obsidian)]/10">
        <span class="text-xs text-[var(--shopizz-obsidian)]/55">Active listings</span>
        <span class="text-xs font-bold text-[var(--shopizz-obsidian)] transition-transform group-hover:translate-x-1">→</span>
      </div>
    </NuxtLink>

    <!-- 4. Shop Views -->
    <div class="relative flex flex-col justify-between rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-6 transition-all duration-300 hover:border-[var(--shopizz-obsidian)]/20 hover:bg-white hover:shadow-sm">
      <div>
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--shopizz-obsidian)]/50">
            Shop Views
          </p>
          <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
            +24% wk
          </span>
        </div>
        <div class="mt-3 font-serif text-3xl font-semibold tracking-tight text-[var(--shopizz-obsidian)]">
          {{ shopViews.toLocaleString() }}
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-[var(--shopizz-obsidian)]/10 text-xs text-[var(--shopizz-obsidian)]/55">
        Marketplace impressions
      </div>
    </div>
  </section>
</template>
