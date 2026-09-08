<script setup lang="ts">
definePageMeta({
  layout: 'account',
  middleware: ['auth'],
})

const {
  data,
  pending,
  refresh,
} = await useFetch<any>('/api/account/payments')

const paymentMethodsList = computed(() => data.value?.paymentMethods || [])

// Modal state
const isModalOpen = ref(false)
const activeType = ref<'CARD' | 'UPI'>('CARD')
const isSubmitting = ref(false)
const feedbackMessage = ref('')
const feedbackError = ref('')

const form = ref({
  type: 'CARD',
  provider: 'Visa',
  identifier: '',
  holderName: '',
  expiryMonth: '',
  expiryYear: '',
  isDefault: false,
})

function openAddModal() {
  activeType.value = 'CARD'
  form.value = {
    type: 'CARD',
    provider: 'Visa',
    identifier: '',
    holderName: '',
    expiryMonth: '12',
    expiryYear: '28',
    isDefault: paymentMethodsList.value.length === 0,
  }
  feedbackError.value = ''
  isModalOpen.value = true
}

async function handleSavePayment() {
  form.value.type = activeType.value

  if (activeType.value === 'CARD') {
    if (!form.value.identifier || !form.value.holderName) {
      feedbackError.value = 'Please enter valid card details.'
      return
    }
  } else {
    if (!form.value.identifier || !form.value.identifier.includes('@')) {
      feedbackError.value = 'Please enter a valid UPI ID (e.g., yourname@okhdfcbank).'
      return
    }
    form.value.provider = form.value.identifier.toLowerCase().includes('ybl') ? 'PhonePe'
      : form.value.identifier.toLowerCase().includes('ok') ? 'Google Pay'
      : form.value.identifier.toLowerCase().includes('paytm') ? 'Paytm'
      : 'UPI'
  }

  isSubmitting.value = true
  feedbackError.value = ''

  try {
    await $fetch('/api/account/payments', {
      method: 'POST',
      body: form.value,
    })

    feedbackMessage.value = 'Payment method saved successfully!'
    await refresh()
    isModalOpen.value = false
    setTimeout(() => { feedbackMessage.value = '' }, 3000)
  } catch (err: any) {
    feedbackError.value = err?.data?.statusMessage || err?.message || 'Failed to save payment method'
  } finally {
    isSubmitting.value = false
  }
}

async function handleSetDefault(id: string) {
  try {
    await $fetch(`/api/account/payments/${id}`, {
      method: 'PATCH',
      body: { isDefault: true },
    })
    await refresh()
    feedbackMessage.value = 'Default payment method updated.'
    setTimeout(() => { feedbackMessage.value = '' }, 2500)
  } catch (err: any) {
    console.error('Error setting default payment method:', err)
  }
}

async function handleDelete(id: string) {
  if (!confirm('Are you sure you want to remove this payment method?')) return
  try {
    await $fetch(`/api/account/payments/${id}`, { method: 'DELETE' })
    await refresh()
    feedbackMessage.value = 'Payment method removed.'
    setTimeout(() => { feedbackMessage.value = '' }, 2500)
  } catch (err: any) {
    console.error('Error deleting payment method:', err)
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-[#94442A]">
      <NuxtLink to="/account" class="hover:underline">My Account</NuxtLink>
      <span class="text-[#7A746B]">&gt;</span>
      <span class="text-[#1F2623] font-medium">Payment Methods</span>
    </nav>

    <!-- Page Header -->
    <section class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E8E2D8]">
      <div>
        <h1 class="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1F2623]">
          Payment Methods
        </h1>
        <p class="mt-1 text-xs sm:text-sm text-[#7A746B]">
          Saved cards and UPI IDs for seamless, encrypted one-click checkout.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full bg-[#1F2623] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2E3C32] transition-transform hover:scale-105 cursor-pointer"
        @click="openAddModal"
      >
        <span>+ Add Payment Method</span>
      </button>
    </section>

    <!-- Feedback Banner -->
    <div
      v-if="feedbackMessage"
      class="rounded-2xl bg-[#EBF3EE] border border-[#C7DFD0] p-4 text-xs font-medium text-[#2D5A43]"
    >
      ✓ {{ feedbackMessage }}
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="py-16 text-center text-xs text-[#7A746B]">
      Loading payment methods...
    </div>

    <!-- Payment Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Existing Payment Cards -->
      <article
        v-for="pm in paymentMethodsList"
        :key="pm.id"
        class="flex flex-col justify-between rounded-3xl border bg-white p-6 shadow-xs transition-all relative"
        :class="pm.isDefault ? 'border-[#94442A] ring-1 ring-[#94442A]/30' : 'border-[#E8E2D8] hover:border-[#D5CEC4]'"
      >
        <div class="space-y-4">
          <!-- Top Row: Provider & Default Pill -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="flex h-8 w-11 items-center justify-center rounded-lg border text-xs font-bold"
                :class="pm.type === 'CARD' ? 'bg-[#FAF8F5] border-[#E8E2D8] text-[#1F2623]' : 'bg-[#5F259F]/10 border-[#5F259F]/20 text-[#5F259F]'"
              >
                {{ pm.type === 'CARD' ? '💳' : 'UPI' }}
              </div>
              <div>
                <p class="font-bold text-xs text-[#1F2623]">{{ pm.provider }}</p>
                <p class="text-[10px] text-[#7A746B] uppercase tracking-wider">{{ pm.type }}</p>
              </div>
            </div>

            <span
              v-if="pm.isDefault"
              class="rounded-full bg-[#EBF3EE] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2D5A43]"
            >
              Default
            </span>
          </div>

          <!-- Details -->
          <div class="space-y-1 text-xs">
            <p class="font-mono font-bold text-[#1F2623] text-sm tracking-wider">
              {{ pm.identifier }}
            </p>
            <p v-if="pm.holderName" class="text-[11px] text-[#7A746B]">
              {{ pm.holderName }}
            </p>
            <p v-if="pm.expiryMonth && pm.expiryYear" class="text-[10px] text-[#7A746B]">
              Expires {{ pm.expiryMonth }}/{{ pm.expiryYear }}
            </p>
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div class="flex items-center justify-between pt-5 mt-4 border-t border-[#E8E2D8] text-xs">
          <button
            type="button"
            class="font-medium text-red-600 hover:text-red-800 transition-colors cursor-pointer"
            @click="handleDelete(pm.id)"
          >
            Remove
          </button>

          <button
            v-if="!pm.isDefault"
            type="button"
            class="text-[11px] font-medium text-[#7A746B] hover:text-[#1F2623] underline cursor-pointer"
            @click="handleSetDefault(pm.id)"
          >
            Set as Default
          </button>
        </div>
      </article>

      <!-- Add New Payment Method Trigger Card -->
      <button
        type="button"
        class="flex min-h-[190px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#D5CEC4] bg-[#FAF8F5]/60 p-6 text-center transition-all hover:border-[#94442A] hover:bg-[#FAF8F5] group cursor-pointer"
        @click="openAddModal"
      >
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#E8E2D8] text-xl text-[#94442A] shadow-xs group-hover:scale-110 transition-transform">
          +
        </div>
        <p class="mt-3 font-serif text-base font-bold text-[#1F2623] group-hover:text-[#94442A] transition-colors">
          Add Payment Method
        </p>
        <p class="mt-1 text-xs text-[#7A746B]">
          Credit / Debit Card or UPI ID
        </p>
      </button>
    </div>

    <!-- Add Payment Method Modal -->
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
            class="fixed inset-0 bg-[#1F2623]/60 backdrop-blur-sm"
            @click="isModalOpen = false"
          />

          <!-- Modal Dialog -->
          <div class="relative w-full max-w-md rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-8 shadow-2xl space-y-5 my-8">
            <div class="flex items-start justify-between pb-3 border-b border-[#E8E2D8]">
              <div>
                <h3 class="font-serif text-xl font-bold text-[#1F2623]">
                  Add Payment Method
                </h3>
                <p class="text-xs text-[#7A746B] mt-0.5">
                  100% secure 256-bit encrypted vault.
                </p>
              </div>
              <button
                type="button"
                class="rounded-full p-2 text-gray-400 hover:text-gray-700"
                @click="isModalOpen = false"
              >
                ✕
              </button>
            </div>

            <!-- Error Banner -->
            <div
              v-if="feedbackError"
              class="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700"
            >
              {{ feedbackError }}
            </div>

            <!-- Type Selector Tabs -->
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="flex-1 rounded-2xl border py-2.5 text-center font-bold text-xs transition-all flex items-center justify-center gap-2"
                :class="activeType === 'CARD' ? 'border-[#94442A] bg-[#FDF3EE] text-[#94442A] ring-1 ring-[#94442A]' : 'border-[#D5CEC4] bg-white text-[#1F2623]'"
                @click="activeType = 'CARD'"
              >
                <span>💳</span>
                <span>Credit / Debit Card</span>
              </button>

              <button
                type="button"
                class="flex-1 rounded-2xl border py-2.5 text-center font-bold text-xs transition-all flex items-center justify-center gap-2"
                :class="activeType === 'UPI' ? 'border-[#94442A] bg-[#FDF3EE] text-[#94442A] ring-1 ring-[#94442A]' : 'border-[#D5CEC4] bg-white text-[#1F2623]'"
                @click="activeType = 'UPI'"
              >
                <span>📱</span>
                <span>UPI ID</span>
              </button>
            </div>

            <form @submit.prevent="handleSavePayment" class="space-y-4 text-xs">
              <!-- CARD FORM -->
              <div v-if="activeType === 'CARD'" class="space-y-3">
                <div>
                  <label class="block font-medium text-[#7A746B] mb-1">Card Network / Provider</label>
                  <select
                    v-model="form.provider"
                    class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="RuPay">RuPay</option>
                    <option value="American Express">American Express</option>
                  </select>
                </div>

                <div>
                  <label class="block font-medium text-[#7A746B] mb-1">Card Number *</label>
                  <input
                    v-model="form.identifier"
                    type="text"
                    required
                    maxlength="19"
                    placeholder="4532 1234 5678 4567"
                    class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs font-mono text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                  >
                </div>

                <div>
                  <label class="block font-medium text-[#7A746B] mb-1">Name on Card *</label>
                  <input
                    v-model="form.holderName"
                    type="text"
                    required
                    placeholder="Cardholder Full Name"
                    class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                  >
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-medium text-[#7A746B] mb-1">Expiry Month</label>
                    <select
                      v-model="form.expiryMonth"
                      class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                    >
                      <option v-for="m in 12" :key="m" :value="String(m).padStart(2, '0')">
                        {{ String(m).padStart(2, '0') }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block font-medium text-[#7A746B] mb-1">Expiry Year</label>
                    <select
                      v-model="form.expiryYear"
                      class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                    >
                      <option v-for="y in ['26', '27', '28', '29', '30', '31', '32']" :key="y" :value="y">
                        20{{ y }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- UPI FORM -->
              <div v-else class="space-y-3">
                <div>
                  <label class="block font-medium text-[#7A746B] mb-1">Virtual Payment Address (UPI ID) *</label>
                  <input
                    v-model="form.identifier"
                    type="text"
                    required
                    placeholder="username@okhdfcbank or phone@ybl"
                    class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs font-mono text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                  >
                  <p class="text-[10px] text-[#7A746B] mt-1">
                    Accepts Google Pay, PhonePe, Paytm, BHIM and all bank UPI handles.
                  </p>
                </div>
              </div>

              <!-- Default Checkbox -->
              <div class="flex items-center gap-2 pt-2">
                <input
                  id="make-default-pm"
                  v-model="form.isDefault"
                  type="checkbox"
                  class="rounded border-[#D5CEC4] text-[#94442A] focus:ring-[#94442A]"
                >
                <label for="make-default-pm" class="text-xs text-[#1F2623] font-medium cursor-pointer">
                  Set as default payment method
                </label>
              </div>

              <!-- Modal Actions -->
              <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2D8]">
                <button
                  type="button"
                  class="rounded-full px-5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                  @click="isModalOpen = false"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="rounded-full bg-[#1F2623] px-6 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2E3C32] disabled:opacity-50 cursor-pointer"
                >
                  {{ isSubmitting ? 'Saving...' : 'Save Payment Method' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
