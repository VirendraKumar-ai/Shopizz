<script setup lang="ts">
interface Props {
  pendingRequests: number
  activeOwners: number
  totalProducts: number
  totalCategories: number
}

defineProps<Props>()
</script>

<template>
  <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <!-- Card 1: Pending Owner Requests -->
    <NuxtLink
      to="/admin/requests"
      class="group relative flex flex-col justify-between rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-6 transition-all duration-300 hover:border-[var(--shopizz-obsidian)]/20 hover:bg-white hover:shadow-sm"
    >
      <div>
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--shopizz-saffron)]">
            Pending Requests
          </p>
          <span
            v-if="pendingRequests > 0"
            class="flex h-2 w-2 rounded-full bg-[#94442a]"
          />
        </div>
        <div class="mt-3 font-serif text-4xl font-semibold tracking-tight text-[var(--shopizz-obsidian)]">
          {{ pendingRequests }}
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between pt-3 border-t border-[var(--shopizz-obsidian)]/10">
        <span class="text-xs text-[var(--shopizz-obsidian)]/55">
          Requires your review
        </span>
        <span
          class="flex h-7 w-7 items-center justify-center rounded-full bg-[#ede5d8] text-xs font-bold text-[var(--shopizz-obsidian)] transition-transform duration-200 group-hover:translate-x-1 group-hover:bg-[var(--shopizz-obsidian)] group-hover:text-white"
        >
          →
        </span>
      </div>
    </NuxtLink>

    <!-- Card 2: Active Owners -->
    <NuxtLink
      to="/admin/owners"
      class="group relative flex flex-col justify-between rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-6 transition-all duration-300 hover:border-[var(--shopizz-obsidian)]/20 hover:bg-white hover:shadow-sm"
    >
      <div>
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--shopizz-obsidian)]/50">
            Active Owners
          </p>
          <span class="text-xs text-emerald-700">●</span>
        </div>
        <div class="mt-3 font-serif text-4xl font-semibold tracking-tight text-[var(--shopizz-obsidian)]">
          {{ activeOwners }}
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between pt-3 border-t border-[var(--shopizz-obsidian)]/10">
        <span class="text-xs text-[var(--shopizz-obsidian)]/55">
          Approved shop owners
        </span>
        <span
          class="flex h-7 w-7 items-center justify-center rounded-full bg-[#ede5d8] text-xs font-bold text-[var(--shopizz-obsidian)] transition-transform duration-200 group-hover:translate-x-1 group-hover:bg-[var(--shopizz-obsidian)] group-hover:text-white"
        >
          →
        </span>
      </div>
    </NuxtLink>

    <!-- Card 3: Total Products -->
    <NuxtLink
      to="/shop"
      class="group relative flex flex-col justify-between rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-6 transition-all duration-300 hover:border-[var(--shopizz-obsidian)]/20 hover:bg-white hover:shadow-sm"
    >
      <div>
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--shopizz-obsidian)]/50">
            Total Products
          </p>
          <span class="text-xs text-[var(--shopizz-obsidian)]/40">✦</span>
        </div>
        <div class="mt-3 font-serif text-4xl font-semibold tracking-tight text-[var(--shopizz-obsidian)]">
          {{ totalProducts }}
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between pt-3 border-t border-[var(--shopizz-obsidian)]/10">
        <span class="text-xs text-[var(--shopizz-obsidian)]/55">
          Across marketplace
        </span>
        <span
          class="flex h-7 w-7 items-center justify-center rounded-full bg-[#ede5d8] text-xs font-bold text-[var(--shopizz-obsidian)] transition-transform duration-200 group-hover:translate-x-1 group-hover:bg-[var(--shopizz-obsidian)] group-hover:text-white"
        >
          →
        </span>
      </div>
    </NuxtLink>

    <!-- Card 4: Total Categories -->
    <NuxtLink
      to="/admin/categories"
      class="group relative flex flex-col justify-between rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-6 transition-all duration-300 hover:border-[var(--shopizz-obsidian)]/20 hover:bg-white hover:shadow-sm"
    >
      <div>
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--shopizz-obsidian)]/50">
            Total Categories
          </p>
          <span class="text-xs text-[var(--shopizz-obsidian)]/40">🏷️</span>
        </div>
        <div class="mt-3 font-serif text-4xl font-semibold tracking-tight text-[var(--shopizz-obsidian)]">
          {{ totalCategories }}
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between pt-3 border-t border-[var(--shopizz-obsidian)]/10">
        <span class="text-xs text-[var(--shopizz-obsidian)]/55">
          All active & curated
        </span>
        <span
          class="flex h-7 w-7 items-center justify-center rounded-full bg-[#ede5d8] text-xs font-bold text-[var(--shopizz-obsidian)] transition-transform duration-200 group-hover:translate-x-1 group-hover:bg-[var(--shopizz-obsidian)] group-hover:text-white"
        >
          →
        </span>
      </div>
    </NuxtLink>
  </section>
</template>
