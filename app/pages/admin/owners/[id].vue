<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const route = useRoute()
const router = useRouter()
const ownerId = computed(() => route.params.id as string)

const {
  fetchOwner,
} = useAdmin()

const loading = ref(true)
const error = ref('')
const ownerData = ref<any>(null)

onMounted(async () => {
  try {
    ownerData.value = await fetchOwner(ownerId.value)
  } catch (err: any) {
    error.value = err?.data?.message || 'Failed to load owner profile.'
  } finally {
    loading.value = false
  }
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-10">
    <!-- Header -->
    <section>
      <button
        type="button"
        class="text-xs uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/50 hover:text-[var(--shopizz-obsidian)]"
        @click="router.back()"
      >
        ← Back to owners directory
      </button>

      <div class="mt-4 flex items-center justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]">
            Admin / Owner Profile
          </p>

          <h1 class="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
            {{ ownerData?.owner?.name || 'Seller Account' }}
          </h1>
        </div>

        <AppBadge v-if="ownerData?.owner" :variant="ownerData.owner.isActive ? 'success' : 'danger'">
          {{ ownerData.owner.isActive ? 'ACTIVE SELLER' : 'SUSPENDED' }}
        </AppBadge>
      </div>
    </section>

    <!-- Loading -->
    <AppLoading v-if="loading" text="Loading owner details..." />

    <!-- Error -->
    <div
      v-else-if="error || !ownerData"
      class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-12 text-center"
    >
      <h2 class="text-2xl font-medium tracking-tight">
        Owner not found
      </h2>
      <p class="mt-2 text-sm text-[var(--shopizz-obsidian)]/55">
        {{ error || 'Unable to locate this owner profile.' }}
      </p>
      <NuxtLink to="/admin/owners" class="mt-6 inline-block">
        <AppButton size="sm">
          Return to directory
        </AppButton>
      </NuxtLink>
    </div>

    <!-- Content -->
    <div v-else class="grid gap-8 lg:grid-cols-12">
      <!-- User Info Left (6 cols) -->
      <div class="space-y-6 lg:col-span-6">
        <div class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-8 space-y-6">
          <h2 class="text-base font-medium tracking-tight border-b border-[var(--shopizz-obsidian)]/10 pb-4">
            User Account Details
          </h2>

          <div class="space-y-4 text-xs">
            <div>
              <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Full Name</p>
              <p class="mt-1 text-sm font-medium">{{ ownerData.owner.name }}</p>
            </div>

            <div>
              <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Email Address</p>
              <p class="mt-1 text-sm font-medium">{{ ownerData.owner.email }}</p>
            </div>

            <div>
              <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Account Created</p>
              <p class="mt-1 font-medium">{{ formatDate(ownerData.owner.createdAt) }}</p>
            </div>

            <div>
              <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Last Login</p>
              <p class="mt-1 font-medium">{{ formatDate(ownerData.owner.lastLoginAt) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Shop Application Details Right (6 cols) -->
      <div class="space-y-6 lg:col-span-6">
        <div class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-8 space-y-6">
          <h2 class="text-base font-medium tracking-tight border-b border-[var(--shopizz-obsidian)]/10 pb-4">
            Registered Shop Details
          </h2>

          <div v-if="ownerData.shop" class="space-y-4 text-xs">
            <div>
              <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Shop / Brand Name</p>
              <p class="mt-1 text-base font-medium text-[var(--shopizz-obsidian)]">{{ ownerData.shop.shopName }}</p>
            </div>

            <div v-if="ownerData.shop.description">
              <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Shop Story / Description</p>
              <p class="mt-1 leading-6 text-[var(--shopizz-obsidian)]/70">{{ ownerData.shop.description }}</p>
            </div>

            <div v-if="ownerData.shop.phone">
              <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Contact Phone</p>
              <p class="mt-1 font-medium">{{ ownerData.shop.phone }}</p>
            </div>

            <div v-if="ownerData.shop.address">
              <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Workshop Location</p>
              <p class="mt-1 font-medium">{{ ownerData.shop.address }}</p>
            </div>

            <div v-if="ownerData.shop.reason">
              <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Application Rationale</p>
              <p class="mt-1 leading-6 text-[var(--shopizz-obsidian)]/70">{{ ownerData.shop.reason }}</p>
            </div>

            <div>
              <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Approved On</p>
              <p class="mt-1 font-medium text-[var(--shopizz-moss)]">{{ formatDate(ownerData.shop.reviewedAt) }}</p>
            </div>
          </div>

          <div v-else class="text-sm text-[var(--shopizz-obsidian)]/50">
            No formal owner application record attached to this account.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
