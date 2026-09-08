<script setup lang="ts">
definePageMeta({
  layout: 'account',
  middleware: ['auth'],
})

const authStore = useAuthStore()

// Fetch current user application status
const {
  data: appData,
  pending: appLoading,
  refresh: refreshApplication,
} = await useFetch<{
  application: any
}>('/api/owner/application')

const application = computed(() => appData.value?.application)

const form = ref({
  shopName: '',
  description: '',
  phone: '',
  address: '',
  reason: '',
})

const submitting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleApply = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  if (!form.value.shopName.trim()) {
    errorMsg.value = 'Shop name is required'
    return
  }

  submitting.value = true

  try {
    await $fetch('/api/owner/apply', {
      method: 'POST',
      body: {
        shopName: form.value.shopName.trim(),
        description: form.value.description.trim(),
        phone: form.value.phone.trim(),
        address: form.value.address.trim(),
        reason: form.value.reason.trim(),
      },
    })

    successMsg.value = 'Your owner application has been submitted successfully.'
    await refreshApplication()
  } catch (err: any) {
    errorMsg.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      'Failed to submit application. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="space-y-10">
    <!-- Header -->
    <section>
      <p class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]">
        Account / Settings
      </p>

      <h1 class="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
        Settings & Seller Portal
      </h1>

      <p class="mt-3 max-w-2xl text-sm leading-7 text-[var(--shopizz-obsidian)]/55">
        Manage your preferences or apply to open an independent seller workspace.
      </p>
    </section>

    <!-- If user is OWNER -->
    <section
      v-if="authStore.user?.role === 'OWNER'"
      class="max-w-3xl rounded-3xl border border-[var(--shopizz-moss)]/20 bg-[var(--shopizz-moss)]/5 p-8"
    >
      <p class="text-[10px] font-medium uppercase tracking-wider text-[var(--shopizz-moss)]">
        Shop Owner Status
      </p>
      <h2 class="mt-3 text-2xl font-medium tracking-tight">
        You are an approved Shop Owner
      </h2>
      <p class="mt-2 text-sm text-[var(--shopizz-obsidian)]/60">
        You have full access to manage your independent shop, publish products, manage inventory, and fulfill orders.
      </p>
      <div class="mt-6">
        <NuxtLink to="/owner">
          <AppButton>
            Go to Owner Workspace →
          </AppButton>
        </NuxtLink>
      </div>
    </section>

    <!-- If user has pending application -->
    <section
      v-else-if="application && application.status === 'PENDING'"
      class="max-w-3xl space-y-4 rounded-3xl border border-[var(--shopizz-saffron)]/20 bg-[var(--shopizz-saffron)]/5 p-8"
    >
      <div class="flex items-center justify-between">
        <p class="text-[10px] font-medium uppercase tracking-wider text-[var(--shopizz-saffron)]">
          Application In Review
        </p>
        <AppBadge variant="warning">
          PENDING REVIEW
        </AppBadge>
      </div>

      <h2 class="text-2xl font-medium tracking-tight">
        {{ application.shopName }}
      </h2>

      <p class="text-sm text-[var(--shopizz-obsidian)]/65">
        Your application to become a Shopizz independent seller was submitted on {{ new Date(application.createdAt).toLocaleDateString() }} and is currently being reviewed by administrators.
      </p>

      <div class="border-t border-[var(--shopizz-obsidian)]/10 pt-4 text-xs text-[var(--shopizz-obsidian)]/50">
        You will receive full access to the Owner Workspace as soon as your shop is approved.
      </div>
    </section>

    <!-- Application Form for regular BUYER -->
    <section
      v-else
      class="max-w-3xl space-y-6 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-8 sm:p-10"
    >
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.25em] text-[var(--shopizz-saffron)]">
          Seller Application
        </p>
        <h2 class="mt-2 text-2xl font-medium tracking-tight">
          Become an Independent Shop Owner
        </h2>
        <p class="mt-2 text-sm text-[var(--shopizz-obsidian)]/60">
          Sell your distinctive clothing, handcrafted ceramics, home objects or sensory goods on Shopizz.
        </p>
      </div>

      <!-- Rejection notification if previously rejected -->
      <div
        v-if="application && application.status === 'REJECTED'"
        class="rounded-2xl border border-[var(--shopizz-saffron)]/20 bg-[var(--shopizz-saffron)]/10 p-5 text-sm"
      >
        <p class="font-medium text-[var(--shopizz-saffron)]">Previous Application Feedback:</p>
        <p class="mt-1 text-xs text-[var(--shopizz-obsidian)]/70">
          {{ application.rejectionReason || 'Please review your details and re-apply.' }}
        </p>
      </div>

      <!-- Error / Success banners -->
      <div
        v-if="errorMsg"
        class="rounded-2xl border border-[var(--shopizz-saffron)]/20 bg-[var(--shopizz-saffron)]/10 p-4 text-xs text-[var(--shopizz-saffron)]"
      >
        {{ errorMsg }}
      </div>

      <div
        v-if="successMsg"
        class="rounded-2xl border border-[var(--shopizz-moss)]/20 bg-[var(--shopizz-moss)]/10 p-4 text-xs font-medium text-[var(--shopizz-moss)]"
      >
        {{ successMsg }}
      </div>

      <form class="space-y-5" @submit.prevent="handleApply">
        <AppInput
          v-model="form.shopName"
          label="Shop / Brand Name *"
          placeholder="e.g. Studio Clay & Wood"
          :disabled="submitting"
        />

        <AppInput
          v-model="form.description"
          label="Shop Story / Description"
          placeholder="What kind of products do you create or curate?"
          :disabled="submitting"
        />

        <div class="grid gap-4 sm:grid-cols-2">
          <AppInput
            v-model="form.phone"
            label="Business Contact Phone"
            placeholder="e.g. +91 98765 43210"
            :disabled="submitting"
          />

          <AppInput
            v-model="form.address"
            label="Workshop / Business City & State"
            placeholder="e.g. Jaipur, Rajasthan"
            :disabled="submitting"
          />
        </div>

        <AppInput
          v-model="form.reason"
          label="Why Shopizz?"
          placeholder="Tell us why your shop is a great fit for the Shopizz marketplace..."
          :disabled="submitting"
        />

        <div class="pt-4">
          <AppButton
            type="submit"
            :disabled="submitting || !form.shopName.trim()"
          >
            {{ submitting ? 'Submitting Application...' : 'Submit Seller Application →' }}
          </AppButton>
        </div>
      </form>
    </section>
  </div>
</template>
