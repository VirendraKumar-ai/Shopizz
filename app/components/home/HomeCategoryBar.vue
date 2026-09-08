<script setup lang="ts">
const emit = defineEmits<{
  (e: 'selectCategory', slug: string): void
}>()
</script>

<template>
  <section id="categories" class="border-y border-[var(--shopizz-obsidian)]/10 py-3 sm:py-3.5">
    <div class="mx-auto max-w-6xl px-6 sm:px-8">
      <div class="flex items-center justify-between gap-4 overflow-x-auto py-0.5 no-scrollbar">
        <!-- Fashion -->
        <button
          type="button"
          class="group flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-75 cursor-pointer"
          @click="emit('selectCategory', 'fashion')"
        >
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#ece6db] text-[#2b2b2b] transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10">
            <svg class="h-4 w-4 sm:h-4.5 sm:w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3a2.5 2.5 0 00-2.5 2.5c0 1.2.8 2.2 1.9 2.45L3.4 14.5A2 2 0 004.6 18h14.8a2 2 0 001.2-3.5L12.6 7.95A2.5 2.5 0 0012 3z"/>
            </svg>
          </div>
          <span class="text-xs sm:text-[13px] font-medium text-[var(--shopizz-obsidian)]">Fashion</span>
        </button>

        <!-- Accessories -->
        <button
          type="button"
          class="group flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-75 cursor-pointer"
          @click="emit('selectCategory', 'accessories')"
        >
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#ece6db] text-[#2b2b2b] transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10">
            <svg class="h-4 w-4 sm:h-4.5 sm:w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
          </div>
          <span class="text-xs sm:text-[13px] font-medium text-[var(--shopizz-obsidian)]">Accessories</span>
        </button>

        <!-- Beauty -->
        <button
          type="button"
          class="group flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-75 cursor-pointer"
          @click="emit('selectCategory', 'beauty')"
        >
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#ece6db] text-[#2b2b2b] transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10">
            <svg class="h-4 w-4 sm:h-4.5 sm:w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 2h4v3h-4V2zM8 5h8v2H8V5zm-1 4a2 2 0 012-2h6a2 2 0 012 2v10a3 3 0 01-3 3H10a3 3 0 01-3-3V9zm5 3v4"/>
            </svg>
          </div>
          <span class="text-xs sm:text-[13px] font-medium text-[var(--shopizz-obsidian)]">Beauty</span>
        </button>

        <!-- Home & Living -->
        <button
          type="button"
          class="group flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-75 cursor-pointer"
          @click="emit('selectCategory', 'home-living')"
        >
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#ece6db] text-[#2b2b2b] transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10">
            <svg class="h-4 w-4 sm:h-4.5 sm:w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 19v2M18 19v2M5 11V7a3 3 0 013-3h8a3 3 0 013 3v4M4 11h16a2 2 0 012 2v3a2 2 0 01-2 2H4a2 2 0 01-2-2v-3a2 2 0 012-2z"/>
            </svg>
          </div>
          <span class="text-xs sm:text-[13px] font-medium text-[var(--shopizz-obsidian)]">Home & Living</span>
        </button>

        <!-- Lifestyle -->
        <button
          type="button"
          class="group flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-75 cursor-pointer"
          @click="emit('selectCategory', 'lifestyle')"
        >
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#ece6db] text-[#2b2b2b] transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10">
            <svg class="h-4 w-4 sm:h-4.5 sm:w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 8h1a3 3 0 010 6h-1M4 6h14v8a4 4 0 01-4 4H8a4 4 0 01-4-4V6zm2 14h10"/>
            </svg>
          </div>
          <span class="text-xs sm:text-[13px] font-medium text-[var(--shopizz-obsidian)]">Lifestyle</span>
        </button>

        <!-- Books -->
        <button
          type="button"
          class="group flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-75 cursor-pointer"
          @click="emit('selectCategory', 'books')"
        >
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#ece6db] text-[#2b2b2b] transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10">
            <svg class="h-4 w-4 sm:h-4.5 sm:w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <span class="text-xs sm:text-[13px] font-medium text-[var(--shopizz-obsidian)]">Books</span>
        </button>

        <!-- View All -->
        <NuxtLink
          to="/shop"
          class="group flex shrink-0 flex-col items-center gap-0.5 transition-opacity hover:opacity-75 cursor-pointer"
        >
          <div class="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--shopizz-obsidian)]/30 text-[var(--shopizz-obsidian)] transition-transform duration-300 group-hover:scale-105 group-hover:border-[var(--shopizz-obsidian)] sm:h-9 sm:w-9">
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </div>
          <span class="text-[9px] font-medium text-[var(--shopizz-obsidian)]/65">View All</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
