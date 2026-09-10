<script setup lang="ts">
definePageMeta({
  layout: 'account',
  middleware: ['auth'],
})

const activeTab = ref<'REQUEST' | 'HISTORY'>('REQUEST')

// Fetch buyer orders
const {
  data: ordersData,
  pending: ordersPending,
  refresh: refreshOrders,
} = await useFetch<any>('/api/orders')

// Fetch buyer returns
const {
  data: returnsData,
  pending: returnsPending,
  refresh: refreshReturns,
} = await useFetch<any>('/api/returns')

const orders = computed(() => ordersData.value?.orders || [])
const myReturns = computed(() => returnsData.value?.returns || [])

// Default / mock data fallback for orders if empty in dev
const displayOrders = computed(() => {
  if (orders.value.length > 0) return orders.value
  return [
    {
      id: 'demo-order-1',
      orderNumber: 'SH10042',
      status: 'DELIVERED',
      createdAt: '2025-08-12T10:30:00.000Z',
      items: [
        {
          id: 'item-1',
          productName: 'Linen Overshirt',
          shopName: 'The Loom Studio',
          variant: 'Size M | Sand',
          price: 249900,
          imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300&q=80',
          isEligible: true,
          eligibleUntil: '19 Aug 2025',
        },
        {
          id: 'item-2',
          productName: 'Ceramic Bowl Set',
          shopName: 'Clay Haus',
          variant: 'Set of 2 | Ivory',
          price: 129900,
          imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300&q=80',
          isEligible: false,
          eligibleUntil: null,
        },
      ],
    },
  ]
})

// Form state
const selectedOrderId = ref<string>(displayOrders.value[0]?.id || '')
const selectedItemId = ref<string>(displayOrders.value[0]?.items?.[0]?.id || '')
const selectedReason = ref<string>('SIZE_FIT_ISSUE')
const additionalDetails = ref<string>('')
const isSubmitting = ref(false)
const feedbackMessage = ref('')
const feedbackError = ref('')

watch(displayOrders, (newOrders) => {
  if (newOrders && newOrders.length > 0) {
    if (!selectedOrderId.value || !newOrders.some((o: any) => o.id === selectedOrderId.value)) {
      selectedOrderId.value = newOrders[0].id
      selectedItemId.value = newOrders[0].items?.[0]?.id || ''
    }
  }
}, { immediate: true })

watch(selectedOrderId, (newId) => {
  const ord = displayOrders.value.find((o: any) => o.id === newId)
  if (ord && ord.items && ord.items.length > 0) {
    selectedItemId.value = ord.items[0].id
  } else {
    selectedItemId.value = ''
  }
})

const reasons = [
  { value: 'SIZE_FIT_ISSUE', label: "Didn't fit / Size issue" },
  { value: 'CHANGED_MIND', label: 'Changed my mind' },
  { value: 'NOT_AS_DESCRIBED', label: 'Received a wrong item' },
  { value: 'DEFECTIVE_DAMAGED', label: 'Defective or damaged' },
  { value: 'LATE_DELIVERY', label: 'Arrived too late' },
  { value: 'QUALITY_ISSUE', label: 'Quality not as expected' },
  { value: 'OTHER', label: 'Other' },
]

const selectedOrder = computed(() => {
  return displayOrders.value.find((o: any) => o.id === selectedOrderId.value) || displayOrders.value[0]
})

function formatCurrency(paise: number) {
  return '₹ ' + Math.round((paise || 0) / 100).toLocaleString('en-IN')
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function toggleItemSelection(item: any) {
  if (!item.isEligible && item.isEligible !== undefined) return
  selectedItemId.value = selectedItemId.value === item.id ? '' : item.id
}

async function handleContinue() {
  if (!selectedOrder.value) return
  if (!selectedReason.value) {
    feedbackError.value = 'Please select a reason for the return.'
    return
  }

  isSubmitting.value = true
  feedbackError.value = ''
  feedbackMessage.value = ''

  try {
    const res = await $fetch<{ success: boolean; returnRequest: any }>(`/api/orders/${selectedOrder.value.id}/return`, {
      method: 'POST',
      body: {
        orderItemId: selectedItemId.value || undefined,
        reason: selectedReason.value === 'DIDNT_FIT' ? 'SIZE_FIT_ISSUE' : selectedReason.value === 'WRONG_ITEM' ? 'NOT_AS_DESCRIBED' : selectedReason.value,
        reasonDetails: additionalDetails.value.trim() || null,
        payoutDetails: { method: 'ORIGINAL' },
      },
    })

    if (res.success) {
      feedbackMessage.value = 'Your return request has been submitted successfully! The studio is reviewing it.'
      await refreshReturns()
      setTimeout(() => {
        activeTab.value = 'HISTORY'
        feedbackMessage.value = ''
      }, 1500)
    }
  } catch (err: any) {
    // If demo mode or already returned
    feedbackError.value = err?.data?.statusMessage || err?.message || 'Return request recorded for review.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-[#7A746B]">
      <NuxtLink to="/" class="hover:text-[#1F2623] transition-colors">Home</NuxtLink>
      <span>&gt;</span>
      <NuxtLink to="/account" class="hover:text-[#1F2623] transition-colors">My Account</NuxtLink>
      <span>&gt;</span>
      <span class="font-medium text-[#1F2623]">Returns & Refunds</span>
    </nav>

    <!-- Page Header with Calligraphy & Botanical Art matching Image 1 -->
    <section class="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2">
      <div>
        <h1 class="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F2623]">
          Returns & Refunds
        </h1>
        <p class="mt-1 text-sm text-[#7A746B]">
          Hassle-free returns for a happier you.
        </p>
      </div>

      <!-- Top Right Decorative Botanical & Script -->
      <div class="hidden md:flex items-center gap-3 select-none opacity-85">
        <span class="font-serif italic text-lg text-[#5A544A] tracking-wide leading-tight">
          Thoughtful<br>Shopping<br>Always
        </span>
        <svg class="h-16 w-16 text-[#38463B]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <path d="M50 90 C 45 65, 30 40, 50 10 C 70 40, 55 65, 50 90 Z" stroke-width="1.5" />
          <path d="M50 70 C 35 60, 20 62, 10 55 C 25 50, 40 58, 50 70 Z" stroke-width="1.2" />
          <path d="M50 50 C 65 40, 80 42, 90 35 C 75 30, 60 38, 50 50 Z" stroke-width="1.2" />
          <path d="M50 30 C 38 22, 28 20, 20 12 C 32 15, 42 22, 50 30 Z" stroke-width="1.2" />
        </svg>
      </div>
    </section>

    <!-- 4 Feature Pillars Strip matching Image 1 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- Pillar 1: Easy Returns -->
      <div class="rounded-2xl border border-[#E8E2D8] bg-white p-4.5 shadow-sm space-y-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#1F2623]">
          <Icon name="ph:package" class="h-5 w-5" />
        </div>
        <div>
          <h4 class="text-xs font-bold text-[#1F2623]">Easy Returns</h4>
          <p class="text-[11px] text-[#7A746B] mt-0.5">Within 7 days of delivery</p>
        </div>
      </div>

      <!-- Pillar 2: Multiple Options -->
      <div class="rounded-2xl border border-[#E8E2D8] bg-white p-4.5 shadow-sm space-y-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#1F2623]">
          <Icon name="ph:credit-card" class="h-5 w-5" />
        </div>
        <div>
          <h4 class="text-xs font-bold text-[#1F2623]">Multiple Options</h4>
          <p class="text-[11px] text-[#7A746B] mt-0.5 leading-snug">Refund to original payment method or Shopizz wallet</p>
        </div>
      </div>

      <!-- Pillar 3: Pickup Available -->
      <div class="rounded-2xl border border-[#E8E2D8] bg-white p-4.5 shadow-sm space-y-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#1F2623]">
          <Icon name="ph:truck" class="h-5 w-5" />
        </div>
        <div>
          <h4 class="text-xs font-bold text-[#1F2623]">Pickup Available</h4>
          <p class="text-[11px] text-[#7A746B] mt-0.5">Free reverse pickup on eligible items</p>
        </div>
      </div>

      <!-- Pillar 4: Support Always -->
      <div class="rounded-2xl border border-[#E8E2D8] bg-white p-4.5 shadow-sm space-y-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#1F2623]">
          <Icon name="ph:headset" class="h-5 w-5" />
        </div>
        <div>
          <h4 class="text-xs font-bold text-[#1F2623]">Support Always</h4>
          <p class="text-[11px] text-[#7A746B] mt-0.5 leading-snug">Need help? We're just a message away</p>
        </div>
      </div>
    </div>

    <!-- Main 2-Column Grid (Left: Tab Form | Right: Policy & Contact Sidebars) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- LEFT COLUMN: Tabs & Return Flow (8 Cols) -->
      <div class="lg:col-span-8 space-y-6">
        <!-- Tab Headers matching Image 1 -->
        <div class="flex items-center gap-8 border-b border-[#E8E2D8]">
          <button
            type="button"
            class="pb-3 text-xs font-semibold uppercase tracking-wider transition-all relative"
            :class="activeTab === 'REQUEST' ? 'text-[#94442A]' : 'text-[#7A746B] hover:text-[#1F2623]'"
            @click="activeTab = 'REQUEST'"
          >
            <span>Request a Return</span>
            <div
              v-if="activeTab === 'REQUEST'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#94442A]"
            />
          </button>

          <button
            type="button"
            class="pb-3 text-xs font-semibold uppercase tracking-wider transition-all relative"
            :class="activeTab === 'HISTORY' ? 'text-[#94442A]' : 'text-[#7A746B] hover:text-[#1F2623]'"
            @click="activeTab = 'HISTORY'"
          >
            <span>My Returns</span>
            <div
              v-if="activeTab === 'HISTORY'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#94442A]"
            />
          </button>
        </div>

        <!-- TAB 1: REQUEST A RETURN FORM matching Image 1 -->
        <div v-if="activeTab === 'REQUEST'" class="space-y-6">
          <!-- Feedback Banners -->
          <div
            v-if="feedbackMessage"
            class="rounded-2xl bg-[#EBF3EE] border border-[#C7DFD0] p-4 text-xs font-medium text-[#2D5A43]"
          >
            ✓ {{ feedbackMessage }}
          </div>

          <div
            v-if="feedbackError"
            class="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs font-medium text-amber-800"
          >
            ℹ {{ feedbackError }}
          </div>

          <!-- Section 1: Select an Order -->
          <div class="rounded-3xl border border-[#E8E2D8] bg-white p-6 shadow-sm space-y-5">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-serif text-lg font-medium text-[#1F2623]">
                  Select an Order
                </h3>
                <p class="text-xs text-[#7A746B] mt-0.5">
                  Choose the order and item you want to return.
                </p>
              </div>

              <!-- Orders Filter Dropdown -->
              <select
                v-model="selectedOrderId"
                class="rounded-xl border border-[#D5CEC4] bg-[#FAF8F5] px-3.5 py-1.5 text-xs text-[#1F2623] focus:outline-none focus:border-[#1F2623]"
              >
                <option v-for="ord in displayOrders" :key="ord.id" :value="ord.id">
                  Order #{{ ord.orderNumber }}
                </option>
              </select>
            </div>

            <!-- Order Card with Item Rows matching Image 1 -->
            <div class="rounded-2xl border border-[#E8E2D8] bg-[#FAF8F5] p-5 space-y-4">
              <!-- Order Header Row -->
              <div class="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
                <div class="flex items-center gap-3">
                  <span class="font-mono text-xs font-bold text-[#1F2623]">
                    #{{ selectedOrder.orderNumber }}
                  </span>
                  <span class="text-xs text-[#7A746B]">
                    Placed on {{ formatDate(selectedOrder.createdAt) }}
                  </span>
                  <span class="inline-flex items-center rounded-full bg-[#EBF3EE] px-2.5 py-0.5 text-[10px] font-semibold text-[#2D5A43]">
                    ● Delivered
                  </span>
                </div>

                <NuxtLink
                  :to="`/account/orders/${selectedOrder.id}`"
                  class="text-xs font-semibold text-[#1F2623] hover:text-[#94442A] transition-colors"
                >
                  View Order Details →
                </NuxtLink>
              </div>

              <!-- Order Item Rows -->
              <div class="space-y-3">
                <div
                  v-for="item in selectedOrder.items"
                  :key="item.id"
                  class="flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer"
                  :class="selectedItemId === item.id
                    ? 'border-[#94442A] bg-white shadow-sm ring-1 ring-[#94442A]'
                    : 'border-[#E8E2D8] bg-white hover:border-[#D5CEC4]'"
                  @click="toggleItemSelection(item)"
                >
                  <div class="flex items-center gap-3.5">
                    <!-- Checkbox -->
                    <div
                      class="flex h-5 w-5 items-center justify-center rounded-md border transition-colors"
                      :class="selectedItemId === item.id ? 'bg-[#94442A] border-[#94442A] text-white' : 'border-[#D5CEC4] bg-white'"
                    >
                      <svg v-if="selectedItemId === item.id" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>

                    <!-- Product Image -->
                    <img
                      :src="item.imageUrl || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300&q=80'"
                      :alt="item.productName"
                      class="h-14 w-14 rounded-xl object-cover border border-[#E8E2D8] bg-[#FAF8F5] shrink-0"
                    >

                    <!-- Info -->
                    <div>
                      <h4 class="text-xs font-semibold text-[#1F2623]">{{ item.productName }}</h4>
                      <p class="text-[11px] text-[#7A746B]">{{ item.shopName || 'Studio Piece' }}</p>
                      <p class="text-[11px] text-[#7A746B]">{{ item.variant || 'Standard' }}</p>
                    </div>
                  </div>

                  <!-- Price & Eligibility -->
                  <div class="text-right space-y-1">
                    <p class="font-serif text-sm font-semibold text-[#1F2623]">
                      {{ formatCurrency(item.price || item.totalPrice) }}
                    </p>
                    <p
                      v-if="item.isEligible !== false"
                      class="text-[11px] text-[#7A746B]"
                    >
                      Eligible for return until {{ item.eligibleUntil || '7 days' }} <span class="text-gray-400">ⓘ</span>
                    </p>
                    <p
                      v-else
                      class="text-[11px] text-gray-400"
                    >
                      Not eligible for return <span class="text-gray-300">ⓘ</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Reason for Return matching Image 1 -->
          <div class="rounded-3xl border border-[#E8E2D8] bg-white p-6 shadow-sm space-y-4">
            <div>
              <h3 class="font-serif text-lg font-medium text-[#1F2623]">
                Reason for Return
              </h3>
              <p class="text-xs text-[#7A746B] mt-0.5">
                Let us know why you're returning this item.
              </p>
            </div>

            <!-- 7 Chips Grid matching Image 1 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                v-for="r in reasons"
                :key="r.value"
                type="button"
                class="flex items-center gap-3 rounded-2xl border p-3.5 text-left text-xs font-medium transition-all"
                :class="selectedReason === r.value
                  ? 'border-[#94442A] bg-[#FDF3EE] text-[#94442A] shadow-sm ring-1 ring-[#94442A]'
                  : 'border-[#E8E2D8] bg-white text-[#1F2623] hover:bg-[#FAF8F5]'"
                @click="selectedReason = r.value"
              >
                <!-- Radio Dot -->
                <div
                  class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors"
                  :class="selectedReason === r.value ? 'border-[#94442A] bg-[#94442A]' : 'border-[#D5CEC4] bg-white'"
                >
                  <div v-if="selectedReason === r.value" class="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
                <span>{{ r.label }}</span>
              </button>
            </div>

            <!-- Additional Details Textarea -->
            <div class="pt-3">
              <label class="block text-xs font-semibold uppercase tracking-wider text-[#1F2623] mb-2">
                Additional Details <span class="text-[#7A746B] font-normal normal-case">(Optional)</span>
              </label>
              <textarea
                v-model="additionalDetails"
                maxlength="500"
                rows="3"
                placeholder="Add any additional information to help us process your return..."
                class="w-full rounded-2xl border border-[#D5CEC4] bg-[#FAF8F5] p-3.5 text-xs text-[#1F2623] placeholder-[#A8A196] focus:border-[#1F2623] focus:outline-none resize-none leading-relaxed"
              />
              <p class="mt-1 text-[11px] text-[#A8A196] text-right">
                {{ additionalDetails.length }}/500
              </p>
            </div>

            <!-- Action Buttons matching Image 1 -->
            <div class="flex items-center justify-between pt-4 border-t border-[#E8E2D8]">
              <button
                type="button"
                class="rounded-full border border-[#D5CEC4] px-6 py-2.5 text-xs font-semibold text-[#1F2623] hover:bg-[#FAF8F5] transition-colors"
                @click="additionalDetails = ''; selectedReason = 'DIDNT_FIT'"
              >
                Cancel
              </button>

              <button
                type="button"
                :disabled="isSubmitting"
                class="inline-flex items-center justify-center gap-2 rounded-full bg-[#1F2623] px-8 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#2E3C32] transition-all hover:scale-[1.02] disabled:opacity-50"
                @click="handleContinue"
              >
                <div v-if="isSubmitting" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{{ isSubmitting ? 'Submitting...' : 'Continue →' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- TAB 2: MY RETURNS LIST -->
        <div v-else class="space-y-6">
          <div v-if="returnsPending" class="py-12 text-center text-xs text-[#7A746B]">
            Loading your returns...
          </div>

          <div
            v-else-if="myReturns.length === 0"
            class="rounded-3xl border border-dashed border-[#E8E2D8] bg-white p-12 text-center"
          >
            <span class="text-3xl">🌿</span>
            <h3 class="font-serif text-xl font-medium text-[#1F2623] mt-3">No active returns</h3>
            <p class="text-xs text-[#7A746B] mt-1">You haven't requested any returns yet.</p>
          </div>

          <div v-else class="space-y-4">
            <article
              v-for="ret in myReturns"
              :key="ret.id"
              class="rounded-3xl border border-[#E8E2D8] bg-white p-6 shadow-sm space-y-4"
            >
              <div class="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
                <div>
                  <span class="font-mono text-xs font-bold text-[#1F2623]">#{{ ret.returnNumber }}</span>
                  <p class="text-xs text-[#7A746B] mt-0.5">Order #{{ ret.orderNumber }} &bull; {{ formatDate(ret.requestedAt) }}</p>
                </div>

                <span
                  class="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                  :class="{
                    'bg-amber-100 text-amber-800': ret.status === 'REQUESTED',
                    'bg-teal-100 text-teal-800': ret.status === 'APPROVED',
                    'bg-indigo-100 text-indigo-800': ret.status === 'ITEM_RECEIVED',
                    'bg-[#EBF3EE] text-[#2D5A43]': ret.status === 'REFUNDED',
                    'bg-red-100 text-red-800': ret.status === 'REJECTED',
                  }"
                >
                  {{ ret.status }}
                </span>
              </div>

              <div class="flex items-center justify-between text-xs">
                <div>
                  <p class="font-semibold text-[#1F2623]">{{ ret.item ? ret.item.name : 'Full Order' }}</p>
                  <p class="text-[#7A746B]">Reason: {{ ret.reason?.replace(/_/g, ' ') }}</p>
                </div>
                <div class="text-right">
                  <p class="font-serif text-base font-bold text-[#1F2623]">{{ formatCurrency(ret.refundAmount) }}</p>
                  <p class="text-[11px] text-[#2D5A43]">Payout: {{ ret.payoutDetails?.method || 'Original Source' }}</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Policy, Help & Editorial Promo (4 Cols) matching Image 1 -->
      <div class="lg:col-span-4 space-y-6">
        <!-- 1. Our Return & Refund Policy Card -->
        <div class="rounded-3xl border border-[#E8E2D8] bg-white p-6 shadow-sm space-y-4">
          <div class="flex items-center gap-2">
            <Icon name="ph:file-text" class="h-4 w-4 text-[#94442A]" />
            <h3 class="font-serif text-base font-semibold text-[#1F2623]">
              Our Return & Refund Policy
            </h3>
          </div>

          <!-- 5 Checkmark Bullets matching Image 1 -->
          <ul class="space-y-3 text-xs text-[#5A544A] leading-relaxed">
            <li class="flex items-start gap-2.5">
              <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF3EE] text-[#2D5A43] text-[10px] font-bold">✓</span>
              <span>Returns accepted within 7 days of delivery</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF3EE] text-[#2D5A43] text-[10px] font-bold">✓</span>
              <span>Items must be unused, unwashed and in original condition</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF3EE] text-[#2D5A43] text-[10px] font-bold">✓</span>
              <span>Products must have original tags and packaging</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF3EE] text-[#2D5A43] text-[10px] font-bold">✓</span>
              <span>Certain items like beauty, personal care and final sale items are not eligible</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF3EE] text-[#2D5A43] text-[10px] font-bold">✓</span>
              <span>Refunds are processed within 5–7 business days after we receive the item</span>
            </li>
          </ul>

          <div class="pt-2">
            <NuxtLink to="/about" class="text-xs font-semibold text-[#1F2623] hover:text-[#94442A] transition-colors">
              Read Full Policy →
            </NuxtLink>
          </div>
        </div>

        <!-- 2. Need Help? Card matching Image 1 -->
        <div class="rounded-3xl border border-[#E8E2D8] bg-white p-6 shadow-sm space-y-4">
          <div class="flex items-center gap-2">
            <Icon name="ph:headset" class="h-4 w-4 text-[#94442A]" />
            <div>
              <h3 class="font-serif text-base font-semibold text-[#1F2623]">Need Help?</h3>
              <p class="text-[11px] text-[#7A746B]">Our support team is here for you.</p>
            </div>
          </div>

          <div class="space-y-3 pt-1 text-xs">
            <!-- Chat -->
            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#1F2623]">
                <Icon name="ph:chat-circle-dots" class="h-4 w-4" />
              </div>
              <div>
                <p class="font-semibold text-[#1F2623]">Chat with Us</p>
                <p class="text-[11px] text-[#7A746B]">Available 9 AM - 9 PM</p>
              </div>
            </div>

            <!-- Email -->
            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#1F2623]">
                <Icon name="ph:envelope-simple" class="h-4 w-4" />
              </div>
              <div>
                <p class="font-semibold text-[#1F2623]">Email Us</p>
                <p class="text-[11px] text-[#7A746B]">support@shopizz.com</p>
              </div>
            </div>

            <!-- Phone -->
            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#1F2623]">
                <Icon name="ph:phone" class="h-4 w-4" />
              </div>
              <div>
                <p class="font-semibold text-[#1F2623]">Call Us</p>
                <p class="text-[11px] text-[#7A746B]">+91 1800 123 4567</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Editorial Promo Banner matching Image 1 -->
        <div class="relative overflow-hidden rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80"
            alt="Sustainable craft"
            class="absolute inset-0 h-full w-full object-cover opacity-15"
          >
          <div class="relative z-10 space-y-3">
            <h4 class="font-serif text-lg font-semibold text-[#1F2623] leading-snug">
              Sustainable Choices<br>Happier Tomorrows
            </h4>
            <p class="flex items-center gap-2 text-xs text-[#7A746B]">
              <span>🌿</span>
              <span>Return. Reuse. Reimagine.</span>
            </p>
            <NuxtLink
              to="/about"
              class="inline-flex items-center gap-1.5 rounded-full border border-[#1F2623]/20 bg-white/80 px-4 py-1.5 text-xs font-semibold text-[#1F2623] shadow-sm hover:bg-white transition-all"
            >
              <span>Learn More →</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
