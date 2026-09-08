<script setup lang="ts">
interface Product {
  id: string
  name: string
  slug: string
  shortDescription?: string | null
  price: number
  compareAtPrice?: number | null
  isFeatured: boolean
  stock: number
  category?: {
    name: string
    slug: string
  } | null
  images: {
    url: string
    alt?: string | null
  }[]
  owner?: {
    name: string
  } | null
}

defineProps<{
  products: Product[]
}>()
</script>

<template>
  <div
    v-if="products.length"
    class="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  >
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
    />
  </div>

  <AppEmptyState
    v-else
    title="Nothing here yet"
    description="We couldn't find any products matching your selection."
  />
</template>