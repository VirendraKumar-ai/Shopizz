<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const statusFilter = ref('ALL')
const searchQuery = ref('')

const {
  data,
  pending,
  error,
  refresh,
} = await useFetch<any>('/api/admin/returns', {
  query: computed(() => ({
    status: statusFilter.value,
    search: searchQuery.value,
  })),
})

const metrics = computed(() => data.value?.metrics || {
  total: 0,
  pending: 0,
  approved: 0,
  itemReceived: 0,
  refunded: 0,
  rejected: 0,
  refundedTotalPaise: 0,
})

const returnsList = computed(() => data.value?.returns || [])

// Modal controls
const isApproveModalOpen = ref(false)
const isRejectModalOpen = ref(false)
const isRefundModalOpen = ref(false)
const selectedReturn = ref<any>(null)
const sellerNotes = ref('')
const rejectionReason = ref('')
const refundTransactionId = ref('')
const isActionLoading = ref(false)
const actionError = ref('')

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
  sellerNotes.value = 'Courier pickup approved by Shopizz Concierge. Doorstep pickup scheduled.'
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
  refundTransactionId.value = `TXN-ADMIN-${Date.now().toString(36).toUpperCase()}`
  actionError.value = ''
  isRefundModalOpen.value = true
}

async function handleApprove() {
  if (!selectedReturn.value) return
  isActionLoading.value = true
  actionError.value = ''

  try {
    const res = await $fetch<{ success: boolean }>(`/api/admin/returns/${selectedReturn.value.id}/status`, {
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
  if (!confirm(`Confirm that the returned piece for #${ret.returnNumber} has arrived for inspection?`)) {
    return
  }

  try {
    const res = await $fetch<{ success: boolean }>(`/api/admin/returns/${ret.id}/status`, {
      method: 'PATCH',
      body: { status: 'ITEM_RECEIVED' },
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
    const res = await $fetch<{ success: boolean }>(`/api/admin/returns/${selectedReturn.value.id}/status`, {
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
    const res = await $fetch<{ success: boolean }>(`/api/admin/returns/${selectedReturn.value.id}/status`, {
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
          Marketplace Operations
        </p>
        <h1 class="mt-2 font-serif text-3xl font-medium tracking-tight text-[var(--shopizz-obsidian)] sm:text-4xl">
          Return & Refund Moderation
        </h1>
        <p class="mt-2 max-w-xl text-xs leading-relaxed text-[var(--shopizz-obsidian)]/60">
          Supervise and moderate all return requests across studios, oversee refund disbursements, and audit restocking operations.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink
          to="/admin/orders"
          class="inline-flex items-center gap-2 rounded-full border border-[var(--shopizz-obsidian)]/20 bg-white px-5 py-2.5 text-xs font-semibold text-[var(--shopizz-obsidian)] shadow-sm hover:bg-[#ede5d8] transition-colors"
        >
          <span>All Orders</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Metrics Cards Strip -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] p-5 shadow-sm">
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/60">
          Total Returns
        </p>
        <p class="mt-2 font-serif text-3xl font-bold text-[var(--shopizz-obsidian)]">
          {{ metrics.total }}
        </p>
        <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/60">
          Across all studios
        </p>
      </div>

      <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] p-5 shadow-sm">
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/60">
          Pending Review
        </p>
        <p
          class="mt-2 font-serif text-3xl font-bold"
          :class="metrics.pending > 0 ? 'text-amber-800' : 'text-[var(--shopizz-obsidian)]'"
        >
          {{ metrics.pending }}
        </p>
        <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/60">
          Awaiting studio/admin action
        </p>
      </div>

      <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] p-5 shadow-sm">
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/60">
          Total Refunds Disbursed
        </p>
        <p class="mt-2 font-serif text-3xl font-bold text-[#2D5A43]">
          {{ formatCurrency(metrics.refundedTotalPaise) }}
        </p>
        <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/60">
          Across {{ metrics.refunded }} completed refunds
        </p>
      </div>

      <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] p-5 shadow-sm">
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/60">
          Declined Returns
        </p>
        <p class="mt-2 font-serif text-3xl font-bold text-[var(--shopizz-obsidian)]">
          {{ metrics.rejected }}
        </p>
        <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/60">
          Non-compliant requests
        </p>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--shopizz-obsidian)]/10 pb-4">
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all"
          :class="statusFilter === 'ALL'
            ? 'bg-[var(--shopizz-obsidian)] text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-[var(--shopizz-obsidian)] hover:bg-[#ede5d8]'"
          @click="statusFilter = 'ALL'"
        >
          All ({{ metrics.total }})
        </button>

        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all flex items-center gap-1.5"
          :class="statusFilter === 'REQUESTED'
            ? 'bg-amber-600 text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-amber-900 hover:bg-amber-50'"
          @click="statusFilter = 'REQUESTED'"
        >
          <span>Pending ({{ metrics.pending }})</span>
        </button>

        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all"
          :class="statusFilter === 'APPROVED'
            ? 'bg-teal-700 text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-teal-800 hover:bg-teal-50'"
          @click="statusFilter = 'APPROVED'"
        >
          Pickup Scheduled ({{ metrics.approved }})
        </button>

        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all"
          :class="statusFilter === 'ITEM_RECEIVED'
            ? 'bg-indigo-700 text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-indigo-800 hover:bg-indigo-50'"
          @click="statusFilter = 'ITEM_RECEIVED'"
        >
          Inspecting ({{ metrics.itemReceived }})
        </button>

        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all"
          :class="statusFilter === 'REFUNDED'
            ? 'bg-[#2D5A43] text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-[#2D5A43] hover:bg-[#EBF3EE]'"
          @click="statusFilter = 'REFUNDED'"
        >
          Refunded ({{ metrics.refunded }})
        </button>

        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all"
          :class="statusFilter === 'REJECTED'
            ? 'bg-red-700 text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-red-800 hover:bg-red-50'"
          @click="statusFilter = 'REJECTED'"
        >
          Declined ({{ metrics.rejected }})
        </button>
      </div>

      <div class="relative w-full sm:w-72">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search Return #, Order #, buyer, studio..."
          class="w-full rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-3.5 py-2 text-xs text-[var(--shopizz-obsidian)] placeholder-[var(--shopizz-obsidian)]/40 focus:outline-none"
        >
      </div>
    </div>

    <!-- Returns List -->
    <div v-if="pending" class="py-16 text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[var(--shopizz-obsidian)] border-t-transparent" />
      <p class="mt-3 text-xs text-[var(--shopizz-obsidian)]/60">Loading marketplace return records...</p>
    </div>

    <div
      v-else-if="returnsList.length === 0"
      class="rounded-3xl border border-dashed border-[var(--shopizz-obsidian)]/20 bg-[#f8f5ee] p-12 text-center"
    >
      <h3 class="font-serif text-xl font-medium text-[var(--shopizz-obsidian)]">
        No return requests found
      </h3>
      <p class="mt-1 text-xs text-[var(--shopizz-obsidian)]/60">
        No records match your selected criteria.
      </p>
    </div>

    <div v-else class="space-y-4">
      <article
        v-for="ret in returnsList"
        :key="ret.id"
        class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white p-6 shadow-sm transition-all"
      >
        <!-- Top Row -->
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[var(--shopizz-obsidian)]/10">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono text-sm font-bold text-[var(--shopizz-obsidian)]">
                #{{ ret.returnNumber }}
              </span>
              <span class="rounded-full bg-[#94442A]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#94442A]">
                Order #{{ ret.orderNumber }}
              </span>
              <span class="rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-[10px] font-semibold text-stone-700">
                Studio: {{ ret.ownerName }}
              </span>
            </div>
            <p class="text-xs text-[var(--shopizz-obsidian)]/60 mt-1">
              Buyer: <strong class="text-[var(--shopizz-obsidian)]">{{ ret.buyerName }}</strong> ({{ ret.buyerEmail }})
              <span class="mx-1.5">•</span>
              <span>Requested {{ formatDate(ret.requestedAt) }}</span>
            </p>
          </div>

          <!-- Status Badge -->
          <div class="flex items-center gap-2">
            <span
              class="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
              :class="{
                'bg-amber-100 text-amber-800 border border-amber-200': ret.status === 'REQUESTED',
                'bg-teal-100 text-teal-800 border border-teal-200': ret.status === 'APPROVED',
                'bg-indigo-100 text-indigo-800 border border-indigo-200': ret.status === 'ITEM_RECEIVED',
                'bg-[#EBF3EE] text-[#2D5A43] border border-[#C7DFD0]': ret.status === 'REFUNDED',
                'bg-red-100 text-red-800 border border-red-200': ret.status === 'REJECTED',
              }"
            >
              {{ ret.status }}
            </span>
          </div>
        </div>

        <!-- Middle Details Grid -->
        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <!-- Item & Amount -->
          <div class="space-y-1">
            <p class="text-[10px] font-bold uppercase tracking-wider text-[#7A746B]">Piece & Value</p>
            <p class="font-semibold text-[var(--shopizz-obsidian)]">
              {{ ret.item ? ret.item.name : `Full Order (${ret.orderNumber})` }}
            </p>
            <p class="text-[#94442A] font-bold text-sm">
              {{ formatCurrency(ret.refundAmount) }}
            </p>
          </div>

          <!-- Reason -->
          <div class="space-y-1">
            <p class="text-[10px] font-bold uppercase tracking-wider text-[#7A746B]">Reason & Notes</p>
            <p class="font-semibold text-[var(--shopizz-obsidian)]">
              {{ ret.reason?.replace(/_/g, ' ') }}
            </p>
            <p v-if="ret.reasonDetails" class="text-[var(--shopizz-obsidian)]/75 italic">
              "{{ ret.reasonDetails }}"
            </p>
          </div>

          <!-- Payout & Admin Actions -->
          <div class="space-y-2">
            <p class="text-[10px] font-bold uppercase tracking-wider text-[#7A746B]">Payout Details</p>
            <p class="font-medium text-[var(--shopizz-obsidian)]">
              {{ ret.payoutDetails?.method || 'Original Payment Source' }}
              <span v-if="ret.payoutDetails?.upiId" class="block font-mono text-[11px] text-gray-600">UPI: {{ ret.payoutDetails.upiId }}</span>
            </p>

            <!-- Admin Actions -->
            <div class="pt-2 flex items-center gap-2 flex-wrap">
              <button
                v-if="ret.status === 'REQUESTED'"
                type="button"
                class="rounded-full bg-[#1F2623] px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-[#2e3b33]"
                @click="openApproveModal(ret)"
              >
                Approve
              </button>
              <button
                v-if="ret.status === 'APPROVED'"
                type="button"
                class="rounded-full bg-indigo-700 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-800"
                @click="handleMarkReceived(ret)"
              >
                Mark Received
              </button>
              <button
                v-if="ret.status === 'ITEM_RECEIVED' || ret.status === 'APPROVED'"
                type="button"
                class="rounded-full bg-[#2D5A43] px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-[#244835]"
                @click="openRefundModal(ret)"
              >
                Refund & Restock
              </button>
              <button
                v-if="ret.status !== 'REFUNDED' && ret.status !== 'REJECTED'"
                type="button"
                class="rounded-full bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 text-[11px] font-semibold hover:bg-red-100"
                @click="openRejectModal(ret)"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- ADMIN MODALS -->
    <Teleport to="body">
      <!-- Approve Modal -->
      <div v-if="isApproveModalOpen && selectedReturn" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="isApproveModalOpen = false" />
        <div class="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl space-y-4">
          <h3 class="font-serif text-xl font-semibold">Admin Approve Return #{{ selectedReturn.returnNumber }}</h3>
          <textarea v-model="sellerNotes" rows="3" class="w-full rounded-xl border p-2.5 text-xs" />
          <div class="flex justify-end gap-2">
            <button class="px-4 py-2 text-xs" @click="isApproveModalOpen = false">Cancel</button>
            <button class="rounded-full bg-[#1F2623] px-5 py-2 text-xs font-semibold text-white" :disabled="isActionLoading" @click="handleApprove">Confirm</button>
          </div>
        </div>
      </div>

      <!-- Refund Modal -->
      <div v-if="isRefundModalOpen && selectedReturn" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="isRefundModalOpen = false" />
        <div class="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl space-y-4">
          <h3 class="font-serif text-xl font-semibold">Authorize Refund: {{ formatCurrency(selectedReturn.refundAmount) }}</h3>
          <p class="text-xs text-stone-600">This will disburse the refund and automatically increment/restock studio inventory.</p>
          <input v-model="refundTransactionId" type="text" placeholder="Transaction Reference ID" class="w-full rounded-xl border p-2.5 text-xs font-mono" />
          <div class="flex justify-end gap-2">
            <button class="px-4 py-2 text-xs" @click="isRefundModalOpen = false">Cancel</button>
            <button class="rounded-full bg-[#2D5A43] px-5 py-2 text-xs font-semibold text-white" :disabled="isActionLoading" @click="handleRefund">Authorize</button>
          </div>
        </div>
      </div>

      <!-- Reject Modal -->
      <div v-if="isRejectModalOpen && selectedReturn" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="isRejectModalOpen = false" />
        <div class="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl space-y-4">
          <h3 class="font-serif text-xl font-semibold text-red-700">Decline Return #{{ selectedReturn.returnNumber }}</h3>
          <textarea v-model="rejectionReason" rows="3" placeholder="Reason for non-approval..." class="w-full rounded-xl border p-2.5 text-xs" />
          <div class="flex justify-end gap-2">
            <button class="px-4 py-2 text-xs" @click="isRejectModalOpen = false">Cancel</button>
            <button class="rounded-full bg-red-700 px-5 py-2 text-xs font-semibold text-white" :disabled="isActionLoading" @click="handleReject">Decline</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
