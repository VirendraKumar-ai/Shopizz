<script setup lang="ts">
const actions = [
  {
    title: 'Review Owner Requests',
    description: 'Inspect pending maker registrations',
    to: '/admin/requests',
    icon: '📝',
    badge: 'Review',
  },
  {
    title: 'Manage Owners',
    description: 'Active shop directories & profiles',
    to: '/admin/owners',
    icon: '👥',
    badge: 'Directory',
  },
  {
    title: 'Manage Categories',
    description: 'Organize catalog taxonomies',
    to: '/admin/categories',
    icon: '🏷️',
    badge: 'Taxonomy',
  },
  {
    title: 'View Orders',
    description: 'Marketplace customer purchases',
    to: '/admin/orders',
    icon: '📋',
    badge: 'Transactions',
  },
]
</script>

<template>
  <section class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-6 sm:p-8">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--shopizz-saffron)]">
          Quick Actions
        </p>
        <h2 class="mt-1 text-xl font-medium tracking-tight text-[var(--shopizz-obsidian)]">
          Marketplace Operations
        </h2>
      </div>
      <p class="text-xs text-[var(--shopizz-obsidian)]/50">
        Direct pathways to core administrative tools
      </p>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <NuxtLink
        v-for="action in actions"
        :key="action.to"
        :to="action.to"
        class="group flex flex-col justify-between rounded-2xl border border-[var(--shopizz-obsidian)]/8 bg-white/70 p-4 transition-all duration-200 hover:border-[var(--shopizz-obsidian)]/20 hover:bg-white hover:shadow-sm"
      >
        <div class="flex items-center justify-between">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ede5d8] text-base">
            {{ action.icon }}
          </span>
          <span class="rounded-full bg-[var(--shopizz-stone)] px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]/60">
            {{ action.badge }}
          </span>
        </div>

        <div class="mt-4">
          <p class="text-xs font-semibold text-[var(--shopizz-obsidian)] group-hover:text-[var(--shopizz-saffron)] transition-colors">
            {{ action.title }}
          </p>
          <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/55 leading-snug">
            {{ action.description }}
          </p>
        </div>

        <div class="mt-3 flex items-center justify-end text-[11px] font-medium text-[var(--shopizz-obsidian)]/70 group-hover:text-[var(--shopizz-obsidian)]">
          <span class="group-hover:underline">Open tool</span>
          <span class="ml-1 text-xs transition-transform group-hover:translate-x-1">→</span>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
