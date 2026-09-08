export interface NotificationItem {
  id: string
  userId?: string | null
  role?: string | null
  type: string
  title: string
  message: string
  link?: string | null
  isRead: boolean
  createdAt: string
}

export const useNotifications = () => {
  const isOpen = useState<boolean>('notifications_drawer_open', () => false)
  const notifications = useState<NotificationItem[]>('notifications_items', () => [])
  const unreadCount = useState<number>('notifications_unread_count', () => 0)
  const loading = useState<boolean>('notifications_is_loading', () => false)

  const { loggedIn } = useAuth()

  const fetchNotifications = async () => {
    if (!loggedIn.value) {
      notifications.value = []
      unreadCount.value = 0
      return
    }

    try {
      loading.value = true
      const res = await $fetch<{
        success: boolean
        notifications: NotificationItem[]
        unreadCount: number
      }>('/api/notifications')

      if (res?.success) {
        notifications.value = res.notifications || []
        unreadCount.value = res.unreadCount || 0
      }
    } catch (err) {
      console.error('[Notifications fetch error]:', err)
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const target = notifications.value.find((n) => n.id === id)
      if (target && !target.isRead) {
        target.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }

      await $fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      })
    } catch (err) {
      console.error('[Notification mark read error]:', err)
      await fetchNotifications()
    }
  }

  const markAllAsRead = async () => {
    try {
      notifications.value.forEach((n) => {
        n.isRead = true
      })
      unreadCount.value = 0

      await $fetch('/api/notifications/read-all', {
        method: 'POST',
      })
    } catch (err) {
      console.error('[Notifications mark all read error]:', err)
      await fetchNotifications()
    }
  }

  const openDrawer = () => {
    isOpen.value = true
    fetchNotifications()
  }

  const closeDrawer = () => {
    isOpen.value = false
  }

  const toggleDrawer = () => {
    if (!isOpen.value) {
      openDrawer()
    } else {
      closeDrawer()
    }
  }

  return {
    isOpen,
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  }
}
