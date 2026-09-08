<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'owner']
})

const authStore = useAuthStore()

const {
  data,
  pending,
  error,
  refresh
} = await useFetch<any>('/api/owner/reviews')

const metrics = computed(() => data.value?.metrics || {
  totalReviews: 0,
  avgRating: 0,
  pendingReplies: 0
})

const allReviews = computed(() => data.value?.reviews || [])

const activeTab = ref<'ALL' | 'PENDING' | 'ANSWERED'>('ALL')
const selectedStar = ref<number | null>(null)
const searchQuery = ref('')

// State for active inline reply forms
const replyInputs = ref<Record<string, string>>({})
const replyLoading = ref<Record<string, boolean>>({})
const editingReplyId = ref<string | null>(null)

const filteredReviews = computed(() => {
  let list = [...allReviews.value]

  // Tab filter
  if (activeTab.value === 'PENDING') {
    list = list.filter(r => !r.sellerReply)
  } else if (activeTab.value === 'ANSWERED') {
    list = list.filter(r => !!r.sellerReply)
  }

  // Star filter
  if (selectedStar.value) {
    list = list.filter(r => Math.round(r.rating) === selectedStar.value)
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(r =>
      r.product.name.toLowerCase().includes(q) ||
      r.reviewer.name.toLowerCase().includes(q) ||
      (r.title && r.title.toLowerCase().includes(q)) ||
      r.comment.toLowerCase().includes(q)
    )
  }

  return list
})

function startReply(review: any) {
  editingReplyId.value = review.id
  replyInputs.value[review.id] = review.sellerReply || ''
}

function cancelReply(reviewId: string) {
  if (editingReplyId.value === reviewId) {
    editingReplyId.value = null
  }
}

async function submitReply(reviewId: string) {
  const text = replyInputs.value[reviewId]?.trim()
  if (!text) return

  replyLoading.value[reviewId] = true
  try {
    const res = await $fetch<{ success: boolean }>(`/api/owner/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: { reply: text }
    })

    if (res.success) {
      editingReplyId.value = null
      await refresh()
    }
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Failed to submit reply')
  } finally {
    replyLoading.value[reviewId] = false
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
          Studio Engagement
        </p>
        <h1 class="mt-2 font-serif text-3xl font-medium tracking-tight text-[var(--shopizz-obsidian)] sm:text-4xl">
          Customer Reviews & Feedback
        </h1>
        <p class="mt-2 max-w-xl text-xs leading-relaxed text-[var(--shopizz-obsidian)]/60">
          Monitor what buyers are saying about your handcrafted pieces and post official studio responses.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink
          to="/owner/products"
          class="inline-flex items-center gap-2 rounded-full border border-[var(--shopizz-obsidian)]/20 bg-white px-5 py-2.5 text-xs font-semibold text-[var(--shopizz-obsidian)] shadow-sm hover:bg-[#ede5d8] transition-colors"
        >
          <span>Manage Products</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Metrics Strip -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Metric 1: Total Reviews -->
      <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] p-5 shadow-sm">
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/60">
          Total Reviews
        </p>
        <p class="mt-2 font-serif text-3xl font-bold text-[var(--shopizz-obsidian)]">
          {{ metrics.totalReviews }}
        </p>
        <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/60">
          Across all active studio pieces
        </p>
      </div>

      <!-- Metric 2: Average Rating -->
      <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] p-5 shadow-sm">
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/60">
          Studio Rating
        </p>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="font-serif text-3xl font-bold text-[var(--shopizz-obsidian)]">
            {{ metrics.avgRating ? metrics.avgRating.toFixed(1) : '—' }}
          </span>
          <div class="flex text-amber-500 text-sm">
            <span v-for="i in 5" :key="i">
              {{ i <= Math.round(metrics.avgRating) ? '★' : '☆' }}
            </span>
          </div>
        </div>
        <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/60">
          Average customer satisfaction
        </p>
      </div>

      <!-- Metric 3: Pending Replies -->
      <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] p-5 shadow-sm">
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/60">
          Pending Response
        </p>
        <p
          class="mt-2 font-serif text-3xl font-bold"
          :class="metrics.pendingReplies > 0 ? 'text-[#94442A]' : 'text-[#2D5A43]'"
        >
          {{ metrics.pendingReplies }}
        </p>
        <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/60">
          {{ metrics.pendingReplies > 0 ? 'Reviews awaiting your studio reply' : 'All reviews answered' }}
        </p>
      </div>
    </div>

    <!-- Controls / Filters -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--shopizz-obsidian)]/10 pb-4">
      <!-- Tabs -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all"
          :class="activeTab === 'ALL'
            ? 'bg-[var(--shopizz-obsidian)] text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-[var(--shopizz-obsidian)] hover:bg-[#ede5d8]'"
          @click="activeTab = 'ALL'"
        >
          All ({{ metrics.totalReviews }})
        </button>
        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all flex items-center gap-1.5"
          :class="activeTab === 'PENDING'
            ? 'bg-[#94442A] text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-[#94442A] hover:bg-[#FBEAE5]'"
          @click="activeTab = 'PENDING'"
        >
          <span>Pending Response</span>
          <span
            v-if="metrics.pendingReplies > 0"
            class="rounded-full bg-white text-[#94442A] px-1.5 py-0.2 text-[10px] font-bold"
          >
            {{ metrics.pendingReplies }}
          </span>
        </button>
        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-semibold transition-all"
          :class="activeTab === 'ANSWERED'
            ? 'bg-[#2D5A43] text-white shadow-sm'
            : 'bg-white border border-[var(--shopizz-obsidian)]/15 text-[#2D5A43] hover:bg-[#EBF3EE]'"
          @click="activeTab = 'ANSWERED'"
        >
          Answered
        </button>
      </div>

      <!-- Star & Search Filter -->
      <div class="flex items-center gap-3">
        <select
          v-model="selectedStar"
          class="rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)] focus:outline-none"
        >
          <option :value="null">All Star Ratings</option>
          <option :value="5">5 Stars ★</option>
          <option :value="4">4 Stars ★</option>
          <option :value="3">3 Stars ★</option>
          <option :value="2">2 Stars ★</option>
          <option :value="1">1 Star ★</option>
        </select>

        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search reviews..."
            class="w-48 sm:w-60 rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-3 py-2 text-xs text-[var(--shopizz-obsidian)] placeholder-[var(--shopizz-obsidian)]/40 focus:outline-none"
          >
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-2 top-2 text-xs text-gray-400 hover:text-gray-600"
            @click="searchQuery = ''"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Reviews List -->
    <div v-if="pending" class="py-16 text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[var(--shopizz-obsidian)] border-t-transparent" />
      <p class="mt-3 text-xs text-[var(--shopizz-obsidian)]/60">Loading customer reviews...</p>
    </div>

    <div
      v-else-if="filteredReviews.length === 0"
      class="rounded-3xl border border-dashed border-[var(--shopizz-obsidian)]/20 bg-[#f8f5ee] p-12 text-center"
    >
      <span class="text-3xl">✨</span>
      <h3 class="mt-3 font-serif text-xl font-medium text-[var(--shopizz-obsidian)]">
        No reviews found
      </h3>
      <p class="mt-1 text-xs text-[var(--shopizz-obsidian)]/60">
        {{ activeTab === 'PENDING' ? 'You have answered all reviews! Outstanding job.' : 'No customer reviews match your search or filter criteria.' }}
      </p>
    </div>

    <div v-else class="space-y-6">
      <article
        v-for="review in filteredReviews"
        :key="review.id"
        class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white p-6 sm:p-7 shadow-sm transition-all hover:shadow-md"
      >
        <!-- Top Section: Product Header & Review Details -->
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[var(--shopizz-obsidian)]/10">
          <!-- Product Info -->
          <div class="flex items-center gap-3.5">
            <img
              v-if="review.product.imageUrl"
              :src="review.product.imageUrl"
              :alt="review.product.name"
              class="h-14 w-14 rounded-xl object-cover border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee]"
            >
            <div
              v-else
              class="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f8f5ee] text-xs text-gray-400 font-serif"
            >
              Piece
            </div>

            <div>
              <div class="flex items-center gap-2">
                <NuxtLink
                  :to="`/product/${review.product.slug}`"
                  target="_blank"
                  class="font-serif text-base font-semibold text-[var(--shopizz-obsidian)] hover:text-[#94442A] transition-colors"
                >
                  {{ review.product.name }} ↗
                </NuxtLink>
              </div>
              <p class="text-xs text-[var(--shopizz-obsidian)]/60 mt-0.5">
                By <strong class="text-[var(--shopizz-obsidian)] font-medium">{{ review.reviewer.name }}</strong>
                <span class="mx-1.5 text-gray-300">•</span>
                <span>{{ formatDate(review.createdAt) }}</span>
              </p>
            </div>
          </div>

          <!-- Stars & Verified Badge -->
          <div class="flex flex-col sm:items-end gap-1.5">
            <div class="flex text-amber-500 text-sm tracking-wider">
              <span v-for="i in 5" :key="i">
                {{ i <= review.rating ? '★' : '☆' }}
              </span>
            </div>
            <span
              v-if="review.isVerifiedPurchase"
              class="inline-flex items-center gap-1 rounded-full bg-[#EBF3EE] px-2.5 py-0.5 text-[10px] font-semibold text-[#2D5A43]"
            >
              <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Verified Purchase
            </span>
          </div>
        </div>

        <!-- Review Headline & Comment -->
        <div class="mt-4 space-y-1.5">
          <h4 v-if="review.title" class="font-serif text-sm font-semibold text-[var(--shopizz-obsidian)]">
            {{ review.title }}
          </h4>
          <p class="text-xs text-[var(--shopizz-obsidian)]/80 leading-relaxed whitespace-pre-line">
            {{ review.comment }}
          </p>
        </div>

        <!-- Seller Reply Area -->
        <div class="mt-5 pt-4 border-t border-[var(--shopizz-obsidian)]/10">
          <!-- Existing Reply Display -->
          <div
            v-if="review.sellerReply && editingReplyId !== review.id"
            class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[#f8f5ee] p-4.5"
          >
            <div class="flex items-center justify-between pb-2 border-b border-[var(--shopizz-obsidian)]/10">
              <div class="flex items-center gap-2">
                <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#94442A] text-[10px] text-white">
                  ✓
                </span>
                <span class="text-xs font-semibold uppercase tracking-wider text-[#94442A]">
                  Your Studio Response
                </span>
                <span v-if="review.sellerRepliedAt" class="text-[10px] text-gray-500">
                  ({{ formatDate(review.sellerRepliedAt) }})
                </span>
              </div>
              <button
                type="button"
                class="text-xs font-semibold text-[var(--shopizz-obsidian)] hover:text-[#94442A] underline transition-colors"
                @click="startReply(review)"
              >
                Edit Reply
              </button>
            </div>
            <p class="mt-2.5 text-xs text-[var(--shopizz-obsidian)] leading-relaxed italic">
              "{{ review.sellerReply }}"
            </p>
          </div>

          <!-- Inline Reply Box (when editing or replying for the first time) -->
          <div
            v-else-if="editingReplyId === review.id"
            class="rounded-2xl border border-[#94442A]/30 bg-[#FAF8F5] p-4.5 space-y-3"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wider text-[#94442A]">
                {{ review.sellerReply ? 'Edit Official Response' : 'Write Official Studio Response' }}
              </span>
              <button
                type="button"
                class="text-xs text-gray-500 hover:text-gray-800"
                @click="cancelReply(review.id)"
              >
                Cancel
              </button>
            </div>
            <textarea
              v-model="replyInputs[review.id]"
              rows="3"
              placeholder="Thank the customer, provide styling tips, or address their feedback thoughtfully..."
              class="w-full rounded-xl border border-[var(--shopizz-obsidian)]/20 bg-white p-3 text-xs text-[var(--shopizz-obsidian)] placeholder-[var(--shopizz-obsidian)]/40 focus:border-[#94442A] focus:outline-none focus:ring-1 focus:ring-[#94442A] resize-none leading-relaxed"
            />
            <div class="flex items-center justify-end gap-2">
              <button
                type="button"
                class="rounded-full px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                @click="cancelReply(review.id)"
              >
                Discard
              </button>
              <button
                type="button"
                :disabled="replyLoading[review.id] || !replyInputs[review.id]?.trim()"
                class="inline-flex items-center gap-2 rounded-full bg-[#1F2623] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2e3b33] disabled:opacity-50 transition-all"
                @click="submitReply(review.id)"
              >
                <div
                  v-if="replyLoading[review.id]"
                  class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"
                />
                <span>{{ replyLoading[review.id] ? 'Saving...' : 'Post Studio Response' }}</span>
              </button>
            </div>
          </div>

          <!-- "Reply to Customer" Trigger Button when no reply yet -->
          <div v-else class="flex items-center justify-between">
            <span class="text-xs text-amber-800 font-medium flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Awaiting your response
            </span>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full bg-[#1F2623] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2e3b33] transition-all"
              @click="startReply(review)"
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span>Reply to Review</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
