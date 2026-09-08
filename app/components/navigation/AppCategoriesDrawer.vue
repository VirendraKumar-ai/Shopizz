<script setup lang="ts">
import type { Category } from '~~/shared/types/product'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// Fetch dynamic categories from the API
const { data: catResponse } = await useFetch<{
  success: boolean
  categories: Category[]
}>('/api/categories')

const categories = computed(() => {
  return catResponse.value?.categories || []
})

const getCategoryBadge = (slug: string) => {
  switch (slug) {
    case 'fashion':
      return 'Trending'
    case 'home-living':
      return 'Popular'
    case 'beauty':
      return 'Pure'
    case 'accessories':
      return 'Handmade'
    case 'art-decor':
      return 'Unique'
    case 'books':
      return 'Curated'
    case 'food-drinks':
      return 'Artisan'
    case 'stationery':
      return 'Craft'
    case 'pets':
      return 'Mindful'
    case 'kids-baby':
      return 'Organic'
    default:
      return 'New'
  }
}

const handleClose = () => {
  emit('close')
}

// Close on ESC key
onMounted(() => {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      handleClose()
    }
  }
  window.addEventListener('keydown', onKeyDown)
  onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
  })
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="isOpen"
      class="absolute left-0 top-full z-40 w-full border-b border-[var(--shopizz-obsidian)]/10 bg-[#faf8f3] shadow-2xl backdrop-blur-md max-h-[80vh] overflow-y-auto"
    >
      <div class="mx-auto max-w-7xl px-6 py-8 sm:px-8">
        <!-- Header Bar Inside Drawer -->
        <div class="mb-6 flex items-center justify-between border-b border-[var(--shopizz-obsidian)]/10 pb-4">
          <div>
            <span class="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a9572b]">
              Curated Collections
            </span>
            <h3 class="mt-1 text-lg font-medium tracking-tight text-[var(--shopizz-obsidian)]">
              Explore by Department ({{ categories.length }} Categories)
            </h3>
          </div>

          <NuxtLink
            to="/shop"
            class="inline-flex items-center gap-2 rounded-full bg-[#293a30] px-5 py-2 text-xs font-medium text-white transition-transform hover:scale-105"
            @click="handleClose"
          >
            <span>View All Collection</span>
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </NuxtLink>
        </div>

        <!-- Dynamic Category Grid -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.slug"
            :to="`/shop?category=${cat.slug}`"
            class="group relative flex items-start gap-3.5 rounded-2xl border border-[var(--shopizz-obsidian)]/5 bg-white p-3.5 transition-all duration-300 hover:border-[#293a30]/30 hover:bg-[#f3ede2] hover:shadow-xs"
            @click="handleClose"
          >
            <!-- Icon Avatar -->
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ede5d8] text-[var(--shopizz-obsidian)] transition-colors group-hover:bg-[#293a30] group-hover:text-white"
            >
              <!-- Fashion Icon -->
              <svg v-if="cat.slug === 'fashion'" class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <!-- Living Icon -->
              <svg v-else-if="cat.slug === 'home-living'" class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <!-- Beauty Icon -->
              <svg v-else-if="cat.slug === 'beauty'" class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z" />
              </svg>
              <!-- Accessories Icon -->
              <svg v-else-if="cat.slug === 'accessories'" class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <!-- Art Icon -->
              <svg v-else-if="cat.slug === 'art-decor'" class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <!-- Books Icon -->
              <svg v-else-if="cat.slug === 'books'" class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <!-- Stationery Icon -->
              <svg v-else-if="cat.slug === 'stationery'" class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <!-- Food Icon -->
              <svg v-else-if="cat.slug === 'food-drinks'" class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <!-- Pets & Kids Icon -->
              <svg v-else class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1">
                <h4 class="text-xs font-semibold text-[var(--shopizz-obsidian)] group-hover:text-[#293a30] truncate">
                  {{ cat.name }}
                </h4>
                <span
                  class="rounded-full bg-[#f2ece2] px-1.5 py-0.5 text-[8.5px] font-semibold text-[var(--shopizz-obsidian)]/70 uppercase tracking-wider shrink-0"
                >
                  {{ getCategoryBadge(cat.slug) }}
                </span>
              </div>
              <p class="mt-0.5 text-[11px] leading-snug text-[var(--shopizz-obsidian)]/60 line-clamp-1">
                {{ cat.description }}
              </p>
            </div>
          </NuxtLink>
        </div>

        <!-- Footer Strip -->
        <div class="mt-6 flex flex-wrap items-center justify-between border-t border-[var(--shopizz-obsidian)]/10 pt-4 text-xs text-[var(--shopizz-obsidian)]/70">
          <div class="flex items-center gap-6">
            <NuxtLink to="/shop?sort=newest" class="hover:text-[var(--shopizz-obsidian)]" @click="handleClose">
              ✨ New Arrivals
            </NuxtLink>
            <NuxtLink to="/shop?sort=featured" class="hover:text-[var(--shopizz-obsidian)]" @click="handleClose">
              🔥 Best Sellers
            </NuxtLink>
            <NuxtLink to="/#shops" class="hover:text-[var(--shopizz-obsidian)]" @click="handleClose">
              🏪 Independent Shops
            </NuxtLink>
          </div>
          <button
            type="button"
            class="text-[11px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/50 hover:text-[var(--shopizz-obsidian)] cursor-pointer"
            @click="handleClose"
          >
            Close ✕
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Backdrop overlay when drawer is open -->
  <div
    v-if="isOpen"
    class="fixed inset-0 top-[108px] z-30 bg-black/20 backdrop-blur-xs transition-opacity duration-300"
    @click="handleClose"
  />
</template>
