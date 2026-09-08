<script setup lang="ts">
import type { Product } from '~~/shared/types/product'
import ProductWriteReviewModal from './ProductWriteReviewModal.vue'

const props = defineProps<{
  productSlug: string
  productName: string
  product?: any
}>()

const emit = defineEmits<{
  (e: 'reviewSubmitted'): void
}>()

const authStore = useAuthStore()
const router = useRouter()

const isModalOpen = ref(false)
const activeTab = ref<'description' | 'details' | 'materials' | 'shipping' | 'reviews'>('description')
const carouselRef = ref<HTMLElement | null>(null)

const {
  data: reviewsData,
  pending,
  refresh: refreshReviews
} = await useFetch<any>(() => `/api/products/${props.productSlug}/reviews`)

const stats = computed(() => {
  const s = reviewsData.value?.stats
  return {
    averageRating: s?.averageRating ? Number(s.averageRating) : (props.product?.rating || 4.8),
    totalReviews: s?.totalReviews ?? (props.product?.reviewCount || 120),
    percentages: s?.percentages || { 5: 72, 4: 20, 3: 6, 2: 2, 1: 0 }
  }
})

const userState = computed(() => reviewsData.value?.userState || {
  canReview: false,
  isVerified: false,
  hasReviewed: false,
  userReview: null
})

// Specifications dictionary from product or general fallback
const specifications = computed(() => {
  if (props.product?.details?.specifications && Object.keys(props.product.details.specifications).length > 0) {
    return props.product.details.specifications
  }
  return {
    Category: props.product?.category?.name || 'Curated Goods',
    'Item SKU': props.product?.sku || 'N/A',
    'Studio / Maker': props.product?.owner?.name || 'Independent Artisan',
    Authenticity: '100% Verified Studio Creation',
    'Return Policy': '7-Day Return Guarantee',
    Packaging: 'Eco-conscious protective carton',
  }
})

// Materials & Care from product or fallback
const materialsData = computed(() => {
  const m = props.product?.details?.materials
  return {
    title: m?.title || 'Materials & Care',
    intro: m?.intro || 'Crafted with premium materials and conscious processes. Follow recommended care instructions to maintain its beauty over time.',
    badges: m?.badges || [
      { title: 'Artisan Crafted', desc: 'Sourced responsibly with high longevity', icon: 'ph:shield-check-bold' },
      { title: 'Premium Finish', desc: 'Refined texture and enduring quality', icon: 'ph:sparkle-bold' },
      { title: 'Consciously Made', desc: 'Low impact, sustainable craftsmanship', icon: 'ph:leaf-bold' }
    ],
    careInstructions: m?.careInstructions || [
      { icon: '✨', text: 'Clean gently with a soft microfiber cloth' },
      { icon: '🚫', text: 'Avoid exposure to harsh abrasives or corrosive chemicals' },
      { icon: '🌡️', text: 'Store in a cool, dry place away from extreme direct sunlight' },
      { icon: '📦', text: 'Retain original packaging for safe transport and storage' }
    ]
  }
})

// Shipping policy from product or fallback
const shippingData = computed(() => {
  const s = props.product?.details?.shipping
  return {
    freeShippingThreshold: s?.freeShippingThreshold || 1499,
    shippingPoints: s?.shippingPoints || [
      'Dispatched within 24–48 business hours',
      'Doorstep courier delivery in 3–6 business days',
      'Real-time tracking notifications via SMS & email',
      'Insured express transit across India'
    ],
    returnPoints: s?.returnPoints || [
      '7-day doorstep return and replacement window',
      'Item must be in its original packaging with tags intact',
      'Initiate seamless return from your Shopizz account hub',
      'Instant refund processed to source upon seller verification'
    ]
  }
})

// Fallback reviews for carousel
const fallbackReviews = [
  {
    id: 'f1',
    author: { name: 'Ananya S.', initial: 'A' },
    isVerifiedPurchase: true,
    rating: 5,
    comment: 'Exquisite quality and impeccable attention to detail. Arrived securely packaged.',
    date: '12 Aug 2025'
  },
  {
    id: 'f2',
    author: { name: 'Rohit M.', initial: 'R' },
    isVerifiedPurchase: true,
    rating: 5,
    comment: 'Loved the authentic design and craftsmanship. Highly recommended studio!',
    date: '5 Aug 2025'
  },
  {
    id: 'f3',
    author: { name: 'Kavya T.', initial: 'K' },
    isVerifiedPurchase: true,
    rating: 5,
    comment: 'Feels premium and durable. Exceeded my expectations.',
    date: '28 Jul 2025'
  }
]

const displayReviews = computed(() => {
  const apiReviews = reviewsData.value?.reviews || []
  if (apiReviews.length >= 3) {
    return apiReviews.map((r: any) => ({
      id: r.id,
      author: {
        name: r.author?.name || 'Customer',
        initial: r.author?.initial || r.author?.name?.charAt(0).toUpperCase() || 'C'
      },
      isVerifiedPurchase: r.isVerifiedPurchase ?? true,
      rating: r.rating || 5,
      comment: r.comment || '',
      title: r.title,
      date: formatDate(r.createdAt)
    }))
  }

  return [
    ...apiReviews.map((r: any) => ({
      id: r.id,
      author: {
        name: r.author?.name || 'Customer',
        initial: r.author?.initial || r.author?.name?.charAt(0).toUpperCase() || 'C'
      },
      isVerifiedPurchase: r.isVerifiedPurchase ?? true,
      rating: r.rating || 5,
      comment: r.comment || '',
      title: r.title,
      date: formatDate(r.createdAt)
    })),
    ...fallbackReviews
  ].slice(0, 6)
})

function scrollCarouselRight() {
  if (carouselRef.value) {
    carouselRef.value.scrollBy({ left: 320, behavior: 'smooth' })
  }
}

function handleWriteReviewClick() {
  if (!authStore.isAuthenticated) {
    router.push(`/login?redirect=/product/${props.productSlug}`)
    return
  }
  isModalOpen.value = true
}

function handleReviewSuccess() {
  refreshReviews()
  emit('reviewSubmitted')
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}
</script>

<template>
  <div id="customer-reviews" class="mt-12 pt-4 scroll-mt-24">
    <!-- 1. Top Tabs Navigation Bar -->
    <nav class="flex items-center gap-6 sm:gap-8 border-b border-[#E8E2D8] pb-0 text-xs sm:text-[13px] text-[#7A746B] overflow-x-auto scrollbar-none">
      <button
        type="button"
        class="pb-3 transition-colors shrink-0"
        :class="activeTab === 'description' ? 'border-b-2 border-[#1F2623] font-bold text-[#1F2623]' : 'hover:text-[#1F2623]'"
        @click="activeTab = 'description'"
      >
        Description
      </button>

      <button
        type="button"
        class="pb-3 transition-colors shrink-0"
        :class="activeTab === 'details' ? 'border-b-2 border-[#1F2623] font-bold text-[#1F2623]' : 'hover:text-[#1F2623]'"
        @click="activeTab = 'details'"
      >
        Details
      </button>

      <button
        type="button"
        class="pb-3 transition-colors shrink-0"
        :class="activeTab === 'materials' ? 'border-b-2 border-[#1F2623] font-bold text-[#1F2623]' : 'hover:text-[#1F2623]'"
        @click="activeTab = 'materials'"
      >
        Materials
      </button>

      <button
        type="button"
        class="pb-3 transition-colors shrink-0"
        :class="activeTab === 'shipping' ? 'border-b-2 border-[#1F2623] font-bold text-[#1F2623]' : 'hover:text-[#1F2623]'"
        @click="activeTab = 'shipping'"
      >
        Shipping & Returns
      </button>

      <button
        type="button"
        class="pb-3 transition-colors shrink-0"
        :class="activeTab === 'reviews' ? 'border-b-2 border-[#1F2623] font-bold text-[#1F2623]' : 'hover:text-[#1F2623]'"
        @click="activeTab = 'reviews'"
      >
        Reviews ({{ stats.totalReviews }})
      </button>
    </nav>

    <!-- 2. Dynamic Tab Panels -->
    <div class="mt-8">
      <!-- TAB 1: DESCRIPTION -->
      <section v-if="activeTab === 'description'" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
        <div class="lg:col-span-7 space-y-4">
          <h2 class="font-serif text-2xl sm:text-[26px] font-medium text-[#1F2623] tracking-tight">
            Product Description
          </h2>
          <p class="text-xs sm:text-[13px] text-[#4A453E] leading-relaxed whitespace-pre-line">
            {{ product?.description || 'A modern essential, this linen overshirt blends timeless craft with everyday comfort. Crafted from premium, breathable linen, it features a relaxed silhouette, natural texture, and clean finishing. Wear it layered or on its own — perfect for effortless, understated style across seasons.' }}
          </p>
        </div>

        <div class="lg:col-span-5">
          <!-- Editorial Story Art Card -->
          <div class="relative overflow-hidden rounded-2xl bg-[#EDE6DC] shadow-sm aspect-[16/10] sm:aspect-[16/9]">
            <img
              src="/images/tab-description.jpg"
              alt="Natural Textures"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
              <p class="font-serif text-xl sm:text-2xl font-medium tracking-tight leading-snug">
                Natural Textures.<br />Modern Living.
              </p>
              <p class="text-[9px] font-bold uppercase tracking-[0.25em] text-white/85 mt-2">
                MADE FOR A KINDER TOMORROW
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 2: DETAILS -->
      <section v-else-if="activeTab === 'details'" class="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start animate-fadeIn">
        <!-- Intro Column (3 cols) -->
        <div class="lg:col-span-4 space-y-3">
          <h2 class="font-serif text-2xl sm:text-[26px] font-medium text-[#1F2623] tracking-tight">
            Product Details
          </h2>
          <p class="text-xs sm:text-[12.5px] text-[#635D54] leading-relaxed">
            {{ product?.details?.philosophy || "Thoughtfully designed for comfort, versatility and everyday wear. A modern classic you'll reach for again and again." }}
          </p>
        </div>

        <!-- Specifications Table (5 cols) -->
        <div class="lg:col-span-5 rounded-2xl border border-[#E8E2D8] bg-white overflow-hidden shadow-sm">
          <table class="w-full text-xs text-left">
            <tbody>
              <tr
                v-for="(val, key, idx) in specifications"
                :key="key"
                :class="idx % 2 === 0 ? 'bg-[#FAF8F5]' : 'bg-white'"
                class="border-b border-[#E8E2D8]/60 last:border-b-0"
              >
                <td class="py-2.5 px-4 font-semibold text-[#7A746B] w-2/5">
                  {{ key }}
                </td>
                <td class="py-2.5 px-4 font-medium text-[#1F2623] w-3/5">
                  {{ val }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Details Art Card (3 cols) -->
        <div class="lg:col-span-3">
          <div class="relative overflow-hidden rounded-2xl bg-[#EDE6DC] shadow-sm aspect-[4/4]">
            <img
              src="/images/tab-details.jpg"
              alt="Artisanal Shirts Stack"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <div class="absolute top-4 right-4 text-right">
              <span class="font-serif italic text-lg sm:text-xl font-medium text-[#1F2623] leading-tight drop-shadow-sm">
                Timeless<br />Versatile<br />Yours
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 3: MATERIALS & CARE -->
      <section v-else-if="activeTab === 'materials'" class="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start animate-fadeIn">
        <!-- Intro & 3 Badges (5 cols) -->
        <div class="lg:col-span-5 space-y-6">
          <div>
            <h2 class="font-serif text-2xl sm:text-[26px] font-medium text-[#1F2623] tracking-tight">
              {{ materialsData.title }}
            </h2>
            <p class="text-xs sm:text-[12.5px] text-[#635D54] leading-relaxed mt-2">
              {{ materialsData.intro }}
            </p>
          </div>

          <!-- 3 Badges Strip -->
          <div class="grid grid-cols-3 gap-3 pt-2">
            <div
              v-for="badge in materialsData.badges"
              :key="badge.title"
              class="rounded-xl border border-[#E8E2D8] bg-white p-3 text-center flex flex-col items-center justify-center space-y-1.5 shadow-sm"
            >
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBF3EE] text-[#2D5A43]">
                <Icon :name="badge.icon || 'ph:leaf-bold'" class="h-4 w-4" />
              </div>
              <p class="text-xs font-bold text-[#1F2623] leading-tight">
                {{ badge.title }}
              </p>
              <p class="text-[10px] text-[#7A746B] leading-tight">
                {{ badge.desc }}
              </p>
            </div>
          </div>
        </div>

        <!-- Care Instructions Checklist (4 cols) -->
        <div class="lg:col-span-4 rounded-2xl border border-[#E8E2D8] bg-white p-5 shadow-sm space-y-3">
          <h3 class="text-xs font-bold uppercase tracking-wider text-[#1F2623] pb-1 border-b border-[#E8E2D8]">
            Care Instructions
          </h3>
          <ul class="space-y-2 text-xs text-[#4A453E]">
            <li
              v-for="item in materialsData.careInstructions"
              :key="item.text"
              class="flex items-center gap-2.5"
            >
              <span class="text-sm shrink-0">{{ item.icon }}</span>
              <span>{{ item.text }}</span>
            </li>
          </ul>
        </div>

        <!-- Materials Art Card (3 cols) -->
        <div class="lg:col-span-3">
          <div class="relative overflow-hidden rounded-2xl bg-[#EDE6DC] shadow-sm aspect-[4/4]">
            <img
              src="/images/tab-materials.jpg"
              alt="Organic Linen"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <div class="absolute bottom-4 left-4">
              <p class="font-serif italic text-base sm:text-lg font-medium text-[#1F2623] leading-tight drop-shadow-sm">
                Natural<br />Conscious<br />Beautiful
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 4: SHIPPING & RETURNS -->
      <section v-else-if="activeTab === 'shipping'" class="space-y-6 animate-fadeIn">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Card 1: Shipping -->
          <div class="rounded-2xl border border-[#E8E2D8] bg-white p-6 shadow-sm flex items-start gap-4">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBF3EE] text-[#2D5A43]">
              <Icon name="ph:truck-bold" class="h-5 w-5" />
            </div>
            <div class="space-y-2">
              <h3 class="font-serif text-lg font-semibold text-[#1F2623]">
                Shipping
              </h3>
              <p class="text-xs font-medium text-[#2D5A43]">
                Free shipping on orders above ₹{{ shippingData.freeShippingThreshold }}
              </p>
              <ul class="space-y-1.5 text-xs text-[#635D54] pt-1">
                <li v-for="pt in shippingData.shippingPoints" :key="pt" class="flex items-center gap-2">
                  <span class="h-1 w-1 rounded-full bg-[#1F2623] shrink-0" />
                  <span>{{ pt }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Card 2: Returns & Refunds -->
          <div class="rounded-2xl border border-[#E8E2D8] bg-white p-6 shadow-sm flex items-start gap-4">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBF3EE] text-[#2D5A43]">
              <Icon name="ph:arrow-counter-clockwise-bold" class="h-5 w-5" />
            </div>
            <div class="space-y-2">
              <h3 class="font-serif text-lg font-semibold text-[#1F2623]">
                Returns & Refunds
              </h3>
              <p class="text-xs font-medium text-[#2D5A43]">
                Easy returns within 7 days of delivery
              </p>
              <ul class="space-y-1.5 text-xs text-[#635D54] pt-1">
                <li v-for="pt in shippingData.returnPoints" :key="pt" class="flex items-center gap-2">
                  <span class="h-1 w-1 rounded-full bg-[#1F2623] shrink-0" />
                  <span>{{ pt }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Bottom Conscious Shopping Banner -->
        <div class="rounded-2xl border border-[#E8E2D8] bg-[#FAF8F5] p-4.5 flex items-center gap-3 text-xs text-[#635D54]">
          <span class="text-lg">🍃</span>
          <div>
            <span class="font-semibold text-[#1F2623]">A kinder shopping experience — </span>
            <span>Thoughtful products. Happy customers. A more conscious future.</span>
          </div>
        </div>
      </section>

      <!-- TAB 5: REVIEWS (ACTIVE) -->
      <section v-else-if="activeTab === 'reviews'" aria-label="Customer Reviews" class="animate-fadeIn">
        <!-- Section Header Row -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-serif text-2xl sm:text-[26px] font-medium text-[#1F2623] tracking-tight">
            Customer Reviews
          </h2>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F2623] hover:text-[#94442A] transition-colors group"
          >
            <span>View All Reviews</span>
            <Icon name="ph:arrow-right" class="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <!-- Main 2-Column Row (Left: Rating Breakdown | Right: Review Cards Carousel) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- LEFT COLUMN: Rating Score & Dark Green Distribution Bars (4 cols) -->
          <div class="lg:col-span-4 space-y-5">
            <!-- Overall Score & Stars -->
            <div class="flex items-center gap-4">
              <span class="font-serif text-5xl font-semibold text-[#1F2623] tracking-tight">
                {{ stats.averageRating.toFixed(1) }}
              </span>

              <div class="space-y-0.5">
                <div class="flex text-amber-500 text-base tracking-wider">
                  <span v-for="i in 5" :key="i">
                    {{ i <= Math.round(stats.averageRating) ? '★' : '☆' }}
                  </span>
                </div>
                <p class="text-xs text-[#7A746B]">
                  Based on {{ stats.totalReviews }} reviews
                </p>
              </div>
            </div>

            <!-- Star Distribution Bars (Dark Forest Green Fill) -->
            <div class="space-y-2 max-w-[280px]">
              <div
                v-for="star in [5, 4, 3, 2, 1]"
                :key="star"
                class="flex items-center gap-2.5 text-xs text-[#1F2623]"
              >
                <div class="flex items-center gap-1 w-6 shrink-0 font-medium text-[#1F2623]">
                  <span>{{ star }}</span>
                  <span class="text-xs">★</span>
                </div>

                <!-- Progress bar track -->
                <div class="h-2 flex-1 rounded-full bg-[#ECE7DF] overflow-hidden">
                  <div
                    class="h-full rounded-full bg-[#2E3C32] transition-all duration-500"
                    :style="{ width: `${stats.percentages[star] || 0}%` }"
                  />
                </div>

                <!-- Percentage -->
                <div class="w-8 shrink-0 text-right text-[11px] text-[#7A746B] font-medium">
                  <span>{{ stats.percentages[star] || 0 }}%</span>
                </div>
              </div>
            </div>

            <!-- Write a Review Button -->
            <div class="pt-2">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full bg-[#2E3C32] px-7 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#202B24] transition-all hover:scale-[1.02]"
                @click="handleWriteReviewClick"
              >
                Write a Review
              </button>
            </div>
          </div>

          <!-- RIGHT COLUMN: Review Cards Carousel (8 cols) -->
          <div class="lg:col-span-8 relative flex items-center">
            <!-- Horizontal Scroll Container -->
            <div
              ref="carouselRef"
              class="flex items-stretch gap-4 overflow-x-auto pb-2 scrollbar-none w-full scroll-smooth"
            >
              <article
                v-for="review in displayReviews"
                :key="review.id"
                class="flex flex-col justify-between w-[280px] sm:w-[295px] shrink-0 rounded-2xl bg-white border border-[#E8E2D8] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all hover:shadow-md"
              >
                <!-- Card Top Bar: Initial Avatar, Name, Verified Badge, 3-dots -->
                <div>
                  <div class="flex items-start justify-between">
                    <div class="flex items-center gap-2.5">
                      <!-- Taupe Circular Avatar -->
                      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#9C8775] text-xs font-semibold text-white">
                        {{ review.author.initial }}
                      </div>

                      <div>
                        <h3 class="text-xs font-bold text-[#1F2623]">
                          {{ review.author.name }}
                        </h3>
                        <div
                          v-if="review.isVerifiedPurchase"
                          class="flex items-center gap-1 text-[10.5px] font-medium text-[#2D6A4F] mt-0.5"
                        >
                          <svg class="h-3 w-3 text-[#2D6A4F]" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          <span>Verified Purchase</span>
                        </div>
                      </div>
                    </div>

                    <!-- 3 Vertical Dots -->
                    <button
                      type="button"
                      class="text-stone-400 hover:text-stone-700 p-0.5"
                      aria-label="Review options"
                    >
                      <Icon name="ph:dots-three-vertical-bold" class="h-4 w-4" />
                    </button>
                  </div>

                  <!-- 5 Amber Stars -->
                  <div class="flex text-amber-500 text-xs tracking-wider mt-3">
                    <span v-for="i in 5" :key="i">
                      {{ i <= review.rating ? '★' : '☆' }}
                    </span>
                  </div>

                  <!-- Review Text Quote -->
                  <p class="mt-2 text-xs text-[#4A453E] leading-relaxed line-clamp-3">
                    {{ review.comment }}
                  </p>
                </div>

                <!-- Date at Bottom -->
                <p class="mt-4 text-[11px] text-[#A39D94]">
                  {{ review.date }}
                </p>
              </article>
            </div>

            <!-- Carousel Next Right Arrow Button -->
            <button
              type="button"
              class="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white border border-[#E8E2D8] shadow-md text-[#1F2623] hover:bg-[#FAF8F5] transition-transform hover:scale-105 z-10"
              aria-label="Next reviews"
              @click="scrollCarouselRight"
            >
              <Icon name="ph:arrow-right-bold" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- Write Review Modal -->
    <ProductWriteReviewModal
      :is-open="isModalOpen"
      :product-slug="productSlug"
      :product-name="productName"
      :is-verified="userState.isVerified"
      :initial-review="userState.userReview"
      @close="isModalOpen = false"
      @submitted="handleReviewSuccess"
    />
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
