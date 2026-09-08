<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

const route = useRoute()
const orderId = computed(() => route.query.orderId as string)
const orderNumber = computed(() => route.query.orderNumber as string)

const {
  data,
  pending,
} = await useFetch<{
  success: boolean
  order: any
}>(() => `/api/orders/${orderId.value}`, {
  immediate: !!orderId.value,
})

const order = computed(() => data.value?.order)

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount / 100)
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-6 py-16 sm:px-8 sm:py-24">
    <!-- Success Banner -->
    <div class="text-center">
      <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--shopizz-moss)]/15 text-2xl text-[var(--shopizz-moss)]">
        ✓
      </div>

      <p class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]">
        Order Confirmed / 001
      </p>

      <h1 class="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
        Thank you for your order.
      </h1>

      <p class="mx-auto mt-4 max-w-md text-sm leading-6 text-[var(--shopizz-obsidian)]/60">
        Your order <span class="font-medium text-[var(--shopizz-obsidian)]">#{{ orderNumber || order?.orderNumber }}</span> has been confirmed. The independent sellers have been notified and will prepare your package.
      </p>
    </div>

    <!-- Order Details Box (if loaded) -->
    <div
      v-if="order"
      class="mt-12 divide-y divide-[var(--shopizz-obsidian)]/10 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-8"
    >
      <!-- Meta -->
      <div class="grid grid-cols-2 gap-4 pb-6 sm:grid-cols-4 text-xs">
        <div>
          <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Order Number</p>
          <p class="mt-1 font-medium">{{ order.orderNumber }}</p>
        </div>

        <div>
          <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Status</p>
          <p class="mt-1 font-medium text-[var(--shopizz-moss)]">{{ order.status }}</p>
        </div>

        <div>
          <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Payment</p>
          <p class="mt-1 font-medium">{{ order.paymentMethod }} ({{ order.paymentStatus }})</p>
        </div>

        <div>
          <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Total Amount</p>
          <p class="mt-1 font-medium">{{ formatPrice(order.totalAmount) }}</p>
        </div>
      </div>

      <!-- Items list -->
      <div class="py-6 space-y-4">
        <h3 class="text-xs uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Items in this order</h3>

        <div
          v-for="item in order.items"
          :key="item.id"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-4">
            <div class="h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-[var(--shopizz-stone)]/40">
              <img
                v-if="item.productImage"
                :src="item.productImage"
                :alt="item.productName"
                class="h-full w-full object-cover"
              />
            </div>
            <div>
              <p class="text-sm font-medium">{{ item.productName }}</p>
              <p class="text-xs text-[var(--shopizz-obsidian)]/45">
                Qty: {{ item.quantity }} × {{ formatPrice(item.unitPrice) }}
              </p>
            </div>
          </div>

          <span class="text-sm font-medium">
            {{ formatPrice(item.totalPrice) }}
          </span>
        </div>
      </div>

      <!-- Shipping destination -->
      <div class="pt-6 text-xs text-[var(--shopizz-obsidian)]/65">
        <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Delivering to</p>
        <p class="mt-1 font-medium text-[var(--shopizz-obsidian)]">{{ order.shippingName }}</p>
        <p class="mt-0.5">{{ order.shippingAddress }}, {{ order.shippingCity }}, {{ order.shippingState }} - {{ order.shippingPostalCode }}</p>
        <p class="mt-0.5 text-[var(--shopizz-obsidian)]/40">Phone: {{ order.shippingPhone }}</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-10 flex flex-wrap justify-center gap-4">
      <NuxtLink to="/account/orders">
        <AppButton>
          View in My Orders →
        </AppButton>
      </NuxtLink>

      <NuxtLink to="/account/products">
        <AppButton variant="secondary">
          Continue shopping
        </AppButton>
      </NuxtLink>
    </div>
  </div>
</template>
