<script setup lang="ts">
import AppCategoriesDrawer from './AppCategoriesDrawer.vue'
import AppSearchDrawer from './AppSearchDrawer.vue'
import AppNotificationDrawer from './AppNotificationDrawer.vue'

const appStore = useAppStore()
const authStore = useAuthStore()
const cartStore = useCartStore()
const route = useRoute()
const { unreadCount, openDrawer, fetchNotifications } = useNotifications()

const isAuthenticated = computed(() => !!authStore.user)
const userRole = computed(() => authStore.user?.role || 'BUYER')
const userName = computed(() => authStore.user?.name || 'Account')
const userEmail = computed(() => authStore.user?.email || '')
const userInitial = computed(() => authStore.user?.name?.charAt(0)?.toUpperCase() || 'U')

const isSearchDrawerOpen = ref(false)
const isCategoriesOpen = ref(false)
const isUserMenuOpen = ref(false)
const loggingOut = ref(false)

const toggleUserMenu = async () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
  if (isUserMenuOpen.value && authStore.isAuthenticated) {
    await authStore.syncSession()
  }
}

onMounted(() => {
  fetchNotifications()
  if (authStore.isAuthenticated) {
    authStore.syncSession()
  }
})

watch(
  () => authStore.user?.id,
  () => {
    fetchNotifications()
    if (authStore.isAuthenticated) {
      authStore.syncSession()
    }
  }
)


// Close drawers/menus on route change
watch(
  () => route.fullPath,
  () => {
    isCategoriesOpen.value = false
    isSearchDrawerOpen.value = false
    isUserMenuOpen.value = false
  }
)

const { data: announcementData } = await useFetch<any>('/api/settings/announcement', {
  lazy: true,
  server: true,
})

const announcementText = computed(
  () => announcementData.value?.announcementText || 'Free shipping on orders above ₹1499 • Easy returns'
)

const handleLogout = async () => {
  loggingOut.value = true
  isUserMenuOpen.value = false
  try {
    await authStore.logout()
    await navigateTo('/login')
  } finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <div class="sticky top-0 z-50 w-full">
    <!-- Top Announcement Bar -->
    <div
      class="bg-[#94442a] py-1.5 px-4 text-center text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#faf8f3]"
    >
      <div class="flex items-center justify-center gap-2">
        <span class="text-[9px] text-[#e8a38a]">✦</span>
        <span>{{ announcementText }}</span>
        <span class="text-[9px] text-[#e8a38a]">✦</span>
      </div>
    </div>

    <!-- Main Header -->
    <header
      class="relative w-full border-b border-[var(--shopizz-obsidian)]/10 bg-[var(--shopizz-porcelain)]/95 backdrop-blur-md"
    >
      <div
        class="mx-auto flex max-w-[1380px] items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8"
      >

        <!-- Left: Logo & Main Navigation -->
        <div class="flex items-center gap-8 lg:gap-10">
          <NuxtLink to="/" aria-label="Shopizz home" class="flex items-center">
            <AppLogo />
          </NuxtLink>

          <!-- Center Navigation Links -->
          <nav class="hidden items-center gap-7 lg:flex">
            <NuxtLink
              to="/shop"
              class="text-xs font-medium uppercase tracking-[0.14em] text-[var(--shopizz-obsidian)]/75 transition-colors hover:text-[var(--shopizz-obsidian)]"
            >
              Shop
            </NuxtLink>

            <button
              type="button"
              class="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--shopizz-obsidian)]/75 transition-colors hover:text-[var(--shopizz-obsidian)]"
              :class="{ 'text-[var(--shopizz-obsidian)] font-bold': isCategoriesOpen }"
              @click="isCategoriesOpen = !isCategoriesOpen"
            >
              <span>Categories</span>
              <svg
                class="h-3 w-3 transition-transform duration-200"
                :class="{ 'rotate-180': isCategoriesOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <NuxtLink
              to="/#shops"
              class="text-xs font-medium uppercase tracking-[0.14em] text-[var(--shopizz-obsidian)]/75 transition-colors hover:text-[var(--shopizz-obsidian)]"
            >
              Shops
            </NuxtLink>

            <NuxtLink
              to="/about"
              class="text-xs font-medium uppercase tracking-[0.14em] text-[var(--shopizz-obsidian)]/75 transition-colors hover:text-[var(--shopizz-obsidian)]"
            >
              About
            </NuxtLink>

            <NuxtLink
              to="/journal"
              class="text-xs font-medium uppercase tracking-[0.14em] text-[var(--shopizz-obsidian)]/75 transition-colors hover:text-[var(--shopizz-obsidian)]"
            >
              Journal
            </NuxtLink>
          </nav>
        </div>

        <!-- Center Search Bar matching Approved Design -->
        <div class="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm xl:max-w-md mx-4">
          <div
            class="relative w-full cursor-pointer"
            @click="isSearchDrawerOpen = true"
          >
            <div class="flex items-center gap-2.5 rounded-full border border-[var(--shopizz-obsidian)]/15 bg-white/70 px-4 py-1.5 text-xs text-[var(--shopizz-obsidian)]/50 transition-all hover:bg-white hover:border-[var(--shopizz-obsidian)]/30 hover:shadow-xs">
              <svg class="h-3.5 w-3.5 text-[var(--shopizz-obsidian)]/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span class="truncate text-xs">Search products, shops or categories...</span>
            </div>
          </div>
        </div>

        <!-- Right Action Icons & User Dropdown -->
        <div class="flex items-center gap-3 sm:gap-4 shrink-0">
          <!-- Role Quick Dashboard Return Button for Admin / Owner -->
          <NuxtLink
            v-if="userRole === 'ADMIN'"
            to="/admin"
            class="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[var(--shopizz-saffron)]/30 bg-[var(--shopizz-saffron)]/10 px-3 py-1.5 text-[11px] font-semibold text-[var(--shopizz-saffron)] transition-all hover:bg-[var(--shopizz-saffron)] hover:text-white"
          >
            <span>📊</span>
            <span>Admin Dashboard</span>
          </NuxtLink>

          <NuxtLink
            v-else-if="userRole === 'OWNER'"
            to="/owner"
            class="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[var(--shopizz-moss)]/30 bg-[var(--shopizz-moss)]/10 px-3 py-1.5 text-[11px] font-semibold text-[var(--shopizz-moss)] transition-all hover:bg-[var(--shopizz-moss)] hover:text-white"
          >
            <span>🏪</span>
            <span>Owner Dashboard</span>
          </NuxtLink>

          <!-- Search Icon Button (on Mobile/Small Screens) -->
          <button
            type="button"
            class="flex md:hidden h-9 w-9 items-center justify-center rounded-full text-[var(--shopizz-obsidian)]/80 transition-colors hover:bg-white hover:text-[var(--shopizz-obsidian)]"
            aria-label="Open search drawer"
            @click="isSearchDrawerOpen = true"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          <!-- Wishlist Heart Icon -->
          <NuxtLink
            to="/wishlist"
            class="flex h-9 w-9 items-center justify-center rounded-full text-[var(--shopizz-obsidian)]/80 transition-colors hover:bg-white hover:text-[var(--shopizz-obsidian)]"
            aria-label="Wishlist"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </NuxtLink>

          <!-- Notification Bell -->
          <div class="relative">
            <button
              type="button"
              class="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--shopizz-obsidian)]/80 transition-colors hover:bg-white hover:text-[var(--shopizz-obsidian)] cursor-pointer"
              aria-label="Notifications"
              @click="openDrawer"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#94442a] px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-white"
              >
                {{ unreadCount }}
              </span>
            </button>
          </div>

          <!-- User Identity Capsule & Dropdown (When Logged In) -->
          <div
            v-if="isAuthenticated"
            class="relative"
          >
            <button
              type="button"
              class="flex items-center gap-2 rounded-full border border-[var(--shopizz-obsidian)]/15 bg-white/70 py-1 pl-1.5 pr-2.5 transition-all duration-200 hover:border-[var(--shopizz-obsidian)] hover:bg-white cursor-pointer"
              @click="toggleUserMenu"
            >
              <div
                class="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--shopizz-obsidian)] text-xs font-semibold text-[#f7f4ee]"
              >
                {{ userInitial }}
              </div>
              <div class="text-left hidden sm:block">
                <p class="text-xs font-semibold leading-none text-[var(--shopizz-obsidian)]">
                  {{ userName }}
                </p>
                <p class="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--shopizz-saffron)]">
                  {{ userRole }}
                </p>
              </div>
              <span class="text-[10px] text-[var(--shopizz-obsidian)]/50 ml-0.5">
                →
              </span>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="isUserMenuOpen"
              class="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white p-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <!-- Profile Header -->
              <div class="flex items-center gap-3 border-b border-[var(--shopizz-obsidian)]/10 pb-3 px-1">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--shopizz-moss)] text-sm font-semibold text-white">
                  {{ userInitial }}
                </div>
                <div class="min-w-0">
                  <p class="truncate text-xs font-semibold text-[var(--shopizz-obsidian)]">
                    {{ userName }}
                  </p>
                  <p class="truncate text-[10px] text-[var(--shopizz-obsidian)]/50">
                    {{ userEmail }}
                  </p>
                </div>
              </div>

              <!-- Menu Items based on Role -->
              <div class="py-2 space-y-1 text-xs text-[var(--shopizz-obsidian)]/75">
                <!-- If Admin -->
                <template v-if="userRole === 'ADMIN'">
                  <NuxtLink
                    to="/admin"
                    class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-[var(--shopizz-stone)]/50 hover:text-[var(--shopizz-obsidian)] transition-colors"
                  >
                    <span>📊</span>
                    <span class="font-medium">Admin Dashboard</span>
                  </NuxtLink>

                  <NuxtLink
                    to="/admin/requests"
                    class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-[var(--shopizz-stone)]/50 hover:text-[var(--shopizz-obsidian)] transition-colors"
                  >
                    <span>📝</span>
                    <span>Owner Requests</span>
                  </NuxtLink>

                  <NuxtLink
                    to="/admin/categories"
                    class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-[var(--shopizz-stone)]/50 hover:text-[var(--shopizz-obsidian)] transition-colors"
                  >
                    <span>🏷️</span>
                    <span>Categories</span>
                  </NuxtLink>

                  <NuxtLink
                    to="/admin/orders"
                    class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-[var(--shopizz-stone)]/50 hover:text-[var(--shopizz-obsidian)] transition-colors"
                  >
                    <span>📋</span>
                    <span>Marketplace Orders</span>
                  </NuxtLink>
                </template>

                <!-- If Owner -->
                <template v-else-if="userRole === 'OWNER'">
                  <NuxtLink
                    to="/owner"
                    class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-[var(--shopizz-stone)]/50 hover:text-[var(--shopizz-obsidian)] transition-colors"
                  >
                    <span>🏪</span>
                    <span class="font-medium">Owner Dashboard</span>
                  </NuxtLink>

                  <NuxtLink
                    to="/owner/shop"
                    class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-[var(--shopizz-stone)]/50 hover:text-[var(--shopizz-obsidian)] transition-colors"
                  >
                    <span>🏬</span>
                    <span>My Store Details</span>
                  </NuxtLink>

                  <NuxtLink
                    to="/owner/products"
                    class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-[var(--shopizz-stone)]/50 hover:text-[var(--shopizz-obsidian)] transition-colors"
                  >
                    <span>📦</span>
                    <span>My Products</span>
                  </NuxtLink>

                  <NuxtLink
                    to="/owner/orders"
                    class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-[var(--shopizz-stone)]/50 hover:text-[var(--shopizz-obsidian)] transition-colors"
                  >
                    <span>📋</span>
                    <span>Shop Orders</span>
                  </NuxtLink>

                  <NuxtLink
                    to="/account"
                    class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-[var(--shopizz-stone)]/50 hover:text-[var(--shopizz-obsidian)] transition-colors"
                  >
                    <span>👤</span>
                    <span>Personal Shopping</span>
                  </NuxtLink>
                </template>

                <!-- If Buyer -->
                <template v-else>
                  <NuxtLink
                    to="/account"
                    class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-[var(--shopizz-stone)]/50 hover:text-[var(--shopizz-obsidian)] transition-colors"
                  >
                    <span>👤</span>
                    <span class="font-medium">My Account</span>
                  </NuxtLink>

                  <NuxtLink
                    to="/account/orders"
                    class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-[var(--shopizz-stone)]/50 hover:text-[var(--shopizz-obsidian)] transition-colors"
                  >
                    <span>📋</span>
                    <span>My Orders</span>
                  </NuxtLink>

                  <NuxtLink
                    to="/wishlist"
                    class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-[var(--shopizz-stone)]/50 hover:text-[var(--shopizz-obsidian)] transition-colors"
                  >
                    <span>♡</span>
                    <span>Saved Items</span>
                  </NuxtLink>

                  <!-- Become a Maker Quick Action -->
                  <NuxtLink
                    to="/account"
                    class="flex items-center justify-between rounded-xl bg-[var(--shopizz-saffron)]/10 border border-[var(--shopizz-saffron)]/20 px-2.5 py-2 text-[var(--shopizz-saffron)] hover:bg-[var(--shopizz-saffron)]/20 transition-colors font-medium mt-1"
                  >
                    <div class="flex items-center gap-2">
                      <span>🏪</span>
                      <span>Become a Maker</span>
                    </div>
                    <span class="text-[9px] font-bold uppercase tracking-wider bg-[var(--shopizz-saffron)] text-white px-1.5 py-0.5 rounded-full">Apply</span>
                  </NuxtLink>
                </template>
              </div>

              <!-- Logout -->
              <div class="border-t border-[var(--shopizz-obsidian)]/10 pt-2">
                <button
                  type="button"
                  :disabled="loggingOut"
                  class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                  @click="handleLogout"
                >
                  <span>🚪</span>
                  <span>{{ loggingOut ? 'Leaving...' : 'Logout' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Logged Out Guest Buttons (Sign In + Join Shopizz) -->
          <div v-else class="flex items-center gap-2">
            <NuxtLink
              to="/login"
              class="hidden sm:inline-flex items-center text-xs font-medium text-[var(--shopizz-obsidian)]/80 hover:text-[var(--shopizz-obsidian)] transition-colors px-2 py-1.5"
            >
              Sign In
            </NuxtLink>

            <NuxtLink
              to="/signup"
              class="inline-flex items-center gap-1.5 rounded-full bg-[#94442a] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#803922] active:scale-95"
            >
              <span>Join Shopizz</span>
            </NuxtLink>
          </div>

          <!-- Bag Pill Button -->
          <NuxtLink
            to="/cart"
            class="inline-flex items-center gap-1.5 rounded-full bg-[var(--shopizz-obsidian)] px-4 py-2 text-xs font-medium text-white transition-transform duration-200 hover:scale-105 shadow-sm"
            aria-label="Shopping Bag"
          >
            <span>Bag ({{ cartStore.itemCount }})</span>
          </NuxtLink>

          <!-- Mobile Hamburger -->
          <button
            type="button"
            class="flex items-center p-1 text-[var(--shopizz-obsidian)] lg:hidden"
            aria-label="Open menu"
            @click="appStore.toggleMenu()"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.75"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Categories Mega Menu Drawer Component -->
      <AppCategoriesDrawer
        :is-open="isCategoriesOpen"
        @close="isCategoriesOpen = false"
      />

      <!-- Live Search Drawer Component -->
      <AppSearchDrawer
        :is-open="isSearchDrawerOpen"
        @close="isSearchDrawerOpen = false"
      />

      <!-- Notification Drawer Component -->
      <AppNotificationDrawer />
    </header>
  </div>

  <AppMobileMenu />
</template>