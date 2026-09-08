<script setup lang="ts">
import type { Product, ProductColor } from '~~/shared/types/product'
import ProductSizeGuideModal from './ProductSizeGuideModal.vue'

const props = defineProps<{
  product: Product
  modelValueColor?: string
  modelValueSize?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValueColor', color: string): void
  (e: 'update:modelValueSize', size: string): void
}>()

const colorsList = computed<ProductColor[]>(() => {
  if (props.product.colors && props.product.colors.length > 0) {
    return props.product.colors
  }
  return [
    { name: 'Oat', hex: '#D6C7B2', inStock: true },
    { name: 'Olive', hex: '#4B5320', inStock: true },
    { name: 'Charcoal', hex: '#2A2B2A', inStock: true },
    { name: 'Rust', hex: '#A34F38', inStock: true },
  ]
})

const sizesList = computed<string[]>(() => {
  if (props.product.sizes && props.product.sizes.length > 0) {
    return props.product.sizes
  }
  return ['XS', 'S', 'M', 'L', 'XL']
})

const selectedColor = ref(props.modelValueColor || colorsList.value[0]?.name || 'Oat')
const selectedSize = ref(props.modelValueSize || sizesList.value[1] || sizesList.value[0] || 'M')
const isSizeGuideOpen = ref(false)

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

const hasDiscount = computed(() => {
  if (!props.product.compareAtPrice) return false
  return props.product.compareAtPrice > props.product.price
})

const discountPercentage = computed(() => {
  if (!hasDiscount.value || !props.product.compareAtPrice) return 0
  return Math.round(
    ((props.product.compareAtPrice - props.product.price) /
      props.product.compareAtPrice) *
      100
  )
})

const handleSelectColor = (name: string) => {
  selectedColor.value = name
  emit('update:modelValueColor', name)
}

const handleSelectSize = (sz: string) => {
  selectedSize.value = sz
  emit('update:modelValueSize', sz)
}
</script>

<template>
  <div class="flex flex-col justify-between space-y-5 w-full">
    <!-- Breadcrumb Hierarchy -->
    <nav aria-label="Breadcrumbs" class="flex items-center gap-1.5 text-xs text-[#7A746B] flex-wrap">
      <NuxtLink to="/" class="hover:text-[#1F2623] transition-colors">Home</NuxtLink>
      <span>&gt;</span>
      <NuxtLink to="/shop" class="hover:text-[#1F2623] transition-colors">Shop</NuxtLink>
      <template v-if="product.category">
        <span>&gt;</span>
        <NuxtLink
          :to="`/category/${product.category.slug}`"
          class="hover:text-[#1F2623] transition-colors capitalize"
        >
          {{ product.category.name }}
        </NuxtLink>
      </template>
      <span>&gt;</span>
      <span class="text-[#1F2623] font-medium truncate max-w-[180px]">{{ product.name }}</span>
    </nav>

    <!-- Header Block -->
    <div>
      <!-- Category Kicker -->
      <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#94442A]">
        {{ product.category?.name || 'Studio Collection' }}
      </p>

      <!-- Product Title (Editorial Serif) -->
      <h1 class="mt-1.5 font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#1F2623] leading-tight">
        {{ product.name }}
      </h1>

      <!-- Maker & Verification Badge -->
      <div class="mt-2 flex items-center gap-2.5">
        <span class="text-xs text-[#7A746B]">
          By <strong class="text-[#1F2623]">{{ product.shop?.name || product.owner?.name || 'Independent Maker' }}</strong>
        </span>
        <span class="inline-flex items-center gap-1 rounded-full bg-[#2E6644]/10 px-2 py-0.5 text-[10.5px] font-semibold text-[#2E6644]">
          <Icon name="ph:check-bold" class="h-3 w-3" />
          <span>Verified Seller</span>
        </span>
      </div>

      <!-- Ratings & Sold Count -->
      <div class="mt-3 flex items-center gap-3 text-xs text-[#666]">
        <a
          href="#customer-reviews"
          class="flex items-center gap-1 font-medium text-[#1F2623] hover:text-[#94442A] transition-colors group cursor-pointer"
        >
          <span class="text-amber-500 font-bold">★</span>
          <span>{{ product.rating ? Number(product.rating).toFixed(1) : '5.0' }}</span>
          <span class="text-[#7A746B] group-hover:underline">({{ product.reviewCount || 0 }} reviews)</span>
        </a>
        <span class="text-stone-300">|</span>
        <div class="flex items-center gap-1 text-[#7A746B]">
          <Icon name="ph:dots-three-vertical-bold" class="h-3.5 w-3.5" />
          <span>{{ product.soldCount || 326 }} sold</span>
        </div>
      </div>
    </div>

    <!-- Price Block -->
    <div class="flex items-baseline gap-3 pt-0.5">
      <p class="font-serif text-3xl lg:text-4xl font-semibold text-[#1F2623] tracking-tight">
        {{ formatPrice(product.price) }}
      </p>

      <p
        v-if="hasDiscount"
        class="text-base font-normal text-[#8A847A] line-through"
      >
        {{ formatPrice(product.compareAtPrice!) }}
      </p>

      <span
        v-if="hasDiscount"
        class="rounded-full bg-[#94442A] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm"
      >
        Save {{ discountPercentage }}%
      </span>
    </div>

    <!-- Short Editorial Description -->
    <p class="text-xs sm:text-[13px] leading-relaxed text-[#5D574E]">
      {{ product.shortDescription || 'A breathable linen overshirt designed with a relaxed silhouette and clean finishing. Easy to wear across seasons.' }}
    </p>

    <!-- Variants Section -->
    <div class="border-t border-[#E8E2D8] pt-4.5 space-y-4.5">
      <!-- Dynamic Colour Selector -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A746B]">
            Colour: <span class="text-[#1F2623] capitalize font-medium ml-1">{{ selectedColor }}</span>
          </label>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            v-for="color in colorsList"
            :key="color.name"
            type="button"
            class="relative flex h-7.5 w-7.5 items-center justify-center rounded-full transition-all duration-200 cursor-pointer"
            :class="
              selectedColor === color.name
                ? 'ring-2 ring-offset-2 ring-[#1F2623] scale-110'
                : 'hover:scale-105 opacity-80 hover:opacity-100'
            "
            :title="color.name"
            :aria-label="`Select colour ${color.name}`"
            @click="handleSelectColor(color.name)"
          >
            <span
              class="h-full w-full rounded-full border border-black/10 shadow-inner"
              :style="{ backgroundColor: color.hex }"
            />
          </button>
        </div>
      </div>

      <!-- Dynamic Size Selector -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A746B]">
            Size
          </label>
          <button
            type="button"
            class="inline-flex items-center gap-1 text-xs font-semibold text-[#1F2623] hover:text-[#94442A] transition-colors"
            @click="isSizeGuideOpen = true"
          >
            <Icon name="ph:ruler-bold" class="h-3.5 w-3.5" />
            <span>Size Guide</span>
          </button>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            v-for="sz in sizesList"
            :key="sz"
            type="button"
            class="flex h-9 min-w-9 px-3 items-center justify-center rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer"
            :class="
              selectedSize === sz
                ? 'bg-[#1F2623] text-white shadow-sm ring-1 ring-[#1F2623]'
                : 'bg-white border border-[#E0D8CE] text-[#1F2623] hover:border-[#1F2623]'
            "
            @click="handleSelectSize(sz)"
          >
            {{ sz }}
          </button>
        </div>
      </div>

      <!-- Details & Materials Info Box -->
      <div class="rounded-2xl bg-[#F6F1E9] p-4 border border-[#E8E2D8] space-y-2 text-xs">
        <h3 class="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A746B]">
          Details & Materials
        </h3>
        <p class="text-[#555] leading-relaxed">
          {{ product.details?.materials || '100% Organic European Flax Linen. Sustainably harvested and garment-washed for a soft, lived-in feel.' }}
        </p>
        <p class="text-[11.5px] text-[#7A746B]">
          <strong>Care:</strong> {{ product.details?.care || 'Machine wash cold on gentle cycle. Line dry in shade.' }}
        </p>
      </div>
    </div>

    <!-- Size Guide Modal -->
    <ProductSizeGuideModal
      :is-open="isSizeGuideOpen"
      @close="isSizeGuideOpen = false"
    />
  </div>
</template>
