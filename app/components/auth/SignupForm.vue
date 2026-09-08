<script setup lang="ts">
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const otp = ref('')

const step = ref<'details' | 'otp'>('details')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const resendTimer = ref(0)
let timerInterval: any = null

const router = useRouter()
const auth = useAuth()

const startResendTimer = () => {
  resendTimer.value = 60
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--
    } else {
      clearInterval(timerInterval)
    }
  }, 1000)
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const handleSendOtp = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (
    !name.value ||
    !email.value ||
    !password.value ||
    !confirmPassword.value
  ) {
    errorMessage.value = 'Please complete all fields.'
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  loading.value = true

  try {
    await auth.sendOtp(
      name.value,
      email.value,
      password.value,
    )
    step.value = 'otp'
    startResendTimer()
  } catch (error: any) {
    errorMessage.value =
      error?.data?.message ||
      error?.data?.statusMessage ||
      error?.statusMessage ||
      error?.message ||
      'Unable to send verification code.'
  } finally {
    loading.value = false
  }
}

const handleVerifyOtp = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  const cleanOtp = otp.value.trim()
  if (!cleanOtp || cleanOtp.length !== 6) {
    errorMessage.value = 'Please enter the 6-digit verification code.'
    return
  }

  loading.value = true

  try {
    await auth.verifyOtp(email.value, cleanOtp)
    await router.push('/')
  } catch (error: any) {
    errorMessage.value =
      error?.data?.message ||
      error?.data?.statusMessage ||
      error?.statusMessage ||
      error?.message ||
      'Invalid or expired verification code.'
  } finally {
    loading.value = false
  }
}

const handleResend = async () => {
  if (resendTimer.value > 0 || loading.value) return
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    await auth.resendOtp(email.value)
    successMessage.value = 'A fresh 6-digit code has been sent to your email.'
    startResendTimer()
  } catch (error: any) {
    errorMessage.value =
      error?.data?.message ||
      error?.data?.statusMessage ||
      error?.statusMessage ||
      error?.message ||
      'Failed to resend code.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- STEP 1: Details -->
    <form
      v-if="step === 'details'"
      class="space-y-5"
      @submit.prevent="handleSendOtp"
    >
      <AppInput
        v-model="name"
        label="Full Name"
        placeholder="e.g. Maya Lin"
        autocomplete="name"
        :disabled="loading"
      />

      <AppInput
        v-model="email"
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        autocomplete="email"
        :disabled="loading"
      />

      <AppInput
        v-model="password"
        label="Password"
        type="password"
        placeholder="Minimum 8 characters"
        autocomplete="new-password"
        :disabled="loading"
      />

      <AppInput
        v-model="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Repeat your password"
        autocomplete="new-password"
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
        {{ loading ? 'Sending verification code...' : 'Continue to Email Verification' }}
      </AppButton>

      <p class="text-center text-sm text-[var(--shopizz-obsidian)]/50">
        Already have an account?

        <NuxtLink
          to="/login"
          class="font-medium text-[var(--shopizz-moss)] hover:underline"
        >
          Sign in
        </NuxtLink>
      </p>
    </form>

    <!-- STEP 2: OTP Verification -->
    <form
      v-else
      class="space-y-5"
      @submit.prevent="handleVerifyOtp"
    >
      <div class="rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] p-5 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#202923] text-white shadow-sm mb-3">
          <Icon name="ph:envelope-simple-open-bold" class="h-6 w-6" />
        </div>
        <h3 class="font-serif text-lg font-semibold text-[#1F2623]">Verify your email</h3>
        <p class="mt-1 text-xs text-[#7A746B] leading-relaxed">
          We sent a 6-digit confirmation code to <br />
          <span class="font-semibold text-[#1F2623]">{{ email }}</span>
        </p>
        <button
          type="button"
          class="mt-2 text-xs font-semibold text-[#94442A] hover:underline"
          @click="step = 'details'; errorMessage = ''; successMessage = ''"
        >
          Edit email or details
        </button>
      </div>

      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-[#7A746B] mb-2 text-center">
          6-Digit Verification Code
        </label>
        <input
          v-model="otp"
          type="text"
          maxlength="6"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="••••••"
          autofocus
          class="w-full text-center text-3xl font-mono font-bold tracking-[0.4em] py-3.5 px-4 rounded-2xl border border-[#E8E2D8] bg-white text-[#1F2623] focus:border-[#202923] focus:outline-none focus:ring-2 focus:ring-[#202923]/10 transition-all shadow-sm"
          :disabled="loading"
        />
        <p class="mt-2 text-center text-[11px] text-[#7A746B]">
          Code expires in 10 minutes.
        </p>
      </div>

      <div
        v-if="errorMessage"
        class="rounded-2xl border border-[var(--shopizz-saffron)]/20 bg-[var(--shopizz-saffron)]/5 px-4 py-3 text-sm text-[var(--shopizz-saffron)]"
      >
        {{ errorMessage }}
      </div>

      <div
        v-if="successMessage"
        class="rounded-2xl border border-[#2e6644]/20 bg-[#2e6644]/10 px-4 py-3 text-sm text-[#2e6644]"
      >
        {{ successMessage }}
      </div>

      <AppButton
        type="submit"
        size="lg"
        :disabled="loading || otp.length < 6"
        class="w-full"
      >
        {{ loading ? 'Verifying...' : 'Verify & Create Account' }}
      </AppButton>

      <!-- Resend Code section -->
      <div class="pt-2 text-center">
        <p class="text-xs text-[#7A746B]">
          Didn't receive the code?
          <button
            v-if="resendTimer === 0"
            type="button"
            class="font-semibold text-[#202923] hover:text-[#94442A] hover:underline ml-1"
            :disabled="loading"
            @click="handleResend"
          >
            Resend code
          </button>
          <span v-else class="text-[#999] ml-1 font-medium">
            Resend in {{ resendTimer }}s
          </span>
        </p>
      </div>
    </form>
  </div>
</template>