<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  productSlug: string
  productName: string
  isVerified?: boolean
  initialReview?: {
    rating: number
    title: string | null
    comment: string
  } | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submitted'): void
}>()

const rating = ref(props.initialReview?.rating || 5)
const hoverRating = ref(0)
const title = ref(props.initialReview?.title || '')
const comment = ref(props.initialReview?.comment || '')
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const ratingLabels: Record<number, string> = {
  1: '1 Star — Poor experience',
  2: '2 Stars — Fair, had issues',
  3: '3 Stars — Average, met expectations',
  4: '4 Stars — Very Good, satisfied',
  5: '5 Stars — Exceptional, loved it!'
}

const activeRating = computed(() => hoverRating.value || rating.value)

watch(() => props.isOpen, (open) => {
  if (open) {
    rating.value = props.initialReview?.rating || 5
    title.value = props.initialReview?.title || ''
    comment.value = props.initialReview?.comment || ''
    errorMessage.value = ''
    successMessage.value = ''
    hoverRating.value = 0
  }
})

async function handleSubmit() {
  if (!comment.value.trim() || comment.value.trim().length < 3) {
    errorMessage.value = 'Please write at least a few words describing your experience.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const res = await $fetch<{ success: boolean }>(`/api/products/${props.productSlug}/reviews`, {
      method: 'POST',
      body: {
        rating: rating.value,
        title: title.value.trim() || null,
        comment: comment.value.trim()
      }
    })

    if (res.success) {
      successMessage.value = 'Thank you! Your review has been published.'
      setTimeout(() => {
        emit('submitted')
        emit('close')
      }, 1000)
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || err?.message || 'Failed to submit review. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-[#1F2623]/60 backdrop-blur-sm transition-opacity"
          @click="emit('close')"
        />

        <!-- Modal Content -->
        <div
          class="relative w-full max-w-lg rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-8 shadow-2xl transition-all"
        >
          <!-- Header -->
          <div class="flex items-start justify-between pb-4 border-b border-[#E8E2D8]">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-[0.25em] text-[#94442A]">
                Studio Feedback
              </span>
              <h3 class="font-serif text-2xl font-medium text-[#1F2623] mt-1">
                {{ initialReview ? 'Edit Your Review' : 'Write a Review' }}
              </h3>
              <p class="text-xs text-[#7A746B] mt-0.5 line-clamp-1">
                For {{ productName }}
              </p>
            </div>
            <button
              type="button"
              class="rounded-full p-2 text-[#7A746B] hover:bg-[#EAE4DC] hover:text-[#1F2623] transition-colors"
              @click="emit('close')"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Verified Badge Banner if verified -->
          <div
            v-if="isVerified"
            class="mt-4 flex items-center gap-2 rounded-xl bg-[#EBF3EE] px-3.5 py-2 text-xs font-medium text-[#2D5A43]"
          >
            <svg class="h-4 w-4 shrink-0 text-[#2D5A43]" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Verified Purchase — Your review will receive a verified badge</span>
          </div>

          <!-- Success Banner -->
          <div
            v-if="successMessage"
            class="mt-4 rounded-xl bg-[#EBF3EE] p-3 text-xs font-medium text-[#2D5A43] text-center"
          >
            {{ successMessage }}
          </div>

          <!-- Error Banner -->
          <div
            v-if="errorMessage"
            class="mt-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 text-center border border-red-200"
          >
            {{ errorMessage }}
          </div>

          <!-- Form Body -->
          <form v-if="!successMessage" @submit.prevent="handleSubmit" class="mt-5 space-y-5">
            <!-- 1. Star Rating Selection -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-[#1F2623] mb-1.5">
                Overall Rating <span class="text-[#94442A]">*</span>
              </label>
              <div class="flex items-center gap-1.5">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  class="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                  @mouseenter="hoverRating = star"
                  @mouseleave="hoverRating = 0"
                  @click="rating = star"
                >
                  <span
                    :class="star <= activeRating ? 'text-[#D97706]' : 'text-[#D5CEC4]'"
                    class="transition-colors"
                  >
                    ★
                  </span>
                </button>
                <span class="ml-2 text-xs font-medium text-[#7A746B]">
                  {{ ratingLabels[activeRating] }}
                </span>
              </div>
            </div>

            <!-- 2. Review Headline / Title -->
            <div>
              <label for="review-title" class="block text-xs font-semibold uppercase tracking-wider text-[#1F2623] mb-1.5">
                Headline / Summary <span class="text-[#7A746B] font-normal normal-case">(Optional)</span>
              </label>
              <input
                id="review-title"
                v-model="title"
                type="text"
                maxlength="100"
                placeholder="e.g. Exceptional drape and craftsmanship"
                class="w-full rounded-xl border border-[#D5CEC4] bg-white px-3.5 py-2.5 text-xs text-[#1F2623] placeholder-[#A8A196] focus:border-[#1F2623] focus:outline-none focus:ring-1 focus:ring-[#1F2623]"
              >
            </div>

            <!-- 3. Review Comment -->
            <div>
              <label for="review-comment" class="block text-xs font-semibold uppercase tracking-wider text-[#1F2623] mb-1.5">
                Detailed Feedback <span class="text-[#94442A]">*</span>
              </label>
              <textarea
                id="review-comment"
                v-model="comment"
                rows="4"
                required
                placeholder="Describe what you liked about the material, fit, finish, or studio packaging..."
                class="w-full rounded-xl border border-[#D5CEC4] bg-white p-3.5 text-xs text-[#1F2623] placeholder-[#A8A196] focus:border-[#1F2623] focus:outline-none focus:ring-1 focus:ring-[#1F2623] leading-relaxed resize-none"
              />
              <p class="mt-1 text-[11px] text-[#A8A196] text-right">
                {{ comment.length }} characters
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D8]">
              <button
                type="button"
                class="rounded-full px-5 py-2.5 text-xs font-semibold text-[#7A746B] hover:bg-[#EAE4DC] hover:text-[#1F2623] transition-colors"
                @click="emit('close')"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="inline-flex items-center justify-center gap-2 rounded-full bg-[#1F2623] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#2e3b33] disabled:opacity-50 transition-all"
              >
                <div v-if="isSubmitting" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{{ isSubmitting ? 'Publishing...' : 'Submit Review' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
