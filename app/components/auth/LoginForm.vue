<script setup lang="ts">
const email = ref('')
const password = ref('')

const loading = ref(false)
const errorMessage = ref('')

const router = useRouter()
const auth = useAuth()

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter your email and password.'
    return
  }

  loading.value = true

  try {
    await auth.login(
      email.value,
      password.value,
    )

    if (auth.isAdmin.value) {
      await router.push('/admin')
      return
    }

    if (auth.isOwner.value) {
      await router.push('/owner')
      return
    }

    await router.push('/')
  } catch (error: any) {
    errorMessage.value =
      error?.data?.message ||
      error?.message ||
      'Unable to sign in. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form
    class="space-y-5"
    @submit.prevent="handleSubmit"
  >
    <AppInput
      v-model="email"
      label="Email"
      type="email"
      placeholder="you@example.com"
      autocomplete="email"
      :disabled="loading"
    />

    <AppInput
      v-model="password"
      label="Password"
      type="password"
      placeholder="••••••••"
      autocomplete="current-password"
      :disabled="loading"
    />

    <div
      v-if="errorMessage"
      class="rounded-2xl border border-[var(--shopizz-saffron)]/20 bg-[var(--shopizz-saffron)]/5 px-4 py-3 text-sm text-[var(--shopizz-saffron)]"
    >
      {{ errorMessage }}
    </div>

    <AppButton
      type="submit"
      size="lg"
      :disabled="loading"
      class="w-full"
    >
      {{ loading ? 'Signing in...' : 'Sign in' }}
    </AppButton>

    <p class="text-center text-sm text-[var(--shopizz-obsidian)]/50">
      Don't have an account?

      <NuxtLink
        to="/signup"
        class="font-medium text-[var(--shopizz-moss)] hover:underline"
      >
        Create one
      </NuxtLink>
    </p>
  </form>
</template>