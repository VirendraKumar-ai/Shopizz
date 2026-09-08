<script setup lang="ts">
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const userInitial = computed(() => user.value?.name?.charAt(0)?.toUpperCase() || 'D')

const navigation = [
  {
    label: 'My Account',
    to: '/account',
    icon: 'ph:user',
    exact: true,
  },
  {
    label: 'My Orders',
    to: '/account/orders',
    icon: 'ph:package',
  },
  {
    label: 'Returns & Refunds',
    to: '/account/returns',
    icon: 'ph:arrow-u-up-left',
  },
  {
    label: 'Saved Items',
    to: '/wishlist',
    icon: 'ph:heart',
  },
  {
    label: 'Addresses',
    to: '/account/addresses',
    icon: 'ph:map-pin',
  },
  {
    label: 'Payment Methods',
    to: '/account/payments',
    icon: 'ph:credit-card',
  },
  {
    label: 'Notifications',
    to: '/account/notifications',
    icon: 'ph:bell',
    badge: '3',
  },
  {
    label: 'Settings',
    to: '/account/settings',
    icon: 'ph:gear',
  },
]
</script>

<template>
  <aside class="w-full lg:w-64 shrink-0">
    <div class="space-y-6">
      <!-- User Profile Card matching Approved Design -->
      <div class="flex items-center gap-3 pb-5 border-b border-[#E8E2D8]">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1F2623] font-serif text-sm font-bold text-white shadow-sm">
          {{ userInitial }}
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="truncate text-xs font-bold text-[#1F2623]">
            {{ user?.name || 'Dave' }}
          </h3>
          <p class="truncate text-[11px] text-[#7A746B]">
            {{ user?.email || 'buyeronly@yopmail.com' }}
          </p>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="space-y-1">
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all group"
          :class="(item.exact ? $route.path === item.to : ($route.path === item.to || $route.path.startsWith(item.to)))
            ? 'bg-[#FDF3EE] font-semibold text-[#94442A] shadow-xs'
            : 'text-[#1F2623]/75 hover:bg-[#EAE4DC]/50 hover:text-[#1F2623]'"
        >
          <div class="flex items-center gap-3">
            <Icon
              :name="item.icon"
              class="h-4 w-4 transition-colors"
              :class="(item.exact ? $route.path === item.to : ($route.path === item.to || $route.path.startsWith(item.to))) ? 'text-[#94442A]' : 'text-[#7A746B] group-hover:text-[#1F2623]'"
            />
            <span>{{ item.label }}</span>
          </div>

          <span
            v-if="item.badge"
            class="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#94442A] px-1 text-[9px] font-bold text-white shadow-xs"
          >
            {{ item.badge }}
          </span>
        </NuxtLink>
      </nav>

      <!-- Bottom: Promo Card & Need Help? matching Approved Design -->
      <div class="pt-2 space-y-4">
        <!-- Curated For A Kinder Tomorrow Promo Card with Botanical Vase Image -->
        <div class="relative overflow-hidden rounded-2xl border border-[#E8DEC8] bg-[#FAF6F0] p-5 shadow-xs">
          <!-- Text Layer -->
          <div class="relative z-10 space-y-2">
            <p class="font-serif text-base font-bold text-[#1F2623] leading-tight">
              Curated<br>For A Kinder<br>Tomorrow
            </p>
            <p class="text-[10px] text-[#7A746B] leading-relaxed max-w-[130px]">
              Discover independent brands and soulful products.
            </p>
            <div class="pt-2">
              <NuxtLink
                to="/shop"
                class="inline-flex items-center gap-1 rounded-full border border-[#1F2623]/20 bg-white px-3.5 py-1 text-[10px] font-semibold text-[#1F2623] shadow-xs hover:bg-[#FAF8F5] transition-all hover:scale-105"
              >
                <span>Explore Now →</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Vase image overlay on right bottom corner -->
          <img
            src="/images/promo-vase.jpg"
            alt="Curated Collection"
            class="absolute -right-3 -bottom-2 h-28 w-24 object-cover object-center rounded-xl opacity-90 pointer-events-none"
          >
        </div>

        <!-- Need Help? Support link -->
        <div class="px-1 pt-1">
          <NuxtLink
            to="/about"
            class="flex items-center gap-3 text-xs text-[#1F2623] hover:text-[#94442A] transition-colors group"
          >
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#E8E2D8] text-[#1F2623] shrink-0 shadow-xs group-hover:border-[#94442A] transition-colors">
              <Icon name="ph:headphones" class="h-4 w-4 text-[#7A746B] group-hover:text-[#94442A]" />
            </div>
            <div>
              <p class="text-xs font-semibold text-[#1F2623]">Need Help?</p>
              <p class="text-[10px] text-[#94442A] font-medium">Contact Support →</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </aside>
</template>