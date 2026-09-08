<script setup lang="ts">
const authStore = useAuthStore()
const cartStore = useCartStore()

const loggingOut = ref(false)
const searchQuery = ref('')

const handleLogout = async () => {
  loggingOut.value = true

  try {
    await authStore.logout()
    await navigateTo('/login')
  } finally {
    loggingOut.value = false
  }
}

const handleSearch = () => {
  const query = searchQuery.value.trim()

  if (!query) return

  navigateTo({
    path: '/account/products',
    query: {
      search: query,
    },
  })
}
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-[var(--shopizz-obsidian)]/10 bg-[var(--shopizz-porcelain)]/95 backdrop-blur-xl"
  >
    <div
      class="flex h-20 items-center gap-8 px-8 lg:px-10"
    >
      <!-- Workspace -->
      <div class="w-40 shrink-0">
        <p
          class="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--shopizz-saffron)]"
        >
          Shopizz
        </p>

        <p
          class="mt-1 text-xs text-[var(--shopizz-obsidian)]/45"
        >
          Shopping
        </p>
      </div>

      <!-- Search -->
      <form
        class="min-w-0 flex-1"
        @submit.prevent="handleSearch"
      >
        <div class="relative w-full max-w-3xl">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search products, shops or categories..."
            class="w-full border-b border-[var(--shopizz-obsidian)]/15 bg-transparent py-3 pr-10 text-sm outline-none transition-colors placeholder:text-[var(--shopizz-obsidian)]/35 focus:border-[var(--shopizz-obsidian)]"
          />

          <button
            type="submit"
            aria-label="Search"
            class="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-[var(--shopizz-obsidian)]/40 transition-colors hover:text-[var(--shopizz-obsidian)]"
          >
            →
          </button>
        </div>
      </form>

      <!-- User & Cart Actions -->
      <div class="flex shrink-0 items-center gap-4">
        <!-- Cart Button -->
        <NuxtLink
          to="/cart"
          class="relative flex items-center gap-2 rounded-full border border-[var(--shopizz-obsidian)]/10 bg-white/40 px-4 py-2 text-xs font-medium text-[var(--shopizz-obsidian)]/80 transition-all hover:bg-white hover:text-[var(--shopizz-obsidian)]"
          aria-label="Shopping Bag"
        >
          <span>Bag</span>
          <span
            v-if="cartStore.itemCount > 0"
            class="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--shopizz-saffron)] text-[9px] font-bold text-white"
          >
            {{ cartStore.itemCount }}
          </span>
        </NuxtLink>

        <!-- User info -->
        <div class="hidden text-right sm:block">
          <p class="text-sm font-medium leading-tight">
            {{ authStore.user?.name || 'User' }}
          </p>

          <p
            class="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--shopizz-obsidian)]/40"
          >
            {{ authStore.user?.role || 'BUYER' }}
          </p>
        </div>

        <!-- Avatar -->
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--shopizz-moss)] text-sm font-medium text-[var(--shopizz-porcelain)]"
        >
          {{
            authStore.user?.name
              ?.charAt(0)
              ?.toUpperCase() || 'U'
          }}
        </div>

        <!-- Logout -->
        <button
          type="button"
          :disabled="loggingOut"
          class="shrink-0 rounded-full border border-[var(--shopizz-obsidian)]/10 px-5 py-2.5 text-xs font-medium transition-all duration-200 hover:bg-[var(--shopizz-obsidian)] hover:text-white disabled:opacity-50"
          @click="handleLogout"
        >
          {{ loggingOut ? 'Leaving...' : 'Logout' }}
        </button>
      </div>
    </div>
  </header>
</template>