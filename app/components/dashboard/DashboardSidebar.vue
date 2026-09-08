<script setup lang="ts">
const authStore = useAuthStore()
const cartStore = useCartStore()

const userRole = computed(() => authStore.user?.role)

// Fetch pending applications count for Admin badge
const { data: adminAppsData } = await useFetch<{
  success: boolean
  applications: any[]
}>('/api/admin/owner-applications', {
  lazy: true,
  server: false,
  immediate: userRole.value === 'ADMIN',
})

const pendingRequestsCount = computed(() => {
  if (userRole.value !== 'ADMIN') return 0
  return adminAppsData.value?.applications?.length ?? 0
})
</script>

<template>
  <aside
    class="hidden w-64 shrink-0 border-r border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] lg:block"
  >
    <div class="sticky top-0 flex h-screen flex-col overflow-y-auto p-6 scrollbar-thin">
      <!-- Top Brand Logo -->
      <div class="pb-6 border-b border-[var(--shopizz-obsidian)]/10">
        <NuxtLink
          to="/"
          class="group block"
        >
          <div class="flex items-center gap-2">
            <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--shopizz-obsidian)] text-xs text-white">
              🌿
            </span>
            <span class="font-serif text-lg font-bold tracking-tight text-[var(--shopizz-obsidian)]">
              SHOPIZZ
            </span>
          </div>
          <p class="mt-1 text-[10px] uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/40">
            Editorial Marketplace
          </p>
        </NuxtLink>
      </div>

      <!-- ADMIN Navigation -->
      <div
        v-if="userRole === 'ADMIN'"
        class="mt-6 space-y-6"
      >
        <!-- Section: Admin Panel -->
        <div>
          <p class="px-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--shopizz-saffron)]">
            Admin Panel
          </p>

          <nav class="mt-2.5 space-y-1">
            <NuxtLink
              to="/admin"
              exact-active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                <span>Overview</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/admin/requests"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Owner Requests</span>
              </div>
              <span
                v-if="pendingRequestsCount > 0"
                class="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#94442a] px-1.5 text-[10px] font-bold text-white"
              >
                {{ pendingRequestsCount }}
              </span>
            </NuxtLink>

            <NuxtLink
              to="/admin/owners"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>Owners</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/admin/products"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span>Products Catalog</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/admin/categories"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span>Categories</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/admin/orders"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>Orders</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/admin/returns"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M16 15v-1a4 4 0 00-4-4H4m0 0l3-3m-3 3l3 3m5 4v1a4 4 0 004 4h8m0 0l-3-3m3 3l-3 3"
                  />
                </svg>
                <span>Returns & Refunds</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/admin/reviews"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                <span>Reviews Moderation</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/admin/users"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span>Users & Roles</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/admin/support"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <span>Support & Concierge</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/admin/settings"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Platform Settings</span>
              </div>
            </NuxtLink>
          </nav>
        </div>

        <!-- Section: Marketplace Storefront Links -->
        <div class="pt-4 border-t border-[var(--shopizz-obsidian)]/10">
          <p class="px-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--shopizz-saffron)]">
            Marketplace
          </p>

          <nav class="mt-2.5 space-y-1">
            <NuxtLink
              to="/"
              class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <svg
                class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>View Storefront</span>
            </NuxtLink>

            <NuxtLink
              to="/"
              class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <svg
                class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back to Home</span>
            </NuxtLink>
          </nav>
        </div>
      </div>

      <!-- OWNER Navigation -->
      <div
        v-else-if="userRole === 'OWNER'"
        class="mt-6 space-y-6"
      >
        <!-- Section: Owner Workspace -->
        <div>
          <p class="px-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--shopizz-saffron)]">
            Owner Workspace
          </p>

          <nav class="mt-2.5 space-y-1">
            <NuxtLink
              to="/owner"
              exact-active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                <span>Overview</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/owner/products"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span>Products</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/owner/orders"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>Orders</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/owner/returns"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M16 15v-1a4 4 0 00-4-4H4m0 0l3-3m-3 3l3 3m5 4v1a4 4 0 004 4h8m0 0l-3-3m3 3l-3 3"
                  />
                </svg>
                <span>Returns & Refunds</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/owner/sales"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <span>Sales & Analytics</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/owner/payouts"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span>Payouts & Finances</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/owner/messages"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <span>Messages & Chat</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/owner/reviews"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                <span>Customer Reviews</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/owner/shop"
              active-class="bg-[#ebe3d5] font-semibold text-[var(--shopizz-obsidian)] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Shop Settings</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/owner/account"
              active-class="bg-[#FDF3EE] font-semibold text-[#94442A] shadow-sm"
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)]"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Account</span>
              </div>
            </NuxtLink>

            <button
              type="button"
              class="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70 transition-all hover:bg-[#ede5d8] hover:text-[var(--shopizz-obsidian)] cursor-pointer"
            >
              <div class="flex items-center gap-2.5">
                <svg
                  class="h-4 w-4 text-[var(--shopizz-obsidian)]/60"
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
                <span>Notifications</span>
              </div>
            </button>
          </nav>
        </div>

        <!-- Grow Your Brand With Shopizz Promo Card matching Image 2 -->
        <div class="relative overflow-hidden rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[#FAF8F5] p-4.5 space-y-2.5 shadow-sm">
          <p class="font-serif text-sm font-semibold text-[#1F2623] leading-snug">
            Grow<br>Your Brand<br>With Shopizz
          </p>
          <p class="text-[10px] text-[#7A746B] leading-relaxed">
            Tools, insights and a community to help you go further.
          </p>
          <NuxtLink
            to="/about"
            class="inline-flex items-center gap-1.5 rounded-full border border-[#1F2623]/20 bg-white px-3.5 py-1.5 text-[11px] font-semibold text-[#1F2623] shadow-sm hover:bg-[#FAF8F5] transition-colors"
          >
            <span>View Resources →</span>
          </NuxtLink>
        </div>

        <!-- Need Help? Support Contact Box -->
        <div class="pt-2">
          <NuxtLink
            to="/about"
            class="flex items-center gap-2 text-[11px] font-semibold text-[#1F2623] hover:text-[#94442A] transition-colors"
          >
            <span>🎧</span>
            <span>Need Help? Contact Support →</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Footer Brand Info -->
      <div class="mt-auto pt-6 border-t border-[var(--shopizz-obsidian)]/10">
        <p class="text-[10px] uppercase font-medium tracking-[0.16em] text-[var(--shopizz-obsidian)]/45">
          Shopizz
        </p>
        <p class="mt-0.5 text-[10px] text-[var(--shopizz-obsidian)]/40 leading-normal">
          A marketplace for independent shops.
        </p>
      </div>
    </div>
  </aside>
</template>