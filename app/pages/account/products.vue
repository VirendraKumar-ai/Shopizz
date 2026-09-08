<script setup lang="ts">
import type { Product, Category } from '~~/shared/types/product'

definePageMeta({
  layout: 'account',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()

// Fetch all active products
const {
  data: productData,
  pending: productsLoading,
  error: productsError,
  refresh: refreshProducts,
} = await useFetch<{
  success: boolean
  products: Product[]
}>('/api/products')

// Fetch categories
const {
  data: categoryData,
} = await useFetch<{
  success: boolean
  categories: Category[]
}>('/api/categories')

const allProducts = computed(() => productData.value?.products ?? [])
const categories = computed(() => categoryData.value?.categories ?? [])

// Filters and sorting state initialized from route query
const selectedCategory = ref<string>(
  (route.query.category as string) || 'all'
)
const searchQuery = ref<string>(
  (route.query.search as string) || ''
)
const sortBy = ref<'newest' | 'price-asc' | 'price-desc'>('newest')

// Keep state synced if route query changes
watch(
  () => route.query.category,
  (newCategory) => {
    selectedCategory.value = (newCategory as string) || 'all'
  }
)

watch(
  () => route.query.search,
  (newSearch) => {
    searchQuery.value = (newSearch as string) || ''
  }
)

const updateCategory = (slug: string) => {
  selectedCategory.value = slug
  router.replace({
    query: {
      ...route.query,
      category: slug === 'all' ? undefined : slug,
    },
  })
}

const updateSearch = () => {
  router.replace({
    query: {
      ...route.query,
      search: searchQuery.value.trim() ? searchQuery.value.trim() : undefined,
    },
  })
}

const clearFilters = () => {
  selectedCategory.value = 'all'
  searchQuery.value = ''
  router.replace({
    query: {},
  })
}

// Filtered and sorted products
const filteredProducts = computed(() => {
  let result = [...allProducts.value]

  // Filter by category
  if (selectedCategory.value !== 'all') {
    result = result.filter(
      (product) => product.category?.slug === selectedCategory.value
    )
  }

  // Filter by search query
  const search = searchQuery.value.trim().toLowerCase()
  if (search) {
    result = result.filter((product) =>
      [
        product.name,
        product.shortDescription,
        product.description,
        product.category?.name,
        product.owner?.name,
      ]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(search))
    )
  }

  // Sort
  if (sortBy.value === 'price-asc') {
    result.sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'price-desc') {
    result.sort((a, b) => b.price - a.price)
  }

  return result
})

const activeCategoryName = computed(() => {
  if (selectedCategory.value === 'all') return 'All items'
  const cat = categories.value.find((c) => c.slug === selectedCategory.value)
  return cat ? cat.name : selectedCategory.value
})
</script>

<template>
  <div class="space-y-10">
    <!-- Header -->
    <section>
      <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p
            class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]"
          >
            Shopping / 002
          </p>

          <h1
            class="mt-3 text-4xl font-medium tracking-[-0.05em] sm:text-5xl"
          >
            Marketplace collection
          </h1>

          <p
            class="mt-3 max-w-2xl text-sm leading-7 text-[var(--shopizz-obsidian)]/55"
          >
            Explore distinctive goods, handcrafted pieces and thoughtful
            essentials from verified independent shop owners.
          </p>
        </div>

        <!-- Search Bar -->
        <div class="w-full lg:w-80">
          <form @submit.prevent="updateSearch">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Search by name, shop, or category..."
                class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 px-4 py-3 text-sm outline-none placeholder:text-[var(--shopizz-obsidian)]/35 transition-all duration-200 focus:border-[var(--shopizz-obsidian)] focus:bg-white"
                @input="updateSearch"
              />
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- Filter & Sort Bar -->
    <section class="border-y border-[var(--shopizz-obsidian)]/10 py-4">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <!-- Categories Rail -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            class="rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] transition-all"
            :class="
              selectedCategory === 'all'
                ? 'bg-[var(--shopizz-obsidian)] text-white'
                : 'bg-white/30 text-[var(--shopizz-obsidian)]/60 hover:bg-white/60 hover:text-[var(--shopizz-obsidian)]'
            "
            @click="updateCategory('all')"
          >
            All ({{ allProducts.length }})
          </button>

          <button
            v-for="category in categories"
            :key="category.id"
            type="button"
            class="rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] transition-all"
            :class="
              selectedCategory === category.slug
                ? 'bg-[var(--shopizz-obsidian)] text-white'
                : 'bg-white/30 text-[var(--shopizz-obsidian)]/60 hover:bg-white/60 hover:text-[var(--shopizz-obsidian)]'
            "
            @click="updateCategory(category.slug)"
          >
            {{ category.name }}
            <span
              v-if="category.productCount !== undefined"
              class="ml-1 opacity-60"
            >
              ({{ category.productCount }})
            </span>
          </button>
        </div>

        <!-- Sort dropdown -->
        <div class="flex items-center gap-2 self-end sm:self-auto">
          <label
            for="sort-select"
            class="text-xs uppercase tracking-[0.18em] text-[var(--shopizz-obsidian)]/40"
          >
            Sort:
          </label>
          <select
            id="sort-select"
            v-model="sortBy"
            class="rounded-xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 px-3 py-1.5 text-xs font-medium outline-none transition-colors focus:border-[var(--shopizz-obsidian)]"
          >
            <option value="newest">Featured & Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Product Grid Section -->
    <section>
      <!-- Results summary -->
      <div class="mb-6 flex items-center justify-between">
        <p class="text-xs font-medium uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/45">
          {{ filteredProducts.length }} {{ filteredProducts.length === 1 ? 'product found' : 'products found' }}
          <span v-if="selectedCategory !== 'all'" class="text-[var(--shopizz-saffron)]">
            in {{ activeCategoryName }}
          </span>
          <span v-if="searchQuery" class="text-[var(--shopizz-obsidian)]/70">
            for "{{ searchQuery }}"
          </span>
        </p>

        <button
          v-if="selectedCategory !== 'all' || searchQuery"
          type="button"
          class="text-xs text-[var(--shopizz-saffron)] hover:underline"
          @click="clearFilters"
        >
          Reset filters
        </button>
      </div>

      <!-- Loading state -->
      <AppLoading
        v-if="productsLoading"
        text="Loading collection..."
      />

      <!-- Error state -->
      <div
        v-else-if="productsError"
        class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-8"
      >
        <p class="text-sm text-[var(--shopizz-obsidian)]/60">
          We were unable to load the product collection.
        </p>

        <AppButton
          class="mt-4"
          size="sm"
          @click="refreshProducts()"
        >
          Try again
        </AppButton>
      </div>

      <!-- Products Grid -->
      <template v-else>
        <div
          v-if="filteredProducts.length"
          class="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
          />
        </div>

        <AppEmptyState
          v-else
          title="No products match your criteria"
          description="Try adjusting your search terms or clearing category filters to find what you're looking for."
        >
          <AppButton
            variant="secondary"
            size="sm"
            @click="clearFilters"
          >
            Clear all filters
          </AppButton>
        </AppEmptyState>
      </template>
    </section>
  </div>
</template>
