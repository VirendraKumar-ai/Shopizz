<script setup lang="ts">
import type { Product } from '~~/shared/types/product'

const props = defineProps<{
  product: Product | any
}>()

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

const isWishlisted = ref(false)
const isAddedFeedback = ref(false)
const isShareFeedback = ref(false)

// Check initial wishlist state if user is logged in
onMounted(async () => {
  if (authStore.loggedIn) {
    try {
      const res = await $fetch<{ success: boolean; wishlist: any[] }>('/api/wishlist')
      if (res?.wishlist?.some((w) => w.productId === props.product.id)) {
        isWishlisted.value = true
      }
    } catch {
      // Non-blocking
    }
  }
})

// 1. Toggle Wishlist
const toggleWishlist = async (e: Event) => {
  e.preventDefault()
  e.stopPropagation()

  if (!authStore.loggedIn) {
    router.push(`/login?redirect=/product/${props.product.slug}`)
    return
  }

  isWishlisted.value = !isWishlisted.value

  try {
    if (isWishlisted.value) {
      await $fetch('/api/wishlist', {
        method: 'POST',
        body: { productId: props.product.id },
      })
    } else {
      await $fetch(`/api/wishlist/${props.product.id}`, {
        method: 'DELETE',
      })
    }
  } catch (err) {
    console.error('Wishlist error:', err)
  }
}

// 2. Add to Bag
const handleAddToBag = (e?: Event) => {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
  }

  cartStore.addItem(props.product, 1)
  isAddedFeedback.value = true
  setTimeout(() => {
    isAddedFeedback.value = false
  }, 1800)
}

// 3. Buy Now
const handleBuyNow = (e?: Event) => {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
  }

  cartStore.addItem(props.product, 1)
  router.push('/checkout')
}

// 4. Share Product Link
const handleShare = async (e: Event) => {
  e.preventDefault()
  e.stopPropagation()

  const productUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/product/${props.product.slug}`
    : `/product/${props.product.slug}`

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(productUrl)
      isShareFeedback.value = true
      setTimeout(() => {
        isShareFeedback.value = false
      }, 2000)
      return
    } catch {
      // fallback
    }
  }

  if (typeof navigator !== 'undefined' && (navigator as any).share) {
    try {
      await (navigator as any).share({
        title: props.product.name,
        url: productUrl,
      })
    } catch {
      // dismissed
    }
  }
}

// 5. Quick View
const handleQuickView = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  router.push(`/product/${props.product.slug}`)
}

const formatPrice = (amount: number) => {
  const valid = Number.isFinite(Number(amount)) ? Number(amount) : 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(valid / 100)
}

const hasDiscount = computed(() => {
  return (
    props.product.compareAtPrice &&
    props.product.compareAtPrice > props.product.price
  )
})

const discountPercentage = computed(() => {
  if (!hasDiscount.value || !props.product.compareAtPrice) {
    return 0
  }

  return Math.round(
    ((props.product.compareAtPrice - props.product.price) /
      props.product.compareAtPrice) *
      100
  )
})

const productImage = computed(() => {
  return (
    props.product.images?.[0]?.url ||
    props.product.imageUrl ||
    props.product.productImage ||
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80'
  )
})
</script>

<template>
  <article
    class="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#E8E2D8] bg-white p-3.5 shadow-xs transition-all duration-300 hover:shadow-lg hover:border-[#D5CEC4]"
  >
    <!-- Image Card Container with Hover Toolbar -->
    <div class="relative block aspect-[4/4.5] w-full overflow-hidden rounded-2xl bg-[#FAF8F5]">
      <NuxtLink :to="`/product/${product.slug}`" class="block h-full w-full">
        <img
          :src="productImage"
          :alt="product.name"
          class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </NuxtLink>

      <!-- Discount / Featured Badge (Top-Left) -->
      <span
        v-if="hasDiscount"
        class="absolute left-3 top-3 rounded-full bg-[#1F2623] px-2.5 py-0.5 text-[10px] font-bold text-white tracking-wide"
      >
        -{{ discountPercentage }}%
      </span>
      <span
        v-else-if="product.isFeatured"
        class="absolute left-3 top-3 rounded-full bg-[#94442A] px-2.5 py-0.5 text-[10px] font-bold text-white tracking-wide uppercase"
      >
        Featured
      </span>

      <!-- Feedback Toast on Card (Copied / Added) -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="isAddedFeedback || isShareFeedback"
          class="absolute inset-x-3 top-3 z-20 flex items-center justify-center rounded-xl bg-[#1F2623]/90 py-1.5 px-3 text-center text-xs font-semibold text-white backdrop-blur-xs shadow-md"
        >
          <span>{{ isAddedFeedback ? '✓ Added to Shopping Bag' : '🔗 Link Copied to Clipboard!' }}</span>
        </div>
      </transition>

      <!-- Animated Hover Floating Action Toolbar (Wishlist, Bag, View, Share) -->
      <div
        class="absolute inset-x-3 bottom-3 z-10 flex items-center justify-center gap-2 rounded-2xl bg-white/95 p-1.5 shadow-lg backdrop-blur-md transition-all duration-300 transform opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0"
      >
        <!-- 1. Wishlist Button -->
        <button
          type="button"
          :title="isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'"
          class="flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
          :class="isWishlisted ? 'bg-red-50 text-red-500' : 'bg-transparent text-[#1F2623] hover:bg-[#FAF8F5]'"
          @click="toggleWishlist"
        >
          <svg
            class="h-4 w-4 transition-colors"
            :class="isWishlisted ? 'fill-red-500 text-red-500' : 'fill-none stroke-current'"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        <!-- 2. Quick Add Bag Button -->
        <button
          type="button"
          title="Quick add to bag"
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-transparent text-[#1F2623] hover:bg-[#FAF8F5] transition-all hover:scale-110 active:scale-95 cursor-pointer"
          @click="handleAddToBag"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </button>

        <!-- 3. Quick View Button -->
        <button
          type="button"
          title="View product details"
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-transparent text-[#1F2623] hover:bg-[#FAF8F5] transition-all hover:scale-110 active:scale-95 cursor-pointer"
          @click="handleQuickView"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>

        <!-- 4. Share Button -->
        <button
          type="button"
          title="Share product link"
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-transparent text-[#1F2623] hover:bg-[#FAF8F5] transition-all hover:scale-110 active:scale-95 cursor-pointer"
          @click="handleShare"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Product Info Section -->
    <div class="mt-4 flex flex-1 flex-col justify-between space-y-3">
      <div>
        <!-- Category & Maker Subtitle -->
        <div class="flex items-center justify-between text-[10px] uppercase font-semibold text-[#7A746B]">
          <span>{{ product.category?.name || product.categoryName || 'Artisanal' }}</span>
          <span v-if="product.owner?.name || product.ownerName" class="truncate max-w-[120px]">
            {{ product.owner?.name || product.ownerName }}
          </span>
        </div>

        <NuxtLink
          :to="`/product/${product.slug}`"
          class="mt-1 block font-serif text-sm font-bold text-[#1F2623] hover:text-[#94442A] transition-colors truncate"
        >
          {{ product.name }}
        </NuxtLink>

        <!-- Price -->
        <div class="mt-1 flex items-baseline gap-2">
          <span class="font-serif text-sm font-bold text-[#1F2623]">
            {{ formatPrice(product.price) }}
          </span>

          <span
            v-if="hasDiscount"
            class="text-xs text-[#7A746B] line-through"
          >
            {{ formatPrice(product.compareAtPrice!) }}
          </span>
        </div>
      </div>

      <!-- Dual Action Buttons: Add to Bag + Buy Now -->
      <div class="grid grid-cols-2 gap-2 pt-1">
        <!-- Add to Bag Button -->
        <button
          type="button"
          class="flex items-center justify-center gap-1.5 rounded-xl border border-[#1F2623] bg-white py-2 px-2 text-[11px] font-semibold text-[#1F2623] hover:bg-[#FAF8F5] transition-all active:scale-98 cursor-pointer shadow-2xs"
          @click="handleAddToBag"
        >
          <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span class="truncate">{{ isAddedFeedback ? 'Added!' : 'Add to Bag' }}</span>
        </button>

        <!-- Buy Now Button -->
        <button
          type="button"
          class="flex items-center justify-center gap-1 rounded-xl bg-[#94442A] py-2 px-2 text-[11px] font-semibold text-white hover:bg-[#7E3821] transition-all active:scale-98 cursor-pointer shadow-2xs"
          @click="handleBuyNow"
        >
          <span class="truncate">Buy Now</span>
          <svg class="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </article>
</template>