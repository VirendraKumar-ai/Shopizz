<script setup lang="ts">
import type { Product, Category } from '~~/shared/types/product'

definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Explore Collection | Curated Independent Products — Shopizz',
  meta: [
    {
      name: 'description',
      content:
        'Explore our curated marketplace of unique handcrafted products, slow fashion, ceramics, and apothecary goods from verified independent makers.',
    },
  ],
})

const route = useRoute()
const router = useRouter()

// Fetch products & categories from active API
const { data, pending, error, refresh } = await useFetch<{
  success: boolean
  products: Product[]
}>('/api/products')

const { data: categoryData } = await useFetch<{
  success: boolean
  categories: Category[]
}>('/api/categories')

const allProducts = computed(() => data.value?.products ?? [])
const allCategories = computed(() => categoryData.value?.categories ?? [])

// State Management
const selectedCategoryStrip = ref<string>('all')
const currentSort = ref<string>('featured')
const gridCols = ref<number>(4)
const currentPage = ref<number>(1)
const itemsPerPage = ref<number>(12)
const isMobileFilterOpen = ref<boolean>(false)

const filters = ref({
  search: '',
  categories: [] as string[],
  maxPrice: 15000,
  types: [] as string[],
  location: 'All Locations',
  minRating: null as number | null,
  inStockOnly: false,
})

// Initialize state from URL query parameters
const initFromRoute = () => {
  if (route.query.category && typeof route.query.category === 'string') {
    const cat = route.query.category.trim()
    selectedCategoryStrip.value = cat
    if (cat !== 'all' && !filters.value.categories.includes(cat)) {
      filters.value.categories = [cat]
    }
  }

  if (route.query.q && typeof route.query.q === 'string') {
    filters.value.search = route.query.q.trim()
  }

  if (route.query.sort && typeof route.query.sort === 'string') {
    currentSort.value = route.query.sort
  }
}

initFromRoute()

// Sync Route on changes
watch(
  () => route.query,
  () => {
    initFromRoute()
  }
)

// Handle Category Strip Selection
const handleStripCategorySelect = (slug: string) => {
  selectedCategoryStrip.value = slug
  if (slug === 'all') {
    filters.value.categories = []
  } else {
    filters.value.categories = [slug]
  }
  currentPage.value = 1
  router.push({
    path: '/shop',
    query: {
      ...route.query,
      category: slug === 'all' ? undefined : slug,
    },
  })
}

// Category counts for sidebar
const categoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const p of allProducts.value) {
    if (p.category?.slug) {
      counts[p.category.slug] = (counts[p.category.slug] || 0) + 1
    }
  }
  return counts
})

// Active Filter Count
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.search) count++
  if (filters.value.categories.length > 0) count += filters.value.categories.length
  if (filters.value.maxPrice < 15000) count++
  if (filters.value.types.length > 0) count += filters.value.types.length
  if (filters.value.location !== 'All Locations') count++
  if (filters.value.minRating) count++
  if (filters.value.inStockOnly) count++
  return count
})

const activeCategoryNames = computed(() => {
  return filters.value.categories.map(slug => {
    const found = allCategories.value.find(c => c.slug === slug)
    return found ? found.name : slug
  })
})

const removeCategoryFilter = (name: string) => {
  const cat = allCategories.value.find(c => c.name === name || c.slug === name)
  const slug = cat ? cat.slug : name
  filters.value.categories = filters.value.categories.filter(s => s !== slug)
  if (selectedCategoryStrip.value === slug) {
    selectedCategoryStrip.value = 'all'
  }
  currentPage.value = 1
}

const clearSearch = () => {
  filters.value.search = ''
  currentPage.value = 1
}

const resetAllFilters = () => {
  filters.value = {
    search: '',
    categories: [],
    maxPrice: 15000,
    types: [],
    location: 'All Locations',
    minRating: null,
    inStockOnly: false,
  }
  selectedCategoryStrip.value = 'all'
  currentPage.value = 1
  router.push({ path: '/shop' })
}

// Filtered & Sorted Products
const filteredProducts = computed(() => {
  let result = [...allProducts.value]

  // Search keyword filter
  if (filters.value.search.trim()) {
    const q = filters.value.search.toLowerCase().trim()
    result = result.filter(p => {
      const matchName = p.name.toLowerCase().includes(q)
      const matchDesc = (p.shortDescription || '').toLowerCase().includes(q)
      const matchCat = (p.category?.name || '').toLowerCase().includes(q)
      const matchOwner = (p.owner?.name || '').toLowerCase().includes(q)
      return matchName || matchDesc || matchCat || matchOwner
    })
  }

  // Categories filter
  if (filters.value.categories.length > 0) {
    result = result.filter(p => {
      return p.category?.slug && filters.value.categories.includes(p.category.slug)
    })
  }

  // Max Price filter (price in cents/paisa in DB)
  if (filters.value.maxPrice < 15000) {
    const maxAmountInCents = filters.value.maxPrice * 100
    result = result.filter(p => p.price <= maxAmountInCents)
  }

  // In Stock Only
  if (filters.value.inStockOnly) {
    result = result.filter(p => p.stock > 0)
  }

  // Sorting
  switch (currentSort.value) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'name-asc':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'newest':
      // default database order is latest
      break
    case 'featured':
    default:
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
      break
  }

  return result
})

// Pagination
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredProducts.value.length / itemsPerPage.value))
)

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredProducts.value.slice(start, end)
})

const scrollToProducts = () => {
  const el = document.getElementById('collection-grid')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#faf8f3]">
    <!-- Breadcrumbs -->
    <div class="border-b border-[var(--shopizz-obsidian)]/10 bg-[#f7f4ee] px-6 py-2.5 sm:px-8">
      <div class="mx-auto flex max-w-7xl items-center gap-2 text-xs text-[var(--shopizz-obsidian)]/60">
        <NuxtLink to="/" class="hover:text-[var(--shopizz-obsidian)]">Home</NuxtLink>
        <span>/</span>
        <span class="font-medium text-[var(--shopizz-obsidian)]">Explore Collection</span>
      </div>
    </div>

    <!-- Hero Section -->
    <ShopHero @scroll-to-products="scrollToProducts" />

    <!-- 12-Icon Category Strip (Dynamic from DB API) -->
    <ShopCategoryStrip
      :categories="allCategories"
      :active-category="selectedCategoryStrip"
      @select-category="handleStripCategorySelect"
    />

    <!-- Main Collection Catalog & Filter Layout -->
    <main id="collection-grid" class="mx-auto max-w-7xl px-6 py-10 sm:px-8">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <!-- Desktop Filter Sidebar (3 cols) -->
        <div class="hidden lg:block lg:col-span-3">
          <div class="sticky top-28">
            <ShopFilterSidebar
              :filters="filters"
              :categories="allCategories"
              :category-counts="categoryCounts"
              :total-results="filteredProducts.length"
              @update:filters="filters = $event; currentPage = 1"
              @reset="resetAllFilters"
            />
          </div>
        </div>

        <!-- Product Grid & Toolbar Area (9 cols) -->
        <div class="lg:col-span-9">
          <!-- Toolbar -->
          <ShopToolbar
            :total-count="filteredProducts.length"
            :displayed-count="paginatedProducts.length"
            :current-sort="currentSort"
            :grid-cols="gridCols"
            :active-filter-count="activeFilterCount"
            :active-category-names="activeCategoryNames"
            :search-query="filters.search"
            @update:sort="currentSort = $event; currentPage = 1"
            @update:grid-cols="gridCols = $event"
            @open-mobile-filters="isMobileFilterOpen = true"
            @remove-category="removeCategoryFilter"
            @clear-search="clearSearch"
          />

          <!-- Loading State -->
          <div v-if="pending" class="flex min-h-[300px] items-center justify-center">
            <div class="flex flex-col items-center gap-3">
              <div class="h-8 w-8 animate-spin rounded-full border-2 border-[var(--shopizz-moss)] border-t-transparent" />
              <p class="text-xs text-[var(--shopizz-obsidian)]/60">Loading curated collection...</p>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="filteredProducts.length === 0"
            class="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--shopizz-obsidian)]/20 p-8 text-center"
          >
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[#ede5d8] text-[var(--shopizz-obsidian)]/40 mb-4">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-[var(--shopizz-obsidian)]">
              No products found
            </h3>
            <p class="mt-1 max-w-sm text-xs text-[var(--shopizz-obsidian)]/60">
              We couldn't find any products matching your current filters or search term. Try adjusting your criteria.
            </p>
            <button
              type="button"
              class="mt-5 rounded-full bg-[var(--shopizz-obsidian)] px-5 py-2 text-xs font-medium text-white transition-transform hover:scale-105"
              @click="resetAllFilters"
            >
              Reset All Filters
            </button>
          </div>

          <!-- Product Grid -->
          <div
            v-else
            class="grid grid-cols-1 gap-5 sm:grid-cols-2"
            :class="gridCols === 4 ? 'md:grid-cols-3 xl:grid-cols-4' : 'md:grid-cols-3'"
          >
            <ProductCard
              v-for="product in paginatedProducts"
              :key="product.id"
              :product="product"
            />
          </div>

          <!-- Pagination -->
          <ShopPagination
            :current-page="currentPage"
            :total-pages="totalPages"
            @update:page="currentPage = $event; scrollToProducts()"
          />
        </div>
      </div>

      <!-- Makers Story Banner -->
      <ShopMakersBanner />
    </main>

    <!-- Trust Pillars Section -->
    <TrustPillars />

    <!-- Mobile Filters Slide-over Modal -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileFilterOpen"
        class="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-xs lg:hidden"
        @click="isMobileFilterOpen = false"
      >
        <div
          class="ml-auto h-full w-full max-w-xs overflow-y-auto bg-white p-6 shadow-2xl"
          @click.stop
        >
          <div class="mb-4 flex items-center justify-between border-b border-[var(--shopizz-obsidian)]/10 pb-4">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]">
              Filters
            </h3>
            <button
              type="button"
              class="p-1 text-[var(--shopizz-obsidian)]/70 hover:text-[var(--shopizz-obsidian)]"
              @click="isMobileFilterOpen = false"
            >
              ✕
            </button>
          </div>

          <ShopFilterSidebar
            :filters="filters"
            :categories="allCategories"
            :category-counts="categoryCounts"
            :total-results="filteredProducts.length"
            @update:filters="filters = $event; currentPage = 1"
            @reset="resetAllFilters"
          />

          <div class="mt-6">
            <button
              type="button"
              class="w-full rounded-full bg-[var(--shopizz-obsidian)] py-3 text-xs font-medium text-white"
              @click="isMobileFilterOpen = false"
            >
              Show {{ filteredProducts.length }} Results
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
