<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'owner'],
})

const {
  data,
  pending,
  error,
  refresh,
} = await useFetch<any>('/api/owner/returns')

const metrics = computed(() => data.value?.metrics || {
  total: 0,
  pending: 0,
  approved: 0,
  itemReceived: 0,
  refunded: 0,
  rejected: 0,
  refundedTotalPaise: 0,
})

const allReturns = computed(() => data.value?.returns || [])

const activeTab = ref<string>('ALL')
const searchQuery = ref('')

// Action Modal States
const isApproveModalOpen = ref(false)
const isRejectModalOpen = ref(false)
const isRefundModalOpen = ref(false)
const selectedReturn = ref<any>(null)
const sellerNotes = ref('')
const rejectionReason = ref('')
const refundTransactionId = ref('')
const isActionLoading = ref(false)
const actionError = ref('')

const filteredReturns = computed(() => {
  let list = [...allReturns.value]

  if (activeTab.value !== 'ALL') {
    list = list.filter(r => r.status === activeTab.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(r =>
      r.returnNumber.toLowerCase().includes(q) ||
      r.orderNumber.toLowerCase().includes(q) ||
      r.buyerName.toLowerCase().includes(q) ||
      (r.buyerEmail && r.buyerEmail.toLowerCase().includes(q)) ||
      (r.item?.name && r.item.name.toLowerCase().includes(q))
    )
  }

  return list
})

function formatCurrency(paise: number) {
  return '₹' + Math.round((paise || 0) / 100).toLocaleString('en-IN')
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function openApproveModal(ret: any) {
  selectedReturn.value = ret
  sellerNotes.value = 'Please keep the piece packaged in its original dustbag/box. Courier pickup will arrive within 24–48 hours.'
  actionError.value = ''
  isApproveModalOpen.value = true
}

function openRejectModal(ret: any) {
  selectedReturn.value = ret
  rejectionReason.value = ''
  actionError.value = ''
  isRejectModalOpen.value = true
}

function openRefundModal(ret: any) {
  selectedReturn.value = ret
  refundTransactionId.value = `TXN-REF-${Date.now().toString(36).toUpperCase()}`
  actionError.value = ''
  isRefundModalOpen.value = true
}

async function handleApprove() {
  if (!selectedReturn.value) return
  isActionLoading.value = true
  actionError.value = ''

  try {
    const res = await $fetch<{ success: boolean }>(`/api/owner/returns/${selectedReturn.value.id}/status`, {
      method: 'PATCH',
      body: {
        status: 'APPROVED',
        sellerNotes: sellerNotes.value.trim(),
      },
    })
    if (res.success) {
      isApproveModalOpen.value = false
      await refresh()
    }
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.message || 'Failed to approve return.'
  } finally {
    isActionLoading.value = false
  }
}

async function handleMarkReceived(ret: any) {
  if (!confirm(`Confirm that you have received the returned piece for #${ret.returnNumber} at your studio for inspection?`)) {
    return
  }

  try {
    const res = await $fetch<{ success: boolean }>(`/api/owner/returns/${ret.id}/status`, {
      method: 'PATCH',
      body: {
        status: 'ITEM_RECEIVED',
      },
    })
    if (res.success) {
      await refresh()
    }
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Failed to update status.')
  }
}

async function handleRefund() {
  if (!selectedReturn.value) return
  isActionLoading.value = true
  actionError.value = ''

  try {
    const res = await $fetch<{ success: boolean }>(`/api/owner/returns/${selectedReturn.value.id}/status`, {
      method: 'PATCH',
      body: {
        status: 'REFUNDED',
        refundTransactionId: refundTransactionId.value.trim(),
      },
    })
    if (res.success) {
      isRefundModalOpen.value = false
      await refresh()
    }
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.message || 'Failed to process refund.'
  } finally {
    isActionLoading.value = false
  }
}

async function handleReject() {
  if (!selectedReturn.value) return
  if (!rejectionReason.value.trim()) {
    actionError.value = 'Please provide a clear reason for declining the return.'
    return
  }

  isActionLoading.value = true
  actionError.value = ''

  try {
    const res = await $fetch<{ success: boolean }>(`/api/owner/returns/${selectedReturn.value.id}/status`, {
      method: 'PATCH',
      body: {
        status: 'REJECTED',
        rejectionReason: rejectionReason.value.trim(),
      },
    })
    if (res.success) {
      isRejectModalOpen.value = false
      await refresh()
    }
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.message || 'Failed to decline return.'
  } finally {
    isActionLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--shopizz-saffron)]">
          Studio Logistics & Guarantees
        </p>
        <h1 class="mt-2 font-serif text-3xl font-medium tracking-tight text-[var(--shopizz-obsidian)] sm:text-4xl">
          Returns & Refund Operations
        </h1>
        <p class="mt-2 max-w-xl text-xs leading-relaxed text-[var(--shopizz-obsidian)]/60">
          Review customer return requests, provide pickup instructions, inspect received pieces, and approve automated inventory restocking with refund payouts.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink
          to="/owner/orders"
          class="inline-flex items-center gap-2 rounded-full border border-[var(--shopizz-obsidian)]/20 bg-white px-5 py-2.5 text-xs font-semibold text-[var(--shopizz-obsidian)] shadow-sm hover:bg-[#ede5d8] transition-colors"
        >
          <span>View All Orders</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Metrics Cards Strip -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Metric 1: Pending Review -->
      <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/60">
            Pending Review
          </p>
          <span
            v-if="metrics.pending > 0"
            class="h-2 w-2 rounded-full bg-amber-500 animate-pulse"
          />
        </div>
        <p
          class="mt-2 font-serif text-3xl font-bold"
          :class="metrics.pending > 0 ? 'text-amber-800' : 'text-[var(--shopizz-obsidian)]'"
        >
          {{ metrics.pending }}
        </p>
        <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/60">
          {{ metrics.pending > 0 ? 'Awaiting your studio approval' : 'All requests up to date' }}
        </p>
      </div>

      <!-- Metric 2: In Inspection / Transit -->
      <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] p-5 shadow-sm">
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/60">
          In Transit / Inspecting
        </p>
        <p class="mt-2 font-serif text-3xl font-bold text-teal-800">
          {{ metrics.approved + metrics.itemReceived }}
        </p>
        <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/60">
          {{ metrics.approved }} pickup scheduled, {{ metrics.itemReceived }} arrived
        </p>
      </div>

      <!-- Metric 3: Total Completed Refunds -->
      <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] p-5 shadow-sm">
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/60">
          Refunds Credited
        </p>
        <p class="mt-2 font-serif text-3xl font-bold text-[#2D5A43]">
          {{ formatCurrency(metrics.refundedTotalPaise) }}
        </p>
        <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/60">
          Across {{ metrics.refunded }} completed returns
        </p>
      </div>

      <!-- Metric 4: Declined Requests -->
      <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] p-5 shadow-sm">
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/60">
          Declined Returns
        </p>
        <p class="mt-2 font-serif text-3xl font-bold text-[var(--shopizz-obsidian)]">
          {{ metrics.rejected }}
        </p>
        <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/60">
          Outside guarantee terms
        </p>
      </div>
    </div>

    <!-- Filters & Search Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--shopizz-obsidian)]/10 pb-4">
      <!-- Tabs -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all"
          :class="activeTab === 'ALL'
            ? 'bg-[var(--shopizz-obsidian)] text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-[var(--shopizz-obsidian)] hover:bg-[#ede5d8]'"
          @click="activeTab = 'ALL'"
        >
          All ({{ metrics.total }})
        </button>

        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all flex items-center gap-1.5"
          :class="activeTab === 'REQUESTED'
            ? 'bg-amber-600 text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-amber-900 hover:bg-amber-50'"
          @click="activeTab = 'REQUESTED'"
        >
          <span>Pending Review</span>
          <span
            v-if="metrics.pending > 0"
            class="rounded-full bg-white text-amber-800 px-1.5 py-0.2 text-[10px] font-bold"
          >
            {{ metrics.pending }}
          </span>
        </button>

        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all"
          :class="activeTab === 'APPROVED'
            ? 'bg-teal-700 text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-teal-800 hover:bg-teal-50'"
          @click="activeTab = 'APPROVED'"
        >
          Pickup Scheduled ({{ metrics.approved }})
        </button>

        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all"
          :class="activeTab === 'ITEM_RECEIVED'
            ? 'bg-indigo-700 text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-indigo-800 hover:bg-indigo-50'"
          @click="activeTab = 'ITEM_RECEIVED'"
        >
          Inspecting ({{ metrics.itemReceived }})
        </button>

        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all"
          :class="activeTab === 'REFUNDED'
            ? 'bg-[#2D5A43] text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-[#2D5A43] hover:bg-[#EBF3EE]'"
          @click="activeTab = 'REFUNDED'"
        >
          Refunded ({{ metrics.refunded }})
        </button>

        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all"
          :class="activeTab === 'REJECTED'
            ? 'bg-red-700 text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-red-800 hover:bg-red-50'"
          @click="activeTab = 'REJECTED'"
        >
          Declined ({{ metrics.rejected }})
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by Return #, Order #, buyer..."
          class="w-full sm:w-64 rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-3.5 py-2 text-xs text-[var(--shopizz-obsidian)] placeholder-[var(--shopizz-obsidian)]/40 focus:outline-none"
        >
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-2.5 top-2 text-xs text-gray-400 hover:text-gray-600"
          @click="searchQuery = ''"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Returns List -->
    <div v-if="pending" class="py-16 text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[var(--shopizz-obsidian)] border-t-transparent" />
      <p class="mt-3 text-xs text-[var(--shopizz-obsidian)]/60">Loading return operations...</p>
    </div>

    <div
      v-else-if="filteredReturns.length === 0"
      class="rounded-3xl border border-dashed border-[var(--shopizz-obsidian)]/20 bg-[#f8f5ee] p-12 text-center"
    >
      <span class="text-3xl">📦</span>
      <h3 class="mt-3 font-serif text-xl font-medium text-[var(--shopizz-obsidian)]">
        No return requests found
      </h3>
      <p class="mt-1 text-xs text-[var(--shopizz-obsidian)]/60">
        {{ activeTab === 'REQUESTED' ? 'No pending return requests awaiting review.' : 'No return records match your selected filter or search.' }}
      </p>
    </div>

    <div v-else class="space-y-6">
      <article
        v-for="ret in filteredReturns"
        :key="ret.id"
        class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white p-6 sm:p-7 shadow-sm transition-all hover:shadow-md"
      >
        <!-- Top Bar: Return #, Order Link, Buyer, Status Badge -->
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[var(--shopizz-obsidian)]/10">
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <span class="font-mono text-sm font-bold text-[var(--shopizz-obsidian)]">
                #{{ ret.returnNumber }}
              </span>
              <span class="rounded-full bg-[#94442A]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#94442A]">
                Order #{{ ret.orderNumber }}
              </span>
            </div>
            <p class="text-xs text-[var(--shopizz-obsidian)]/65 mt-1.5">
              Buyer: <strong class="text-[var(--shopizz-obsidian)] font-semibold">{{ ret.buyerName }}</strong>
              <span class="mx-1.5 text-gray-300">•</span>
              <span>{{ ret.shippingCity || 'City' }}</span>
              <span class="mx-1.5 text-gray-300">•</span>
              <span>Requested {{ formatDate(ret.requestedAt) }}</span>
            </p>
          </div>

          <!-- Status Badge -->
          <div>
            <span
              v-if="ret.status === 'REQUESTED'"
              class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Pending Review
            </span>
            <span
              v-else-if="ret.status === 'APPROVED'"
              class="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-teal-500" />
              Pickup Scheduled
            </span>
            <span
              v-else-if="ret.status === 'ITEM_RECEIVED'"
              class="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-800"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Piece Arrived / Inspecting
            </span>
            <span
              v-else-if="ret.status === 'REFUNDED'"
              class="inline-flex items-center gap-1.5 rounded-full bg-[#2D5A43]/15 border border-[#2D5A43]/30 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#2D5A43]"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-[#2D5A43]" />
              Refunded & Restocked
            </span>
            <span
              v-else-if="ret.status === 'REJECTED'"
              class="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-red-700"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-red-600" />
              Declined
            </span>
          </div>
        </div>

        <!-- Middle Section: Piece info, Reason, Payout info -->
        <div class="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Item Details (5 cols) -->
          <div class="lg:col-span-5 flex items-start gap-4">
            <img
              v-if="ret.item?.imageUrl"
              :src="ret.item.imageUrl"
              :alt="ret.item.name"
              class="h-16 w-16 rounded-2xl object-cover border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] shrink-0"
            >
            <div
              v-else
              class="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f8f5ee] text-xs text-gray-400 font-serif shrink-0"
            >
              Full Order
            </div>

            <div class="space-y-1">
              <h4 class="font-serif text-sm font-semibold text-[var(--shopizz-obsidian)]">
                {{ ret.item ? ret.item.name : `Full Order (${ret.orderNumber})` }}
              </h4>
              <p v-if="ret.item?.sku" class="text-[11px] text-[var(--shopizz-obsidian)]/50 font-mono">
                SKU: {{ ret.item.sku }}
              </p>
              <p class="text-xs font-medium text-[#94442A]">
                Refund Amount: <strong class="text-sm font-bold">{{ formatCurrency(ret.refundAmount) }}</strong>
              </p>
            </div>
          </div>

          <!-- Reason & Notes (4 cols) -->
          <div class="lg:col-span-4 space-y-1 text-xs">
            <p class="text-[10px] font-bold uppercase tracking-wider text-[var(--shopizz-obsidian)]/50">
              Reason for Return
            </p>
            <p class="font-semibold text-[var(--shopizz-obsidian)]">
              {{ ret.reason?.replace(/_/g, ' ') }}
            </p>
            <p v-if="ret.reasonDetails" class="text-[var(--shopizz-obsidian)]/75 italic">
              "{{ ret.reasonDetails }}"
            </p>

            <!-- Image proof links if any -->
            <div v-if="ret.images && ret.images.length > 0" class="pt-2 flex items-center gap-2">
              <span class="text-[10px] font-semibold text-[#7A746B]">Evidence:</span>
              <a
                v-for="(img, idx) in ret.images"
                :key="idx"
                :href="img"
                target="_blank"
                class="rounded-lg border border-[var(--shopizz-obsidian)]/20 px-2 py-0.5 text-[10px] font-medium text-[var(--shopizz-obsidian)] hover:bg-[#ede5d8]"
              >
                Photo {{ Number(idx) + 1 }} ↗
              </a>
            </div>
          </div>

          <!-- Payout Method (3 cols) -->
          <div class="lg:col-span-3 space-y-1 text-xs">
            <p class="text-[10px] font-bold uppercase tracking-wider text-[var(--shopizz-obsidian)]/50">
              Payout Destination
            </p>
            <p class="font-semibold text-[var(--shopizz-obsidian)]">
              {{ ret.payoutDetails?.method || 'Original Payment Source' }}
            </p>
            <p v-if="ret.payoutDetails?.upiId" class="text-[11px] font-mono text-[var(--shopizz-obsidian)]/80">
              UPI: {{ ret.payoutDetails.upiId }}
            </p>
            <p v-if="ret.payoutDetails?.bank?.accountNumber" class="text-[11px] font-mono text-[var(--shopizz-obsidian)]/80">
              A/C: {{ ret.payoutDetails.bank.accountNumber }} ({{ ret.payoutDetails.bank.ifscCode }})
            </p>
          </div>
        </div>

        <!-- Notes / Instructions Banner if present -->
        <div v-if="ret.sellerNotes" class="mt-4 rounded-2xl bg-[#EBF3EE] border border-[#C7DFD0] p-3 text-xs text-[#2D5A43]">
          <strong>Studio Pickup Note:</strong> {{ ret.sellerNotes }}
        </div>

        <div v-if="ret.rejectionReason" class="mt-4 rounded-2xl bg-red-50 border border-red-200 p-3 text-xs text-red-800">
          <strong>Declined Reason:</strong> {{ ret.rejectionReason }}
        </div>

        <!-- Bottom Action Strip -->
        <div class="mt-5 pt-4 border-t border-[var(--shopizz-obsidian)]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="text-[11px] text-[var(--shopizz-obsidian)]/50">
            <span v-if="ret.refundTransactionId" class="font-mono">
              Txn Ref: {{ ret.refundTransactionId }} &bull; Completed {{ formatDate(ret.refundedAt) }}
            </span>
            <span v-else>
              Lifecycle state: {{ ret.status }}
            </span>
          </div>

          <!-- Actions according to status -->
          <div class="flex items-center gap-2.5 flex-wrap">
            <!-- REQUESTED Actions -->
            <template v-if="ret.status === 'REQUESTED'">
              <button
                type="button"
                class="rounded-full px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors"
                @click="openRejectModal(ret)"
              >
                Decline
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full bg-[#1F2623] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2e3b33] transition-all hover:scale-[1.02]"
                @click="openApproveModal(ret)"
              >
                <span>Approve & Schedule Pickup</span>
              </button>
            </template>

            <!-- APPROVED Actions -->
            <template v-else-if="ret.status === 'APPROVED'">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full bg-indigo-700 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-800 transition-all hover:scale-[1.02]"
                @click="handleMarkReceived(ret)"
              >
                <span>Mark Piece Received & Arrived</span>
              </button>
            </template>

            <!-- ITEM_RECEIVED Actions -->
            <template v-else-if="ret.status === 'ITEM_RECEIVED'">
              <button
                type="button"
                class="rounded-full px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors"
                @click="openRejectModal(ret)"
              >
                Reject Post-Inspection
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full bg-[#2D5A43] px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#244835] transition-all hover:scale-[1.02]"
                @click="openRefundModal(ret)"
              >
                <span>Approve Refund & Restock Inventory</span>
              </button>
            </template>

            <!-- REFUNDED Badge -->
            <template v-else-if="ret.status === 'REFUNDED'">
              <span class="inline-flex items-center gap-1 text-xs font-semibold text-[#2D5A43]">
                ✓ Refund Dispatched & Piece Restocked
              </span>
            </template>
          </div>
        </div>
      </article>
    </div>

    <!-- MODAL 1: APPROVE RETURN MODAL -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isApproveModalOpen && selectedReturn"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <div
            class="fixed inset-0 bg-[#1F2623]/60 backdrop-blur-sm"
            @click="isApproveModalOpen = false"
          />

          <div class="relative w-full max-w-lg rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-8 shadow-2xl">
            <div class="flex items-start justify-between pb-4 border-b border-[#E8E2D8]">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-[0.25em] text-teal-800">
                  Return #{{ selectedReturn.returnNumber }}
                </span>
                <h3 class="font-serif text-2xl font-medium text-[#1F2623] mt-1">
                  Approve Return & Logistics
                </h3>
              </div>
              <button
                type="button"
                class="rounded-full p-2 text-gray-400 hover:text-gray-700"
                @click="isApproveModalOpen = false"
              >
                ✕
              </button>
            </div>

            <div v-if="actionError" class="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 text-center">
              {{ actionError }}
            </div>

            <div class="mt-5 space-y-4 text-xs">
              <p class="text-[#7A746B]">
                Approving this request will notify the customer via email and in-app alerts, authorizing our courier partner for doorstep collection.
              </p>

              <div>
                <label class="block font-semibold uppercase tracking-wider text-[#1F2623] mb-1.5">
                  Pickup Instructions & Studio Notes
                </label>
                <textarea
                  v-model="sellerNotes"
                  rows="3"
                  class="w-full rounded-xl border border-[#D5CEC4] bg-white p-3 text-xs text-[#1F2623] focus:outline-none focus:border-[#1F2623] resize-none"
                />
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D8]">
                <button
                  type="button"
                  class="rounded-full px-5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  @click="isApproveModalOpen = false"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  :disabled="isActionLoading"
                  class="inline-flex items-center gap-2 rounded-full bg-[#1F2623] px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2e3b33] disabled:opacity-50"
                  @click="handleApprove"
                >
                  <span>{{ isActionLoading ? 'Approving...' : 'Confirm Approval' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL 2: REFUND CONFIRMATION & INVENTORY RESTOCK MODAL -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isRefundModalOpen && selectedReturn"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <div
            class="fixed inset-0 bg-[#1F2623]/60 backdrop-blur-sm"
            @click="isRefundModalOpen = false"
          />

          <div class="relative w-full max-w-lg rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-8 shadow-2xl">
            <div class="flex items-start justify-between pb-4 border-b border-[#E8E2D8]">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-[0.25em] text-[#2D5A43]">
                  Inspection Passed
                </span>
                <h3 class="font-serif text-2xl font-medium text-[#1F2623] mt-1">
                  Authorize Full Refund
                </h3>
              </div>
              <button
                type="button"
                class="rounded-full p-2 text-gray-400 hover:text-gray-700"
                @click="isRefundModalOpen = false"
              >
                ✕
              </button>
            </div>

            <div v-if="actionError" class="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 text-center">
              {{ actionError }}
            </div>

            <div class="mt-5 space-y-4 text-xs">
              <div class="rounded-2xl bg-[#EBF3EE] border border-[#C7DFD0] p-4 space-y-1.5">
                <p class="font-bold text-sm text-[#2D5A43]">
                  Refund Total: {{ formatCurrency(selectedReturn.refundAmount) }}
                </p>
                <p class="text-[#1F2623]">
                  Destination: <strong>{{ selectedReturn.payoutDetails?.method || 'Original Payment Method' }}</strong>
                </p>
                <p class="text-[11px] text-[#2D5A43]">
                  ✓ Inventory for the returned piece will automatically be incremented and restocked back into active studio inventory.
                </p>
              </div>

              <div>
                <label class="block font-semibold uppercase tracking-wider text-[#1F2623] mb-1.5">
                  Refund Reference / Transaction ID
                </label>
                <input
                  v-model="refundTransactionId"
                  type="text"
                  required
                  class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs font-mono text-[#1F2623] focus:outline-none focus:border-[#1F2623]"
                >
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D8]">
                <button
                  type="button"
                  class="rounded-full px-5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  @click="isRefundModalOpen = false"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  :disabled="isActionLoading"
                  class="inline-flex items-center gap-2 rounded-full bg-[#2D5A43] px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#244835] disabled:opacity-50"
                  @click="handleRefund"
                >
                  <span>{{ isActionLoading ? 'Processing...' : 'Authorize Refund & Restock' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL 3: DECLINE RETURN MODAL -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isRejectModalOpen && selectedReturn"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <div
            class="fixed inset-0 bg-[#1F2623]/60 backdrop-blur-sm"
            @click="isRejectModalOpen = false"
          />

          <div class="relative w-full max-w-lg rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-8 shadow-2xl">
            <div class="flex items-start justify-between pb-4 border-b border-[#E8E2D8]">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-[0.25em] text-red-700">
                  Decline Return
                </span>
                <h3 class="font-serif text-2xl font-medium text-[#1F2623] mt-1">
                  Non-Approval Reason
                </h3>
              </div>
              <button
                type="button"
                class="rounded-full p-2 text-gray-400 hover:text-gray-700"
                @click="isRejectModalOpen = false"
              >
                ✕
              </button>
            </div>

            <div v-if="actionError" class="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 text-center">
              {{ actionError }}
            </div>

            <div class="mt-5 space-y-4 text-xs">
              <p class="text-[#7A746B]">
                Please explain why this return request cannot be honored (e.g. piece returned with missing tags, signs of wear, or outside policy terms).
              </p>

              <div>
                <label class="block font-semibold uppercase tracking-wider text-[#1F2623] mb-1.5">
                  Explanation to Customer <span class="text-red-600">*</span>
                </label>
                <textarea
                  v-model="rejectionReason"
                  rows="3"
                  required
                  placeholder="e.g. Item shows signs of usage or original tags/packaging are not intact as required by studio policy."
                  class="w-full rounded-xl border border-[#D5CEC4] bg-white p-3 text-xs text-[#1F2623] focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D8]">
                <button
                  type="button"
                  class="rounded-full px-5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  @click="isRejectModalOpen = false"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  :disabled="isActionLoading"
                  class="inline-flex items-center gap-2 rounded-full bg-red-700 px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-800 disabled:opacity-50"
                  @click="handleReject"
                >
                  <span>{{ isActionLoading ? 'Submitting...' : 'Decline Return' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
