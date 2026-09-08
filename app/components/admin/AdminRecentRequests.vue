<script setup lang="ts">
interface Application {
  id: string
  shopName: string
  description?: string
  phone?: string
  address?: string
  reason?: string
  status: string
  createdAt: string
  userName?: string
  userEmail?: string
}

interface Props {
  requests: Application[]
}

defineProps<Props>()

const formatRelativeTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 60) {
    return `${Math.max(1, diffInMinutes)}m ago`
  }
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="flex flex-col justify-between rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-6 sm:p-7">
    <div>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--shopizz-saffron)]">
            Submissions
          </p>
          <h3 class="mt-1 text-lg font-medium tracking-tight text-[var(--shopizz-obsidian)]">
            Recent Owner Requests
          </h3>
        </div>

        <NuxtLink
          to="/admin/requests"
          class="text-xs font-medium text-[var(--shopizz-obsidian)]/60 hover:text-[var(--shopizz-obsidian)] hover:underline"
        >
          View all ({{ requests.length }}) →
        </NuxtLink>
      </div>

      <!-- Empty state -->
      <div
        v-if="!requests.length"
        class="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--shopizz-obsidian)]/15 bg-white/30 py-10 text-center"
      >
        <span class="text-2xl">✨</span>
        <p class="mt-2 text-xs font-medium text-[var(--shopizz-obsidian)]/70">
          No pending applications
        </p>
        <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/40">
          All maker applications have been processed.
        </p>
      </div>

      <!-- Requests list -->
      <div
        v-else
        class="mt-5 space-y-3"
      >
        <div
          v-for="app in requests"
          :key="app.id"
          class="flex items-center justify-between rounded-2xl border border-[var(--shopizz-obsidian)]/8 bg-white/80 p-4 transition-all hover:bg-white hover:shadow-sm"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ede5d8] font-serif text-sm font-semibold text-[var(--shopizz-obsidian)]">
              {{ app.shopName?.charAt(0)?.toUpperCase() || 'S' }}
            </div>
            <div class="min-w-0">
              <p class="truncate text-xs font-semibold text-[var(--shopizz-obsidian)]">
                {{ app.shopName }}
              </p>
              <p class="mt-0.5 truncate text-[11px] text-[var(--shopizz-obsidian)]/55">
                by {{ app.userName || 'Applicant' }} • {{ formatRelativeTime(app.createdAt) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <span class="hidden rounded-full bg-[#f6eee3] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#94442a] sm:inline-block">
              Pending
            </span>
            <NuxtLink
              to="/admin/requests"
              class="rounded-full bg-[var(--shopizz-obsidian)] px-3.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-[var(--shopizz-moss)]"
            >
              Review
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 pt-4 border-t border-[var(--shopizz-obsidian)]/10 text-right">
      <NuxtLink
        to="/admin/requests"
        class="text-xs font-medium text-[var(--shopizz-saffron)] hover:underline"
      >
        Go to application approval queue →
      </NuxtLink>
    </div>
  </div>
</template>
