<script setup lang="ts">
const props = defineProps<{
  order: any
  returnRequest?: any
}>()

const emit = defineEmits<{
  (e: 'return-requested'): void
}>()

const isModalOpen = ref(false)
const selectedItemId = ref<string>('')
const reason = ref<string>('DEFECTIVE_DAMAGED')
const reasonDetails = ref('')
const payoutMethod = ref<'ORIGINAL' | 'UPI' | 'BANK_TRANSFER'>('ORIGINAL')
const upiId = ref('')
const bankDetails = ref({
  accountHolder: '',
  accountNumber: '',
  ifscCode: '',
  bankName: '',
})
const imageInputs = ref<string[]>([''])
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const reasons = [
  { value: 'DEFECTIVE_DAMAGED', label: 'Defective or Damaged Piece' },
  { value: 'SIZE_FIT_ISSUE', label: 'Size / Fit / Dimension Issue' },
  { value: 'NOT_AS_DESCRIBED', label: 'Item Differs from Photos / Description' },
  { value: 'CHANGED_MIND', label: 'Changed Mind / Preference' },
  { value: 'LATE_DELIVERY', label: 'Arrived Past Scheduled Timeline' },
  { value: 'OTHER', label: 'Other Reason' },
]

// Calculate 7-day return eligibility
const isWithinReturnWindow = computed(() => {
  if (props.order.status !== 'DELIVERED') return false
  const orderDate = new Date(props.order.updatedAt || props.order.createdAt)
  const diffDays = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 7
})

const estimatedRefundAmount = computed(() => {
  if (!selectedItemId.value) {
    return props.order.totalAmount || 0
  }
  const item = props.order.items?.find((i: any) => i.id === selectedItemId.value)
  return item ? item.totalPrice : props.order.totalAmount || 0
})

const currentStep = computed(() => {
  const s = props.returnRequest?.status
  if (s === 'REQUESTED') return 1
  if (s === 'APPROVED') return 2
  if (s === 'ITEM_RECEIVED') return 3
  if (s === 'REFUNDED') return 4
  return 0
})

function formatCurrency(paise: number) {
  return '₹' + Math.round((paise || 0) / 100).toLocaleString('en-IN')
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function addImageField() {
  if (imageInputs.value.length < 4) {
    imageInputs.value.push('')
  }
}

function removeImageField(index: number) {
  imageInputs.value.splice(index, 1)
}

function openModal() {
  selectedItemId.value = ''
  reason.value = 'DEFECTIVE_DAMAGED'
  reasonDetails.value = ''
  payoutMethod.value = 'ORIGINAL'
  upiId.value = ''
  bankDetails.value = { accountHolder: '', accountNumber: '', ifscCode: '', bankName: '' }
  imageInputs.value = ['']
  errorMessage.value = ''
  successMessage.value = ''
  isModalOpen.value = true
}

async function handleSubmitReturn() {
  if (!reason.value) {
    errorMessage.value = 'Please select a reason for the return.'
    return
  }

  if (payoutMethod.value === 'UPI' && !upiId.value.trim()) {
    errorMessage.value = 'Please enter your UPI ID for refund transfer.'
    return
  }

  if (payoutMethod.value === 'BANK_TRANSFER') {
    if (!bankDetails.value.accountNumber.trim() || !bankDetails.value.ifscCode.trim()) {
      errorMessage.value = 'Please provide Account Number and IFSC code for bank transfer.'
      return
    }
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const validImages = imageInputs.value.filter(url => url.trim().length > 0)
    const payoutPayload: Record<string, any> = { method: payoutMethod.value }
    if (payoutMethod.value === 'UPI') {
      payoutPayload.upiId = upiId.value.trim()
    } else if (payoutMethod.value === 'BANK_TRANSFER') {
      payoutPayload.bank = bankDetails.value
    }

    const res = await $fetch<{ success: boolean; returnRequest: any }>(`/api/orders/${props.order.id}/return`, {
      method: 'POST',
      body: {
        orderItemId: selectedItemId.value || undefined,
        reason: reason.value,
        reasonDetails: reasonDetails.value.trim() || null,
        images: validImages,
        payoutDetails: payoutPayload,
      },
    })

    if (res.success) {
      successMessage.value = 'Return request submitted successfully!'
      setTimeout(() => {
        isModalOpen.value = false
        emit('return-requested')
      }, 1200)
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || err?.message || 'Failed to submit return request.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- 1. ACTIVE RETURN PROGRESS CARD -->
    <div
      v-if="returnRequest"
      class="rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-8 shadow-sm"
    >
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D8] pb-6">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-[#94442A]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#94442A]">
              Return & Refund
            </span>
            <span class="font-mono text-xs font-semibold text-[#1F2623]">
              #{{ returnRequest.returnNumber }}
            </span>
          </div>
          <h3 class="font-serif text-xl sm:text-2xl font-medium text-[#1F2623] mt-2">
            Return Lifecycle Status
          </h3>
          <p class="text-xs text-[#7A746B] mt-1">
            Requested on {{ formatDate(returnRequest.requestedAt) }} &bull; Est. Refund: <strong class="text-[#1F2623]">{{ formatCurrency(returnRequest.refundAmount) }}</strong>
          </p>
        </div>

        <!-- Current Status Pill -->
        <div>
          <span
            v-if="returnRequest.status === 'REQUESTED'"
            class="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800"
          >
            <span class="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Under Studio Review
          </span>
          <span
            v-else-if="returnRequest.status === 'APPROVED'"
            class="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-800"
          >
            <span class="h-2 w-2 rounded-full bg-teal-500" />
            Return Approved &bull; Pickup Scheduled
          </span>
          <span
            v-else-if="returnRequest.status === 'ITEM_RECEIVED'"
            class="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-800"
          >
            <span class="h-2 w-2 rounded-full bg-indigo-500" />
            Piece Received &bull; Inspecting
          </span>
          <span
            v-else-if="returnRequest.status === 'REFUNDED'"
            class="inline-flex items-center gap-2 rounded-full bg-[#2D5A43]/15 border border-[#2D5A43]/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#2D5A43]"
          >
            <span class="h-2 w-2 rounded-full bg-[#2D5A43]" />
            Refund Credited &bull; Completed
          </span>
          <span
            v-else-if="returnRequest.status === 'REJECTED'"
            class="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-700"
          >
            <span class="h-2 w-2 rounded-full bg-red-600" />
            Return Request Declined
          </span>
        </div>
      </div>

      <!-- 4-STEP PROGRESS STEPPER (If not rejected) -->
      <div v-if="returnRequest.status !== 'REJECTED'" class="py-8 border-b border-[#E8E2D8]">
        <div class="relative flex items-center justify-between max-w-2xl mx-auto px-4">
          <!-- Background track line -->
          <div class="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-[#E8E2D8] -z-0" />
          <!-- Active filled track line -->
          <div
            class="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-[#2D5A43] -z-0 transition-all duration-500"
            :style="{
              width: currentStep === 1 ? '0%' : currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : 'calc(100% - 4rem)'
            }"
          />

          <!-- Step 1: Requested -->
          <div class="relative z-10 flex flex-col items-center text-center">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all"
              :class="currentStep >= 1 ? 'bg-[#2D5A43] text-white shadow-md ring-4 ring-[#EBF3EE]' : 'bg-[#E8E2D8] text-[#7A746B]'"
            >
              1
            </div>
            <p class="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#1F2623]">Requested</p>
            <p class="text-[10px] text-[#7A746B]">Initiated</p>
          </div>

          <!-- Step 2: Approved -->
          <div class="relative z-10 flex flex-col items-center text-center">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all"
              :class="currentStep >= 2 ? 'bg-[#2D5A43] text-white shadow-md ring-4 ring-[#EBF3EE]' : 'bg-[#E8E2D8] text-[#7A746B]'"
            >
              2
            </div>
            <p class="mt-2 text-[11px] font-semibold uppercase tracking-wider" :class="currentStep >= 2 ? 'text-[#1F2623]' : 'text-[#7A746B]'">Approved</p>
            <p class="text-[10px] text-[#7A746B]">Pickup Handover</p>
          </div>

          <!-- Step 3: Item Received -->
          <div class="relative z-10 flex flex-col items-center text-center">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all"
              :class="currentStep >= 3 ? 'bg-[#2D5A43] text-white shadow-md ring-4 ring-[#EBF3EE]' : 'bg-[#E8E2D8] text-[#7A746B]'"
            >
              3
            </div>
            <p class="mt-2 text-[11px] font-semibold uppercase tracking-wider" :class="currentStep >= 3 ? 'text-[#1F2623]' : 'text-[#7A746B]'">Inspected</p>
            <p class="text-[10px] text-[#7A746B]">Quality Verified</p>
          </div>

          <!-- Step 4: Refunded -->
          <div class="relative z-10 flex flex-col items-center text-center">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all"
              :class="currentStep >= 4 ? 'bg-[#2D5A43] text-white shadow-md ring-4 ring-[#EBF3EE]' : 'bg-[#E8E2D8] text-[#7A746B]'"
            >
              4
            </div>
            <p class="mt-2 text-[11px] font-semibold uppercase tracking-wider" :class="currentStep >= 4 ? 'text-[#1F2623]' : 'text-[#7A746B]'">Refunded</p>
            <p class="text-[10px] text-[#7A746B]">Credit Dispatched</p>
          </div>
        </div>
      </div>

      <!-- REJECTION BANNER -->
      <div
        v-if="returnRequest.status === 'REJECTED'"
        class="mt-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-5 text-sm"
      >
        <p class="font-semibold text-red-800">Return Request Declined by Studio</p>
        <p class="mt-1 text-xs text-red-700">
          Reason: <em>"{{ returnRequest.rejectionReason || 'Item does not meet return eligibility criteria.' }}"</em>
        </p>
        <p class="mt-2 text-[11px] text-[#7A746B]">
          If you have further questions, please contact our concierge support with Return ID #{{ returnRequest.returnNumber }}.
        </p>
      </div>

      <!-- INSTRUCTIONS / REFUND DETAILS FOOTER -->
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <!-- Return Details -->
        <div class="rounded-2xl bg-white border border-[#E8E2D8] p-4 text-xs space-y-1.5">
          <p class="font-bold uppercase tracking-wider text-[10px] text-[#7A746B]">Return Details</p>
          <p class="text-[#1F2623]"><strong class="text-[#7A746B]">Reason:</strong> {{ returnRequest.reason?.replace(/_/g, ' ') }}</p>
          <p v-if="returnRequest.reasonDetails" class="text-[#1F2623]"><strong class="text-[#7A746B]">Notes:</strong> {{ returnRequest.reasonDetails }}</p>
          <p class="text-[#1F2623]"><strong class="text-[#7A746B]">Payout Method:</strong> {{ returnRequest.payoutDetails?.method || 'Original Payment Source' }}</p>
        </div>

        <!-- Studio Pickup / Refund Notice -->
        <div
          v-if="returnRequest.status === 'APPROVED' || returnRequest.status === 'ITEM_RECEIVED'"
          class="rounded-2xl bg-[#EBF3EE] border border-[#C7DFD0] p-4 text-xs space-y-1.5"
        >
          <p class="font-bold uppercase tracking-wider text-[10px] text-[#2D5A43]">Pickup & Inspection Instructions</p>
          <p class="text-[#1F2623]">
            {{ returnRequest.sellerNotes || 'Please ensure original studio packaging, dustbags, and tags are intact. Our courier will pick up within 24-48 hours.' }}
          </p>
        </div>

        <div
          v-else-if="returnRequest.status === 'REFUNDED'"
          class="rounded-2xl bg-[#EBF3EE] border border-[#C7DFD0] p-4 text-xs space-y-1.5"
        >
          <p class="font-bold uppercase tracking-wider text-[10px] text-[#2D5A43]">✓ Refund Receipt</p>
          <p class="text-[#1F2623] font-semibold text-sm">Amount: {{ formatCurrency(returnRequest.refundAmount) }}</p>
          <p class="text-[11px] text-[#2D5A43]">Ref ID: {{ returnRequest.refundTransactionId || 'TXN-REF-COMPLETED' }}</p>
          <p class="text-[10px] text-[#7A746B]">Dispatched on {{ formatDate(returnRequest.refundedAt) }}</p>
        </div>

        <div
          v-else-if="returnRequest.status === 'REQUESTED'"
          class="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs space-y-1.5"
        >
          <p class="font-bold uppercase tracking-wider text-[10px] text-amber-800">Review in Progress</p>
          <p class="text-amber-900">
            The studio maker is reviewing your return request. You will be notified via email and in-app once approved with pickup instructions.
          </p>
        </div>
      </div>
    </div>

    <!-- 2. "REQUEST RETURN" ACTION CARD (When order is DELIVERED and no active non-rejected return) -->
    <div
      v-else-if="order.status === 'DELIVERED'"
      class="rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
    >
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="inline-flex h-2 w-2 rounded-full bg-[#2D5A43]" />
          <span class="text-[11px] font-bold uppercase tracking-[0.2em] text-[#94442A]">
            7-Day Studio Guarantee
          </span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-medium text-[#1F2623]">
          Need to Return or Exchange this Order?
        </h3>
        <p class="text-xs text-[#7A746B] max-w-xl leading-relaxed">
          Eligible pieces can be returned within 7 days of delivery with original packaging intact. Doorstep pickup and quick refunds directly to your original source, UPI, or bank account.
        </p>
      </div>

      <div class="shrink-0">
        <button
          v-if="isWithinReturnWindow"
          type="button"
          class="inline-flex items-center justify-center rounded-full bg-[#1F2623] px-6 py-3 text-xs font-semibold text-white shadow-sm hover:bg-[#2E3C32] transition-all hover:scale-[1.02]"
          @click="openModal"
        >
          Request Return & Refund
        </button>
        <span
          v-else
          class="inline-block rounded-full bg-[#E8E2D8] px-4 py-2 text-xs font-medium text-[#7A746B]"
        >
          7-Day Return Window Expired
        </span>
      </div>
    </div>

    <!-- 3. INTERACTIVE RETURN REQUEST MODAL -->
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
          v-if="isModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <!-- Backdrop -->
          <div
            class="fixed inset-0 bg-[#1F2623]/60 backdrop-blur-sm transition-opacity"
            @click="isModalOpen = false"
          />

          <!-- Modal Window -->
          <div
            class="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-8 shadow-2xl transition-all"
          >
            <!-- Header -->
            <div class="flex items-start justify-between pb-4 border-b border-[#E8E2D8]">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-[0.25em] text-[#94442A]">
                  Order #{{ order.orderNumber }}
                </span>
                <h3 class="font-serif text-2xl font-medium text-[#1F2623] mt-1">
                  Request Return & Refund
                </h3>
                <p class="text-xs text-[#7A746B] mt-0.5">
                  Handcrafted pieces are handled with care by our studio makers.
                </p>
              </div>
              <button
                type="button"
                class="rounded-full p-2 text-[#7A746B] hover:bg-[#EAE4DC] hover:text-[#1F2623] transition-colors"
                @click="isModalOpen = false"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Success Banner -->
            <div
              v-if="successMessage"
              class="mt-6 rounded-2xl bg-[#EBF3EE] p-5 text-center font-medium text-[#2D5A43] text-sm border border-[#C7DFD0]"
            >
              ✓ {{ successMessage }}
            </div>

            <!-- Error Banner -->
            <div
              v-if="errorMessage"
              class="mt-4 rounded-xl bg-red-50 p-3.5 text-xs font-medium text-red-700 text-center border border-red-200"
            >
              {{ errorMessage }}
            </div>

            <!-- Modal Form -->
            <form v-if="!successMessage" @submit.prevent="handleSubmitReturn" class="mt-6 space-y-5">
              <!-- Item Selection (if multiple items) -->
              <div v-if="order.items && order.items.length > 1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-[#1F2623] mb-2">
                  Select Return Scope
                </label>
                <select
                  v-model="selectedItemId"
                  class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2.5 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                >
                  <option value="">Full Order (All {{ order.items.length }} pieces) — {{ formatCurrency(order.totalAmount) }}</option>
                  <option
                    v-for="item in order.items"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.productName }} (Qty: {{ item.quantity }}) — {{ formatCurrency(item.totalPrice) }}
                  </option>
                </select>
              </div>

              <!-- Reason Dropdown -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-[#1F2623] mb-2">
                  Reason for Return <span class="text-[#94442A]">*</span>
                </label>
                <select
                  v-model="reason"
                  required
                  class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2.5 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                >
                  <option v-for="r in reasons" :key="r.value" :value="r.value">
                    {{ r.label }}
                  </option>
                </select>
              </div>

              <!-- Detailed Description -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-[#1F2623] mb-2">
                  Additional Details / Notes <span class="text-[#7A746B] font-normal normal-case">(Optional)</span>
                </label>
                <textarea
                  v-model="reasonDetails"
                  rows="3"
                  placeholder="Provide any details about the defect, fit, or condition to help the studio verify..."
                  class="w-full rounded-xl border border-[#D5CEC4] bg-white p-3.5 text-xs text-[#1F2623] placeholder-[#A8A196] focus:border-[#1F2623] focus:outline-none resize-none"
                />
              </div>

              <!-- Payout Method Selection -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-[#1F2623] mb-2">
                  Preferred Refund Method <span class="text-[#94442A]">*</span>
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    class="rounded-xl border p-2.5 text-center text-xs font-medium transition-all"
                    :class="payoutMethod === 'ORIGINAL' ? 'border-[#1F2623] bg-[#1F2623] text-white shadow-sm' : 'border-[#D5CEC4] bg-white text-[#1F2623] hover:bg-[#FAF8F5]'"
                    @click="payoutMethod = 'ORIGINAL'"
                  >
                    Original Source
                  </button>
                  <button
                    type="button"
                    class="rounded-xl border p-2.5 text-center text-xs font-medium transition-all"
                    :class="payoutMethod === 'UPI' ? 'border-[#1F2623] bg-[#1F2623] text-white shadow-sm' : 'border-[#D5CEC4] bg-white text-[#1F2623] hover:bg-[#FAF8F5]'"
                    @click="payoutMethod = 'UPI'"
                  >
                    UPI ID
                  </button>
                  <button
                    type="button"
                    class="rounded-xl border p-2.5 text-center text-xs font-medium transition-all"
                    :class="payoutMethod === 'BANK_TRANSFER' ? 'border-[#1F2623] bg-[#1F2623] text-white shadow-sm' : 'border-[#D5CEC4] bg-white text-[#1F2623] hover:bg-[#FAF8F5]'"
                    @click="payoutMethod = 'BANK_TRANSFER'"
                  >
                    Bank Account
                  </button>
                </div>

                <!-- UPI Input -->
                <div v-if="payoutMethod === 'UPI'" class="mt-3">
                  <input
                    v-model="upiId"
                    type="text"
                    required
                    placeholder="Enter UPI ID (e.g. mobile@upi or name@okhdfcbank)"
                    class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                  >
                </div>

                <!-- Bank Details Inputs -->
                <div v-if="payoutMethod === 'BANK_TRANSFER'" class="mt-3 space-y-2">
                  <div class="grid grid-cols-2 gap-2">
                    <input
                      v-model="bankDetails.accountHolder"
                      type="text"
                      placeholder="Account Holder Name"
                      class="rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                    >
                    <input
                      v-model="bankDetails.bankName"
                      type="text"
                      placeholder="Bank Name"
                      class="rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                    >
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <input
                      v-model="bankDetails.accountNumber"
                      type="text"
                      placeholder="Account Number"
                      class="rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                    >
                    <input
                      v-model="bankDetails.ifscCode"
                      type="text"
                      placeholder="IFSC Code (e.g. HDFC0001234)"
                      class="rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs text-[#1F2623] uppercase focus:border-[#1F2623] focus:outline-none"
                    >
                  </div>
                </div>
              </div>

              <!-- Image Proof URLs (Optional) -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="text-xs font-semibold uppercase tracking-wider text-[#1F2623]">
                    Photo Proof URLs <span class="text-[#7A746B] font-normal normal-case">(Optional)</span>
                  </label>
                  <button
                    v-if="imageInputs.length < 4"
                    type="button"
                    class="text-[11px] font-semibold text-[#94442A] hover:underline"
                    @click="addImageField"
                  >
                    + Add Image Link
                  </button>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="(img, idx) in imageInputs"
                    :key="idx"
                    class="flex items-center gap-2"
                  >
                    <input
                      v-model="imageInputs[idx]"
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      class="flex-1 rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                    >
                    <button
                      v-if="imageInputs.length > 1"
                      type="button"
                      class="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                      @click="removeImageField(idx)"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>

              <!-- Estimated Refund Summary Box -->
              <div class="rounded-2xl bg-[#FAF6F0] border border-[#E8DEC8] p-4 flex items-center justify-between">
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-wider text-[#7A746B]">Estimated Refund Amount</p>
                  <p class="font-serif text-2xl font-bold text-[#1F2623] mt-0.5">{{ formatCurrency(estimatedRefundAmount) }}</p>
                </div>
                <p class="text-[11px] text-[#7A746B] max-w-[200px] text-right">
                  Will be credited upon studio piece inspection.
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D8]">
                <button
                  type="button"
                  class="rounded-full px-5 py-2.5 text-xs font-semibold text-[#7A746B] hover:bg-[#EAE4DC] hover:text-[#1F2623] transition-colors"
                  @click="isModalOpen = false"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="inline-flex items-center justify-center gap-2 rounded-full bg-[#1F2623] px-7 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#2E3C32] disabled:opacity-50 transition-all"
                >
                  <div v-if="isSubmitting" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{{ isSubmitting ? 'Submitting Request...' : 'Submit Return Request' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
