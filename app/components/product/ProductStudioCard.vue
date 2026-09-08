<script setup lang="ts">
import type { Product } from '~~/shared/types/product'

const props = defineProps<{
  product: Product
  selectedColor?: string
  selectedSize?: string
}>()

const cartStore = useCartStore()

const quantity = ref(1)
const isWishlisted = ref(false)
const addedNotice = ref(false)
const copiedToast = ref(false)

const maxQuantity = computed(() => {
  return Math.max(1, Math.min(props.product.stock || 10, 10))
})

const incrementQty = () => {
  if (quantity.value < maxQuantity.value) quantity.value++
}

const decrementQty = () => {
  if (quantity.value > 1) quantity.value--
}

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

const handleAddToCart = () => {
  const success = cartStore.addItem(props.product, quantity.value)
  if (success) {
    addedNotice.value = true
    setTimeout(() => {
      addedNotice.value = false
    }, 4000)
  }
}

const toggleWishlist = () => {
  isWishlisted.value = !isWishlisted.value
}

const copyProductLink = async () => {
  try {
    if (typeof window !== 'undefined') {
      await navigator.clipboard.writeText(window.location.href)
      copiedToast.value = true
      setTimeout(() => {
        copiedToast.value = false
      }, 2500)
    }
  } catch (err) {
    console.error('Failed to copy link:', err)
  }
}

const shareToSocial = (platform: 'whatsapp' | 'pinterest' | 'facebook') => {
  if (typeof window === 'undefined') return
  const url = encodeURIComponent(window.location.href)
  const text = encodeURIComponent(`Check out ${props.product.name} on Shopizz Marketplace!`)

  let shareUrl = ''
  if (platform === 'whatsapp') {
    shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`
  } else if (platform === 'pinterest') {
    const img = encodeURIComponent(props.product.images?.[0]?.url || '')
    shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&media=${img}&description=${text}`
  } else if (platform === 'facebook') {
    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
  }

  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=500')
  }
}

const shopName = computed(() => {
  return props.product.shop?.name || props.product.owner?.name || 'The Loom Studio'
})

const shopLocation = computed(() => {
  return props.product.shop?.location || 'Jaipur, Rajasthan'
})

const shopBio = computed(() => {
  return (
    props.product.shop?.description ||
    'Thoughtful clothing for everyday living. Rooted in craft, made for modern life.'
  )
})
</script>

<template>
  <div class="flex flex-col gap-4 w-full" aria-label="Purchase and Maker Studio Section">
    <!-- Top Card: Studio Profile & Brand Values -->
    <aside class="flex flex-col gap-4 rounded-[22px] bg-[#FAF8F5] border border-[#E8E2D8] p-5 shadow-sm overflow-hidden">
      <!-- Studio Header -->
      <div class="border-b border-[#E8E2D8] pb-3.5">
        <div class="flex items-center gap-3">
          <!-- Studio Avatar / Monogram -->
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E5DFD5] border border-black/5 text-[#1F2623] font-serif font-bold text-xs shadow-inner">
            {{ shopName.slice(0, 2).toUpperCase() }}
          </div>

          <div class="min-w-0 flex-1 overflow-hidden">
            <NuxtLink
              to="/shop"
              class="group flex items-center gap-1 font-serif text-[15px] font-bold text-[#1F2623] hover:text-[#94442A] transition-colors"
            >
              <span class="truncate block max-w-full">{{ shopName }}</span>
              <Icon name="ph:caret-right-bold" class="h-3 w-3 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </NuxtLink>
            <p class="text-[10.5px] text-[#7A746B] font-medium truncate block max-w-full mt-0.5">
              Independent Brand • {{ shopLocation }}
            </p>
          </div>
        </div>

        <!-- Studio Bio -->
        <p class="mt-2.5 text-xs text-[#5D574E] leading-relaxed line-clamp-2">
          {{ shopBio }}
        </p>

        <!-- View Shop Link -->
        <NuxtLink
          to="/shop"
          class="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-[#1F2623] hover:text-[#94442A] hover:underline transition-colors"
        >
          <span>View Shop</span>
          <Icon name="ph:arrow-right" class="h-3.5 w-3.5" />
        </NuxtLink>
      </div>

      <!-- Sustainability & Craft Values -->
      <div class="space-y-2.5 text-xs text-[#1F2623] font-medium">
        <div class="flex items-center gap-2.5">
          <Icon name="ph:leaf" class="h-4 w-4 text-[#2E6644] shrink-0" />
          <span>Sustainable Materials</span>
        </div>
        <div class="flex items-center gap-2.5">
          <Icon name="ph:sparkle" class="h-4 w-4 text-[#94442A] shrink-0" />
          <span>Ethically Made</span>
        </div>
        <div class="flex items-center gap-2.5">
          <Icon name="ph:plant" class="h-4 w-4 text-[#2E6644] shrink-0" />
          <span>Small Batch Production</span>
        </div>
        <div class="flex items-center gap-2.5">
          <Icon name="ph:handshake" class="h-4 w-4 text-[#94442A] shrink-0" />
          <span>Supports Local Artisans</span>
        </div>
      </div>
    </aside>

    <!-- Bottom Action Card: Quantity, Add to Cart, Wishlist, Trust & Share -->
    <div class="flex flex-col gap-4 rounded-[22px] bg-[#FAF8F5] border border-[#E8E2D8] p-5 shadow-sm">
      <!-- Quantity Stepper -->
      <div>
        <label class="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A746B] mb-2">
          Quantity
        </label>
        <div class="inline-flex items-center rounded-full border border-[#DED7CD] bg-white px-3 py-1 shadow-sm">
          <button
            type="button"
            class="h-6 w-6 flex items-center justify-center text-sm text-[#1F2623] hover:bg-stone-100 rounded-full transition-colors disabled:opacity-30 cursor-pointer"
            :disabled="quantity <= 1"
            aria-label="Decrease quantity"
            @click="decrementQty"
          >
            −
          </button>
          <span class="w-8 text-center text-xs font-bold text-[#1F2623]">
            {{ quantity }}
          </span>
          <button
            type="button"
            class="h-6 w-6 flex items-center justify-center text-sm text-[#1F2623] hover:bg-stone-100 rounded-full transition-colors disabled:opacity-30 cursor-pointer"
            :disabled="quantity >= maxQuantity"
            aria-label="Increase quantity"
            @click="incrementQty"
          >
            +
          </button>
        </div>
      </div>

      <!-- Action Buttons (Add to Cart & Wishlist) -->
      <div class="flex flex-col gap-2.5">
        <button
          type="button"
          class="w-full h-[46px] rounded-full bg-[#2B3B30] hover:bg-[#1D2821] text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
          @click="handleAddToCart"
        >
          <span>Add to Cart — {{ formatPrice(product.price * quantity) }}</span>
        </button>

        <button
          type="button"
          class="w-full h-[42px] rounded-full border border-[#D0C8BC] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#1F2623] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          :class="{ 'text-red-600 border-red-200 bg-red-50/50': isWishlisted }"
          @click="toggleWishlist"
        >
          <Icon
            :name="isWishlisted ? 'ph:heart-fill' : 'ph:heart'"
            class="h-4 w-4"
            :class="isWishlisted ? 'text-red-500' : 'text-[#1F2623]'"
          />
          <span>{{ isWishlisted ? 'Wishlisted' : 'Add to Wishlist' }}</span>
        </button>
      </div>

      <!-- Added to Cart Feedback Banner -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="addedNotice"
          class="flex items-center justify-between rounded-xl border border-[#2E6644]/20 bg-[#2E6644]/10 px-3.5 py-2 text-xs font-semibold text-[#2E6644]"
        >
          <span>✓ Added {{ quantity }} item{{ quantity > 1 ? 's' : '' }} to Bag</span>
          <NuxtLink to="/cart" class="underline hover:text-[#1F2623]">
            View Bag →
          </NuxtLink>
        </div>
      </Transition>

      <!-- 3-Column Trust Strip -->
      <div class="grid grid-cols-3 gap-2 pt-2 border-t border-[#E8E2D8] text-[10px] text-[#555]">
        <div class="flex flex-col items-center text-center p-1.5 rounded-xl bg-[#F6F1E9]">
          <Icon name="ph:truck" class="h-3.5 w-3.5 text-[#94442A] mb-1" />
          <span class="font-bold text-[#1F2623]">Free Shipping</span>
          <span class="text-[9px] text-[#7A746B]">above ₹1499</span>
        </div>

        <div class="flex flex-col items-center text-center p-1.5 rounded-xl bg-[#F6F1E9]">
          <Icon name="ph:package" class="h-3.5 w-3.5 text-[#94442A] mb-1" />
          <span class="font-bold text-[#1F2623]">Easy Returns</span>
          <span class="text-[9px] text-[#7A746B]">within 7 days</span>
        </div>

        <div class="flex flex-col items-center text-center p-1.5 rounded-xl bg-[#F6F1E9]">
          <Icon name="ph:shield-check" class="h-3.5 w-3.5 text-[#94442A] mb-1" />
          <span class="font-bold text-[#1F2623]">Secure</span>
          <span class="text-[9px] text-[#7A746B]">100% encrypted</span>
        </div>
      </div>

      <!-- Share this product row -->
      <div class="pt-2 border-t border-[#E8E2D8]">
        <div class="flex items-center justify-between">
          <p class="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#7A746B]">
            Share piece
          </p>

          <div class="flex items-center gap-2">
            <!-- Copy Link -->
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-full border border-[#DED7CD] bg-white text-[#1F2623] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
              title="Copy Link"
              aria-label="Copy link"
              @click="copyProductLink"
            >
              <Icon name="ph:link" class="h-3 w-3" />
            </button>

            <!-- WhatsApp -->
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-full border border-[#DED7CD] bg-white text-[#1F2623] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
              title="Share on WhatsApp"
              aria-label="Share on WhatsApp"
              @click="shareToSocial('whatsapp')"
            >
              <Icon name="ph:whatsapp-logo" class="h-3 w-3 text-[#2E6644]" />
            </button>

            <!-- Pinterest -->
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-full border border-[#DED7CD] bg-white text-[#1F2623] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
              title="Share on Pinterest"
              aria-label="Share on Pinterest"
              @click="shareToSocial('pinterest')"
            >
              <Icon name="ph:pinterest-logo" class="h-3 w-3 text-[#94442A]" />
            </button>

            <!-- Facebook -->
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-full border border-[#DED7CD] bg-white text-[#1F2623] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
              title="Share on Facebook"
              aria-label="Share on Facebook"
              @click="shareToSocial('facebook')"
            >
              <Icon name="ph:facebook-logo" class="h-3 w-3 text-[#1F2623]" />
            </button>
          </div>
        </div>

        <!-- Toast Feedback -->
        <p v-if="copiedToast" class="mt-1.5 text-[10px] font-semibold text-[#2E6644]">
          ✓ Link copied to clipboard!
        </p>
      </div>
    </div>
  </div>
</template>
