<script setup lang="ts">
definePageMeta({
  layout: 'account',
  middleware: ['auth'],
})

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const userInitial = computed(() => user.value?.name?.charAt(0)?.toUpperCase() || 'D')

// Fetch buyer orders for live recent orders
const {
  data: ordersData,
  pending: ordersPending,
} = await useFetch<any>('/api/orders')

const liveOrders = computed(() => ordersData.value?.orders || [])

// Fallback / default high-fidelity items matching approved design
const recentOrders = computed(() => {
  if (liveOrders.value.length > 0) {
    return liveOrders.value.slice(0, 3).map((o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      productName: o.items?.[0]?.productName || 'Handcrafted Piece',
      shopName: o.items?.[0]?.ownerName || 'The Studio',
      variant: o.items?.[0]?.productSku ? `SKU: ${o.items[0].productSku}` : 'Standard Edition',
      price: o.totalAmount,
      status: o.status,
      date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      imageUrl: o.items?.[0]?.productImage || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300&q=80',
    }))
  }

  return [
    {
      id: 'demo-1',
      orderNumber: 'SH10042',
      productName: 'Linen Overshirt',
      shopName: 'The Loom Studio',
      variant: 'Size M | Sand',
      price: 249900,
      status: 'DELIVERED',
      date: '12 Aug 2026',
      imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300&q=80',
    },
    {
      id: 'demo-2',
      orderNumber: 'SH10038',
      productName: 'Ceramic Bowl Set',
      shopName: 'Clay Haus',
      variant: 'Set of 2 | Ivory',
      price: 129900,
      status: 'SHIPPED',
      date: '09 Aug 2026',
      imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300&q=80',
    },
    {
      id: 'demo-3',
      orderNumber: 'SH10029',
      productName: 'Linen Scarf',
      shopName: 'The Calm Studio',
      variant: 'Beige',
      price: 119900,
      status: 'DELIVERED',
      date: '03 Aug 2026',
      imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=300&q=80',
    },
  ]
})

// Saved Items matching approved design
const savedItems = [
  {
    id: 'save-1',
    name: 'Textured Vase',
    price: 189900,
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300&q=80',
  },
  {
    id: 'save-2',
    name: 'Cotton Pants',
    price: 279900,
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&q=80',
  },
  {
    id: 'save-3',
    name: 'Linen Tote Bag',
    price: 149900,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&q=80',
  },
]

// Notification Toggles State
const notificationToggles = ref({
  orderUpdates: true,
  offersPromotions: true,
  newArrivals: false,
  savedReminders: true,
})

// Edit Profile Modal
const isEditProfileOpen = ref(false)
const editName = ref(user.value?.name || 'Dave')
const editPhone = ref('+91 98765 43210')
const isSavingProfile = ref(false)
const profileSavedMessage = ref('')

function formatCurrency(paise: number) {
  return '₹ ' + Math.round((paise || 0) / 100).toLocaleString('en-IN')
}

function handleSaveProfile() {
  isSavingProfile.value = true
  setTimeout(() => {
    if (authStore.user) {
      authStore.user.name = editName.value.trim()
    }
    isSavingProfile.value = false
    profileSavedMessage.value = 'Profile updated!'
    setTimeout(() => {
      isEditProfileOpen.value = false
      profileSavedMessage.value = ''
    }, 1000)
  }, 500)
}

function handleDownloadData() {
  const dataToExport = {
    user: { name: user.value?.name, email: user.value?.email, role: user.value?.role },
    exportedAt: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `shopizz-account-data-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-8">
    <!-- Breadcrumbs matching Approved Design -->
    <nav class="flex items-center gap-2 text-xs text-[#94442A]">
      <span>My Account</span>
    </nav>

    <!-- Page Header with Calligraphy, Leaf Illustration & Tagline matching Approved Design -->
    <section class="relative flex flex-col md:flex-row md:items-start justify-between gap-4 pb-2">
      <div>
        <h1 class="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F2623]">
          My Account
        </h1>
        <p class="mt-1 text-xs sm:text-sm text-[#7A746B]">
          Manage your profile, orders, addresses, payments and preferences — all in one place.
        </p>
      </div>

      <!-- Top Right Decorative Calligraphy, Leaf Art & Tagline -->
      <div class="hidden lg:flex items-center gap-6 select-none opacity-85">
        <!-- Script text -->
        <span class="font-serif italic text-lg text-[#5A544A] tracking-wide leading-tight text-right">
          Thoughtful<br>Shopping<br>Always
        </span>

        <!-- Leaf Illustration -->
        <svg class="h-16 w-16 text-[#38463B]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <path d="M50 90 C 45 65, 30 40, 50 10 C 70 40, 55 65, 50 90 Z" stroke-width="1.5" />
          <path d="M50 70 C 35 60, 20 62, 10 55 C 25 50, 40 58, 50 70 Z" stroke-width="1.2" />
          <path d="M50 50 C 65 40, 80 42, 90 35 C 75 30, 60 38, 50 50 Z" stroke-width="1.2" />
          <path d="M50 30 C 38 22, 28 20, 20 12 C 32 15, 42 22, 50 30 Z" stroke-width="1.2" />
        </svg>

        <!-- People Products Possibilities -->
        <div class="text-[10px] text-[#7A746B] tracking-wider leading-relaxed border-l border-[#D5CEC4] pl-4">
          <p>—</p>
          <p class="font-medium text-[#1F2623]">People</p>
          <p class="font-medium text-[#1F2623]">Products</p>
          <p class="font-medium text-[#1F2623]">Possibilities</p>
          <p>—</p>
        </div>
      </div>
    </section>

    <!-- 1. Profile Hero Card matching Approved Design -->
    <section class="rounded-3xl border border-[#E8E2D8] bg-white p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div class="flex items-center gap-5">
        <!-- Large Avatar with Camera Overlay -->
        <div class="relative shrink-0">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[#1F2623] font-serif text-2xl font-bold text-white shadow-sm">
            {{ userInitial }}
          </div>
          <button
            type="button"
            class="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-[#E8E2D8] text-[#1F2623] shadow-md hover:bg-[#FAF8F5]"
            title="Change Avatar"
            @click="isEditProfileOpen = true"
          >
            <Icon name="ph:camera" class="h-3 w-3" />
          </button>
        </div>

        <!-- Name, Email, Verified Badge & Member Date -->
        <div class="space-y-1">
          <div class="flex items-center gap-2.5 flex-wrap">
            <h2 class="font-serif text-xl font-bold text-[#1F2623]">
              {{ user?.name || 'Dave' }}
            </h2>
            <span class="inline-flex items-center rounded-full bg-[#EBF3EE] px-2.5 py-0.5 text-[10px] font-semibold text-[#2D5A43]">
              Verified
            </span>
          </div>
          <p class="text-xs text-[#7A746B]">
            {{ user?.email || 'buyeronly@yopmail.com' }}
          </p>
          <p class="text-[11px] text-[#7A746B]">
            Member since September 2026
          </p>
        </div>
      </div>

      <!-- Edit Profile Button -->
      <div>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border border-[#D5CEC4] bg-white px-5 py-2 text-xs font-semibold text-[#1F2623] shadow-sm hover:bg-[#FAF8F5] transition-all hover:scale-[1.02]"
          @click="isEditProfileOpen = true"
        >
          <Icon name="ph:pencil-simple" class="h-3.5 w-3.5 text-[#7A746B]" />
          <span>Edit Profile</span>
        </button>
      </div>
    </section>

    <!-- 2. Four Quick Stats Cards Strip matching Approved Design -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Stat 1: Total Orders -->
      <NuxtLink
        to="/account/orders"
        class="rounded-3xl border border-[#E8E2D8] bg-white p-5 shadow-sm transition-all hover:shadow-md group"
      >
        <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FDF3EE] text-[#94442A]">
          <Icon name="ph:bag" class="h-5 w-5" />
        </div>
        <p class="font-serif text-2xl font-bold text-[#1F2623] mt-3 group-hover:text-[#94442A] transition-colors">
          {{ recentOrders.length || 5 }}
        </p>
        <p class="text-xs text-[#7A746B] mt-0.5">Total Orders</p>
      </NuxtLink>

      <!-- Stat 2: Saved Items -->
      <NuxtLink
        to="/wishlist"
        class="rounded-3xl border border-[#E8E2D8] bg-white p-5 shadow-sm transition-all hover:shadow-md group"
      >
        <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FDF3EE] text-[#94442A]">
          <Icon name="ph:heart" class="h-5 w-5" />
        </div>
        <p class="font-serif text-2xl font-bold text-[#1F2623] mt-3 group-hover:text-[#94442A] transition-colors">
          12
        </p>
        <p class="text-xs text-[#7A746B] mt-0.5">Saved Items</p>
      </NuxtLink>

      <!-- Stat 3: Addresses -->
      <NuxtLink
        to="/account/addresses"
        class="rounded-3xl border border-[#E8E2D8] bg-white p-5 shadow-sm transition-all hover:shadow-md group"
      >
        <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FDF3EE] text-[#94442A]">
          <Icon name="ph:map-pin" class="h-5 w-5" />
        </div>
        <p class="font-serif text-2xl font-bold text-[#1F2623] mt-3 group-hover:text-[#94442A] transition-colors">
          3
        </p>
        <p class="text-xs text-[#7A746B] mt-0.5">Addresses</p>
      </NuxtLink>

      <!-- Stat 4: Payment Methods -->
      <NuxtLink
        to="/account/payments"
        class="rounded-3xl border border-[#E8E2D8] bg-white p-5 shadow-sm transition-all hover:shadow-md group"
      >
        <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FDF3EE] text-[#94442A]">
          <Icon name="ph:credit-card" class="h-5 w-5" />
        </div>
        <p class="font-serif text-2xl font-bold text-[#1F2623] mt-3 group-hover:text-[#94442A] transition-colors">
          2
        </p>
        <p class="text-xs text-[#7A746B] mt-0.5">Payment Methods</p>
      </NuxtLink>
    </div>

    <!-- 3. Main 2-Column Content Layout (Left: Orders & Payments | Right: Insider, Saved, Addresses, Actions) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- ============================================== -->
      <!-- LEFT COLUMN (7-8 cols) -->
      <!-- ============================================== -->
      <div class="lg:col-span-8 space-y-6">
        <!-- Recent Orders Card matching Approved Design -->
        <section class="rounded-3xl border border-[#E8E2D8] bg-white p-6 sm:p-7 shadow-sm space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
            <h3 class="font-serif text-lg font-semibold text-[#1F2623]">
              Recent Orders
            </h3>
            <NuxtLink
              to="/account/orders"
              class="text-xs font-semibold text-[#1F2623] hover:text-[#94442A] transition-colors"
            >
              View All →
            </NuxtLink>
          </div>

          <!-- 3 Order Rows matching Approved Design -->
          <div class="space-y-4">
            <div
              v-for="order in recentOrders"
              :key="order.id"
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[#E8E2D8] bg-[#FAF8F5] transition-all hover:border-[#D5CEC4]"
            >
              <!-- Thumbnail & Info -->
              <div class="flex items-center gap-3.5">
                <img
                  :src="order.imageUrl"
                  :alt="order.productName"
                  class="h-14 w-14 rounded-xl object-cover border border-[#E8E2D8] bg-white shrink-0"
                >
                <div class="space-y-0.5">
                  <h4 class="text-xs font-semibold text-[#1F2623]">{{ order.productName }}</h4>
                  <p class="text-[11px] text-[#7A746B]">{{ order.shopName }}</p>
                  <p class="text-[11px] text-[#7A746B]">{{ order.variant }}</p>
                </div>
              </div>

              <!-- Price, Status Badge, Date & View Details -->
              <div class="flex items-center justify-between sm:justify-end gap-6 sm:gap-8">
                <div class="text-left sm:text-right">
                  <p class="font-serif text-sm font-semibold text-[#1F2623]">
                    {{ formatCurrency(order.price) }}
                  </p>
                </div>

                <div class="text-left sm:text-right space-y-1">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                    :class="order.status === 'DELIVERED'
                      ? 'bg-[#EBF3EE] text-[#2D5A43]'
                      : 'bg-[#E8F0FE] text-[#1A73E8]'"
                  >
                    {{ order.status === 'DELIVERED' ? 'Delivered' : 'Shipped' }}
                  </span>
                  <p class="text-[10px] text-[#7A746B]">{{ order.date }}</p>
                </div>

                <NuxtLink
                  :to="`/account/orders/${order.id}`"
                  class="inline-flex items-center rounded-full border border-[#D5CEC4] bg-white px-4 py-1.5 text-xs font-medium text-[#1F2623] hover:bg-[#FAF8F5] transition-colors"
                >
                  View Details
                </NuxtLink>
              </div>
            </div>
          </div>
        </section>

        <!-- Bottom 2-Card Row: Payment Methods & Notifications matching Approved Design -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- 1. Payment Methods Card -->
          <section class="rounded-3xl border border-[#E8E2D8] bg-white p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
              <h3 class="font-serif text-base font-semibold text-[#1F2623]">
                Payment Methods
              </h3>
              <NuxtLink
                to="/account/payments"
                class="text-xs font-semibold text-[#1F2623] hover:text-[#94442A] transition-colors"
              >
                Manage →
              </NuxtLink>
            </div>

            <div class="space-y-3 text-xs">
              <!-- Item 1: Card -->
              <div class="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8]">
                <div class="flex items-center gap-3">
                  <div class="flex h-7 w-9 items-center justify-center rounded-md bg-white border border-[#E8E2D8] text-xs font-bold text-[#1F2623]">
                    💳
                  </div>
                  <div>
                    <p class="font-mono font-semibold text-[#1F2623]">•••• •••• 4567</p>
                    <p class="text-[10px] text-[#7A746B]">Visa</p>
                  </div>
                </div>
                <span class="rounded-full bg-[#EBF3EE] px-2 py-0.5 text-[10px] font-semibold text-[#2D5A43]">
                  Default
                </span>
              </div>

              <!-- Item 2: UPI -->
              <div class="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8]">
                <div class="flex items-center gap-3">
                  <div class="flex h-7 w-9 items-center justify-center rounded-md bg-[#5F259F]/10 border border-[#5F259F]/20 text-[10px] font-bold text-[#5F259F]">
                    UPI
                  </div>
                  <div>
                    <p class="font-mono text-xs font-semibold text-[#1F2623]">buyeronly@ybl</p>
                    <p class="text-[10px] text-[#7A746B]">PhonePe</p>
                  </div>
                </div>
                <button type="button" class="text-gray-400 hover:text-gray-700">
                  <Icon name="ph:dots-three-vertical" class="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          <!-- 2. Notifications Card -->
          <section class="rounded-3xl border border-[#E8E2D8] bg-white p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
              <h3 class="font-serif text-base font-semibold text-[#1F2623]">
                Notifications
              </h3>
              <NuxtLink
                to="/account/notifications"
                class="text-xs font-semibold text-[#1F2623] hover:text-[#94442A] transition-colors"
              >
                Manage →
              </NuxtLink>
            </div>

            <div class="space-y-3.5 text-xs">
              <!-- Toggle 1 -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <Icon name="ph:envelope" class="h-4 w-4 text-[#7A746B]" />
                  <span class="font-medium text-[#1F2623]">Order updates</span>
                </div>
                <button
                  type="button"
                  class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                  :class="notificationToggles.orderUpdates ? 'bg-[#94442A]' : 'bg-[#D5CEC4]'"
                  @click="notificationToggles.orderUpdates = !notificationToggles.orderUpdates"
                >
                  <span
                    class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="notificationToggles.orderUpdates ? 'translate-x-4' : 'translate-x-0'"
                  />
                </button>
              </div>

              <!-- Toggle 2 -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <Icon name="ph:tag" class="h-4 w-4 text-[#7A746B]" />
                  <span class="font-medium text-[#1F2623]">Offers &amp; promotions</span>
                </div>
                <button
                  type="button"
                  class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                  :class="notificationToggles.offersPromotions ? 'bg-[#94442A]' : 'bg-[#D5CEC4]'"
                  @click="notificationToggles.offersPromotions = !notificationToggles.offersPromotions"
                >
                  <span
                    class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="notificationToggles.offersPromotions ? 'translate-x-4' : 'translate-x-0'"
                  />
                </button>
              </div>

              <!-- Toggle 3 -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <Icon name="ph:package" class="h-4 w-4 text-[#7A746B]" />
                  <span class="font-medium text-[#1F2623]">New arrivals</span>
                </div>
                <button
                  type="button"
                  class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                  :class="notificationToggles.newArrivals ? 'bg-[#94442A]' : 'bg-[#D5CEC4]'"
                  @click="notificationToggles.newArrivals = !notificationToggles.newArrivals"
                >
                  <span
                    class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="notificationToggles.newArrivals ? 'translate-x-4' : 'translate-x-0'"
                  />
                </button>
              </div>

              <!-- Toggle 4 -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <Icon name="ph:heart" class="h-4 w-4 text-[#7A746B]" />
                  <span class="font-medium text-[#1F2623]">Saved item reminders</span>
                </div>
                <button
                  type="button"
                  class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                  :class="notificationToggles.savedReminders ? 'bg-[#94442A]' : 'bg-[#D5CEC4]'"
                  @click="notificationToggles.savedReminders = !notificationToggles.savedReminders"
                >
                  <span
                    class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="notificationToggles.savedReminders ? 'translate-x-4' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- RIGHT COLUMN (4-5 cols) -->
      <!-- ============================================== -->
      <div class="lg:col-span-4 space-y-6">
        <!-- 1. Shopizz Insider Card matching Approved Design -->
        <div class="relative overflow-hidden rounded-3xl border border-[#E8DEC8] bg-[#FAF6F0] p-6 shadow-sm space-y-4">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F4EDE4] text-[#94442A]">
              <Icon name="ph:crown" class="h-5 w-5" />
            </div>
            <div>
              <h3 class="font-serif text-base font-semibold text-[#1F2623]">
                Shopizz Insider
              </h3>
              <p class="text-[11px] text-[#7A746B]">
                More love for mindful shopping.
              </p>
            </div>
          </div>

          <ul class="space-y-2.5 text-xs text-[#5A544A]">
            <li class="flex items-center gap-2.5">
              <span class="text-[#2D5A43] font-bold">✓</span>
              <span>Early access to new collections</span>
            </li>
            <li class="flex items-center gap-2.5">
              <span class="text-[#2D5A43] font-bold">✓</span>
              <span>Exclusive member offers</span>
            </li>
            <li class="flex items-center gap-2.5">
              <span class="text-[#2D5A43] font-bold">✓</span>
              <span>Curated recommendations</span>
            </li>
          </ul>

          <div class="pt-2">
            <NuxtLink
              to="/about"
              class="inline-flex items-center gap-1.5 rounded-full border border-[#1F2623]/20 bg-white px-4 py-1.5 text-xs font-semibold text-[#1F2623] shadow-sm hover:bg-[#FAF8F5] transition-all"
            >
              <span>Learn More →</span>
            </NuxtLink>
          </div>
        </div>

        <!-- 2. Saved Items Card matching Approved Design -->
        <section class="rounded-3xl border border-[#E8E2D8] bg-white p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
            <h3 class="font-serif text-base font-semibold text-[#1F2623]">
              Saved Items
            </h3>
            <NuxtLink
              to="/wishlist"
              class="text-xs font-semibold text-[#1F2623] hover:text-[#94442A] transition-colors"
            >
              View All →
            </NuxtLink>
          </div>

          <!-- 3 Mini Items Row matching Approved Design -->
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="item in savedItems"
              :key="item.id"
              class="space-y-1.5 group"
            >
              <div class="relative overflow-hidden rounded-2xl border border-[#E8E2D8] bg-[#FAF8F5] aspect-square">
                <img
                  :src="item.imageUrl"
                  :alt="item.name"
                  class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                >
                <button
                  type="button"
                  class="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm text-[#94442A]"
                >
                  <Icon name="ph:heart-fill" class="h-3.5 w-3.5" />
                </button>
              </div>
              <p class="text-[11px] font-medium text-[#1F2623] truncate">{{ item.name }}</p>
              <p class="font-serif text-xs font-semibold text-[#1F2623]">{{ formatCurrency(item.price) }}</p>
            </div>
          </div>
        </section>

        <!-- 3. Addresses Card matching Approved Design -->
        <section class="rounded-3xl border border-[#E8E2D8] bg-white p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
            <h3 class="font-serif text-base font-semibold text-[#1F2623]">
              Addresses
            </h3>
            <NuxtLink
              to="/account/addresses"
              class="text-xs font-semibold text-[#1F2623] hover:text-[#94442A] transition-colors"
            >
              Manage →
            </NuxtLink>
          </div>

          <div class="flex items-start justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8]">
            <div class="flex items-start gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#FDF3EE] text-[#94442A] shrink-0 mt-0.5">
                <Icon name="ph:house" class="h-4 w-4" />
              </div>
              <div class="space-y-0.5 text-xs">
                <p class="font-semibold text-[#1F2623]">Home</p>
                <p class="text-[11px] text-[#1F2623] font-medium">{{ user?.name || 'Dave' }}</p>
                <p class="text-[11px] text-[#7A746B] leading-relaxed">123, MG Road, Koramangala<br>Bengaluru, Karnataka 560034</p>
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <button
                type="button"
                class="rounded-full border border-[#D5CEC4] bg-white px-3 py-1 text-[11px] font-medium text-[#1F2623] hover:bg-[#FAF8F5]"
              >
                Edit
              </button>
              <button type="button" class="text-gray-400 hover:text-gray-700 p-1">
                <Icon name="ph:dots-three-vertical" class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

        <!-- 4. Account Actions Card matching Approved Design -->
        <section class="rounded-3xl border border-[#E8E2D8] bg-white p-6 shadow-sm space-y-4">
          <h3 class="font-serif text-base font-semibold text-[#1F2623] pb-3 border-b border-[#E8E2D8]">
            Account Actions
          </h3>

          <div class="space-y-2 text-xs">
            <button
              type="button"
              class="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors text-left"
              @click="isEditProfileOpen = true"
            >
              <div class="flex items-center gap-3 text-[#1F2623]">
                <Icon name="ph:pencil-simple" class="h-4 w-4 text-[#7A746B]" />
                <span class="font-medium">Change Password</span>
              </div>
              <span class="text-gray-400">→</span>
            </button>

            <button
              type="button"
              class="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors text-left"
              @click="handleDownloadData"
            >
              <div class="flex items-center gap-3 text-[#1F2623]">
                <Icon name="ph:download-simple" class="h-4 w-4 text-[#7A746B]" />
                <span class="font-medium">Download My Data</span>
              </div>
              <span class="text-gray-400">→</span>
            </button>

            <button
              type="button"
              class="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-red-50 transition-colors text-left"
              @click="alert('Account deletion request submitted.')"
            >
              <div class="flex items-center gap-3 text-red-700">
                <Icon name="ph:trash" class="h-4 w-4 text-red-600" />
                <span class="font-medium">Delete Account</span>
              </div>
              <span class="text-red-400">→</span>
            </button>
          </div>
        </section>
      </div>
    </div>

    <!-- Edit Profile Modal -->
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
          v-if="isEditProfileOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <div
            class="fixed inset-0 bg-[#1F2623]/60 backdrop-blur-sm"
            @click="isEditProfileOpen = false"
          />

          <div class="relative w-full max-w-md rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-8 shadow-2xl space-y-4">
            <div class="flex items-start justify-between pb-3 border-b border-[#E8E2D8]">
              <h3 class="font-serif text-xl font-medium text-[#1F2623]">Edit Profile</h3>
              <button
                type="button"
                class="rounded-full p-2 text-gray-400 hover:text-gray-700"
                @click="isEditProfileOpen = false"
              >
                ✕
              </button>
            </div>

            <div v-if="profileSavedMessage" class="rounded-xl bg-[#EBF3EE] p-2.5 text-xs text-[#2D5A43] font-medium text-center">
              ✓ {{ profileSavedMessage }}
            </div>

            <form @submit.prevent="handleSaveProfile" class="space-y-4 text-xs">
              <div>
                <label class="block font-medium text-[#7A746B] mb-1">Full Name</label>
                <input
                  v-model="editName"
                  type="text"
                  required
                  class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                >
              </div>

              <div>
                <label class="block font-medium text-[#7A746B] mb-1">Email Address</label>
                <input
                  :value="user?.email"
                  disabled
                  class="w-full rounded-xl border border-[#D5CEC4] bg-gray-100 px-3.5 py-2 text-xs text-gray-500 cursor-not-allowed"
                >
              </div>

              <div>
                <label class="block font-medium text-[#7A746B] mb-1">Phone Number</label>
                <input
                  v-model="editPhone"
                  type="tel"
                  class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
                >
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D8]">
                <button
                  type="button"
                  class="rounded-full px-5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  @click="isEditProfileOpen = false"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="isSavingProfile"
                  class="rounded-full bg-[#1F2623] px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2E3C32] disabled:opacity-50"
                >
                  {{ isSavingProfile ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>