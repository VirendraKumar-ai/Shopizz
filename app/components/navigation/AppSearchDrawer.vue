<script setup lang="ts">
interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const searchInput = ref<HTMLInputElement | null>(null)
const query = ref('')
const loading = ref(false)

const results = ref<{
  products: any[]
  categories: any[]
  shops: any[]
}>({
  products: [],
  categories: [],
  shops: [],
})

const popularTags = [
  'Ceramics',
  'Linen',
  'Botanical',
  'Leather Bag',
  'Home Decor',
  'Fashion',
  'Beauty',
]

// Focus input when opened
watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      setTimeout(() => {
        searchInput.value?.focus()
      }, 100)
    } else {
      query.value = ''
      results.value = { products: [], categories: [], shops: [] }
    }
  }
)

let debounceTimer: any = null

const performSearch = () => {
  clearTimeout(debounceTimer)
  const q = query.value.trim()

  if (!q) {
    results.value = { products: [], categories: [], shops: [] }
    loading.value = false
    return
  }

  loading.value = true
  debounceTimer = setTimeout(async () => {
    try {
      const data = await $fetch<any>('/api/search', {
        query: { q },
      })
      if (data?.success) {
        results.value = {
          products: data.products || [],
          categories: data.categories || [],
          shops: data.shops || [],
        }
      }
    } catch (e) {
      console.error('Search error', e)
    } finally {
      loading.value = false
    }
  }, 180)
}

const handleTagClick = (tag: string) => {
  query.value = tag
  performSearch()
}

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

const selectProduct = (slug: string) => {
  emit('close')
  router.push(`/product/${slug}`)
}

const selectCategory = (slug: string) => {
  emit('close')
  router.push(`/shop?category=${slug}`)
}

const selectShop = () => {
  emit('close')
  router.push('/#shops')
}

const viewAllResults = () => {
  if (query.value.trim()) {
    const q = query.value.trim()
    emit('close')
    router.push({ path: '/shop', query: { q } })
  }
}

// Close on escape
onMounted(() => {
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      emit('close')
    }
  }
  window.addEventListener('keydown', onKeydown)
  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
  })
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex flex-col bg-black/50 backdrop-blur-md"
        @click.self="emit('close')"
      >
        <!-- Search Drawer Modal Container -->
        <div
          class="w-full bg-[#fbf9f4] border-b border-[var(--shopizz-obsidian)]/15 shadow-2xl transition-transform"
        >
          <div class="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-8">
            <!-- Search Header with Big Input -->
            <div class="flex items-center gap-3">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--shopizz-stone)] text-base text-[var(--shopizz-obsidian)]">
                🔍
              </span>

              <div class="relative flex-1">
                <input
                  ref="searchInput"
                  v-model="query"
                  type="text"
                  placeholder="Search products, shops, categories, makers..."
                  class="w-full bg-transparent font-serif text-lg text-[var(--shopizz-obsidian)] placeholder-[var(--shopizz-obsidian)]/35 outline-none sm:text-2xl"
                  @input="performSearch"
                  @keydown.enter.prevent="viewAllResults"
                >

                <button
                  v-if="query"
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[var(--shopizz-stone)] p-1 text-xs text-[var(--shopizz-obsidian)]/60 hover:text-[var(--shopizz-obsidian)]"
                  @click="query = ''; results = { products: [], categories: [], shops: [] }"
                >
                  ✕
                </button>
              </div>

              <!-- Close Button -->
              <button
                type="button"
                class="flex h-10 items-center gap-1.5 rounded-full border border-[var(--shopizz-obsidian)]/15 bg-white px-4 text-xs font-medium text-[var(--shopizz-obsidian)] transition-colors hover:bg-[var(--shopizz-stone)]"
                @click="emit('close')"
              >
                <span>Close</span>
                <span class="text-[10px] text-[var(--shopizz-obsidian)]/50 hidden sm:inline">(ESC)</span>
              </button>
            </div>

            <!-- Loading Indicator -->
            <div
              v-if="loading"
              class="mt-6 flex items-center gap-2 text-xs text-[var(--shopizz-obsidian)]/60"
            >
              <span class="h-2 w-2 rounded-full bg-[var(--shopizz-saffron)] animate-ping" />
              <span>Searching marketplace catalog...</span>
            </div>

            <!-- Empty State: Popular Search Tags when no query -->
            <div
              v-else-if="!query"
              class="mt-6 pt-5 border-t border-[var(--shopizz-obsidian)]/10"
            >
              <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--shopizz-saffron)]">
                Popular Searches
              </p>
              <div class="mt-3 flex flex-wrap gap-2">
                <button
                  v-for="tag in popularTags"
                  :key="tag"
                  type="button"
                  class="rounded-full border border-[var(--shopizz-obsidian)]/12 bg-white px-3.5 py-1.5 text-xs text-[var(--shopizz-obsidian)]/80 transition-colors hover:border-[var(--shopizz-obsidian)] hover:bg-[var(--shopizz-obsidian)] hover:text-white"
                  @click="handleTagClick(tag)"
                >
                  {{ tag }}
                </button>
              </div>
            </div>

            <!-- Search Results Display -->
            <div
              v-else-if="results.products.length || results.categories.length || results.shops.length"
              class="mt-6 max-h-[60vh] overflow-y-auto pt-5 border-t border-[var(--shopizz-obsidian)]/10 pr-2 scrollbar-thin space-y-6"
            >
              <!-- 1. Categories Matches -->
              <div v-if="results.categories.length">
                <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--shopizz-saffron)]">
                  Categories ({{ results.categories.length }})
                </p>
                <div class="mt-2.5 flex flex-wrap gap-2">
                  <button
                    v-for="cat in results.categories"
                    :key="cat.id"
                    type="button"
                    class="group flex items-center gap-2 rounded-xl border border-[var(--shopizz-obsidian)]/12 bg-white px-3 py-2 text-left text-xs transition-all hover:border-[var(--shopizz-obsidian)] hover:shadow-sm"
                    @click="selectCategory(cat.slug)"
                  >
                    <span class="text-sm">🏷️</span>
                    <div>
                      <p class="font-medium text-[var(--shopizz-obsidian)] group-hover:text-[var(--shopizz-saffron)]">
                        {{ cat.name }}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <!-- 2. Products Matches -->
              <div v-if="results.products.length">
                <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--shopizz-saffron)]">
                  Products ({{ results.products.length }})
                </p>
                <div class="mt-3 grid gap-3 sm:grid-cols-2">
                  <button
                    v-for="prod in results.products"
                    :key="prod.id"
                    type="button"
                    class="group flex items-center gap-3.5 rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white p-3 text-left transition-all hover:border-[var(--shopizz-obsidian)] hover:shadow-sm"
                    @click="selectProduct(prod.slug)"
                  >
                    <div class="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--shopizz-stone)]">
                      <img
                        v-if="prod.imageUrl"
                        :src="prod.imageUrl"
                        :alt="prod.name"
                        class="h-full w-full object-cover transition-transform group-hover:scale-105"
                      >
                      <div
                        v-else
                        class="flex h-full w-full items-center justify-center font-serif text-sm text-[var(--shopizz-obsidian)]/30"
                      >
                        {{ prod.name.charAt(0) }}
                      </div>
                    </div>

                    <div class="min-w-0 flex-1">
                      <span
                        v-if="prod.categoryName"
                        class="rounded-md bg-[var(--shopizz-stone)] px-1.5 py-0.5 text-[9px] font-semibold uppercase text-[var(--shopizz-obsidian)]/60"
                      >
                        {{ prod.categoryName }}
                      </span>
                      <p class="mt-1 truncate text-xs font-semibold text-[var(--shopizz-obsidian)] group-hover:text-[var(--shopizz-saffron)]">
                        {{ prod.name }}
                      </p>
                      <p class="mt-0.5 text-xs font-medium text-[var(--shopizz-obsidian)]/80">
                        {{ formatPrice(prod.price) }}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <!-- 3. Shops Matches -->
              <div v-if="results.shops.length">
                <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--shopizz-saffron)]">
                  Independent Shops ({{ results.shops.length }})
                </p>
                <div class="mt-2.5 grid gap-3 sm:grid-cols-2">
                  <button
                    v-for="shop in results.shops"
                    :key="shop.id"
                    type="button"
                    class="group flex items-center gap-3 rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white p-3 text-left transition-all hover:border-[var(--shopizz-obsidian)] hover:shadow-sm"
                    @click="selectShop"
                  >
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ede5d8] text-base">
                      🌿
                    </div>
                    <div class="min-w-0">
                      <p class="truncate text-xs font-semibold text-[var(--shopizz-obsidian)] group-hover:text-[var(--shopizz-saffron)]">
                        {{ shop.shopName }}
                      </p>
                      <p class="truncate text-[10px] text-[var(--shopizz-obsidian)]/50">
                        📍 {{ shop.address || 'Independent Maker Studio' }}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <!-- View All Button -->
              <div class="pt-3 border-t border-[var(--shopizz-obsidian)]/10 text-center">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 text-xs font-semibold text-[var(--shopizz-saffron)] hover:underline"
                  @click="viewAllResults"
                >
                  <span>View all results in collection for "{{ query }}"</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <!-- No Results Found -->
            <div
              v-else
              class="mt-6 py-8 text-center pt-5 border-t border-[var(--shopizz-obsidian)]/10"
            >
              <p class="text-sm font-medium text-[var(--shopizz-obsidian)]">
                No results found for "{{ query }}"
              </p>
              <p class="mt-1 text-xs text-[var(--shopizz-obsidian)]/50">
                Try searching with broader terms or browse through our categories.
              </p>
              <button
                type="button"
                class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--shopizz-obsidian)] px-5 py-2 text-xs font-medium text-white hover:bg-[var(--shopizz-moss)]"
                @click="emit('close'); router.push('/shop')"
              >
                Explore Full Collection →
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
