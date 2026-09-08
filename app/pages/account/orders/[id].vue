<script setup lang="ts">
definePageMeta({
  layout: 'account',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const orderId = computed(() => route.params.id as string)

const {
  data,
  pending,
  error,
  refresh: refreshOrder,
} = await useFetch<{
  success: boolean
  order: any
}>(() => `/api/orders/${orderId.value}`)

const {
  data: returnData,
  refresh: refreshReturn,
} = await useFetch<{
  success: boolean
  returnRequest: any
}>(() => `/api/orders/${orderId.value}/return`)

const order = computed(() => data.value?.order)
const returnRequest = computed(() => returnData.value?.returnRequest)

const refreshAll = () => {
  refreshOrder()
  refreshReturn()
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="space-y-10">
    <!-- Header Back -->
    <div class="flex items-center justify-between">
      <button
        type="button"
        class="text-xs uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/50 hover:text-[var(--shopizz-obsidian)]"
        @click="router.back()"
      >
        ← Back to orders
      </button>

      <OrderStatusBadge
        v-if="order"
        :status="order.status"
      />
    </div>

    <!-- Loading -->
    <AppLoading
      v-if="pending"
      text="Loading order & tracking details..."
    />

    <!-- Error / Not found -->
    <div
      v-else-if="error || !order"
      class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-12 text-center"
    >
      <h2 class="text-2xl font-medium tracking-tight">
        Order not found
      </h2>
      <p class="mt-2 text-sm text-[var(--shopizz-obsidian)]/55">
        We were unable to locate this order or you do not have permission to view it.
      </p>
      <NuxtLink to="/account/orders" class="mt-6 inline-block">
        <AppButton size="sm">
          Return to orders
        </AppButton>
      </NuxtLink>
    </div>

    <!-- Order Content -->
    <div v-else class="space-y-8">
      <!-- Title Block -->
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]">
          Receipt & Tracking / #{{ order.orderNumber }}
        </p>

        <h1 class="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
          Order Summary & Journey
        </h1>

        <p class="mt-1 text-xs text-[var(--shopizz-obsidian)]/45">
          Placed on {{ formatDate(order.createdAt) }}
        </p>
      </div>

      <!-- Live Tracking Timeline Full Width -->
      <OrderTrackingTimeline
        :current-status="order.status"
        :history="order.history"
      />

      <!-- RETURN & REFUND SECTION -->
      <OrderReturnSection
        :order="order"
        :return-request="returnRequest"
        @return-requested="refreshAll"
      />

      <div class="grid gap-8 lg:grid-cols-12">
        <!-- Left: Items Ordered (7 cols) -->
        <div class="space-y-6 lg:col-span-7">
          <OrderItems :items="order.items || []" />
        </div>

        <!-- Right: Address & Payment Summary (5 cols) -->
        <div class="space-y-6 lg:col-span-5">
          <OrderSummary
            :subtotal="order.subtotal"
            :shipping-fee="order.shippingFee"
            :tax-amount="order.taxAmount"
            :discount-amount="order.discountAmount"
            :total-amount="order.totalAmount"
            :payment-status="order.paymentStatus"
            :payment-method="order.paymentMethod"
          />

          <OrderAddress
            :shipping-name="order.shippingName"
            :shipping-phone="order.shippingPhone"
            :shipping-address="order.shippingAddress"
            :shipping-city="order.shippingCity"
            :shipping-state="order.shippingState"
            :shipping-postal-code="order.shippingPostalCode"
            :shipping-country="order.shippingCountry"
            :payment-method="order.paymentMethod"
            :payment-status="order.paymentStatus"
          />
        </div>
      </div>
    </div>
  </div>
</template>
