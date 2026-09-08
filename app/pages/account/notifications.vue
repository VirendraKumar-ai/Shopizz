<script setup lang="ts">
definePageMeta({
  layout: 'account',
  middleware: ['auth'],
})

const activeTab = ref<'ALL' | 'ORDERS' | 'OFFERS' | 'RETURNS'>('ALL')

const {
  data,
  pending,
  refresh,
} = await useFetch<any>('/api/notifications')

const notificationsList = computed(() => data.value?.notifications || [])
const unreadCount = computed(() => data.value?.unreadCount || 0)

const filteredNotifications = computed(() => {
  if (activeTab.value === 'ALL') return notificationsList.value
  if (activeTab.value === 'ORDERS') {
    return notificationsList.value.filter((n: any) => n.type?.includes('ORDER') || n.title?.toLowerCase().includes('order'))
  }
  if (activeTab.value === 'RETURNS') {
    return notificationsList.value.filter((n: any) => n.type?.includes('RETURN') || n.title?.toLowerCase().includes('return'))
  }
  return notificationsList.value.filter((n: any) => n.type?.includes('OFFER') || n.type?.includes('PROMO'))
})

async function markAsRead(notification: any) {
  if (notification.isRead) return
  try {
    await $fetch(`/api/notifications/${notification.id}/read`, { method: 'PATCH' })
    await refresh()
  } catch (err) {
    console.error('Error marking as read:', err)
  }
}

async function markAllAsRead() {
  try {
    await $fetch('/api/notifications/read-all', { method: 'POST' })
    await refresh()
  } catch (err) {
    console.error('Error marking all as read:', err)
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>

<template>
  <div class="space-y-8">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-[#94442A]">
      <NuxtLink to="/account" class="hover:underline">My Account</NuxtLink>
      <span class="text-[#7A746B]">&gt;</span>
      <span class="text-[#1F2623] font-medium">Notifications</span>
    </nav>

    <!-- Page Header -->
    <section class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E8E2D8]">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1F2623]">
            Notifications
          </h1>
          <span
            v-if="unreadCount > 0"
            class="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#94442A] px-2 text-xs font-bold text-white shadow-xs"
          >
            {{ unreadCount }}
          </span>
        </div>
        <p class="mt-1 text-xs sm:text-sm text-[#7A746B]">
          Stay updated on your order fulfillments, deliveries, returns, and studio news.
        </p>
      </div>

      <button
        v-if="unreadCount > 0"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-full border border-[#D5CEC4] bg-white px-4 py-2 text-xs font-semibold text-[#1F2623] shadow-xs hover:bg-[#FAF8F5] transition-all cursor-pointer"
        @click="markAllAsRead"
      >
        <span>✓ Mark all as read</span>
      </button>
    </section>

    <!-- Filter Tabs -->
    <div class="flex items-center gap-2 border-b border-[#E8E2D8] pb-1 overflow-x-auto">
      <button
        v-for="t in [
          { id: 'ALL', label: 'All' },
          { id: 'ORDERS', label: 'Orders' },
          { id: 'RETURNS', label: 'Returns & Refunds' },
          { id: 'OFFERS', label: 'Offers' },
        ]"
        :key="t.id"
        type="button"
        class="px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap"
        :class="activeTab === t.id ? 'bg-[#1F2623] text-white shadow-xs' : 'text-[#7A746B] hover:bg-white hover:text-[#1F2623]'"
        @click="activeTab = t.id as any"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="py-16 text-center text-xs text-[#7A746B]">
      Loading notifications...
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredNotifications.length === 0"
      class="rounded-3xl border border-dashed border-[#E8E2D8] bg-white p-12 text-center space-y-3"
    >
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF8F5] text-xl text-[#94442A]">
        🔔
      </div>
      <h3 class="font-serif text-lg font-bold text-[#1F2623]">
        No notifications here
      </h3>
      <p class="text-xs text-[#7A746B]">
        You're all caught up on all activity.
      </p>
    </div>

    <!-- Notifications List -->
    <div v-else class="space-y-3">
      <article
        v-for="n in filteredNotifications"
        :key="n.id"
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4.5 transition-all"
        :class="n.isRead ? 'border-[#E8E2D8] bg-white hover:border-[#D5CEC4]' : 'border-[#94442A]/30 bg-[#FDF3EE]/40 ring-1 ring-[#94442A]/20 shadow-xs'"
        @click="markAsRead(n)"
      >
        <div class="flex items-start gap-3.5">
          <!-- Icon Capsule -->
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base shadow-xs"
            :class="n.type?.includes('ORDER') ? 'bg-[#EBF3EE] text-[#2D5A43]' : n.type?.includes('RETURN') ? 'bg-[#FDF3EE] text-[#94442A]' : 'bg-[#FAF8F5] text-[#1F2623]'"
          >
            {{ n.type?.includes('ORDER') ? '📦' : n.type?.includes('RETURN') ? '↩' : '✨' }}
          </div>

          <!-- Message -->
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <h4 class="font-serif text-sm font-bold text-[#1F2623]">{{ n.title }}</h4>
              <span v-if="!n.isRead" class="h-2 w-2 rounded-full bg-[#94442A]" />
            </div>
            <p class="text-xs text-[#5A544A] leading-relaxed">{{ n.message }}</p>
            <p class="text-[10px] text-[#A8A196] pt-0.5">{{ formatDate(n.createdAt) }}</p>
          </div>
        </div>

        <!-- Action Link -->
        <div v-if="n.link" class="shrink-0 self-end sm:self-center">
          <NuxtLink
            :to="n.link"
            class="inline-flex items-center gap-1 rounded-full border border-[#D5CEC4] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1F2623] shadow-xs hover:bg-[#FAF8F5] transition-colors"
          >
            <span>View →</span>
          </NuxtLink>
        </div>
      </article>
    </div>
  </div>
</template>
