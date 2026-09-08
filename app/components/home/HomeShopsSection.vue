<script setup lang="ts">
import type { Shop } from '~~/shared/types/shop'

const props = defineProps<{
  shops: Shop[]
}>()

const shopsCarouselContainer = ref<HTMLElement | null>(null)

const scrollShopsCarousel = (direction: 'left' | 'right') => {
  if (shopsCarouselContainer.value) {
    const scrollAmount = shopsCarouselContainer.value.clientWidth || 800
    shopsCarouselContainer.value.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }
}
</script>

<template>
  <section id="shops" class="border-t border-[var(--shopizz-obsidian)]/10 px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
    <div class="mx-auto max-w-7xl">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
        <!-- Left Sidebar (Title) - Fixed Position & Stable -->
        <div class="flex w-full shrink-0 flex-col justify-center lg:w-72 xl:w-80">
          <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c56a32]">
            03 / Independent Shops
          </p>
          <h2 class="mt-3 text-2xl font-medium tracking-tight text-[var(--shopizz-obsidian)] sm:text-3xl leading-snug">
            Meet the makers.
          </h2>
          <p class="mt-2 text-xs text-[var(--shopizz-obsidian)]/60">
            Real people. Original stories.
          </p>
        </div>

        <!-- Right Shops Carousel Area -->
        <div class="relative flex flex-1 min-w-0 items-center gap-3">
          <!-- Left Arrow Button (On Carousel Wrapper, only if > 4 shops) -->
          <button
            v-if="shops.length > 4"
            type="button"
            class="hidden lg:flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ece6db] text-[var(--shopizz-obsidian)] transition-all hover:bg-[#e0d9cc] active:scale-95 shadow-sm cursor-pointer"
            aria-label="Previous shops"
            @click="scrollShopsCarousel('left')"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <!-- Shops Track -->
          <div
            ref="shopsCarouselContainer"
            class="flex-1 overflow-x-auto no-scrollbar scroll-smooth flex items-stretch gap-4 py-3"
          >
            <NuxtLink
              v-for="shop in shops"
              :key="shop.id"
              :to="shop.link"
              class="group relative flex w-full shrink-0 flex-col justify-between rounded-2xl bg-[#f2ece2] p-3 transition-all duration-300 hover:shadow-md sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]"
            >
              <!-- Image Wrapper with Unclipped Floating Badge -->
              <div class="relative w-full">
                <!-- Image Frame (with overflow-hidden for zoom effect) -->
                <div class="aspect-[4/4.2] w-full overflow-hidden rounded-xl bg-[#e8e2d6]/60">
                  <img
                    :src="shop.imageUrl"
                    :alt="shop.name"
                    class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>

                <!-- Circular Badge Overlapping Bottom-Left Edge (Fully Visible) -->
                <div
                  class="absolute -bottom-3.5 left-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white font-serif font-medium text-xs text-[var(--shopizz-obsidian)] shadow-sm border border-[var(--shopizz-obsidian)]/10"
                >
                  <img
                    v-if="shop.logoUrl"
                    :src="shop.logoUrl"
                    :alt="shop.name"
                    class="h-full w-full rounded-full object-cover"
                  />
                  <span v-else class="italic leading-none">
                    {{ shop.badge }}
                  </span>
                </div>
              </div>

              <!-- Info Block -->
              <div class="pt-5 pb-1 px-1">
                <h3 class="text-xs sm:text-[13px] font-semibold text-[var(--shopizz-obsidian)] tracking-tight line-clamp-1">
                  {{ shop.name }}
                </h3>
                <p class="text-[11px] text-[var(--shopizz-obsidian)]/50 mt-0.5">
                  {{ shop.category }}
                </p>
              </div>
            </NuxtLink>
          </div>

          <!-- Right Arrow Button (On Carousel Wrapper, only if > 4 shops) -->
          <button
            v-if="shops.length > 4"
            type="button"
            class="hidden lg:flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ece6db] text-[var(--shopizz-obsidian)] transition-all hover:bg-[#e0d9cc] active:scale-95 shadow-sm cursor-pointer"
            aria-label="Next shops"
            @click="scrollShopsCarousel('right')"
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
