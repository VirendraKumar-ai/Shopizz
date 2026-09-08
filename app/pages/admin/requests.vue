<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const {
  applications,
  applicationsLoading,
  error,
  approveApplication: approveAdminApplication,
  rejectApplication: rejectAdminApplication,
  fetchApplications,
} = useAdmin()

const showRejectModal = ref(false)
const selectedApplication = ref<any>(null)
const rejectionReason = ref('')
const actionLoading= ref(false)
const searchQuery = ref('')

const filteredApplications = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return applications.value
  return applications.value.filter((app: any) =>
    app.shopName?.toLowerCase().includes(query) ||
    app.userName?.toLowerCase().includes(query) ||
    app.userEmail?.toLowerCase().includes(query) ||
    app.address?.toLowerCase().includes(query) ||
    app.description?.toLowerCase().includes(query)
  )
})

onMounted(async () => {
  try {
    await fetchApplications()
  } catch {
    console.error(
      'Failed to fetch applications:',
      error.value,
    )
  }
})

const approveApplication = async (application: any) => {
  actionLoading.value = true

  try {
    await approveAdminApplication(application.id)
  } catch {
    // useAdmin already stores the API error
  } finally {
    actionLoading.value = false
  }
}

const openRejectModal = (application: any) => {
  selectedApplication.value = application
  rejectionReason.value = ''
  showRejectModal.value = true
}

const rejectApplication = async () => {
  if (!selectedApplication.value) {
    return
  }

  const reason = rejectionReason.value.trim()

  if (!reason) {
    return
  }

  actionLoading.value = true

  try {
    await rejectAdminApplication(
      selectedApplication.value.id,
      reason,
    )

    showRejectModal.value = false
    selectedApplication.value = null
  } catch {
    // useAdmin already stores the API error
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-10">

    <!-- Header -->
    <section>
      <p
        class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]"
      >
        Admin / 002
      </p>

      <div
        class="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1
            class="text-4xl font-medium tracking-[-0.05em] sm:text-5xl"
          >
            Owner requests
          </h1>

          <p
            class="mt-4 max-w-2xl text-sm leading-7 text-[var(--shopizz-obsidian)]/55"
          >
            Review applications from buyers who want to
            open and manage a shop on Shopizz.
          </p>
        </div>

        <AppBadge variant="warning">
          {{ applications.length }} pending
        </AppBadge>
      </div>
    </section>

    <!-- Loading -->
    <AppLoading
      v-if="applicationsLoading && !applications.length"
      text="Loading owner applications..."
    />

    <!-- Error -->
    <div
      v-else-if="error"
      class="rounded-3xl border border-[var(--shopizz-saffron)]/20 bg-[var(--shopizz-saffron)]/5 p-6"
    >
      <p
        class="text-sm text-[var(--shopizz-saffron)]"
      >
        {{ error }}
      </p>

      <AppButton
        class="mt-4"
        size="sm"
        @click="fetchApplications"
      >
        Try again
      </AppButton>
    </div>

    <!-- Search & Filter Bar -->
    <section
      v-if="applications.length"
      class="flex flex-col gap-4 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="w-full sm:w-80">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search by shop, maker name, city..."
          class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white px-4 py-2.5 text-xs outline-none focus:border-[var(--shopizz-obsidian)]"
        />
      </div>
      <p class="text-xs text-[var(--shopizz-obsidian)]/50">
        Showing {{ filteredApplications.length }} of {{ applications.length }} requests
      </p>
    </section>

    <!-- Empty -->
    <AppEmptyState
      v-if="!applications.length"
      title="No pending applications"
      description="There are currently no buyers waiting for owner approval."
    />

    <AppEmptyState
      v-else-if="!filteredApplications.length"
      title="No matching requests"
      description="No owner requests match your search criteria."
    />

    <!-- Applications -->
    <section
      v-else
      class="space-y-5"
    >
      <OwnerRequestCard
        v-for="application in filteredApplications"
        :key="application.id"
        :application="application"
        @approve="approveApplication(application)"
        @reject="openRejectModal(application)"
      />
    </section>

    <!-- Reject modal -->
    <UModal
      v-model:open="showRejectModal"
      title="Reject application"
      description="Please provide a reason for rejecting this owner application."
    >
      <template #body>
        <div class="space-y-6">
          <AppInput
            v-model="rejectionReason"
            label="Rejection reason"
            placeholder="Explain why this application cannot be approved."
            :disabled="actionLoading"
          />

          <div class="flex justify-end gap-3">
            <AppButton
              variant="secondary"
              :disabled="actionLoading"
              @click="showRejectModal = false"
            >
              Cancel
            </AppButton>

            <AppButton
              variant="accent"
              :disabled="actionLoading || !rejectionReason.trim()"
              @click="rejectApplication"
            >
              {{
                actionLoading
                  ? 'Rejecting...'
                  : 'Reject application'
              }}
            </AppButton>
          </div>
        </div>
      </template>
    </UModal>

  </div>
</template>