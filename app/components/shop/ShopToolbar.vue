<script setup lang="ts">
const props = defineProps<{
  totalCount: number
  displayedCount: number
  currentSort: string
  gridCols: number
  activeFilterCount: number
  activeCategoryNames: string[]
  searchQuery: string
}>()

const emit = defineEmits<{
  (e: 'update:sort', sort: string): void
  (e: 'update:gridCols', cols: number): void
  (e: 'openMobileFilters'): void
  (e: 'removeCategory', name: string): void
  (e: 'clearSearch'): void
}>()

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Name (A to Z)', value: 'name-asc' },
]

const handleSortChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  emit('update:sort', target.value)
}
</script>

<template>
  <div class="mb-6 flex flex-col gap-4 border-b border-[var(--shopizz-obsidian)]/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
    <!-- Left: Results Counter & Active Tags -->
    <div class="flex flex-wrap items-center gap-2">
      <p class="text-xs font-medium text-[var(--shopizz-obsidian)]/70">
        Showing <span class="font-bold text-[var(--shopizz-obsidian)]">{{ displayedCount }}</span> of {{ totalCount }} products
      </p>

      <!-- Active Search Tag -->
      <span
        v-if="searchQuery"
        class="inline-flex items-center gap-1.5 rounded-full bg-[#ede5d8] px-2.5 py-1 text-[11px] font-medium text-[var(--shopizz-obsidian)]"
      >
        <span>"{{ searchQuery }}"</span>
        <button type="button" class="hover:text-red-600" @click="emit('clearSearch')">✕</button>
      </span>

      <!-- Active Category Tags -->
      <span
        v-for="cat in activeCategoryNames"
        :key="cat"
        class="inline-flex items-center gap-1.5 rounded-full bg-[#ede5d8] px-2.5 py-1 text-[11px] font-medium text-[var(--shopizz-obsidian)]"
      >
        <span>{{ cat }}</span>
        <button type="button" class="hover:text-red-600" @click="emit('removeCategory', cat)">✕</button>
      </span>
    </div>

    <!-- Right: Mobile Filters Button, Sort Dropdown & Grid View Toggle -->
    <div class="flex items-center gap-3 self-end sm:self-auto">
      <!-- Mobile Filter Toggle Button -->
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)] lg:hidden"
        @click="emit('openMobileFilters')"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span>Filters</span>
        <span
          v-if="activeFilterCount > 0"
          class="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--shopizz-moss)] text-[9px] text-white"
        >
          {{ activeFilterCount }}
        </span>
      </button>

      <!-- Sort Dropdown -->
      <div class="flex items-center gap-2">
        <label for="sort-select" class="text-xs font-medium text-[var(--shopizz-obsidian)]/60 whitespace-nowrap hidden sm:inline">
          Sort by:
        </label>
        <select
          id="sort-select"
          :value="currentSort"
          class="rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)] focus:border-[var(--shopizz-obsidian)] focus:outline-none cursor-pointer"
          @change="handleSortChange"
        >
          <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Grid Column View Switcher (Desktop) -->
      <div class="hidden items-center rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white p-1 sm:flex">
        <!-- 3 Columns -->
        <button
          type="button"
          class="rounded-lg p-1.5 transition-colors"
          :class="gridCols === 3 ? 'bg-[#ede5d8] text-[var(--shopizz-obsidian)]' : 'text-[var(--shopizz-obsidian)]/40 hover:text-[var(--shopizz-obsidian)]'"
          aria-label="3 columns grid"
          @click="emit('update:gridCols', 3)"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4h4v16H4V4zm6 0h4v16h-4V4zm6 0h4v16h-4V4z"/>
          </svg>
        </button>

        <!-- 4 Columns -->
        <button
          type="button"
          class="rounded-lg p-1.5 transition-colors"
          :class="gridCols === 4 ? 'bg-[#ede5d8] text-[var(--shopizz-obsidian)]' : 'text-[var(--shopizz-obsidian)]/40 hover:text-[var(--shopizz-obsidian)]'"
          aria-label="4 columns grid"
          @click="emit('update:gridCols', 4)"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 4h3.5v16H3V4zm5.5 0H12v16H8.5V4zm5.5 0h3.5v16H14V4zm5.5 0H23v16h-3.5V4z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
