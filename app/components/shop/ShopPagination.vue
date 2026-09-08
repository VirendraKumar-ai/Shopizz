<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  (e: 'update:page', page: number): void
}>()

const pages = computed(() => {
  const current = props.currentPage
  const total = props.totalPages
  const delta = 2
  const range: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      range.push(i)
    }
    return range
  }

  range.push(1)

  if (current > delta + 2) {
    range.push('...')
  }

  const start = Math.max(2, current - delta)
  const end = Math.min(total - 1, current + delta)

  for (let i = start; i <= end; i++) {
    range.push(i)
  }

  if (current < total - delta - 1) {
    range.push('...')
  }

  if (total > 1) {
    range.push(total)
  }

  return range
})

const setPage = (page: number | string) => {
  if (typeof page === 'number' && page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:page', page)
  }
}
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="mt-12 flex items-center justify-center gap-1.5"
    aria-label="Pagination"
  >
    <!-- Previous Button -->
    <button
      type="button"
      :disabled="currentPage === 1"
      class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white text-xs font-medium text-[var(--shopizz-obsidian)] transition-all hover:bg-[#ede5d8] disabled:cursor-not-allowed disabled:opacity-30"
      aria-label="Previous page"
      @click="setPage(currentPage - 1)"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- Page Numbers -->
    <template v-for="(p, idx) in pages" :key="idx">
      <span
        v-if="p === '...'"
        class="flex h-9 w-7 items-center justify-center text-xs text-[var(--shopizz-obsidian)]/40"
      >
        ...
      </span>

      <button
        v-else
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-medium transition-all"
        :class="
          p === currentPage
            ? 'bg-[var(--shopizz-obsidian)] text-white shadow-xs'
            : 'border border-[var(--shopizz-obsidian)]/15 bg-white text-[var(--shopizz-obsidian)] hover:bg-[#ede5d8]'
        "
        :aria-current="p === currentPage ? 'page' : undefined"
        @click="setPage(p)"
      >
        {{ p }}
      </button>
    </template>

    <!-- Next Button -->
    <button
      type="button"
      :disabled="currentPage === totalPages"
      class="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white text-xs font-medium text-[var(--shopizz-obsidian)] transition-all hover:bg-[#ede5d8] disabled:cursor-not-allowed disabled:opacity-30"
      aria-label="Next page"
      @click="setPage(currentPage + 1)"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </nav>
</template>
