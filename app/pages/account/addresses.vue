<script setup lang="ts">
definePageMeta({
  layout: 'account',
  middleware: ['auth'],
})

const {
  data,
  pending,
  refresh,
} = await useFetch<any>('/api/account/addresses')

const addressesList = computed(() => data.value?.addresses || [])

// Modal state
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const isSubmitting = ref(false)
const feedbackMessage = ref('')
const feedbackError = ref('')

const form = ref({
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  type: 'HOME',
  isDefault: false,
})

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  form.value = {
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    type: 'HOME',
    isDefault: addressesList.value.length === 0,
  }
  feedbackError.value = ''
  isModalOpen.value = true
}

function openEditModal(addr: any) {
  isEditing.value = true
  editingId.value = addr.id
  form.value = {
    fullName: addr.fullName,
    phone: addr.phone,
    addressLine1: addr.addressLine1,
    addressLine2: addr.addressLine2 || '',
    city: addr.city,
    state: addr.state,
    postalCode: addr.postalCode,
    country: addr.country || 'India',
    type: addr.type || 'HOME',
    isDefault: addr.isDefault,
  }
  feedbackError.value = ''
  isModalOpen.value = true
}

async function handleSaveAddress() {
  if (!form.value.fullName || !form.value.phone || !form.value.addressLine1 || !form.value.city || !form.value.state || !form.value.postalCode) {
    feedbackError.value = 'Please fill in all required fields.'
    return
  }

  isSubmitting.value = true
  feedbackError.value = ''

  try {
    if (isEditing.value && editingId.value) {
      await $fetch(`/api/account/addresses/${editingId.value}`, {
        method: 'PATCH',
        body: form.value,
      })
      feedbackMessage.value = 'Address updated successfully!'
    } else {
      await $fetch('/api/account/addresses', {
        method: 'POST',
        body: form.value,
      })
      feedbackMessage.value = 'New delivery address added!'
    }

    await refresh()
    isModalOpen.value = false
    setTimeout(() => { feedbackMessage.value = '' }, 3000)
  } catch (err: any) {
    feedbackError.value = err?.data?.statusMessage || err?.message || 'Failed to save address'
  } finally {
    isSubmitting.value = false
  }
}

async function handleSetDefault(id: string) {
  try {
    await $fetch(`/api/account/addresses/${id}`, {
      method: 'PATCH',
      body: { isDefault: true },
    })
    await refresh()
    feedbackMessage.value = 'Default delivery address updated.'
    setTimeout(() => { feedbackMessage.value = '' }, 2500)
  } catch (err: any) {
    console.error('Error setting default address:', err)
  }
}

async function handleDelete(id: string) {
  if (!confirm('Are you sure you want to delete this address?')) return
  try {
    await $fetch(`/api/account/addresses/${id}`, { method: 'DELETE' })
    await refresh()
    feedbackMessage.value = 'Address removed.'
    setTimeout(() => { feedbackMessage.value = '' }, 2500)
  } catch (err: any) {
    console.error('Error deleting address:', err)
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-[#94442A]">
      <NuxtLink to="/account" class="hover:underline">My Account</NuxtLink>
      <span class="text-[#7A746B]">&gt;</span>
      <span class="text-[#1F2623] font-medium">Addresses</span>
    </nav>

    <!-- Page Header -->
    <section class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E8E2D8]">
      <div>
        <h1 class="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1F2623]">
          Addresses
        </h1>
        <p class="mt-1 text-xs sm:text-sm text-[#7A746B]">
          Manage your saved shipping and delivery addresses for quick checkout.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full bg-[#1F2623] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2E3C32] transition-transform hover:scale-105 cursor-pointer"
        @click="openAddModal"
      >
        <span>+ Add New Address</span>
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
      Loading addresses...
    </div>

    <!-- Address Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Existing Address Cards -->
      <article
        v-for="addr in addressesList"
        :key="addr.id"
        class="flex flex-col justify-between rounded-3xl border bg-white p-6 shadow-xs transition-all relative"
        :class="addr.isDefault ? 'border-[#94442A] ring-1 ring-[#94442A]/30' : 'border-[#E8E2D8] hover:border-[#D5CEC4]'"
      >
        <div class="space-y-4">
          <!-- Top Row: Type & Default Pill -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="flex h-7 w-7 items-center justify-center rounded-xl bg-[#FAF8F5] text-xs font-bold text-[#1F2623]">
                <Icon :name="addr.type === 'WORK' ? 'ph:briefcase' : addr.type === 'HOME' ? 'ph:house' : 'ph:map-pin'" class="h-4 w-4 text-[#94442A]" />
              </span>
              <span class="text-xs font-bold uppercase tracking-wider text-[#1F2623]">
                {{ addr.type }}
              </span>
            </div>

            <span
              v-if="addr.isDefault"
              class="rounded-full bg-[#EBF3EE] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2D5A43]"
            >
              Default
            </span>
          </div>

          <!-- Address Details -->
          <div class="space-y-1 text-xs">
            <p class="font-bold text-[#1F2623] text-sm">{{ addr.fullName }}</p>
            <p class="text-[#7A746B]">{{ addr.addressLine1 }}</p>
            <p v-if="addr.addressLine2" class="text-[#7A746B]">{{ addr.addressLine2 }}</p>
            <p class="text-[#7A746B]">{{ addr.city }}, {{ addr.state }} - {{ addr.postalCode }}</p>
            <p class="text-[#7A746B]">{{ addr.country }}</p>
            <p class="text-[#1F2623] font-medium pt-1">Phone: {{ addr.phone }}</p>
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div class="flex items-center justify-between pt-5 mt-4 border-t border-[#E8E2D8] text-xs">
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="font-semibold text-[#1F2623] hover:text-[#94442A] transition-colors cursor-pointer"
              @click="openEditModal(addr)"
            >
              Edit
            </button>
            <span class="text-gray-300">|</span>
            <button
              type="button"
              class="font-medium text-red-600 hover:text-red-800 transition-colors cursor-pointer"
              @click="handleDelete(addr.id)"
            >
              Delete
            </button>
          </div>

          <button
            v-if="!addr.isDefault"
            type="button"
            class="text-[11px] font-medium text-[#7A746B] hover:text-[#1F2623] underline cursor-pointer"
            @click="handleSetDefault(addr.id)"
          >
            Set as Default
          </button>
        </div>
      </article>

      <!-- Add New Address Trigger Card -->
      <button
        type="button"
        class="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#D5CEC4] bg-[#FAF8F5]/60 p-6 text-center transition-all hover:border-[#94442A] hover:bg-[#FAF8F5] group cursor-pointer"
        @click="openAddModal"
      >
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#E8E2D8] text-xl text-[#94442A] shadow-xs group-hover:scale-110 transition-transform">
          +
        </div>
        <p class="mt-3 font-serif text-base font-bold text-[#1F2623] group-hover:text-[#94442A] transition-colors">
          Add New Address
        </p>
        <p class="mt-1 text-xs text-[#7A746B]">
          Save another home, studio, or office address
        </p>
      </button>
    </div>

    <!-- Add / Edit Address Modal -->
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
          <div class="relative w-full max-w-lg rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-8 shadow-2xl space-y-5 my-8">
            <div class="flex items-start justify-between pb-3 border-b border-[#E8E2D8]">
              <div>
                <h3 class="font-serif text-xl font-bold text-[#1F2623]">
                  {{ isEditing ? 'Edit Address' : 'Add New Address' }}
                </h3>
                <p class="text-xs text-[#7A746B] mt-0.5">
                  Enter delivery information for doorstep fulfillment.
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

            <form @submit.prevent="handleSaveAddress" class="space-y-4 text-xs">
              <!-- Type Pills -->
              <div>
                <label class="block font-medium text-[#7A746B] mb-1.5">Address Type</label>
                <div class="flex items-center gap-3">
                  <button
                    v-for="t in ['HOME', 'WORK', 'OTHER']"
                    :key="t"
                    type="button"
                    class="flex-1 rounded-xl border py-2 text-center font-semibold transition-all"
                    :class="form.type === t ? 'border-[#94442A] bg-[#FDF3EE] text-[#94442A]' : 'border-[#D5CEC4] bg-white text-[#1F2623]'"
                    @click="form.type = t"
                  >
                    {{ t }}
                  </button>
                </div>
              </div>

              <!-- Name & Phone -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-medium text-[#7A746B] mb-1">Full Name *</label>
                  <input
                    v-model="form.fullName"
                    type="text"
                    required
                    placeholder="Receiver Name"
                    class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                  >
                </div>

                <div>
                  <label class="block font-medium text-[#7A746B] mb-1">Phone Number *</label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                  >
                </div>
              </div>

              <!-- Address Line 1 -->
              <div>
                <label class="block font-medium text-[#7A746B] mb-1">Street Address *</label>
                <input
                  v-model="form.addressLine1"
                  type="text"
                  required
                  placeholder="House / Flat / Block no., Street name"
                  class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                >
              </div>

              <!-- Address Line 2 -->
              <div>
                <label class="block font-medium text-[#7A746B] mb-1">Apartment, Landmark, Suite (Optional)</label>
                <input
                  v-model="form.addressLine2"
                  type="text"
                  placeholder="Near landmark, sector"
                  class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                >
              </div>

              <!-- City, State, PIN -->
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block font-medium text-[#7A746B] mb-1">City *</label>
                  <input
                    v-model="form.city"
                    type="text"
                    required
                    placeholder="Bengaluru"
                    class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                  >
                </div>

                <div>
                  <label class="block font-medium text-[#7A746B] mb-1">State *</label>
                  <input
                    v-model="form.state"
                    type="text"
                    required
                    placeholder="Karnataka"
                    class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                  >
                </div>

                <div>
                  <label class="block font-medium text-[#7A746B] mb-1">PIN Code *</label>
                  <input
                    v-model="form.postalCode"
                    type="text"
                    required
                    placeholder="560034"
                    class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                  >
                </div>
              </div>

              <!-- Make Default Checkbox -->
              <div class="flex items-center gap-2 pt-2">
                <input
                  id="make-default"
                  v-model="form.isDefault"
                  type="checkbox"
                  class="rounded border-[#D5CEC4] text-[#94442A] focus:ring-[#94442A]"
                >
                <label for="make-default" class="text-xs text-[#1F2623] font-medium cursor-pointer">
                  Set as default delivery address
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
                  {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Address' : 'Save Address') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
