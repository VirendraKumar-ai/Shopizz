<script setup lang="ts">
const {
  isOpen,
  notifications,
  unreadCount,
  loading,
  closeDrawer,
  markAsRead,
  markAllAsRead,
} = useNotifications()

const router = useRouter()

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'WELCOME':
      return 'ph:sparkle-fill'
    case 'APPLICATION_SUBMITTED':
      return 'ph:storefront-bold'
    case 'OWNER_APPLICATION_APPROVED':
      return 'ph:check-circle-fill'
    case 'OWNER_APPLICATION_REJECTED':
      return 'ph:x-circle-fill'
    case 'PRODUCT_CREATED':
      return 'ph:package-fill'
    default:
      return 'ph:bell-fill'
  }
}

const getIconColorClass = (type: string) => {
  switch (type) {
    case 'OWNER_APPLICATION_APPROVED':
      return 'text-[#2e6644] bg-[#2e6644]/10'
    case 'OWNER_APPLICATION_REJECTED':
      return 'text-[#94442a] bg-[#94442a]/10'
    case 'PRODUCT_CREATED':
      return 'text-[#8c5025] bg-[#8c5025]/10'
    case 'APPLICATION_SUBMITTED':
      return 'text-[#3b5443] bg-[#3b5443]/10'
    default:
      return 'text-[#7d7162] bg-[#f0eae1]'
  }
}

const handleNotificationClick = async (item: any) => {
  if (!item.isRead) {
    await markAsRead(item.id)
  }
  if (item.type === 'OWNER_APPLICATION_APPROVED') {
    const authStore = useAuthStore()
    await authStore.syncSession()
  }
  if (item.link) {
    closeDrawer()
    router.push(item.link)
  }
}

// Close on ESC
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    closeDrawer()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm"
        @click="closeDrawer"
      />
    </Transition>

    <!-- Slide-over Drawer -->
    <Transition
      enter-active-class="transition transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="isOpen"
        class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#FAF8F5] border-l border-[#E5DFD7] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Notifications Drawer"
      >
        <!-- Drawer Header -->
        <div class="flex items-center justify-between border-b border-[#E8E2D8] px-6 py-4 bg-white/80 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#202923] text-white">
              <Icon name="ph:bell-fill" class="h-4 w-4" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base font-semibold text-[#1F2623] tracking-tight">Notifications</h2>
                <span
                  v-if="unreadCount > 0"
                  class="inline-flex items-center rounded-full bg-[#94442A] px-2 py-0.5 text-[11px] font-bold text-white shadow-sm"
                >
                  {{ unreadCount }} new
                </span>
              </div>
              <p class="text-xs text-[#7A746B]">Activity, reviews & updates</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="notifications.length > 0 && unreadCount > 0"
              type="button"
              class="text-xs font-semibold text-[#202923] hover:text-[#94442A] transition-colors px-2 py-1 rounded-lg hover:bg-stone-100"
              @click="markAllAsRead"
            >
              Mark all read
            </button>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-[#666] hover:bg-stone-200/60 transition-colors"
              aria-label="Close notification drawer"
              @click="closeDrawer"
            >
              <Icon name="ph:x-bold" class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Drawer Content -->
        <div class="flex-1 overflow-y-auto divide-y divide-[#EFE9E0]">
          <!-- Loading State -->
          <div v-if="loading && notifications.length === 0" class="p-8 text-center text-sm text-[#7A746B]">
            <div class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#202923] border-t-transparent" />
            <p class="mt-2 font-medium">Checking for notifications...</p>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="notifications.length === 0"
            class="flex flex-col items-center justify-center px-6 py-20 text-center"
          >
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#EDE6DC] text-[#7A746B] mb-4">
              <Icon name="ph:bell-slash-light" class="h-7 w-7" />
            </div>
            <h3 class="font-serif text-lg font-medium text-[#1F2623]">All caught up!</h3>
            <p class="mt-1 max-w-xs text-xs text-[#7A746B] leading-relaxed">
              You have no notifications right now. Activity and updates will appear here in real time.
            </p>
          </div>

          <!-- Notification Items List -->
          <div
            v-for="item in notifications"
            :key="item.id"
            class="group relative flex gap-3.5 p-5 transition-colors cursor-pointer"
            :class="item.isRead ? 'bg-transparent hover:bg-white/60' : 'bg-[#F2ECE1]/50 hover:bg-[#EAE2D5]'"
            @click="handleNotificationClick(item)"
          >
            <!-- Unread indicator dot -->
            <div
              v-if="!item.isRead"
              class="absolute left-2 top-6 h-2 w-2 rounded-full bg-[#94442A]"
            />

            <!-- Icon -->
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
              :class="getIconColorClass(item.type)"
            >
              <Icon :name="getNotificationIcon(item.type)" class="h-4 w-4" />
            </div>

            <!-- Text Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline justify-between gap-2">
                <p
                  class="text-xs font-bold tracking-tight truncate"
                  :class="item.isRead ? 'text-[#3E4741]' : 'text-[#1F2623]'"
                >
                  {{ item.title }}
                </p>
                <span class="text-[10px] font-medium text-[#8F877C] shrink-0">
                  {{ formatTimeAgo(item.createdAt) }}
                </span>
              </div>

              <p class="mt-1 text-xs text-[#5D574E] leading-relaxed line-clamp-2">
                {{ item.message }}
              </p>

              <!-- Optional Action Link Indicator -->
              <div v-if="item.link" class="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-[#202923] group-hover:text-[#94442A]">
                <span>View details</span>
                <Icon name="ph:arrow-right" class="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>

            <!-- Single Mark as Read Button -->
            <div v-if="!item.isRead" class="shrink-0 self-center">
              <button
                type="button"
                title="Mark as read"
                class="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-full hover:bg-stone-200 text-stone-600 transition-opacity"
                @click.stop="markAsRead(item.id)"
              >
                <Icon name="ph:check" class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Drawer Footer -->
        <div class="border-t border-[#E8E2D8] bg-[#F4EFE6] px-6 py-3 text-center">
          <p class="text-[11px] text-[#7A746B]">
            Shopizz Notification Center
          </p>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
