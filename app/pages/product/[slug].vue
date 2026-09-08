<script setup lang="ts">
import type { Product } from '~~/shared/types/product'
import ProductGallery from '~/components/product/ProductGallery.vue'
import ProductDetailsInfo from '~/components/product/ProductDetailsInfo.vue'
import ProductStudioCard from '~/components/product/ProductStudioCard.vue'
import ProductReviewsSection from '~/components/product/ProductReviewsSection.vue'
import ProductRecommendations from '~/components/product/ProductRecommendations.vue'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const slug = computed(() => route.params.slug as string)

const {
  data,
  pending,
  error,
  refresh,
} = await useFetch<{
  success: boolean
  product: Product
  relatedProducts: any[]
}>(() => `/api/products/${slug.value}`)

const product = computed(() => data.value?.product)
const relatedProducts = computed(() => data.value?.relatedProducts || [])

const selectedColor = ref('')
const selectedSize = ref('')

watchEffect(() => {
  if (product.value) {
    if (!selectedColor.value) {
      selectedColor.value = product.value.colors?.[0]?.name || 'Oat'
    }
    if (!selectedSize.value) {
      selectedSize.value = product.value.sizes?.[1] || product.value.sizes?.[0] || 'M'
    }
  }
})

// SEO Meta
useSeoMeta({
  title: () => (product.value ? `${product.value.name} — Shopizz Studio` : 'Product Not Found — Shopizz'),
  description: () => product.value?.shortDescription || 'Discover distinctive pieces from independent studios.',
})
</script>

<template>
  <main class="min-h-screen bg-[var(--shopizz-porcelain)] py-6 sm:py-8">
    <div class="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
      <!-- Loading Skeleton -->
      <div v-if="pending" class="py-20 text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[#1F2623] border-t-transparent mb-4" />
        <p class="font-serif text-lg text-[#1F2623]">Unfolding piece details...</p>
      </div>

      <!-- Error / Not Found State -->
      <div
        v-else-if="error || !product"
        class="mx-auto max-w-xl rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-12 text-center shadow-sm"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-[#94442A]">
          Piece Unavailable
        </p>
        <h1 class="mt-4 font-serif text-3xl font-medium text-[#1F2623]">
          We couldn't find this piece.
        </h1>
        <p class="mx-auto mt-3 max-w-md text-xs text-[#7A746B] leading-relaxed">
          The product may have been archived or is no longer listed by the studio maker.
        </p>

        <div class="mt-8 flex justify-center gap-4">
          <NuxtLink
            to="/shop"
            class="rounded-full bg-[#1F2623] px-6 py-3 text-xs font-semibold text-white hover:bg-[#2e3b33] transition-colors"
          >
            Explore Collection →
          </NuxtLink>
        </div>
      </div>

      <!-- 3-Section Editorial Product Layout -->
      <div v-else class="space-y-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
          <!-- 1. Left Section: Vertical Thumbnails & Main Gallery (5 cols) -->
          <div class="lg:col-span-5">
            <ProductGallery
              :images="product.images"
              :product-name="product.name"
            />
          </div>

          <!-- 2. Center Section: Product Specifications & Variant Selectors (4 cols) -->
          <div class="lg:col-span-4">
            <ProductDetailsInfo
              :product="product"
              v-model:model-value-color="selectedColor"
              v-model:model-value-size="selectedSize"
            />
          </div>

          <!-- 3. Right Section: Maker Studio Showcase & Purchase Actions (3 cols) -->
          <div class="lg:col-span-3">
            <ProductStudioCard
              :product="product"
              :selected-color="selectedColor"
              :selected-size="selectedSize"
            />
          </div>
        </div>


        <!-- 4. Middle Section: Dynamic Tabs & Customer Reviews -->
        <ProductReviewsSection
          :product="product"
          :product-slug="product.slug"
          :product-name="product.name"
          @review-submitted="refresh"
        />

        <!-- 5. Bottom Section: "You may also like" Recommendations -->
        <ProductRecommendations
          :products="relatedProducts"
        />
      </div>
    </div>
  </main>
</template>

