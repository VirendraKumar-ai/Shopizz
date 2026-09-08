export default defineNuxtRouteMiddleware(async () => {
  const {
    loggedIn,
    ready,
    refresh
  } = useAuth()

  if (!ready.value) {
    await refresh()
  }

  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})