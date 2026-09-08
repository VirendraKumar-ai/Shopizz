<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

const proceedToCheckout = () => {
  if (!authStore.loggedIn) {
    router.push('/login?redirect=/checkout')
  } else {
    router.push('/checkout')
  }
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
    <!-- Header -->
    <div class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]">
          Shopping Bag / 001
        </p>

        <h1 class="mt-3 text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
          Your Cart
        </h1>
      </div>

      <NuxtLink
        :to="authStore.loggedIn ? '/account/products' : '/'"
        class="text-xs uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/50 transition-colors hover:text-[var(--shopizz-obsidian)]"
      >
        ← Continue shopping
      </NuxtLink>
    </div>

    <!-- Empty State -->
    <div v-if="cartStore.isEmpty" class="py-12">
      <AppEmptyState
        title="Your bag is empty"
        description="Explore the Shopizz collection of independent clothing, objects and everyday essentials."
      >
        <NuxtLink :to="authStore.loggedIn ? '/account/products' : '/'">
          <AppButton>
            Explore marketplace collection →
          </AppButton>
        </NuxtLink>
      </AppEmptyState>
    </div>

    <!-- Cart Layout -->
    <div v-else class="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <!-- Items List (8 cols) -->
      <div class="space-y-6 lg:col-span-8">
        <!-- Free Shipping Banner -->
        <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-5">
          <div class="flex items-center justify-between text-xs">
            <span class="font-medium">
              <template v-if="cartStore.freeShippingProgress >= 100">
                ✓ You have qualified for free delivery!
              </template>
              <template v-else>
                Add {{ formatPrice(cartStore.freeShippingRemaining) }} more to unlock free delivery
              </template>
            </span>
            <span class="text-[var(--shopizz-obsidian)]/50">
              {{ cartStore.freeShippingProgress }}%
            </span>
          </div>

          <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--shopizz-stone)]">
            <div
              class="h-full bg-[var(--shopizz-moss)] transition-all duration-500"
              :style="{ width: `${cartStore.freeShippingProgress}%` }"
            />
          </div>
        </div>

        <!-- Items Table / Cards -->
        <div class="divide-y divide-[var(--shopizz-obsidian)]/10 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/20 p-6 sm:p-8">
          <div
            v-for="item in cartStore.items"
            :key="item.productId"
            class="flex flex-col gap-6 py-6 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <!-- Product image + details -->
            <div class="flex items-center gap-5">
              <NuxtLink
                :to="`/product/${item.product.slug}`"
                class="h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-[var(--shopizz-stone)]/40 aspect-[4/5]"
              >
                <img
                  v-if="item.product?.images?.[0]?.url || (item.product as any)?.imageUrl"
                  :src="item.product?.images?.[0]?.url || (item.product as any)?.imageUrl"
                  :alt="item.product?.images?.[0]?.alt || item.product?.name"
                  class="h-full w-full object-cover"
                />
                <div
                  v-else
                  class="flex h-full items-center justify-center text-[10px] uppercase text-[var(--shopizz-obsidian)]/30"
                >
                  Piece
                </div>
              </NuxtLink>

              <div class="space-y-1">
                <p
                  v-if="item.product?.category?.name || (item.product as any)?.categoryName"
                  class="text-[10px] font-medium uppercase tracking-[0.2em] text-[#94442A]"
                >
                  {{ item.product?.category?.name || (item.product as any)?.categoryName }}
                </p>

                <NuxtLink
                  :to="`/product/${item.product?.slug}`"
                  class="block text-base font-medium tracking-tight transition-opacity hover:opacity-70"
                >
                  {{ item.product?.name || 'Handcrafted Piece' }}
                </NuxtLink>

                <p
                  v-if="item.product?.owner?.name || (item.product as any)?.ownerName"
                  class="text-xs text-[var(--shopizz-obsidian)]/40"
                >
                  By {{ item.product?.owner?.name || (item.product as any)?.ownerName }}
                </p>

                <p class="text-sm font-medium sm:hidden">
                  {{ formatPrice(item.product?.price || item.price) }}
                </p>
              </div>
            </div>

            <!-- Quantity & Actions Right -->
            <div class="flex items-center justify-between gap-6 sm:justify-end">
              <!-- Stepper -->
              <div class="flex items-center rounded-full border border-[var(--shopizz-obsidian)]/15 bg-white/50 px-3 py-1">
                <button
                  type="button"
                  class="px-2 py-0.5 text-sm text-[var(--shopizz-obsidian)]/60 transition-colors hover:text-[var(--shopizz-obsidian)]"
                  @click="cartStore.updateQuantity(item.productId, (item.quantity || 1) - 1)"
                >
                  −
                </button>

                <span class="w-7 text-center text-xs font-medium">
                  {{ item.quantity || 1 }}
                </span>

                <button
                  type="button"
                  class="px-2 py-0.5 text-sm text-[var(--shopizz-obsidian)]/60 transition-colors hover:text-[var(--shopizz-obsidian)]"
                  @click="cartStore.updateQuantity(item.productId, (item.quantity || 1) + 1)"
                >
                  +
                </button>
              </div>

              <!-- Price -->
              <div class="hidden min-w-24 text-right sm:block">
                <p class="text-base font-medium">
                  {{ formatPrice((item.product?.price || item.price || 0) * (item.quantity || 1)) }}
                </p>
                <p
                  v-if="(item.quantity || 1) > 1"
                  class="text-[10px] text-[var(--shopizz-obsidian)]/40"
                >
                  {{ formatPrice(item.product?.price || item.price || 0) }} each
                </p>
              </div>

              <!-- Remove button -->
              <button
                type="button"
                aria-label="Remove item"
                class="rounded-full p-2 text-xs text-[var(--shopizz-obsidian)]/35 transition-colors hover:bg-[var(--shopizz-stone)] hover:text-[var(--shopizz-obsidian)]"
                @click="cartStore.removeItem(item.productId)"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Clear cart -->
        <div class="flex justify-end">
          <button
            type="button"
            class="text-xs text-[var(--shopizz-obsidian)]/40 underline hover:text-[var(--shopizz-saffron)]"
            @click="cartStore.clearCart()"
          >
            Empty shopping bag
          </button>
        </div>
      </div>

      <!-- Order Summary (4 cols) -->
      <div class="lg:col-span-4">
        <div class="sticky top-28 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-8">
          <h2 class="text-xl font-medium tracking-[-0.02em]">
            Order Summary
          </h2>

          <div class="mt-6 space-y-4 text-sm">
            <div class="flex justify-between">
              <span class="text-[var(--shopizz-obsidian)]/60">Subtotal ({{ cartStore.itemCount }} {{ cartStore.itemCount === 1 ? 'item' : 'items' }})</span>
              <span class="font-medium">{{ formatPrice(cartStore.subtotal) }}</span>
            </div>

            <div class="flex justify-between">
              <span class="text-[var(--shopizz-obsidian)]/60">Estimated Shipping</span>
              <span class="font-medium">
                {{ cartStore.shipping === 0 ? 'Free' : formatPrice(cartStore.shipping) }}
              </span>
            </div>

            <div class="border-t border-[var(--shopizz-obsidian)]/10 pt-4 flex justify-between text-base font-medium">
              <span>Total</span>
              <span>{{ formatPrice(cartStore.total) }}</span>
            </div>
          </div>

          <!-- Checkout CTA -->
          <button
            type="button"
            class="mt-8 w-full rounded-full bg-[var(--shopizz-obsidian)] py-4 text-sm font-medium text-white transition-all duration-300 hover:bg-[var(--shopizz-moss)] hover:-translate-y-0.5"
            @click="proceedToCheckout"
          >
            Proceed to Checkout →
          </button>

          <!-- Guest info -->
          <p
            v-if="!authStore.loggedIn"
            class="mt-3 text-center text-[11px] text-[var(--shopizz-obsidian)]/50"
          >
            You'll be prompted to sign in or create an account at checkout.
          </p>

          <div class="mt-6 border-t border-[var(--shopizz-obsidian)]/10 pt-5 space-y-2 text-[11px] text-[var(--shopizz-obsidian)]/55">
            <div class="flex items-center gap-2">
              <span>✓</span>
              <span>Secure encrypted checkout</span>
            </div>
            <div class="flex items-center gap-2">
              <span>✓</span>
              <span>Direct support from independent shops</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
