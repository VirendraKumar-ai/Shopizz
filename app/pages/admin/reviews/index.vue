<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin']
})

const statusFilter = ref('ALL')
const searchQuery = ref('')
const isUpdatingId = ref<string | null>(null)

const {
  data,
  pending,
  error,
  refresh
} = await useFetch<any>('/api/admin/reviews', {
  query: computed(() => ({
    status: statusFilter.value,
    search: searchQuery.value
  }))
})

const metrics = computed(() => data.value?.metrics || {
  total: 0,
  publishedCount: 0,
  hiddenCount: 0
})

const reviewsList = computed(() => data.value?.reviews || [])

async function toggleReviewStatus(review: any) {
  const nextStatus = review.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED'
  isUpdatingId.value = review.id

  try {
    const res = await $fetch<{ success: boolean }>(`/api/admin/reviews/${review.id}/status`, {
      method: 'PATCH',
      body: { status: nextStatus }
    })

    if (res.success) {
      await refresh()
    }
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Failed to update review status')
  } finally {
    isUpdatingId.value = null
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--shopizz-saffron)]">
          Marketplace Moderation
        </p>
        <h1 class="mt-2 font-serif text-3xl font-medium tracking-tight text-[var(--shopizz-obsidian)] sm:text-4xl">
          Review & Rating Moderation
        </h1>
        <p class="mt-2 max-w-xl text-xs leading-relaxed text-[var(--shopizz-obsidian)]/60">
          Oversee all customer reviews across Shopizz studios, ensure community standards, and moderate content.
        </p>
      </div>
    </section>

    <!-- Metrics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] p-5 shadow-sm">
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/60">
          Total Reviews
        </p>
        <p class="mt-2 font-serif text-3xl font-bold text-[var(--shopizz-obsidian)]">
          {{ metrics.total }}
        </p>
        <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/60">
          Across all products
        </p>
      </div>

      <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] p-5 shadow-sm">
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/60">
          Published & Visible
        </p>
        <p class="mt-2 font-serif text-3xl font-bold text-[#2D5A43]">
          {{ metrics.publishedCount }}
        </p>
        <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/60">
          Active on storefronts
        </p>
      </div>

      <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] p-5 shadow-sm">
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/60">
          Hidden / Flagged
        </p>
        <p class="mt-2 font-serif text-3xl font-bold text-[#94442A]">
          {{ metrics.hiddenCount }}
        </p>
        <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/60">
          Hidden from public view
        </p>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--shopizz-obsidian)]/10 pb-4">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all"
          :class="statusFilter === 'ALL'
            ? 'bg-[var(--shopizz-obsidian)] text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-[var(--shopizz-obsidian)] hover:bg-[#ede5d8]'"
          @click="statusFilter = 'ALL'"
        >
          All ({{ metrics.total }})
        </button>
        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all"
          :class="statusFilter === 'PUBLISHED'
            ? 'bg-[#2D5A43] text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-[#2D5A43] hover:bg-[#EBF3EE]'"
          @click="statusFilter = 'PUBLISHED'"
        >
          Published ({{ metrics.publishedCount }})
        </button>
        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all"
          :class="statusFilter === 'HIDDEN'
            ? 'bg-[#94442A] text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-[#94442A] hover:bg-[#FBEAE5]'"
          @click="statusFilter = 'HIDDEN'"
        >
          Hidden ({{ metrics.hiddenCount }})
        </button>
      </div>

      <div class="relative w-full sm:w-72">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by product, buyer, text..."
          class="w-full rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-3.5 py-2 text-xs text-[var(--shopizz-obsidian)] placeholder-[var(--shopizz-obsidian)]/40 focus:outline-none"
        >
      </div>
    </div>

    <!-- Reviews Table / List -->
    <div v-if="pending" class="py-16 text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[var(--shopizz-obsidian)] border-t-transparent" />
      <p class="mt-3 text-xs text-[var(--shopizz-obsidian)]/60">Loading marketplace reviews...</p>
    </div>

    <div
      v-else-if="reviewsList.length === 0"
      class="rounded-3xl border border-dashed border-[var(--shopizz-obsidian)]/20 bg-[#f8f5ee] p-12 text-center"
    >
      <h3 class="font-serif text-xl font-medium text-[var(--shopizz-obsidian)]">
        No reviews found
      </h3>
      <p class="mt-1 text-xs text-[var(--shopizz-obsidian)]/60">
        No customer reviews match your current filter.
      </p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="review in reviewsList"
        :key="review.id"
        class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white p-5 sm:p-6 shadow-sm transition-all"
        :class="review.status === 'HIDDEN' ? 'opacity-70 bg-gray-50' : ''"
      >
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-[var(--shopizz-obsidian)]/10">
          <div>
            <div class="flex items-center gap-2">
              <NuxtLink
                :to="`/product/${review.product.slug}`"
                target="_blank"
                class="font-serif text-base font-semibold text-[var(--shopizz-obsidian)] hover:text-[#94442A] transition-colors"
              >
                {{ review.product.name }} ↗
              </NuxtLink>

              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                :class="review.status === 'PUBLISHED' ? 'bg-[#EBF3EE] text-[#2D5A43]' : 'bg-[#FBEAE5] text-[#94442A]'"
              >
                {{ review.status }}
              </span>
            </div>

            <p class="text-xs text-[var(--shopizz-obsidian)]/60 mt-0.5">
              By <strong class="text-[var(--shopizz-obsidian)]">{{ review.reviewer.name }}</strong> ({{ review.reviewer.email }})
              <span class="mx-1.5">•</span>
              <span>{{ formatDate(review.createdAt) }}</span>
            </p>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex text-amber-500 text-sm">
              <span v-for="i in 5" :key="i">
                {{ i <= review.rating ? '★' : '☆' }}
              </span>
            </div>

            <button
              type="button"
              :disabled="isUpdatingId === review.id"
              class="rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              :class="review.status === 'PUBLISHED'
                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'"
              @click="toggleReviewStatus(review)"
            >
              {{ isUpdatingId === review.id ? 'Updating...' : (review.status === 'PUBLISHED' ? 'Hide Review' : 'Publish Review') }}
            </button>
          </div>
        </div>

        <!-- Review Comment Body -->
        <div class="mt-3 space-y-1">
          <h4 v-if="review.title" class="font-serif text-sm font-semibold text-[var(--shopizz-obsidian)]">
            {{ review.title }}
          </h4>
          <p class="text-xs text-[var(--shopizz-obsidian)]/80 leading-relaxed whitespace-pre-line">
            {{ review.comment }}
          </p>
        </div>

        <!-- Studio Seller Response (if any) -->
        <div
          v-if="review.sellerReply"
          class="mt-3 rounded-xl border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] p-3 text-xs"
        >
          <span class="font-semibold text-[#94442A]">Studio Reply:</span>
          <span class="ml-1.5 text-[var(--shopizz-obsidian)] italic">"{{ review.sellerReply }}"</span>
        </div>
      </div>
    </div>
  </div>
</template>
