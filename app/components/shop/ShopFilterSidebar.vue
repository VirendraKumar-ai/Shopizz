<script setup lang="ts">
import type { Category } from '~~/shared/types/product'

interface FilterState {
  search: string
  categories: string[]
  maxPrice: number
  types: string[]
  location: string
  minRating: number | null
  inStockOnly: boolean
}

const props = defineProps<{
  filters: FilterState
  categories: Category[]
  categoryCounts: Record<string, number>
  totalResults: number
}>()

const emit = defineEmits<{
  (e: 'update:filters', filters: FilterState): void
  (e: 'reset'): void
}>()

const productTypes = [
  { label: 'Handmade & Craft', value: 'handmade' },
  { label: 'Small Batch', value: 'small-batch' },
  { label: 'Organic & Pure', value: 'organic' },
  { label: 'Artisan Custom', value: 'custom' },
]

const locations = [
  'All Locations',
  'Mumbai, MH',
  'Jaipur, RJ',
  'Bengaluru, KA',
  'Delhi, NCR',
  'Kochi, KL',
  'Goa',
]

const toggleCategory = (slug: string) => {
  const current = [...props.filters.categories]
  const index = current.indexOf(slug)
  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(slug)
  }
  emit('update:filters', { ...props.filters, categories: current })
}

const toggleType = (type: string) => {
  const current = [...props.filters.types]
  const index = current.indexOf(type)
  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(type)
  }
  emit('update:filters', { ...props.filters, types: current })
}

const updatePrice = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:filters', { ...props.filters, maxPrice: Number(target.value) })
}

const updateSearch = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:filters', { ...props.filters, search: target.value })
}

const updateLocation = (e: Event) => {
  const target = e.target as HTMLSelectElement
  emit('update:filters', { ...props.filters, location: target.value })
}

const toggleInStock = () => {
  emit('update:filters', {
    ...props.filters,
    inStockOnly: !props.filters.inStockOnly,
  })
}

const setRating = (rating: number | null) => {
  emit('update:filters', {
    ...props.filters,
    minRating: props.filters.minRating === rating ? null : rating,
  })
}

const formatPrice = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val)
}
</script>

<template>
  <aside class="w-full space-y-7 rounded-2xl bg-white p-5 border border-[var(--shopizz-obsidian)]/10 shadow-xs">
    <!-- Header / Reset Action -->
    <div class="flex items-center justify-between border-b border-[var(--shopizz-obsidian)]/10 pb-4">
      <div class="flex items-center gap-2">
        <svg class="h-4 w-4 text-[var(--shopizz-obsidian)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <h3 class="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--shopizz-obsidian)]">
          Filters
        </h3>
      </div>

      <button
        type="button"
        class="text-xs font-medium text-[var(--shopizz-terracotta)] hover:underline cursor-pointer"
        @click="emit('reset')"
      >
        Clear all
      </button>
    </div>

    <!-- Search in Collection Filter -->
    <div>
      <label class="block text-[11px] font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]/60 mb-2">
        Search Collection
      </label>
      <div class="relative">
        <input
          :value="filters.search"
          type="text"
          placeholder="Keyword, maker, material..."
          class="w-full rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-[#faf8f3] px-3.5 py-2 pl-9 text-xs text-[var(--shopizz-obsidian)] placeholder:text-[var(--shopizz-obsidian)]/40 focus:border-[var(--shopizz-obsidian)] focus:bg-white focus:outline-none"
          @input="updateSearch"
        />
        <svg
          class="absolute left-3 top-2.5 h-4 w-4 text-[var(--shopizz-obsidian)]/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <button
          v-if="filters.search"
          type="button"
          class="absolute right-2.5 top-2.5 text-xs text-[var(--shopizz-obsidian)]/40 hover:text-[var(--shopizz-obsidian)]"
          @click="emit('update:filters', { ...filters, search: '' })"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Dynamic Category Checkboxes From Database API -->
    <div class="border-t border-[var(--shopizz-obsidian)]/10 pt-5">
      <h4 class="text-[11px] font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]/60 mb-3">
        Categories
      </h4>
      <div class="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        <label
          v-for="cat in categories"
          :key="cat.slug"
          class="flex cursor-pointer items-center justify-between text-xs text-[var(--shopizz-obsidian)] hover:text-[#293a30]"
        >
          <div class="flex items-center gap-2.5">
            <input
              type="checkbox"
              :checked="filters.categories.includes(cat.slug)"
              class="h-4 w-4 rounded border-[var(--shopizz-obsidian)]/20 text-[#293a30] focus:ring-[#293a30] cursor-pointer"
              @change="toggleCategory(cat.slug)"
            />
            <span>{{ cat.name }}</span>
          </div>
          <span class="text-[11px] text-[var(--shopizz-obsidian)]/40">
            ({{ categoryCounts[cat.slug] || 0 }})
          </span>
        </label>
      </div>
    </div>

    <!-- Price Range Filter -->
    <div class="border-t border-[var(--shopizz-obsidian)]/10 pt-5">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-[11px] font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]/60">
          Max Price
        </h4>
        <span class="text-xs font-bold text-[var(--shopizz-obsidian)]">
          {{ formatPrice(filters.maxPrice) }}
        </span>
      </div>
      <input
        type="range"
        min="500"
        max="15000"
        step="250"
        :value="filters.maxPrice"
        class="w-full accent-[#293a30] cursor-pointer"
        @input="updatePrice"
      />
      <div class="flex items-center justify-between text-[10px] text-[var(--shopizz-obsidian)]/50 mt-1">
        <span>₹500</span>
        <span>₹15,000+</span>
      </div>
    </div>

    <!-- Product Type -->
    <div class="border-t border-[var(--shopizz-obsidian)]/10 pt-5">
      <h4 class="text-[11px] font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]/60 mb-3">
        Craft & Type
      </h4>
      <div class="space-y-2.5">
        <label
          v-for="type in productTypes"
          :key="type.value"
          class="flex cursor-pointer items-center gap-2.5 text-xs text-[var(--shopizz-obsidian)] hover:text-[#293a30]"
        >
          <input
            type="checkbox"
            :checked="filters.types.includes(type.value)"
            class="h-4 w-4 rounded border-[var(--shopizz-obsidian)]/20 text-[#293a30] focus:ring-[#293a30] cursor-pointer"
            @change="toggleType(type.value)"
          />
          <span>{{ type.label }}</span>
        </label>
      </div>
    </div>

    <!-- Origin / Location -->
    <div class="border-t border-[var(--shopizz-obsidian)]/10 pt-5">
      <h4 class="text-[11px] font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]/60 mb-2">
        Shop Location
      </h4>
      <select
        :value="filters.location"
        class="w-full rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-[#faf8f3] px-3 py-2 text-xs text-[var(--shopizz-obsidian)] focus:border-[var(--shopizz-obsidian)] focus:outline-none cursor-pointer"
        @change="updateLocation"
      >
        <option v-for="loc in locations" :key="loc" :value="loc">
          {{ loc }}
        </option>
      </select>
    </div>

    <!-- Rating Filter -->
    <div class="border-t border-[var(--shopizz-obsidian)]/10 pt-5">
      <h4 class="text-[11px] font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]/60 mb-3">
        Customer Rating
      </h4>
      <div class="space-y-2">
        <button
          v-for="r in [5, 4, 3]"
          :key="r"
          type="button"
          class="flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs transition-colors cursor-pointer"
          :class="
            filters.minRating === r
              ? 'bg-[#293a30] font-semibold text-white'
              : 'text-[var(--shopizz-obsidian)]/75 hover:bg-[#f7f4ee]'
          "
          @click="setRating(r)"
        >
          <div class="flex items-center gap-1.5">
            <span :class="filters.minRating === r ? 'text-[#e8a36e]' : 'text-[#c56a32]'">★</span>
            <span>{{ r }} Stars & Up</span>
          </div>
          <span v-if="filters.minRating === r" class="text-[11px]">✓</span>
        </button>
      </div>
    </div>

    <!-- Stock Availability Toggle -->
    <div class="border-t border-[var(--shopizz-obsidian)]/10 pt-5">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs font-medium text-[var(--shopizz-obsidian)]">
            In stock only
          </span>
          <p class="text-[10px] text-[var(--shopizz-obsidian)]/50">
            Exclude made-to-order backorders
          </p>
        </div>
        <button
          type="button"
          class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
          :class="filters.inStockOnly ? 'bg-[#293a30]' : 'bg-gray-300'"
          @click="toggleInStock"
        >
          <span
            class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            :class="filters.inStockOnly ? 'translate-x-4' : 'translate-x-0'"
          />
        </button>
      </div>
    </div>
  </aside>
</template>
