<script setup lang="ts">
const appStore = useAppStore()
const authStore = useAuthStore()

const isAuthenticated = computed(() => !!authStore.user)

const closeMenu = () => {
  appStore.closeMenu()
}
</script>

<template>
  <Transition name="mobile-menu">
    <div
      v-if="appStore.isMenuOpen"
      class="fixed inset-0 z-[60] min-h-screen bg-[var(--shopizz-porcelain)] p-6 md:hidden"
    >
      <div class="flex items-center justify-between">
        <AppLogo />

        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--shopizz-obsidian)]/10 text-2xl"
          aria-label="Close menu"
          @click="closeMenu"
        >
          ×
        </button>
      </div>

      <nav class="mt-20 flex flex-col gap-5">
        <NuxtLink
          to="/shop"
          class="text-3xl font-medium tracking-[-0.03em]"
          @click="closeMenu"
        >
          Shop
        </NuxtLink>

        <NuxtLink
          to="/shop"
          class="text-3xl font-medium tracking-[-0.03em]"
          @click="closeMenu"
        >
          Categories
        </NuxtLink>

        <NuxtLink
          to="/#shops"
          class="text-3xl font-medium tracking-[-0.03em]"
          @click="closeMenu"
        >
          Shops
        </NuxtLink>

        <NuxtLink
          to="/about"
          class="text-3xl font-medium tracking-[-0.03em]"
          @click="closeMenu"
        >
          About
        </NuxtLink>

        <NuxtLink
          to="/journal"
          class="text-3xl font-medium tracking-[-0.03em]"
          @click="closeMenu"
        >
          Journal
        </NuxtLink>

        <template v-if="!isAuthenticated">
          <NuxtLink
            to="/login"
            class="mt-4 text-2xl font-medium tracking-[-0.03em] text-[var(--shopizz-obsidian)]/60"
            @click="closeMenu"
          >
            Login
          </NuxtLink>

          <NuxtLink
            to="/signup"
            class="text-2xl font-medium tracking-[-0.03em] text-[var(--shopizz-moss)]"
            @click="closeMenu"
          >
            Join Shopizz
          </NuxtLink>
        </template>

        <NuxtLink
          v-else
          to="/account"
          class="mt-4 text-2xl font-medium tracking-[-0.03em] text-[var(--shopizz-moss)]"
          @click="closeMenu"
        >
          My Account
        </NuxtLink>
      </nav>
    </div>
  </Transition>
</template>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 200ms ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}
</style>