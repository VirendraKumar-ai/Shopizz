export default defineNuxtRouteMiddleware(async () => {
  const {
    loggedIn,
    user,
    ready,
    refresh
  } = useAuth()

  if (!ready.value) {
    await refresh()
  }

  if (!loggedIn.value) {
    return navigateTo('/login')
  }

  if (user.value?.role !== 'OWNER') {
    return navigateTo('/403')
  }
})