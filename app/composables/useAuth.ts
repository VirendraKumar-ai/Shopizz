export const useAuth = () => {
  const {
    loggedIn,
    user,
    ready,
    fetch,
    clear
  } = useUserSession()

  const login = async (
    email: string,
    password: string
  ) => {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email,
        password
      }
    })

    await fetch()
  }

  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        name,
        email,
        password
      }
    })

    await fetch()
  }

  const sendOtp = async (
    name: string,
    email: string,
    password: string
  ) => {
    return await $fetch('/api/auth/send-otp', {
      method: 'POST',
      body: {
        name,
        email,
        password
      }
    })
  }

  const verifyOtp = async (
    email: string,
    otp: string
  ) => {
    const res = await $fetch<{ success: boolean; user: any }>('/api/auth/verify-otp', {
      method: 'POST',
      body: {
        email,
        otp
      }
    })

    await fetch()
    return res
  }

  const resendOtp = async (email: string) => {
    return await $fetch('/api/auth/resend-otp', {
      method: 'POST',
      body: {
        email
      }
    })
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', {
      method: 'POST'
    })
    await clear()
  }

  const syncSession = async () => {
    try {
      const res = await $fetch<{ success: boolean; user: any; synced: boolean }>('/api/auth/sync-session', {
        method: 'POST',
      })
      if (res?.synced) {
        await fetch()
      }
      return res
    } catch {
      return { success: false, user: null, synced: false }
    }
  }

  const isAdmin = computed(() => {
    return user.value?.role === 'ADMIN'
  })

  const isBuyer = computed(() => {
    return user.value?.role === 'BUYER'
  })

  const isOwner = computed(() => {
    return user.value?.role === 'OWNER'
  })

  const isAuthenticated = computed(() => {
    return loggedIn.value || !!user.value
  })

  return {
    ready,
    loggedIn,
    user,

    isAdmin,
    isBuyer,
    isOwner,
    isAuthenticated,

    login,
    register,
    sendOtp,
    verifyOtp,
    resendOtp,
    logout,
    syncSession,

    refresh: fetch
  }
}