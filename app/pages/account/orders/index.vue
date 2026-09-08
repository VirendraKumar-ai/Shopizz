<script setup lang="ts">
definePageMeta({
  layout: 'account',
  middleware: ['auth'],
})

const {
  data,
  pending,
  error,
  refresh,
} = await useFetch<{
  success: boolean
  orders: any[]
}>('/api/orders')

const orders = computed(() => data.value?.orders ?? [])

const formatRupees = (amount: number) => {
  return (amount / 100).toLocaleString('en-IN')
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-10">
    <!-- Header -->
    <section>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]">
            Account / Orders
          </p>

          <h1 class="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
            My Orders
          </h1>

          <p class="mt-3 max-w-2xl text-sm leading-7 text-[var(--shopizz-obsidian)]/55">
            Track your purchases, review past shipments, and check real-time fulfillment timelines.
          </p>
        </div>

        <NuxtLink
          to="/account/products"
          class="text-xs uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/60 hover:text-[var(--shopizz-obsidian)] font-medium"
        >
          Explore collection →
        </NuxtLink>
      </div>
    </section>

    <!-- Loading -->
    <AppLoading
      v-if="pending"
      text="Loading your order history..."
    />

    <!-- Error -->
    <div
      v-else-if="error"
      class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-8"
    >
      <p class="text-sm text-[var(--shopizz-obsidian)]/60">
        Unable to load your order history right now.
      </p>

      <AppButton
        class="mt-4"
        size="sm"
        @click="refresh()"
      >
        Try again
      </AppButton>
    </div>

    <!-- Empty State -->
    <AppEmptyState
      v-else-if="!orders.length"
      title="No orders yet"
      description="You haven't made any purchases on Shopizz yet. Discover unique pieces from independent shops."
    >
      <NuxtLink to="/account/products">
        <AppButton>
          Start shopping →
        </AppButton>
      </NuxtLink>
    </AppEmptyState>

    <!-- Orders list -->
    <section v-else class="space-y-6">
      <div
        v-for="order in orders"
        :key="order.id"
        class="overflow-hidden rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 transition-all hover:border-[var(--shopizz-obsidian)]/25 hover:shadow-sm"
      >
        <!-- Order Header -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--shopizz-obsidian)]/10 bg-white/40 px-6 py-4 sm:px-8">
          <div class="flex flex-wrap items-center gap-4 sm:gap-8 text-xs">
            <div>
              <p class="text-[9px] uppercase tracking-[0.18em] text-[var(--shopizz-obsidian)]/40 font-semibold">Order Placed</p>
              <p class="font-medium mt-0.5">{{ formatDate(order.createdAt) }}</p>
            </div>

            <div>
              <p class="text-[9px] uppercase tracking-[0.18em] text-[var(--shopizz-obsidian)]/40 font-semibold">Order Number</p>
              <p class="font-mono font-medium mt-0.5">{{ order.orderNumber }}</p>
            </div>

            <div>
              <p class="text-[9px] uppercase tracking-[0.18em] text-[var(--shopizz-obsidian)]/40 font-semibold">Total Amount</p>
              <p class="font-semibold text-sm mt-0.5">₹{{ formatRupees(order.totalAmount) }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <OrderStatusBadge :status="order.status" />

            <NuxtLink
              :to="`/account/orders/${order.id}`"
              class="rounded-xl border border-[var(--shopizz-obsidian)]/10 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-[var(--shopizz-obsidian)] hover:bg-white hover:border-[var(--shopizz-obsidian)]/30 transition-all"
            >
              Track Order →
            </NuxtLink>
          </div>
        </div>

        <!-- Order items preview -->
        <div class="p-6 sm:p-8">
          <div class="divide-y divide-[var(--shopizz-obsidian)]/10">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <div class="flex items-center gap-4">
                <div class="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[var(--shopizz-stone)]/40 aspect-square">
                  <img
                    v-if="item.productImage"
                    :src="item.productImage"
                    :alt="item.productName || 'Piece'"
                    class="h-full w-full object-cover"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center text-xs font-bold text-[var(--shopizz-obsidian)]/30">
                    SZ
                  </div>
                </div>

                <div>
                  <NuxtLink
                    v-if="item.productSlug"
                    :to="`/product/${item.productSlug}`"
                    class="text-sm font-medium hover:text-[var(--shopizz-saffron)] transition-colors line-clamp-1"
                  >
                    {{ item.productName || 'Marketplace Item' }}
                  </NuxtLink>
                  <p v-else class="text-sm font-medium line-clamp-1">
                    {{ item.productName || 'Marketplace Item' }}
                  </p>

                  <div class="mt-1 flex items-center gap-2 text-xs text-[var(--shopizz-obsidian)]/45">
                    <span v-if="item.productSku" class="font-mono text-[10px] uppercase bg-white/60 px-1.5 py-0.5 rounded border border-[var(--shopizz-obsidian)]/5">
                      {{ item.productSku }}
                    </span>
                    <span>Qty: {{ item.quantity }}</span>
                    <span>•</span>
                    <span>₹{{ formatRupees(item.unitPrice) }} ea.</span>
                  </div>
                </div>
              </div>

              <span class="text-sm font-semibold">
                ₹{{ formatRupees(item.totalPrice) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
