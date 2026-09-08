<script setup lang="ts">
import type { Product, Category } from '~~/shared/types/product'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

// 1. Fetch products in this category
const {
  data: productsData,
  pending: productsPending,
  error: productsError,
  refresh: refreshProducts,
} = await useFetch<{
  success: boolean
  products: Product[]
}>(() => `/api/products?category=${slug.value}`)

// 2. Fetch categories list for category metadata
const { data: categoryData } = await useFetch<{
  success: boolean
  categories: Category[]
}>('/api/categories')

const currentCategory = computed(() => {
  return categoryData.value?.categories?.find((c) => c.slug === slug.value)
})

const products = computed(() => productsData.value?.products ?? [])

useHead({
  title: computed(() =>
    currentCategory.value
      ? `${currentCategory.value.name} — Shopizz`
      : 'Department Collection — Shopizz'
  ),
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
    <!-- Breadcrumb -->
    <div class="mb-8 flex items-center justify-between">
      <button
        type="button"
        class="text-xs uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/50 transition-colors hover:text-[var(--shopizz-obsidian)]"
        @click="router.back()"
      >
        ← Back
      </button>

      <div class="text-xs uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/40">
        <NuxtLink to="/" class="hover:text-[var(--shopizz-obsidian)]">Shop</NuxtLink>
        <span class="mx-2">/</span>
        <span class="text-[var(--shopizz-obsidian)] font-medium">{{ currentCategory?.name || slug }}</span>
      </div>
    </div>

    <!-- Category Header -->
    <section class="mb-12 border-b border-[var(--shopizz-obsidian)]/10 pb-8">
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div class="max-w-2xl">
          <p class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]">
            Department / {{ slug }}
          </p>

          <h1 class="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
            {{ currentCategory?.name || slug.replace('-', ' ') }}
          </h1>

          <p v-if="currentCategory?.description" class="mt-4 text-base leading-7 text-[var(--shopizz-obsidian)]/65">
            {{ currentCategory.description }}
          </p>
        </div>

        <div class="text-xs text-[var(--shopizz-obsidian)]/50">
          Showing <span class="font-medium text-[var(--shopizz-obsidian)]">{{ products.length }}</span> {{ products.length === 1 ? 'piece' : 'curated pieces' }}
        </div>
      </div>
    </section>

    <!-- Loading -->
    <AppLoading v-if="productsPending" text="Discovering curated pieces..." />

    <!-- Error -->
    <div
      v-else-if="productsError"
      class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-12 text-center"
    >
      <h2 class="text-xl font-medium">Unable to load department collection.</h2>
      <AppButton class="mt-4" size="sm" @click="refreshProducts()">
        Try again
      </AppButton>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!products.length"
      class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-16 text-center space-y-4"
    >
      <p class="text-xs font-medium uppercase tracking-[0.25em] text-[var(--shopizz-saffron)]">
        Collection empty
      </p>
      <h2 class="text-2xl font-medium tracking-tight">
        No pieces currently available in this department.
      </h2>
      <p class="mx-auto max-w-md text-sm text-[var(--shopizz-obsidian)]/55">
        Independent shop owners are currently curating new additions for this collection.
      </p>
      <div class="pt-4">
        <NuxtLink to="/">
          <AppButton size="sm">
            Explore All Departments →
          </AppButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Products Grid -->
    <section v-else class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </section>
  </div>
</template>
