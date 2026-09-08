<script setup lang="ts">
import type { Category } from '~~/shared/types/product'

definePageMeta({
  layout: 'account',
  middleware: ['auth'],
})

const {
  data,
  pending,
  error,
  refresh,
} = await useFetch<{
  success: boolean
  categories: Category[]
}>('/api/categories')

const categories = computed(() => data.value?.categories ?? [])
</script>

<template>
  <div class="space-y-10">
    <!-- Header -->
    <section>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]"
          >
            Shopping / 003
          </p>

          <h1
            class="mt-3 text-4xl font-medium tracking-[-0.05em] sm:text-5xl"
          >
            Categories
          </h1>

          <p
            class="mt-3 max-w-2xl text-sm leading-7 text-[var(--shopizz-obsidian)]/55"
          >
            Browse the marketplace through curated departments curated by independent shops.
          </p>
        </div>

        <NuxtLink
          to="/account/products"
          class="text-sm text-[var(--shopizz-obsidian)]/55 hover:text-[var(--shopizz-obsidian)]"
        >
          View all products →
        </NuxtLink>
      </div>
    </section>

    <!-- Loading -->
    <AppLoading
      v-if="pending"
      text="Loading categories..."
    />

    <!-- Error -->
    <div
      v-else-if="error"
      class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-8"
    >
      <p class="text-sm text-[var(--shopizz-obsidian)]/60">
        Failed to load categories.
      </p>

      <AppButton
        class="mt-4"
        size="sm"
        @click="refresh()"
      >
        Try again
      </AppButton>
    </div>

    <!-- Category Grid -->
    <section v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="category in categories"
        :key="category.id"
        :to="{
          path: '/account/products',
          query: { category: category.slug },
        }"
        class="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-8 transition-all duration-300 hover:border-[var(--shopizz-obsidian)]/30 hover:bg-white/60 hover:-translate-y-1"
      >
        <div>
          <p class="text-[10px] uppercase tracking-[0.25em] text-[var(--shopizz-saffron)]">
            Department
          </p>

          <h2 class="mt-4 text-2xl font-medium tracking-[-0.03em]">
            {{ category.name }}
          </h2>

          <p
            v-if="category.description"
            class="mt-3 text-sm leading-6 text-[var(--shopizz-obsidian)]/60"
          >
            {{ category.description }}
          </p>
        </div>

        <div class="mt-8 flex items-center justify-between border-t border-[var(--shopizz-obsidian)]/10 pt-4">
          <span class="text-xs uppercase tracking-[0.16em] text-[var(--shopizz-obsidian)]/40">
            {{ category.productCount ?? 0 }} {{ category.productCount === 1 ? 'product' : 'products' }}
          </span>

          <span class="text-sm transition-transform duration-200 group-hover:translate-x-1">
            Explore →
          </span>
        </div>
      </NuxtLink>
    </section>
  </div>
</template>
