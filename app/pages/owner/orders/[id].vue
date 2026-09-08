<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'owner'],
})

const route = useRoute()
const router = useRouter()
const orderId = computed(() => route.params.id as string)

const {
  data,
  pending,
  error,
  refresh,
} = await useFetch<{
  success: boolean
  order: any
}>(() => `/api/owner/orders/${orderId.value}`)

const order = computed(() => data.value?.order)

const NEXT_ACTIONS: Record<string, { label: string; next: string; desc: string }> = {
  PLACED: {
    label: '✓ Confirm Order',
    next: 'CONFIRMED',
    desc: 'Verify pieces availability and commit to fulfillment.',
  },
  CONFIRMED: {
    label: '⚡ Start Crafting & Packaging',
    next: 'PROCESSING',
    desc: 'Prepare the artisanal piece and package securely.',
  },
  PROCESSING: {
    label: '📦 Mark Dispatched / Shipped',
    next: 'SHIPPED',
    desc: 'Hand over parcel to courier and start transit.',
  },
  SHIPPED: {
    label: '🚚 Mark Out for Delivery',
    next: 'OUT_FOR_DELIVERY',
    desc: 'Shipment is with local delivery agent for final handover.',
  },
  OUT_FOR_DELIVERY: {
    label: '✨ Mark as Delivered',
    next: 'DELIVERED',
    desc: 'Confirm final delivery has been completed.',
  },
}

const customMessage = ref('')
const updatingStatus = ref(false)
const statusError = ref('')

// Carrier Dispatch Modal
const showCarrierModal = ref(false)
const carrierForm = ref({
  carrierName: 'Delhivery',
  customCarrierName: '',
  trackingNumber: '',
  trackingUrl: '',
  notes: '',
})

const CARRIER_OPTIONS = [
  'Delhivery',
  'BlueDart',
  'DTDC',
  'FedEx Express',
  'India Post Speed Post',
  'Shadowfax',
  'Xpressbees',
  'Other / Custom Courier',
]

const handleAdvanceClick = (nextStatus: string) => {
  if (nextStatus === 'SHIPPED') {
    showCarrierModal.value = true
    return
  }
  advanceStatus(nextStatus)
}

const confirmShipment = async () => {
  const selectedCarrier = carrierForm.value.carrierName === 'Other / Custom Courier'
    ? carrierForm.value.customCarrierName.trim() || 'Courier'
    : carrierForm.value.carrierName

  await advanceStatus('SHIPPED', {
    carrierName: selectedCarrier,
    trackingNumber: carrierForm.value.trackingNumber.trim() || undefined,
    trackingUrl: carrierForm.value.trackingUrl.trim() || undefined,
    message: carrierForm.value.notes.trim() || undefined,
  })

  if (!statusError.value) {
    showCarrierModal.value = false
    carrierForm.value = {
      carrierName: 'Delhivery',
      customCarrierName: '',
      trackingNumber: '',
      trackingUrl: '',
      notes: '',
    }
  }
}

const advanceStatus = async (nextStatus: string, carrierData?: any) => {
  statusError.value = ''
  updatingStatus.value = true

  try {
    await $fetch(`/api/owner/orders/${orderId.value}/status`, {
      method: 'PATCH',
      body: {
        nextStatus,
        message: carrierData?.message || customMessage.value.trim() || undefined,
        carrierName: carrierData?.carrierName,
        trackingNumber: carrierData?.trackingNumber,
        trackingUrl: carrierData?.trackingUrl,
      },
    })

    customMessage.value = ''
    await refresh()
  } catch (err: any) {
    statusError.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      'Failed to update order status'
  } finally {
    updatingStatus.value = false
  }
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
      text="Loading order & shipment details..."
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
        We were unable to locate this order or it contains no items from your shop.
      </p>
      <NuxtLink to="/owner/orders" class="mt-6 inline-block">
        <AppButton size="sm">
          Return to orders
        </AppButton>
      </NuxtLink>
    </div>

    <!-- Order Content -->
    <div v-else class="space-y-8">
      <!-- Title Block -->
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]">
            Owner / Order Fulfillment
          </p>

          <h1 class="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
            Order #{{ order.orderNumber }}
          </h1>

          <p class="mt-1 text-xs text-[var(--shopizz-obsidian)]/45">
            Placed on {{ formatDate(order.createdAt) }} by {{ order.buyer?.name }} ({{ order.buyer?.email }})
          </p>
        </div>

        <div class="flex items-center gap-2">
          <OrderStatusBadge :status="order.paymentStatus" type="payment" />
        </div>
      </div>

      <!-- Action Card: Advance Fulfillment -->
      <section class="rounded-3xl border border-[var(--shopizz-moss)]/30 bg-[var(--shopizz-moss)]/5 p-7 sm:p-8 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--shopizz-moss)]/20 pb-4">
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--shopizz-moss)]">
              Fulfillment Workflow Engine
            </p>
            <h3 class="text-lg font-medium text-[var(--shopizz-obsidian)]">
              Current Stage: <span class="font-bold text-[var(--shopizz-moss)]">{{ order.status }}</span>
            </h3>
          </div>

          <!-- Advance Button if not delivered/cancelled -->
          <div v-if="NEXT_ACTIONS[order.status]" class="flex items-center gap-3">
            <AppButton
              size="sm"
              :disabled="updatingStatus"
              @click="handleAdvanceClick(NEXT_ACTIONS[order.status].next)"
            >
              {{ updatingStatus ? 'Updating...' : NEXT_ACTIONS[order.status].label }}
            </AppButton>
          </div>

          <div v-else class="text-xs font-medium text-[var(--shopizz-moss)] bg-white/80 px-3 py-1.5 rounded-full border border-[var(--shopizz-moss)]/20 shadow-sm">
            ✓ Order in Terminal State ({{ order.status }})
          </div>
        </div>

        <div v-if="NEXT_ACTIONS[order.status]" class="space-y-3 pt-2">
          <p class="text-xs text-[var(--shopizz-obsidian)]/70">
            <strong>Next Milestone:</strong> {{ NEXT_ACTIONS[order.status].desc }}
          </p>

          <div class="space-y-1">
            <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--shopizz-obsidian)]/60">
              Optional Status Audit Note (Visible on customer tracking timeline):
            </label>
            <input
              v-model="customMessage"
              type="text"
              placeholder="e.g. Courier tracking #AWB-987654 via BlueDart Express..."
              class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-2.5 text-xs outline-none focus:border-[var(--shopizz-moss)]"
            />
          </div>

          <div
            v-if="statusError"
            class="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200"
          >
            {{ statusError }}
          </div>
        </div>
      </section>

      <!-- Live Tracking Timeline -->
      <OrderTrackingTimeline
        :current-status="order.status"
        :history="order.history"
      />

      <div class="grid gap-8 lg:grid-cols-12">
        <!-- Left: Your Sold Items (7 cols) -->
        <div class="space-y-6 lg:col-span-7">
          <OrderItems :items="order.items || []" />
        </div>

        <!-- Right: Destination Address & Revenue (5 cols) -->
        <div class="space-y-6 lg:col-span-5">
          <!-- Seller Subtotal Card -->
          <div class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-7 sm:p-8 space-y-3">
            <p class="text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--shopizz-saffron)]">
              Your Earnings
            </p>
            <h3 class="text-base font-medium tracking-tight">
              Order Line Revenue
            </h3>

            <div class="border-t border-[var(--shopizz-obsidian)]/10 pt-3 flex items-baseline justify-between">
              <span class="text-xs text-[var(--shopizz-obsidian)]/60">Your Items Total:</span>
              <span class="text-2xl font-bold text-[var(--shopizz-obsidian)]">
                ₹{{ (order.ownerSubtotal / 100).toLocaleString('en-IN') }}
              </span>
            </div>
          </div>

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

    <!-- Carrier Dispatch Modal -->
    <div
      v-if="showCarrierModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-[var(--shopizz-obsidian)]/60 p-4 backdrop-blur-sm"
    >
      <div class="w-full max-w-lg rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-[var(--shopizz-porcelain)] p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
        <div class="flex items-start justify-between">
          <div>
            <span class="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--shopizz-terracotta)]">
              Courier Handover
            </span>
            <h3 class="mt-1 font-serif text-2xl font-medium text-[var(--shopizz-obsidian)]">
              Dispatch & Tracking Details
            </h3>
            <p class="mt-1 text-xs text-[var(--shopizz-obsidian)]/60">
              Provide logistics tracking information for the buyer to trace shipment live.
            </p>
          </div>
          <button
            class="rounded-full p-2 text-[var(--shopizz-obsidian)]/40 hover:bg-black/5 hover:text-[var(--shopizz-obsidian)]"
            @click="showCarrierModal = false"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="confirmShipment" class="space-y-4">
          <div>
            <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--shopizz-obsidian)]/70 mb-1.5">
              Logistics Partner / Courier Service
            </label>
            <select
              v-model="carrierForm.carrierName"
              class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-3 text-xs outline-none focus:border-[var(--shopizz-terracotta)]"
            >
              <option v-for="carrier in CARRIER_OPTIONS" :key="carrier" :value="carrier">
                {{ carrier }}
              </option>
            </select>
          </div>

          <div v-if="carrierForm.carrierName === 'Other / Custom Courier'">
            <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--shopizz-obsidian)]/70 mb-1.5">
              Specify Courier Partner Name
            </label>
            <input
              v-model="carrierForm.customCarrierName"
              type="text"
              placeholder="e.g. Local Courier / Porter / Professional Couriers"
              required
              class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-3 text-xs outline-none focus:border-[var(--shopizz-terracotta)]"
            />
          </div>

          <div>
            <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--shopizz-obsidian)]/70 mb-1.5">
              Airway Bill / Tracking Consignment ID
            </label>
            <input
              v-model="carrierForm.trackingNumber"
              type="text"
              placeholder="e.g. AWB-98234710129"
              class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-3 text-xs font-mono outline-none focus:border-[var(--shopizz-terracotta)]"
            />
          </div>

          <div>
            <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--shopizz-obsidian)]/70 mb-1.5">
              Direct Tracking URL (Optional)
            </label>
            <input
              v-model="carrierForm.trackingUrl"
              type="url"
              placeholder="https://www.delhivery.com/track/package/..."
              class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-3 text-xs outline-none focus:border-[var(--shopizz-terracotta)]"
            />
          </div>

          <div>
            <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--shopizz-obsidian)]/70 mb-1.5">
              Fulfillment & Packaging Note (Optional)
            </label>
            <input
              v-model="carrierForm.notes"
              type="text"
              placeholder="e.g. Carefully packed in bubble wrap & eco-friendly carton."
              class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-3 text-xs outline-none focus:border-[var(--shopizz-terracotta)]"
            />
          </div>

          <div
            v-if="statusError"
            class="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200"
          >
            {{ statusError }}
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-[var(--shopizz-obsidian)]/10">
            <button
              type="button"
              class="rounded-full px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-[var(--shopizz-obsidian)]/60 hover:bg-black/5"
              @click="showCarrierModal = false"
            >
              Cancel
            </button>
            <AppButton
              type="submit"
              size="sm"
              :disabled="updatingStatus"
            >
              {{ updatingStatus ? 'Dispatching...' : 'Confirm & Dispatch Shipment' }}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
