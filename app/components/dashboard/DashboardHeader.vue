<script setup lang="ts">
import AppNotificationDrawer from '~/components/navigation/AppNotificationDrawer.vue'

const authStore = useAuthStore()
const { unreadCount, openDrawer, fetchNotifications } = useNotifications()

const loggingOut = ref(false)

onMounted(() => {
  fetchNotifications()
})

watch(
  () => authStore.user?.id,
  () => {
    fetchNotifications()
  }
)

const handleLogout = async () => {
  loggingOut.value = true

  try {
    await authStore.logout()
    await navigateTo('/login')
  } finally {
    loggingOut.value = false
  }
}

const userInitial = computed(() => {
  return authStore.user?.name?.charAt(0)?.toUpperCase() || 'U'
})

const roleLabel = computed(() => {
  return authStore.user?.role || 'BUYER'
})
</script>

<template>
  <header class="sticky top-0 z-40 bg-[var(--shopizz-porcelain)]">
    <!-- Top Terracotta Ribbon -->
    <div
      class="flex h-7 items-center justify-center gap-2 bg-[#94442a] px-4 text-center text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#fbf8f3]"
    >
      <span class="text-[9px] text-[#e8a38a]">✦</span>
      <span>Free shipping on orders above ₹1499 • Easy returns</span>
      <span class="text-[9px] text-[#e8a38a]">✦</span>
    </div>

    <!-- Main Header Bar -->
    <div
      class="flex h-16 items-center justify-between border-b border-[var(--shopizz-obsidian)]/10 px-6 backdrop-blur-md lg:px-10"
    >
      <!-- Left: Workspace Identity & Context -->
      <div class="flex items-center gap-3">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--shopizz-saffron)]">
            Shopizz Workspace
          </p>
          <p class="text-xs font-medium text-[var(--shopizz-obsidian)]/60">
            {{ authStore.user?.role === 'ADMIN' ? 'Marketplace Administration' : 'Owner Studio Workspace' }}
          </p>
        </div>
      </div>

      <!-- Right: Actions & User Identity -->
      <div class="flex items-center gap-3 sm:gap-4">
        <!-- View Storefront (Direct Link to Single Storefront /) -->
        <NuxtLink
          to="/"
          class="flex items-center gap-2 rounded-full border border-[var(--shopizz-obsidian)]/15 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-[var(--shopizz-obsidian)] transition-all duration-200 hover:border-[var(--shopizz-obsidian)] hover:bg-white"
        >
          <svg
            class="h-3.5 w-3.5 text-[var(--shopizz-saffron)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span class="hidden sm:inline">View Storefront</span>
          <span class="sm:hidden">Store</span>
        </NuxtLink>

        <!-- Notification Bell -->
        <button
          type="button"
          class="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--shopizz-obsidian)]/10 bg-white/50 text-[var(--shopizz-obsidian)]/70 transition-colors hover:bg-white hover:text-[var(--shopizz-obsidian)] cursor-pointer"
          aria-label="Notifications"
          @click="openDrawer"
        >
          <Icon name="ph:bell-bold" class="h-4 w-4" />
          <span
            v-if="unreadCount > 0"
            class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#94442a] px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-white"
          >
            {{ unreadCount }}
          </span>
        </button>

        <!-- User Identity Capsule -->
        <div class="flex items-center gap-2.5 rounded-full border border-[var(--shopizz-obsidian)]/10 bg-white/60 py-1 pl-1.5 pr-3">
          <div
            class="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--shopizz-obsidian)] text-xs font-semibold text-[#f7f4ee]"
          >
            {{ userInitial }}
          </div>
          <div class="text-left">
            <p class="text-xs font-medium leading-none text-[var(--shopizz-obsidian)]">
              {{ authStore.user?.name || 'Account' }}
            </p>
            <p class="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--shopizz-saffron)]">
              {{ roleLabel }}
            </p>
          </div>
        </div>

        <!-- Logout Button -->
        <button
          type="button"
          :disabled="loggingOut"
          class="rounded-full border border-[var(--shopizz-obsidian)]/15 px-3.5 py-1.5 text-xs font-medium text-[var(--shopizz-obsidian)] transition-all duration-200 hover:bg-[var(--shopizz-obsidian)] hover:text-white disabled:opacity-50"
          @click="handleLogout"
        >
          {{ loggingOut ? '...' : 'Logout' }}
        </button>
      </div>
    </div>

    <!-- Notification Drawer -->
    <AppNotificationDrawer />
  </header>
</template>