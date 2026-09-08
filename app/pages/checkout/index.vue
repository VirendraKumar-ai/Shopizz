<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()
const { openCheckout } = useRazorpay()

// If cart is empty, redirect back to cart
onMounted(async () => {
  if (cartStore.isEmpty) {
    router.replace('/cart')
    return
  }

  // Auto-fill from saved addresses if available
  try {
    const res = await $fetch<{ success: boolean; addresses: any[] }>('/api/account/addresses')
    if (res?.addresses?.length > 0) {
      const defaultAddr = res.addresses.find((a) => a.isDefault) || res.addresses[0]
      if (defaultAddr) {
        form.value.shippingName = defaultAddr.recipientName || form.value.shippingName
        form.value.shippingPhone = defaultAddr.phoneNumber || form.value.shippingPhone
        form.value.shippingAddress = defaultAddr.streetAddress || form.value.shippingAddress
        form.value.shippingCity = defaultAddr.city || form.value.shippingCity
        form.value.shippingState = defaultAddr.state || form.value.shippingState
        form.value.shippingPostalCode = defaultAddr.postalCode || form.value.shippingPostalCode
      }
    }
  } catch {
    // Non-blocking fallback
  }
})

const form = ref({
  shippingName: authStore.user?.name || '',
  shippingPhone: '',
  shippingAddress: '',
  shippingCity: '',
  shippingState: '',
  shippingPostalCode: '',
  paymentMethod: 'RAZORPAY', // Default to Razorpay secure checkout
  notes: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('')

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

const handlePlaceOrder = async () => {
  errorMessage.value = ''

  if (cartStore.isEmpty) {
    errorMessage.value = 'Your shopping bag is empty.'
    return
  }

  if (
    !form.value.shippingName.trim() ||
    !form.value.shippingPhone.trim() ||
    !form.value.shippingAddress.trim() ||
    !form.value.shippingCity.trim() ||
    !form.value.shippingState.trim() ||
    !form.value.shippingPostalCode.trim()
  ) {
    errorMessage.value = 'Please complete all required shipping fields.'
    return
  }

  isSubmitting.value = true

  const shippingPayload = {
    items: cartStore.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    })),
    shippingName: form.value.shippingName.trim(),
    shippingPhone: form.value.shippingPhone.trim(),
    shippingAddress: form.value.shippingAddress.trim(),
    shippingCity: form.value.shippingCity.trim(),
    shippingState: form.value.shippingState.trim(),
    shippingPostalCode: form.value.shippingPostalCode.trim(),
    notes: form.value.notes.trim() || undefined,
  }

  try {
    // Flow 1: Razorpay Online Payment (UPI, Cards, NetBanking)
    if (form.value.paymentMethod === 'RAZORPAY') {
      // Step A: Create order on Razorpay via backend
      const rzpOrder = await $fetch<{
        success: boolean
        orderId: string
        amount: number
        currency: string
        orderNumber: string
        keyId: string
      }>('/api/payments/razorpay/create-order', {
        method: 'POST',
        body: shippingPayload,
      })

      // Step B: Open Razorpay modal
      const paymentResponse = await openCheckout({
        keyId: rzpOrder.keyId,
        orderId: rzpOrder.orderId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'Shopizz',
        description: `Order #${rzpOrder.orderNumber} — Artisanal Marketplace`,
        prefill: {
          name: form.value.shippingName.trim(),
          email: authStore.user?.email || '',
          contact: form.value.shippingPhone.trim(),
        },
        notes: {
          orderNumber: rzpOrder.orderNumber,
        },
      })

      // Step C: Verify payment signature and fulfill order
      const verifyResponse = await $fetch<{
        success: boolean
        orderId: string
        orderNumber: string
      }>('/api/payments/razorpay/verify', {
        method: 'POST',
        body: {
          ...shippingPayload,
          orderNumber: rzpOrder.orderNumber,
          razorpayOrderId: paymentResponse.razorpay_order_id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature,
        },
      })

      // Clear bag & route to confirmation
      cartStore.clearCart()
      await router.push({
        path: '/checkout/success',
        query: {
          orderId: verifyResponse.orderId,
          orderNumber: verifyResponse.orderNumber,
        },
      })
    } 
    // Flow 2: Cash / Pay on Delivery (COD)
    else {
      const codResponse = await $fetch<{
        success: boolean
        orderId: string
        orderNumber: string
      }>('/api/orders', {
        method: 'POST',
        body: {
          ...shippingPayload,
          paymentMethod: 'COD',
        },
      })

      cartStore.clearCart()
      await router.push({
        path: '/checkout/success',
        query: {
          orderId: codResponse.orderId,
          orderNumber: codResponse.orderNumber,
        },
      })
    }
  } catch (err: any) {
    if (err?.message === 'PAYMENT_CANCELLED') {
      errorMessage.value = 'Payment window was closed. Your items are safe in your bag—you can try again whenever you are ready.'
    } else {
      errorMessage.value =
        err?.data?.statusMessage ||
        err?.data?.message ||
        err?.message ||
        'An error occurred while processing your checkout. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
    <!-- Header -->
    <div class="mb-10 flex items-center justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-[#94442a]">
          Checkout / 001
        </p>

        <h1 class="mt-3 text-4xl font-medium tracking-[-0.05em] text-[var(--shopizz-obsidian)] sm:text-5xl">
          Order Details
        </h1>
      </div>

      <NuxtLink
        to="/cart"
        class="text-xs font-medium uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/60 transition-colors hover:text-[var(--shopizz-obsidian)]"
      >
        ← Return to bag
      </NuxtLink>
    </div>

    <!-- Checkout grid -->
    <div class="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <!-- Shipping & Payment Form (7 cols) -->
      <div class="space-y-8 lg:col-span-7">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="rounded-2xl border border-[#94442a]/20 bg-[#94442a]/10 p-4 text-xs font-medium text-[#94442a] flex items-start gap-3"
        >
          <span class="text-base">⚠️</span>
          <p class="leading-relaxed">{{ errorMessage }}</p>
        </div>

        <!-- 1. Shipping Details -->
        <div class="space-y-6 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 p-7 sm:p-8 shadow-xs">
          <div class="flex items-center gap-3">
            <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#94442a] text-xs font-semibold text-white">
              1
            </span>
            <h2 class="text-xl font-medium tracking-tight text-[var(--shopizz-obsidian)]">
              Delivery Address
            </h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <AppInput
              v-model="form.shippingName"
              label="Recipient Name *"
              placeholder="e.g. Eleanor Vance"
              :disabled="isSubmitting"
            />

            <AppInput
              v-model="form.shippingPhone"
              label="Contact Phone *"
              placeholder="e.g. +91 98765 43210"
              :disabled="isSubmitting"
            />
          </div>

          <AppInput
            v-model="form.shippingAddress"
            label="Street Address / Flat / Building *"
            placeholder="e.g. Flat 402, Lotus Residency, 14th Main"
            :disabled="isSubmitting"
          />

          <div class="grid gap-4 sm:grid-cols-3">
            <AppInput
              v-model="form.shippingCity"
              label="City *"
              placeholder="e.g. Bengaluru"
              :disabled="isSubmitting"
            />

            <AppInput
              v-model="form.shippingState"
              label="State *"
              placeholder="e.g. Karnataka"
              :disabled="isSubmitting"
            />

            <AppInput
              v-model="form.shippingPostalCode"
              label="Postal PIN Code *"
              placeholder="e.g. 560001"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <!-- 2. Payment Method -->
        <div class="space-y-6 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 p-7 sm:p-8 shadow-xs">
          <div class="flex items-center gap-3">
            <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#94442a] text-xs font-semibold text-white">
              2
            </span>
            <h2 class="text-xl font-medium tracking-tight text-[var(--shopizz-obsidian)]">
              Payment Method
            </h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <!-- Razorpay Option -->
            <label
              class="relative flex cursor-pointer flex-col justify-between rounded-2xl border p-5 transition-all"
              :class="
                form.paymentMethod === 'RAZORPAY'
                  ? 'border-[#94442a] bg-[#94442a]/5 shadow-sm ring-1 ring-[#94442a]'
                  : 'border-[var(--shopizz-obsidian)]/10 bg-white/20 hover:bg-white/40'
              "
            >
              <input
                v-model="form.paymentMethod"
                type="radio"
                value="RAZORPAY"
                class="sr-only"
              />
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]">
                    ⚡ Razorpay Secure
                  </span>
                  <span class="rounded-md bg-[#2e6644]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#2e6644]">
                    Instant
                  </span>
                </div>
                <span v-if="form.paymentMethod === 'RAZORPAY'" class="text-sm font-bold text-[#94442a]">●</span>
              </div>
              <p class="mt-3 text-xs text-[var(--shopizz-obsidian)]/70">
                UPI (GPay, PhonePe, Paytm), Credit & Debit Cards, NetBanking, Wallets.
              </p>
            </label>

            <!-- COD Option -->
            <label
              class="relative flex cursor-pointer flex-col justify-between rounded-2xl border p-5 transition-all"
              :class="
                form.paymentMethod === 'COD'
                  ? 'border-[#94442a] bg-[#94442a]/5 shadow-sm ring-1 ring-[#94442a]'
                  : 'border-[var(--shopizz-obsidian)]/10 bg-white/20 hover:bg-white/40'
              "
            >
              <input
                v-model="form.paymentMethod"
                type="radio"
                value="COD"
                class="sr-only"
              />
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]">
                  📦 Pay on Delivery
                </span>
                <span v-if="form.paymentMethod === 'COD'" class="text-sm font-bold text-[#94442a]">●</span>
              </div>
              <p class="mt-3 text-xs text-[var(--shopizz-obsidian)]/70">
                Pay in cash or scan UPI upon doorstep delivery.
              </p>
            </label>
          </div>

          <AppInput
            v-model="form.notes"
            label="Delivery Notes (Optional)"
            placeholder="Special delivery instructions, landmark, or gate instructions..."
            :disabled="isSubmitting"
          />
        </div>
      </div>

      <!-- Order Review Sidebar (5 cols) -->
      <div class="lg:col-span-5">
        <div class="sticky top-28 space-y-6 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/60 p-8 shadow-sm">
          <h2 class="text-xl font-medium tracking-tight text-[var(--shopizz-obsidian)]">
            Order Summary
          </h2>

          <!-- Items preview -->
          <div class="max-h-60 space-y-3 overflow-y-auto pr-2 divide-y divide-[var(--shopizz-obsidian)]/10">
            <div
              v-for="item in cartStore.items"
              :key="item.productId"
              class="flex items-center justify-between gap-4 pt-3 first:pt-0"
            >
              <div class="flex items-center gap-3">
                <div class="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--shopizz-stone)]/40 aspect-[4/5]">
                  <img
                    v-if="item.product.images?.[0]?.url"
                    :src="item.product.images[0].url"
                    :alt="item.product.name"
                    class="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p class="text-xs font-medium text-[var(--shopizz-obsidian)] line-clamp-1">
                    {{ item.product.name }}
                  </p>
                  <p class="text-[10px] text-[var(--shopizz-obsidian)]/50">
                    Qty: {{ item.quantity }}
                  </p>
                </div>
              </div>

              <span class="text-xs font-semibold text-[var(--shopizz-obsidian)] shrink-0">
                {{ formatPrice(item.product.price * item.quantity) }}
              </span>
            </div>
          </div>

          <!-- Total Calculation -->
          <div class="space-y-3 border-t border-[var(--shopizz-obsidian)]/10 pt-4 text-xs">
            <div class="flex justify-between text-[var(--shopizz-obsidian)]/70">
              <span>Subtotal</span>
              <span class="font-medium text-[var(--shopizz-obsidian)]">{{ formatPrice(cartStore.subtotal) }}</span>
            </div>

            <div class="flex justify-between text-[var(--shopizz-obsidian)]/70">
              <span>Shipping Fee</span>
              <span class="font-medium text-[var(--shopizz-obsidian)]">{{ cartStore.shipping === 0 ? 'Free' : formatPrice(cartStore.shipping) }}</span>
            </div>

            <div class="border-t border-[var(--shopizz-obsidian)]/10 pt-3 flex justify-between text-base font-semibold text-[var(--shopizz-obsidian)]">
              <span>Total Payable</span>
              <span class="text-[#94442a]">{{ formatPrice(cartStore.total) }}</span>
            </div>
          </div>

          <!-- Confirm Order CTA -->
          <button
            type="button"
            :disabled="isSubmitting || cartStore.isEmpty"
            class="w-full rounded-full bg-[#94442a] py-4 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-[#7e3821] hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
            @click="handlePlaceOrder"
          >
            <svg
              v-if="isSubmitting"
              class="h-4 w-4 animate-spin text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>
              {{
                isSubmitting
                  ? 'Connecting to Gateway...'
                  : form.paymentMethod === 'RAZORPAY'
                  ? `Pay with Razorpay (${formatPrice(cartStore.total)})`
                  : `Place Order on Delivery (${formatPrice(cartStore.total)})`
              }}
            </span>
          </button>

          <div class="flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/50">
            <span>🛡️</span>
            <span>256-Bit SSL Encrypted Razorpay Checkout</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
