<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const cartStore = useCartStore()

const {
  data,
  pending,
  refresh,
} = await useFetch<any>('/api/wishlist')

const items = computed(() => data.value?.items || [])

const removingId = ref<string | null>(null)
const movingId = ref<string | null>(null)
const feedbackMessage = ref('')

function formatCurrency(paise: number) {
  return '₹ ' + Math.round((paise || 0) / 100).toLocaleString('en-IN')
}

async function handleRemove(productId: string) {
  removingId.value = productId
  try {
    await $fetch(`/api/wishlist/${productId}`, { method: 'DELETE' })
    await refresh()
    feedbackMessage.value = 'Item removed from your curation.'
    setTimeout(() => { feedbackMessage.value = '' }, 2500)
  } catch (err: any) {
    console.error('Error removing from wishlist:', err)
  } finally {
    removingId.value = null
  }
}

async function handleMoveToBag(item: any) {
  movingId.value = item.productId
  try {
    cartStore.addItem({
      productId: item.productId,
      productName: item.name,
      productSlug: item.slug,
      productImage: item.imageUrl,
      price: item.price,
      quantity: 1,
      ownerName: item.shopName,
    })

    // Optionally remove from wishlist once added
    await $fetch(`/api/wishlist/${item.productId}`, { method: 'DELETE' })
    await refresh()

    feedbackMessage.value = `"${item.name}" moved to your Shopping Bag!`
    setTimeout(() => { feedbackMessage.value = '' }, 3000)
  } catch (err: any) {
    console.error('Error moving to cart:', err)
  } finally {
    movingId.value = null
  }
}
</script>

<template>
  <div class="mx-auto max-w-[1380px] px-4 py-10 sm:px-6 lg:px-8 sm:py-12">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-[#7A746B] mb-6">
      <NuxtLink to="/" class="hover:text-[#1F2623] transition-colors">Home</NuxtLink>
      <span>&gt;</span>
      <NuxtLink to="/account" class="hover:text-[#1F2623] transition-colors">My Account</NuxtLink>
      <span>&gt;</span>
      <span class="font-medium text-[#1F2623]">Saved Items</span>
    </nav>

    <!-- Header -->
    <section class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#E8E2D8]">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1F2623]">
            Saved Items
          </h1>
          <span
            v-if="items.length > 0"
            class="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#FDF3EE] px-2.5 text-xs font-bold text-[#94442A]"
          >
            {{ items.length }}
          </span>
        </div>
        <p class="mt-2 text-xs sm:text-sm text-[#7A746B] max-w-xl">
          Pieces you've curated for mindful living, natural textures, and intentional style.
        </p>
      </div>

      <NuxtLink
        to="/shop"
        class="inline-flex items-center gap-1 text-xs font-semibold text-[#1F2623] hover:text-[#94442A] transition-colors"
      >
        <span>Continue Exploring →</span>
      </NuxtLink>
    </section>

    <!-- Feedback Banner -->
    <div
      v-if="feedbackMessage"
      class="mt-6 rounded-2xl bg-[#EBF3EE] border border-[#C7DFD0] p-4 text-xs font-medium text-[#2D5A43] transition-all"
    >
      ✓ {{ feedbackMessage }}
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="py-20 text-center text-xs text-[#7A746B]">
      Loading your curated pieces...
    </div>

    <!-- Empty State -->
    <div
      v-else-if="items.length === 0"
      class="my-12 rounded-3xl border border-dashed border-[#E8E2D8] bg-white p-12 sm:p-16 text-center space-y-4 shadow-xs"
    >
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FAF8F5] text-2xl text-[#94442A]">
        ♡
      </div>
      <h3 class="font-serif text-2xl font-bold text-[#1F2623]">
        Your curation is currently empty
      </h3>
      <p class="mx-auto max-w-md text-xs text-[#7A746B] leading-relaxed">
        Save thoughtful creations while browsing our maker directory and return to them anytime.
      </p>
      <div class="pt-2">
        <NuxtLink
          to="/shop"
          class="inline-flex items-center gap-2 rounded-full bg-[#1F2623] px-7 py-3 text-xs font-semibold text-white shadow-sm hover:bg-[#2E3C32] transition-transform hover:scale-105"
        >
          <span>Explore Collection →</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Wishlist Grid -->
    <div
      v-else
      class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <article
        v-for="item in items"
        :key="item.productId"
        class="group flex flex-col rounded-3xl border border-[#E8E2D8] bg-white p-4 shadow-xs hover:shadow-md transition-all duration-300"
      >
        <!-- Product Image & Remove Button -->
        <div class="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8]">
          <NuxtLink :to="`/product/${item.slug}`" class="block h-full w-full">
            <img
              :src="item.imageUrl"
              :alt="item.name"
              class="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            >
          </NuxtLink>

          <!-- Remove Wishlist Button -->
          <button
            type="button"
            :disabled="removingId === item.productId"
            class="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#94442A] shadow-sm hover:bg-white hover:scale-110 transition-all cursor-pointer"
            title="Remove from saved"
            @click="handleRemove(item.productId)"
          >
            <Icon name="ph:heart-fill" class="h-4 w-4" />
          </button>
        </div>

        <!-- Info & Actions -->
        <div class="mt-4 flex flex-1 flex-col justify-between space-y-3">
          <div>
            <p class="text-[11px] font-medium text-[#7A746B]">{{ item.shopName }}</p>
            <NuxtLink
              :to="`/product/${item.slug}`"
              class="mt-0.5 block font-serif text-sm font-bold text-[#1F2623] hover:text-[#94442A] transition-colors truncate"
            >
              {{ item.name }}
            </NuxtLink>
            <div class="mt-1.5 flex items-baseline gap-2">
              <span class="font-serif text-sm font-bold text-[#1F2623]">
                {{ formatCurrency(item.price) }}
              </span>
              <span
                v-if="item.compareAtPrice && item.compareAtPrice > item.price"
                class="text-xs text-[#7A746B] line-through"
              >
                {{ formatCurrency(item.compareAtPrice) }}
              </span>
            </div>
          </div>

          <!-- Move to Bag Action -->
          <button
            type="button"
            :disabled="movingId === item.productId"
            class="w-full flex items-center justify-center gap-2 rounded-2xl border border-[#1F2623] bg-white py-2.5 text-xs font-semibold text-[#1F2623] hover:bg-[#1F2623] hover:text-white transition-all shadow-xs disabled:opacity-50"
            @click="handleMoveToBag(item)"
          >
            <Icon name="ph:bag" class="h-4 w-4" />
            <span>{{ movingId === item.productId ? 'Adding...' : 'Move to Bag' }}</span>
          </button>
        </div>
      </article>
    </div>
  </div>
</template>
