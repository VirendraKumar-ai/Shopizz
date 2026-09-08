import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const {
    loggedIn,
    user,
    ready,
    refresh,
    logout,
    syncSession
  } = useAuth()

  const isAuthenticated = computed(() => {
    return loggedIn.value || !!user.value
  })

  const isAdmin = computed(() => {
    return user.value?.role === 'ADMIN'
  })

  const isBuyer = computed(() => {
    return user.value?.role === 'BUYER'
  })

  const isOwner = computed(() => {
    return user.value?.role === 'OWNER'
  })

  const logoutUser = async () => {
    await logout()
  }

  return {
    ready,
    loggedIn,
    user,

    isAuthenticated,
    isAdmin,
    isBuyer,
    isOwner,

    refresh,
    syncSession,
    logout: logoutUser
  }
})