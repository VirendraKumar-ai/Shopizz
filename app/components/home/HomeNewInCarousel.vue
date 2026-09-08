<script setup lang="ts">
import type { Product } from '~~/shared/types/product'
import ProductCard from '~/components/product/ProductCard.vue'

const props = defineProps<{
  products: Product[]
  pending?: boolean
  error?: any
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const selectedCategory = ref('all')

const filterTabs = [
  { label: 'All', value: 'all' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Living', value: 'home-living' },
  { label: 'Beauty', value: 'beauty' },
  { label: 'Accessories', value: 'accessories' },
]

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'all') {
    return props.products
  }
  return props.products.filter(p => p.category?.slug === selectedCategory.value)
})

const carouselContainer = ref<HTMLElement | null>(null)

const scrollCarousel = (direction: 'left' | 'right') => {
  if (carouselContainer.value) {
    const scrollAmount = carouselContainer.value.clientWidth || 800
    carouselContainer.value.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }
}
</script>

<template>
  <section id="new-in" class="px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
    <div class="mx-auto max-w-7xl">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
        <!-- Left Sidebar (Title + Single-Row Tabs) - Fixed Position & Stable -->
        <div class="flex w-full shrink-0 flex-col justify-center lg:w-72 xl:w-80">
          <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c56a32]">
            02 / New In
          </p>
          <h2 class="mt-3 text-2xl font-medium tracking-tight text-[var(--shopizz-obsidian)] sm:text-3xl leading-snug">
            Fresh finds,
            <br />
            handpicked for you.
          </h2>

          <!-- Clean Single-Row Text Filter Tabs with Active Underline -->
          <div class="mt-6 flex items-center gap-3.5 sm:gap-4 text-xs whitespace-nowrap overflow-x-auto no-scrollbar">
            <button
              v-for="tab in filterTabs"
              :key="tab.value"
              type="button"
              class="relative pb-1 font-medium transition-colors cursor-pointer shrink-0"
              :class="
                selectedCategory === tab.value
                  ? 'font-semibold text-[var(--shopizz-obsidian)]'
                  : 'text-[var(--shopizz-obsidian)]/55 hover:text-[var(--shopizz-obsidian)]'
              "
              @click="selectedCategory = tab.value"
            >
              <span>{{ tab.label }}</span>
              <span
                v-if="selectedCategory === tab.value"
                class="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[var(--shopizz-obsidian)]"
              />
            </button>
          </div>
        </div>

        <!-- Products Carousel Container Area -->
        <div class="relative flex flex-1 min-w-0 items-center gap-3">
          <!-- Left Arrow Button (Placed on Carousel Wrapper, only if > 4 products) -->
          <button
            v-if="filteredProducts.length > 4"
            type="button"
            class="hidden lg:flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ece6db] text-[var(--shopizz-obsidian)] transition-all hover:bg-[#e0d9cc] active:scale-95 shadow-sm cursor-pointer"
            aria-label="Previous products"
            @click="scrollCarousel('left')"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <!-- Main Carousel Track -->
          <div class="flex-1 min-w-0">
            <AppLoading v-if="pending" text="Curating the collection..." />

            <div
              v-else-if="error"
              class="w-full rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-8 text-center"
            >
              <p class="text-sm text-[var(--shopizz-obsidian)]/60">
                We couldn't load the products right now.
              </p>
              <AppButton class="mt-4" size="sm" @click="emit('refresh')">
                Try again
              </AppButton>
            </div>

            <template v-else-if="filteredProducts.length">
              <!-- Scrollable Single-Row Horizontal Carousel Container -->
              <div
                ref="carouselContainer"
                class="overflow-x-auto no-scrollbar scroll-smooth flex items-stretch gap-4 py-1"
              >
                <div
                  v-for="product in filteredProducts"
                  :key="product.id"
                  class="w-full shrink-0 sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] flex flex-col"
                >
                  <ProductCard
                    :product="product"
                    class="h-full"
                  />
                </div>
              </div>
            </template>

            <div
              v-else
              class="w-full rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-12 text-center"
            >
              <p class="text-sm text-[var(--shopizz-obsidian)]/60">
                No products found for this selection.
              </p>
              <button
                type="button"
                class="mt-4 text-xs font-semibold text-[var(--shopizz-saffron)] underline cursor-pointer"
                @click="selectedCategory = 'all'"
              >
                Reset filter
              </button>
            </div>
          </div>

          <!-- Right Arrow Button (Placed on Carousel Wrapper, only if > 4 products) -->
          <button
            v-if="filteredProducts.length > 4"
            type="button"
            class="hidden lg:flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ece6db] text-[var(--shopizz-obsidian)] transition-all hover:bg-[#e0d9cc] active:scale-95 shadow-sm cursor-pointer"
            aria-label="Next products"
            @click="scrollCarousel('right')"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
