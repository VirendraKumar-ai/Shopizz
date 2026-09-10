<script setup lang="ts">
const testimonials = [
  {
    quote:
      'I love discovering new brands here. Everything feels so thoughtfully curated and unique.',
    author: 'Aarohi Mehta',
    purchase: 'Purchased Ceramic Planter from Studio Earth',
    rating: 5,
  },
  {
    quote:
      'The craftsmanship of the leather tote is impeccable. It feels great supporting independent makers directly.',
    author: 'Rohan Sharma',
    purchase: 'Purchased Minimal Leather Tote from Bare & Bone',
    rating: 5,
  },
  {
    quote:
      'Fast delivery and exquisite packaging. The botanical face oils have become my everyday morning ritual.',
    author: 'Pooja Iyer',
    purchase: 'Purchased Herbal Glow Face Oil from Nuvie',
    rating: 5,
  },
]

const activeTestimonialIndex = ref(0)
let testimonialTimer: ReturnType<typeof setInterval> | null = null

const startTestimonialTimer = () => {
  stopTestimonialTimer()
  testimonialTimer = setInterval(() => {
    nextTestimonial(false)
  }, 4500)
}

const stopTestimonialTimer = () => {
  if (testimonialTimer) {
    clearInterval(testimonialTimer)
    testimonialTimer = null
  }
}

const nextTestimonial = (resetTimer = true) => {
  activeTestimonialIndex.value =
    (activeTestimonialIndex.value + 1) % testimonials.length
  if (resetTimer) {
    startTestimonialTimer()
  }
}

const prevTestimonial = () => {
  activeTestimonialIndex.value =
    (activeTestimonialIndex.value - 1 + testimonials.length) %
    testimonials.length
  startTestimonialTimer()
}

onMounted(() => {
  startTestimonialTimer()
})

onUnmounted(() => {
  stopTestimonialTimer()
})
</script>

<template>
  <section
    class="px-4 py-10 sm:px-6 lg:px-8 sm:py-14"
    @mouseenter="stopTestimonialTimer"
    @mouseleave="startTestimonialTimer"
  >
    <div class="mx-auto max-w-7xl">
      <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c56a32]">
        From the Community
      </p>

      <div class="mt-6 grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <!-- Left Column: Editorial Quote (7 cols) -->
        <div class="lg:col-span-7 flex items-start gap-3 sm:gap-4 min-h-[90px]">
          <span class="text-3xl sm:text-4xl font-serif font-bold text-[var(--shopizz-obsidian)] leading-none select-none">“</span>
          <transition name="fade-slide" mode="out-in">
            <blockquote
              :key="activeTestimonialIndex"
              class="font-serif text-xl sm:text-2xl lg:text-[25px] font-normal leading-snug tracking-tight text-[var(--shopizz-obsidian)] max-w-xl"
            >
              {{ testimonials[activeTestimonialIndex]?.quote }}
            </blockquote>
          </transition>
        </div>

        <!-- Right Column: Rating, Author & Carousel Controls (5 cols) -->
        <div class="flex items-center justify-between gap-6 lg:col-span-5">
          <div>
            <!-- 5 Stars -->
            <div class="flex items-center gap-1 text-[#c56a32] text-sm sm:text-base">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
            </div>

            <!-- Author & Details -->
            <transition name="fade-slide" mode="out-in">
              <div :key="activeTestimonialIndex">
                <p class="mt-2.5 text-xs sm:text-[13px] font-semibold text-[var(--shopizz-obsidian)] tracking-tight">
                  {{ testimonials[activeTestimonialIndex]?.author }}
                </p>
                <p class="mt-0.5 text-[11px] text-[var(--shopizz-obsidian)]/55">
                  {{ testimonials[activeTestimonialIndex]?.purchase }}
                </p>
              </div>
            </transition>
          </div>

          <!-- Arrow Controls (Beige circular buttons matching sections 02 & 03) -->
          <div class="flex items-center gap-2.5">
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-[#ece6db] text-[var(--shopizz-obsidian)] transition-all hover:bg-[#e0d9cc] active:scale-95 shadow-sm cursor-pointer"
              aria-label="Previous review"
              @click="prevTestimonial"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-[#ece6db] text-[var(--shopizz-obsidian)] transition-all hover:bg-[#e0d9cc] active:scale-95 shadow-sm cursor-pointer"
              aria-label="Next review"
              @click="nextTestimonial(true)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
