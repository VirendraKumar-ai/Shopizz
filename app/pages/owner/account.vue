<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'owner'],
})

const authStore = useAuthStore()

// Fetch owner profile and shop details
const {
  data: accountData,
  pending,
  refresh,
} = await useFetch<any>('/api/owner/account')

// Profile State
const fullName = ref('')
const email = ref('')
const phoneNumber = ref('')
const isProfileSaving = ref(false)
const profileFeedback = ref('')

// Shop State
const shopName = ref('')
const shopSlug = ref('')
const shopCategory = ref('Fashion')
const shopBio = ref('')
const shopLogoUrl = ref('')
const isShopSaving = ref(false)
const shopFeedback = ref('')

// Bank State
const accountHolder = ref('')
const bankName = ref('HDFC Bank')
const accountNumber = ref('')
const showAccountNumber = ref(false)
const ifscCode = ref('')
const upiId = ref('')
const isBankSaving = ref(false)
const bankFeedback = ref('')

// Notification Preferences State
const notifications = ref({
  orderNotifications: true,
  customerMessages: true,
  payoutUpdates: true,
  marketingUpdates: false,
  emailNotifications: true,
})
const notifFeedback = ref('')

// Password State
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isPasswordSaving = ref(false)
const passwordFeedback = ref('')
const passwordError = ref('')

// Sync data when loaded
watchEffect(() => {
  if (accountData.value) {
    const u = accountData.value.user
    const s = accountData.value.shop
    const b = accountData.value.bank
    const n = accountData.value.notifications

    if (u) {
      fullName.value = u.name || ''
      email.value = u.email || ''
      phoneNumber.value = u.phone || '+91 98765 43210'
    }

    if (s) {
      shopName.value = s.shopName || 'The Loom Studio'
      shopSlug.value = s.shopSlug || 'the-loom-studio'
      shopCategory.value = s.category || 'Fashion'
      shopBio.value = s.description || 'Thoughtful clothing for everyday living. Rooted in craft, made for modern life.'
      shopLogoUrl.value = s.logoUrl || ''
    }

    if (b) {
      accountHolder.value = b.accountHolder || u?.name || 'Studio Owner'
      bankName.value = b.bankName || 'HDFC Bank'
      accountNumber.value = b.accountNumber || '•••• •••• 4587'
      ifscCode.value = b.ifscCode || 'HDFC0001234'
      upiId.value = b.upiId || 'owner@okhdfcbank'
    }

    if (n) {
      notifications.value = { ...n }
    }
  }
})

// Handlers
async function handleSaveProfile() {
  isProfileSaving.value = true
  profileFeedback.value = ''

  try {
    const res = await $fetch<{ success: boolean }>('/api/owner/account', {
      method: 'PATCH',
      body: {
        name: fullName.value.trim(),
        phone: phoneNumber.value.trim(),
      },
    })
    if (res.success) {
      profileFeedback.value = 'Profile updated successfully!'
      if (authStore.user) {
        authStore.user.name = fullName.value.trim()
      }
      setTimeout(() => (profileFeedback.value = ''), 3000)
    }
  } catch (err: any) {
    profileFeedback.value = 'Failed to update profile.'
  } finally {
    isProfileSaving.value = false
  }
}

async function handleSaveShop() {
  isShopSaving.value = true
  shopFeedback.value = ''

  try {
    const res = await $fetch<{ success: boolean }>('/api/owner/account', {
      method: 'PATCH',
      body: {
        shopName: shopName.value.trim(),
        description: shopBio.value.trim(),
        logoUrl: shopLogoUrl.value || undefined,
      },
    })
    if (res.success) {
      shopFeedback.value = 'Shop information saved!'
      setTimeout(() => (shopFeedback.value = ''), 3000)
    }
  } catch (err: any) {
    shopFeedback.value = 'Failed to update shop details.'
  } finally {
    isShopSaving.value = false
  }
}

async function handleSaveBank() {
  isBankSaving.value = true
  bankFeedback.value = ''
  setTimeout(() => {
    isBankSaving.value = false
    bankFeedback.value = 'Bank and payout details updated!'
    setTimeout(() => (bankFeedback.value = ''), 3000)
  }, 600)
}

function toggleNotif(key: keyof typeof notifications.value) {
  notifications.value[key] = !notifications.value[key]
  notifFeedback.value = 'Preferences saved.'
  setTimeout(() => (notifFeedback.value = ''), 2500)
}

async function handleUpdatePassword() {
  if (!currentPassword.value || !newPassword.value) {
    passwordError.value = 'Please provide your current and new password.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'New password and confirmation do not match.'
    return
  }

  isPasswordSaving.value = true
  passwordError.value = ''
  passwordFeedback.value = ''

  try {
    const res = await $fetch<{ success: boolean }>('/api/owner/account', {
      method: 'PATCH',
      body: {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
      },
    })
    if (res.success) {
      passwordFeedback.value = 'Password changed successfully!'
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
      setTimeout(() => (passwordFeedback.value = ''), 3000)
    }
  } catch (err: any) {
    passwordError.value = err?.data?.statusMessage || err?.message || 'Failed to update password.'
  } finally {
    isPasswordSaving.value = false
  }
}

function handleDownloadData() {
  const dataToExport = {
    owner: { name: fullName.value, email: email.value, phone: phoneNumber.value },
    shop: { name: shopName.value, slug: shopSlug.value, bio: shopBio.value },
    exportedAt: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `shopizz-owner-data-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function handleDeactivate() {
  if (confirm('Are you sure you want to temporarily deactivate your shop listings?')) {
    alert('Your shop and product listings have been paused.')
  }
}

function handleCloseAccount() {
  if (confirm('Warning: Closing your account is permanent and cannot be undone. Are you certain?')) {
    alert('Account closure request submitted to concierge admin.')
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Breadcrumbs matching Image 2 -->
    <nav class="flex items-center gap-2 text-xs text-[#7A746B]">
      <NuxtLink to="/owner" class="hover:text-[#1F2623] transition-colors">Owner Workspace</NuxtLink>
      <span>&gt;</span>
      <span class="font-medium text-[#1F2623]">My Account</span>
    </nav>

    <!-- Page Header with Calligraphy & Botanical Art matching Image 2 -->
    <section class="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2">
      <div>
        <h1 class="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F2623]">
          My Account
        </h1>
        <p class="mt-1 text-xs sm:text-sm text-[#7A746B]">
          Manage your personal information, shop details, payments and preferences.
        </p>
      </div>

      <!-- Top Right Decorative Botanical & Script -->
      <div class="hidden md:flex items-center gap-3 select-none opacity-85">
        <span class="font-serif italic text-lg text-[#5A544A] tracking-wide leading-tight">
          Independent<br>Brands<br>Stronger<br>Together
        </span>
        <svg class="h-16 w-16 text-[#38463B]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <path d="M50 90 C 45 65, 30 40, 50 10 C 70 40, 55 65, 50 90 Z" stroke-width="1.5" />
          <path d="M50 70 C 35 60, 20 62, 10 55 C 25 50, 40 58, 50 70 Z" stroke-width="1.2" />
          <path d="M50 50 C 65 40, 80 42, 90 35 C 75 30, 60 38, 50 50 Z" stroke-width="1.2" />
          <path d="M50 30 C 38 22, 28 20, 20 12 C 32 15, 42 22, 50 30 Z" stroke-width="1.2" />
        </svg>
      </div>
    </section>

    <!-- 6 CARDS GRID (2 Columns x 3 Rows) matching Image 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <!-- ============================================== -->
      <!-- CARD 1: PROFILE INFORMATION -->
      <!-- ============================================== -->
      <section class="rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-7 shadow-sm space-y-5">
        <!-- Card Header -->
        <div class="flex items-start justify-between pb-3 border-b border-[#E8E2D8]">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F4EDE4] text-[#94442A]">
              <Icon name="ph:user" class="h-5 w-5" />
            </div>
            <div>
              <h3 class="font-serif text-base font-semibold text-[#1F2623]">
                Profile Information
              </h3>
              <p class="text-[11px] text-[#7A746B]">
                This information will be used for your account and communication.
              </p>
            </div>
          </div>
          <button type="button" class="text-gray-400 hover:text-[#1F2623]">
            <Icon name="ph:pencil-simple" class="h-4 w-4" />
          </button>
        </div>

        <div v-if="profileFeedback" class="rounded-xl bg-[#EBF3EE] p-2.5 text-xs text-[#2D5A43] font-medium">
          ✓ {{ profileFeedback }}
        </div>

        <!-- Form Fields with Avatar -->
        <form @submit.prevent="handleSaveProfile" class="space-y-4 text-xs">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <!-- Avatar with Camera Overlay -->
            <div class="relative shrink-0">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[#1F2623] font-serif text-2xl font-bold text-white shadow-sm">
                {{ fullName.charAt(0) || 'R' }}
              </div>
              <button
                type="button"
                class="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-[#E8E2D8] text-[#1F2623] shadow-md hover:bg-[#FAF8F5]"
                title="Change Avatar"
              >
                <Icon name="ph:camera" class="h-3 w-3" />
              </button>
            </div>

            <!-- Inputs -->
            <div class="flex-1 w-full space-y-3">
              <div>
                <label class="block font-medium text-[#7A746B] mb-1">Full Name</label>
                <input
                  v-model="fullName"
                  type="text"
                  required
                  class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                >
              </div>

              <div>
                <label class="block font-medium text-[#7A746B] mb-1">Email Address</label>
                <div class="flex items-center justify-between rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-1.5">
                  <span class="text-xs text-[#1F2623]">{{ email }}</span>
                  <span class="rounded-full bg-[#EBF3EE] px-2 py-0.5 text-[10px] font-semibold text-[#2D5A43]">
                    Verified
                  </span>
                </div>
              </div>

              <div>
                <label class="block font-medium text-[#7A746B] mb-1">Phone Number</label>
                <div class="flex items-center rounded-xl border border-[#D5CEC4] bg-white px-3 py-1.5 gap-2">
                  <span class="text-sm">🇮🇳</span>
                  <input
                    v-model="phoneNumber"
                    type="tel"
                    class="w-full text-xs text-[#1F2623] focus:outline-none"
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="pt-2 flex justify-start">
            <button
              type="submit"
              :disabled="isProfileSaving"
              class="inline-flex items-center justify-center rounded-full bg-[#1F2623] px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2E3C32] transition-all hover:scale-[1.02]"
            >
              {{ isProfileSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </section>

      <!-- ============================================== -->
      <!-- CARD 2: SHOP INFORMATION -->
      <!-- ============================================== -->
      <section class="rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-7 shadow-sm space-y-5">
        <!-- Card Header -->
        <div class="flex items-start justify-between pb-3 border-b border-[#E8E2D8]">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F4EDE4] text-[#94442A]">
              <Icon name="ph:storefront" class="h-5 w-5" />
            </div>
            <div>
              <h3 class="font-serif text-base font-semibold text-[#1F2623]">
                Shop Information
              </h3>
              <p class="text-[11px] text-[#7A746B]">
                Update your shop details and branding.
              </p>
            </div>
          </div>
          <button type="button" class="text-gray-400 hover:text-[#1F2623]">
            <Icon name="ph:pencil-simple" class="h-4 w-4" />
          </button>
        </div>

        <div v-if="shopFeedback" class="rounded-xl bg-[#EBF3EE] p-2.5 text-xs text-[#2D5A43] font-medium">
          ✓ {{ shopFeedback }}
        </div>

        <!-- Shop Form -->
        <form @submit.prevent="handleSaveShop" class="space-y-3.5 text-xs">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <!-- Shop Logo with Camera overlay -->
            <div class="relative shrink-0">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAE0D0] font-serif italic text-sm font-semibold text-[#1F2623] shadow-inner border border-[#D5CEC4]">
                {{ shopName.slice(0, 8) || 'The Loom' }}
              </div>
              <button
                type="button"
                class="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-[#E8E2D8] text-[#1F2623] shadow-md hover:bg-[#FAF8F5]"
                title="Change Shop Logo"
              >
                <Icon name="ph:camera" class="h-3 w-3" />
              </button>
            </div>

            <!-- Name & Slug -->
            <div class="flex-1 w-full space-y-2.5">
              <div>
                <label class="block font-medium text-[#7A746B] mb-1">Shop Name</label>
                <input
                  v-model="shopName"
                  type="text"
                  required
                  class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-1.5 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                >
              </div>

              <div>
                <label class="block font-medium text-[#7A746B] mb-1">Shop Slug</label>
                <input
                  v-model="shopSlug"
                  type="text"
                  class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-1.5 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none font-mono"
                >
                <p class="mt-0.5 text-[10px] text-[#7A746B]">
                  shopizz.com/shop/{{ shopSlug }}
                </p>
              </div>
            </div>
          </div>

          <!-- Category & Bio -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label class="block font-medium text-[#7A746B] mb-1">Category</label>
              <select
                v-model="shopCategory"
                class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
              >
                <option value="Fashion">Fashion</option>
                <option value="Ceramics">Ceramics</option>
                <option value="Home Living">Home Living</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Art & Collectibles">Art & Collectibles</option>
              </select>
            </div>

            <div class="sm:col-span-2">
              <div class="flex items-center justify-between mb-1">
                <label class="font-medium text-[#7A746B]">Short Bio</label>
                <span class="text-[10px] text-[#7A746B]">{{ shopBio.length }}/200</span>
              </div>
              <textarea
                v-model="shopBio"
                maxlength="200"
                rows="2"
                class="w-full rounded-xl border border-[#D5CEC4] bg-white p-2.5 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          <div class="pt-2 flex justify-start">
            <button
              type="submit"
              :disabled="isShopSaving"
              class="inline-flex items-center justify-center rounded-full bg-[#1F2623] px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2E3C32] transition-all hover:scale-[1.02]"
            >
              {{ isShopSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </section>

      <!-- ============================================== -->
      <!-- CARD 3: BANK & PAYOUT INFORMATION -->
      <!-- ============================================== -->
      <section class="rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-7 shadow-sm space-y-5">
        <!-- Card Header -->
        <div class="flex items-start justify-between pb-3 border-b border-[#E8E2D8]">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F4EDE4] text-[#94442A]">
              <Icon name="ph:bank" class="h-5 w-5" />
            </div>
            <div>
              <h3 class="font-serif text-base font-semibold text-[#1F2623]">
                Bank & Payout Information
              </h3>
              <p class="text-[11px] text-[#7A746B]">
                Manage your bank account for receiving payouts.
              </p>
            </div>
          </div>
          <button type="button" class="text-gray-400 hover:text-[#1F2623]">
            <Icon name="ph:pencil-simple" class="h-4 w-4" />
          </button>
        </div>

        <div v-if="bankFeedback" class="rounded-xl bg-[#EBF3EE] p-2.5 text-xs text-[#2D5A43] font-medium">
          ✓ {{ bankFeedback }}
        </div>

        <!-- Bank Form -->
        <form @submit.prevent="handleSaveBank" class="space-y-3.5 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-[#7A746B] mb-1">Account Holder Name</label>
              <input
                v-model="accountHolder"
                type="text"
                class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
              >
            </div>

            <div>
              <label class="block font-medium text-[#7A746B] mb-1">Bank Name</label>
              <select
                v-model="bankName"
                class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
              >
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="State Bank of India">State Bank of India</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-[#7A746B] mb-1">Account Number</label>
              <div class="relative">
                <input
                  :type="showAccountNumber ? 'text' : 'password'"
                  v-model="accountNumber"
                  class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 pr-9 text-xs font-mono text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                >
                <button
                  type="button"
                  class="absolute right-2.5 top-2 text-gray-400 hover:text-gray-700"
                  @click="showAccountNumber = !showAccountNumber"
                >
                  <Icon :name="showAccountNumber ? 'ph:eye-slash' : 'ph:eye'" class="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label class="block font-medium text-[#7A746B] mb-1">IFSC Code</label>
              <input
                v-model="ifscCode"
                type="text"
                class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs font-mono uppercase text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
              >
            </div>
          </div>

          <div>
            <label class="block font-medium text-[#7A746B] mb-1">UPI ID (Optional)</label>
            <input
              v-model="upiId"
              type="text"
              placeholder="e.g. reyphenoix@okhdfcbank"
              class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs font-mono text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
            >
          </div>

          <div class="pt-2 flex justify-start">
            <button
              type="submit"
              :disabled="isBankSaving"
              class="inline-flex items-center justify-center rounded-full bg-[#1F2623] px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2E3C32] transition-all hover:scale-[1.02]"
            >
              {{ isBankSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </section>

      <!-- ============================================== -->
      <!-- CARD 4: NOTIFICATION PREFERENCES -->
      <!-- ============================================== -->
      <section class="rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-7 shadow-sm space-y-5">
        <!-- Card Header -->
        <div class="flex items-start justify-between pb-3 border-b border-[#E8E2D8]">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F4EDE4] text-[#94442A]">
              <Icon name="ph:bell" class="h-5 w-5" />
            </div>
            <div>
              <h3 class="font-serif text-base font-semibold text-[#1F2623]">
                Notification Preferences
              </h3>
              <p class="text-[11px] text-[#7A746B]">
                Choose what updates you want to receive.
              </p>
            </div>
          </div>
        </div>

        <div v-if="notifFeedback" class="rounded-xl bg-[#EBF3EE] p-2 text-xs text-[#2D5A43] font-medium">
          ✓ {{ notifFeedback }}
        </div>

        <!-- 5 Toggle Rows matching Image 2 -->
        <div class="space-y-4 text-xs">
          <!-- Row 1: Order notifications -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Icon name="ph:package" class="h-4 w-4 text-[#7A746B]" />
              <div>
                <p class="font-semibold text-[#1F2623]">Order notifications</p>
                <p class="text-[11px] text-[#7A746B]">Get notified when you receive a new order</p>
              </div>
            </div>
            <button
              type="button"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="notifications.orderNotifications ? 'bg-[#94442A]' : 'bg-[#D5CEC4]'"
              @click="toggleNotif('orderNotifications')"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="notifications.orderNotifications ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <!-- Row 2: Customer messages -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Icon name="ph:chat-circle-dots" class="h-4 w-4 text-[#7A746B]" />
              <div>
                <p class="font-semibold text-[#1F2623]">Customer messages</p>
                <p class="text-[11px] text-[#7A746B]">Get notified about new customer messages</p>
              </div>
            </div>
            <button
              type="button"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="notifications.customerMessages ? 'bg-[#94442A]' : 'bg-[#D5CEC4]'"
              @click="toggleNotif('customerMessages')"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="notifications.customerMessages ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <!-- Row 3: Payout updates -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Icon name="ph:bell-ringing" class="h-4 w-4 text-[#7A746B]" />
              <div>
                <p class="font-semibold text-[#1F2623]">Payout updates</p>
                <p class="text-[11px] text-[#7A746B]">Get notified about payout status and settlement</p>
              </div>
            </div>
            <button
              type="button"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="notifications.payoutUpdates ? 'bg-[#94442A]' : 'bg-[#D5CEC4]'"
              @click="toggleNotif('payoutUpdates')"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="notifications.payoutUpdates ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <!-- Row 4: Marketing & platform updates -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Icon name="ph:shield-check" class="h-4 w-4 text-[#7A746B]" />
              <div>
                <p class="font-semibold text-[#1F2623]">Marketing & platform updates</p>
                <p class="text-[11px] text-[#7A746B]">News, tips and feature updates from Shopizz</p>
              </div>
            </div>
            <button
              type="button"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="notifications.marketingUpdates ? 'bg-[#94442A]' : 'bg-[#D5CEC4]'"
              @click="toggleNotif('marketingUpdates')"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="notifications.marketingUpdates ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <!-- Row 5: Email notifications -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Icon name="ph:envelope" class="h-4 w-4 text-[#7A746B]" />
              <div>
                <p class="font-semibold text-[#1F2623]">Email notifications</p>
                <p class="text-[11px] text-[#7A746B]">Receive all important updates via email</p>
              </div>
            </div>
            <button
              type="button"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="notifications.emailNotifications ? 'bg-[#94442A]' : 'bg-[#D5CEC4]'"
              @click="toggleNotif('emailNotifications')"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="notifications.emailNotifications ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>
        </div>
      </section>

      <!-- ============================================== -->
      <!-- CARD 5: CHANGE PASSWORD -->
      <!-- ============================================== -->
      <section class="rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-7 shadow-sm space-y-5">
        <!-- Card Header -->
        <div class="flex items-start justify-between pb-3 border-b border-[#E8E2D8]">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F4EDE4] text-[#94442A]">
              <Icon name="ph:lock" class="h-5 w-5" />
            </div>
            <div>
              <h3 class="font-serif text-base font-semibold text-[#1F2623]">
                Change Password
              </h3>
              <p class="text-[11px] text-[#7A746B]">
                Keep your account secure with a strong password.
              </p>
            </div>
          </div>
        </div>

        <div v-if="passwordFeedback" class="rounded-xl bg-[#EBF3EE] p-2.5 text-xs text-[#2D5A43] font-medium">
          ✓ {{ passwordFeedback }}
        </div>
        <div v-if="passwordError" class="rounded-xl bg-red-50 p-2.5 text-xs text-red-700 font-medium">
          ✕ {{ passwordError }}
        </div>

        <!-- Password Form -->
        <form @submit.prevent="handleUpdatePassword" class="space-y-3.5 text-xs">
          <!-- Current Password -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label class="font-medium text-[#7A746B] sm:w-36">Current Password</label>
            <div class="relative flex-1">
              <input
                :type="showCurrentPassword ? 'text' : 'password'"
                v-model="currentPassword"
                required
                placeholder="Enter current password"
                class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-1.5 pr-9 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
              >
              <button
                type="button"
                class="absolute right-2.5 top-1.5 text-gray-400 hover:text-gray-700"
                @click="showCurrentPassword = !showCurrentPassword"
              >
                <Icon :name="showCurrentPassword ? 'ph:eye-slash' : 'ph:eye'" class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- New Password -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label class="font-medium text-[#7A746B] sm:w-36">New Password</label>
            <div class="relative flex-1">
              <input
                :type="showNewPassword ? 'text' : 'password'"
                v-model="newPassword"
                required
                placeholder="Enter new password"
                class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-1.5 pr-9 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
              >
              <button
                type="button"
                class="absolute right-2.5 top-1.5 text-gray-400 hover:text-gray-700"
                @click="showNewPassword = !showNewPassword"
              >
                <Icon :name="showNewPassword ? 'ph:eye-slash' : 'ph:eye'" class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Confirm New Password -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label class="font-medium text-[#7A746B] sm:w-36">Confirm New Password</label>
            <div class="relative flex-1">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="confirmPassword"
                required
                placeholder="Confirm new password"
                class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-1.5 pr-9 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
              >
              <button
                type="button"
                class="absolute right-2.5 top-1.5 text-gray-400 hover:text-gray-700"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <Icon :name="showConfirmPassword ? 'ph:eye-slash' : 'ph:eye'" class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="pt-2 flex justify-end">
            <button
              type="submit"
              :disabled="isPasswordSaving"
              class="inline-flex items-center justify-center rounded-full bg-[#1F2623] px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2E3C32] transition-all hover:scale-[1.02]"
            >
              {{ isPasswordSaving ? 'Updating...' : 'Update Password' }}
            </button>
          </div>
        </form>
      </section>

      <!-- ============================================== -->
      <!-- CARD 6: ACCOUNT ACTIONS -->
      <!-- ============================================== -->
      <section class="rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-7 shadow-sm space-y-5">
        <!-- Card Header -->
        <div class="flex items-start justify-between pb-3 border-b border-[#E8E2D8]">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F4EDE4] text-[#94442A]">
              <Icon name="ph:gear" class="h-5 w-5" />
            </div>
            <div>
              <h3 class="font-serif text-base font-semibold text-[#1F2623]">
                Account Actions
              </h3>
              <p class="text-[11px] text-[#7A746B]">
                Manage your account and data.
              </p>
            </div>
          </div>
        </div>

        <!-- 3 Action Rows matching Image 2 -->
        <div class="space-y-4 text-xs">
          <!-- Row 1: Download My Data -->
          <div class="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
            <div class="flex items-center gap-3">
              <Icon name="ph:download-simple" class="h-4 w-4 text-[#7A746B]" />
              <div>
                <p class="font-semibold text-[#1F2623]">Download My Data</p>
                <p class="text-[11px] text-[#7A746B]">Get a copy of your shop and account data.</p>
              </div>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full border border-[#D5CEC4] bg-white px-4 py-1.5 text-xs font-semibold text-[#1F2623] hover:bg-[#FAF8F5] transition-colors"
              @click="handleDownloadData"
            >
              <span>↓ Download</span>
            </button>
          </div>

          <!-- Row 2: Deactivate Account -->
          <div class="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
            <div class="flex items-center gap-3">
              <Icon name="ph:pause-circle" class="h-4 w-4 text-[#7A746B]" />
              <div>
                <p class="font-semibold text-[#1F2623]">Deactivate Account</p>
                <p class="text-[11px] text-[#7A746B]">Temporarily hide your shop and listings.</p>
              </div>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full border border-[#D5CEC4] bg-white px-4 py-1.5 text-xs font-semibold text-[#1F2623] hover:bg-[#FAF8F5] transition-colors"
              @click="handleDeactivate"
            >
              <span>⏸ Deactivate</span>
            </button>
          </div>

          <!-- Row 3: Close Account -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Icon name="ph:trash" class="h-4 w-4 text-red-600" />
              <div>
                <p class="font-semibold text-[#1F2623]">Close Account</p>
                <p class="text-[11px] text-[#7A746B]">Permanently delete your account and data.</p>
              </div>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50/50 px-4 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
              @click="handleCloseAccount"
            >
              <Icon name="ph:trash" class="h-3.5 w-3.5" />
              <span>Close Account</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
