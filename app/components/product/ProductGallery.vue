<script setup lang="ts">
import type { ProductImage } from '~~/shared/types/product'

const props = defineProps<{
  images: ProductImage[]
  productName: string
}>()

const activeIndex = ref(0)
const isZoomModalOpen = ref(false)

const validImages = computed(() => {
  if (props.images && props.images.length > 0) {
    return props.images
  }
  return [
    {
      url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=1000&auto=format&fit=crop&q=80',
      alt: props.productName,
    },
  ]
})

const nextImage = () => {
  activeIndex.value = (activeIndex.value + 1) % validImages.value.length
}

const prevImage = () => {
  activeIndex.value =
    (activeIndex.value - 1 + validImages.value.length) % validImages.value.length
}

// Keyboard navigation
const handleKeyDown = (e: KeyboardEvent) => {
  if (isZoomModalOpen.value) {
    if (e.key === 'Escape') isZoomModalOpen.value = false
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') prevImage()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full items-start">
    <!-- Left: Vertical Thumbnails Strip -->
    <div
      v-if="validImages.length > 1"
      class="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[490px] sm:w-[68px] shrink-0 no-scrollbar py-0.5"
    >
      <button
        v-for="(img, idx) in validImages.slice(0, 5)"
        :key="img.url || idx"
        type="button"
        class="relative h-14 w-14 sm:h-[74px] sm:w-[68px] shrink-0 overflow-hidden rounded-xl border transition-all duration-200 cursor-pointer"
        :class="
          activeIndex === idx
            ? 'border-[#1F2623] ring-2 ring-[#1F2623]/25 scale-95 opacity-100 shadow-sm'
            : 'border-[#E5DDD2] opacity-70 hover:opacity-100 hover:border-stone-400'
        "
        :aria-label="`View image ${idx + 1}`"
        @click="activeIndex = idx"
      >
        <img
          :src="img.url"
          :alt="img.alt || `${productName} view ${idx + 1}`"
          class="h-full w-full object-cover"
          loading="lazy"
        />
      </button>

      <!-- Down scroll indicator button -->
      <button
        v-if="validImages.length > 5"
        type="button"
        class="hidden sm:flex h-8 w-[68px] shrink-0 items-center justify-center rounded-xl bg-[#F0EBE1] text-[#1F2623] hover:bg-[#E5DFD5] transition-colors"
        aria-label="Next image"
        @click="nextImage"
      >
        <Icon name="ph:arrow-down" class="h-3.5 w-3.5" />
      </button>
    </div>

    <!-- Center/Main Hero Image Card -->
    <div class="relative flex-1 overflow-hidden rounded-[22px] bg-[#EDE7DC] aspect-[4/4.7] max-h-[490px] w-full shadow-sm">
      <img
        :src="validImages[activeIndex]?.url"
        :alt="validImages[activeIndex]?.alt || productName"
        class="h-full w-full object-cover transition-all duration-500 ease-out select-none"
      />

      <!-- Expand / Zoom Button (Top-Right) -->
      <button
        type="button"
        class="absolute top-3.5 right-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-[#1F2623] shadow-sm hover:bg-white hover:scale-105 transition-all"
        aria-label="Expand photo full screen"
        @click="isZoomModalOpen = true"
      >
        <Icon name="ph:arrows-out-bold" class="h-3.5 w-3.5" />
      </button>

      <!-- Bottom-Left Watermark / Editorial Badge -->
      <div class="absolute bottom-4 left-4 pointer-events-none z-10">
        <p class="font-serif italic text-base sm:text-lg text-stone-900/80 drop-shadow-sm tracking-wide">
          Crafted for slower days
        </p>
      </div>

      <!-- Bottom-Right Carousel Controls & Pagination -->
      <div
        v-if="validImages.length > 1"
        class="absolute bottom-4 right-4 z-10 flex items-center gap-1.5"
      >
        <div class="flex items-center gap-1 rounded-full bg-white/85 backdrop-blur-md p-0.5 shadow-sm">
          <button
            type="button"
            class="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white text-[#1F2623] transition-colors"
            aria-label="Previous photo"
            @click="prevImage"
          >
            <Icon name="ph:caret-left-bold" class="h-3 w-3" />
          </button>
          <button
            type="button"
            class="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white text-[#1F2623] transition-colors"
            aria-label="Next photo"
            @click="nextImage"
          >
            <Icon name="ph:caret-right-bold" class="h-3 w-3" />
          </button>
        </div>

        <span class="rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-white tracking-widest shadow-sm">
          {{ activeIndex + 1 }} / {{ validImages.length }}
        </span>
      </div>
    </div>

    <!-- Full Screen Image Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isZoomModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            class="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            aria-label="Close full view"
            @click="isZoomModalOpen = false"
          >
            <Icon name="ph:x-bold" class="h-5 w-5" />
          </button>

          <img
            :src="validImages[activeIndex]?.url"
            :alt="validImages[activeIndex]?.alt || productName"
            class="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          />

          <!-- Controls inside zoom modal -->
          <div
            v-if="validImages.length > 1"
            class="absolute bottom-6 flex items-center gap-4 bg-black/60 px-4 py-2 rounded-full text-white"
          >
            <button type="button" @click="prevImage">
              <Icon name="ph:caret-left-bold" class="h-5 w-5 hover:text-stone-300" />
            </button>
            <span class="text-xs font-mono tracking-widest">
              {{ activeIndex + 1 }} / {{ validImages.length }}
            </span>
            <button type="button" @click="nextImage">
              <Icon name="ph:caret-right-bold" class="h-5 w-5 hover:text-stone-300" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
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
