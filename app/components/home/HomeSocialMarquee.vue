<script setup lang="ts">
const socialPhotos = [
  {
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    alt: 'Ceramic coffee cup',
  },
  {
    url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=600&q=80',
    alt: 'Linen clothing flat lay',
  },
  {
    url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80',
    alt: 'Warm candle glowing',
  },
  {
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    alt: 'Armchair in sunlight',
  },
  {
    url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
    alt: 'Minimal leather tote',
  },
  {
    url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80',
    alt: 'Botanical shadows',
  },
  {
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    alt: 'Glass soap dispenser',
  },
  {
    url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    alt: 'Sculptural stone pottery',
  },
  {
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    alt: 'Dried florals in clay vase',
  },
  {
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    alt: 'Woven organic basket',
  },
]

const marqueePhotos = computed(() => [...socialPhotos, ...socialPhotos])
</script>

<template>
  <section class="border-t border-[var(--shopizz-obsidian)]/10 pt-8 pb-14 sm:pt-10 sm:pb-16 overflow-hidden">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c56a32]">
        Follow @shopizz.market
      </p>
    </div>

    <!-- Ultra-Smooth Infinite Continuous Sliding Marquee Track -->
    <div class="relative mt-5 w-full overflow-hidden marquee-container">
      <div class="flex gap-3.5 marquee-track w-max py-1">
        <a
          v-for="(photo, index) in marqueePhotos"
          :key="index"
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative w-36 sm:w-44 md:w-48 lg:w-52 shrink-0 aspect-square overflow-hidden rounded-xl bg-[#e8e2d6] transition-transform duration-300 shadow-sm"
        >
          <img
            :src="photo.url"
            :alt="photo.alt"
            class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
          <div class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/25">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[var(--shopizz-obsidian)] opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100 group-hover:scale-105">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" stroke-width="2"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke-width="2"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Ultra-Smooth 60fps Continuous Infinite Marquee */
@keyframes continuousSlide {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
}

.marquee-track {
  display: flex;
  width: max-content;
  animation: continuousSlide 38s linear infinite;
  will-change: transform;
}

.marquee-container:hover .marquee-track {
  animation-play-state: paused;
}
</style>
