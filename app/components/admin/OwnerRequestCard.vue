<script setup lang="ts">
defineProps<{
  application: {
    id: string
    shopName: string
    description?: string | null
    phone?: string | null
    address?: string | null
    reason?: string | null
    status: string
    userName?: string | null
    userEmail?: string | null
    createdAt?: string | Date | null
  }
}>()

const emit = defineEmits<{
  approve: []
  reject: []
}>()

const formatDate = (date?: string | Date | null) => {
  if (!date) return '—'

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}
</script>

<template>
  <article
    class="overflow-hidden rounded-[1.75rem] border border-[var(--shopizz-obsidian)]/10 bg-white/30"
  >
    <!-- Top -->
    <div
      class="flex flex-col gap-5 border-b border-[var(--shopizz-obsidian)]/10 p-6 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <AppBadge variant="warning">
            {{ application.status }}
          </AppBadge>

          <span
            class="text-xs text-[var(--shopizz-obsidian)]/40"
          >
            {{ formatDate(application.createdAt) }}
          </span>
        </div>

        <h2
          class="mt-4 text-2xl font-medium tracking-[-0.03em]"
        >
          {{ application.shopName }}
        </h2>

        <p
          class="mt-1 text-sm text-[var(--shopizz-obsidian)]/50"
        >
          {{ application.userName || 'Unknown applicant' }}
        </p>
      </div>

      <div class="flex gap-2">
        <AppButton
          size="sm"
          @click="emit('approve')"
        >
          Approve
        </AppButton>

        <AppButton
          size="sm"
          variant="secondary"
          @click="emit('reject')"
        >
          Reject
        </AppButton>
      </div>
    </div>

    <!-- Details -->
    <div class="grid gap-6 p-6 md:grid-cols-2">
      <div>
        <p
          class="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--shopizz-obsidian)]/40"
        >
          Applicant
        </p>

        <div class="mt-3 space-y-1 text-sm">
          <p>
            {{ application.userName || '—' }}
          </p>

          <p class="text-[var(--shopizz-obsidian)]/50">
            {{ application.userEmail || '—' }}
          </p>
        </div>
      </div>

      <div>
        <p
          class="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--shopizz-obsidian)]/40"
        >
          Contact
        </p>

        <div class="mt-3 space-y-1 text-sm">
          <p>
            {{ application.phone || 'No phone provided' }}
          </p>

          <p class="text-[var(--shopizz-obsidian)]/50">
            {{ application.address || 'No address provided' }}
          </p>
        </div>
      </div>

      <div
        v-if="application.reason"
        class="md:col-span-2"
      >
        <p
          class="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--shopizz-obsidian)]/40"
        >
          Why Shopizz?
        </p>

        <p
          class="mt-3 max-w-3xl text-sm leading-7 text-[var(--shopizz-obsidian)]/60"
        >
          {{ application.reason }}
        </p>
      </div>

      <div
        v-if="application.description"
        class="md:col-span-2"
      >
        <p
          class="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--shopizz-obsidian)]/40"
        >
          Shop description
        </p>

        <p
          class="mt-3 max-w-3xl text-sm leading-7 text-[var(--shopizz-obsidian)]/60"
        >
          {{ application.description }}
        </p>
      </div>
    </div>
  </article>
</template>