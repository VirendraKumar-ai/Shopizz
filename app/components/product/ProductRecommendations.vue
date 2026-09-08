<script setup lang="ts">
export interface RelatedProductItem {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  rating: number
  imageUrl: string
  shopName: string
}

const props = defineProps<{
  products: RelatedProductItem[]
}>()

const fallbackProducts: RelatedProductItem[] = [
  {
    id: '1',
    name: 'Relaxed Linen Shirt',
    slug: 'relaxed-linen-shirt',
    price: 229900,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    shopName: 'The Loom Studio',
  },
  {
    id: '2',
    name: 'Cotton Wide Pants',
    slug: 'cotton-wide-pants',
    price: 279900,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
    shopName: 'Studio Tattva',
  },
  {
    id: '3',
    name: 'Linen Tote Bag',
    slug: 'linen-tote-bag',
    price: 149900,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    shopName: 'Leaf & Loom',
  },
  {
    id: '4',
    name: 'Textured Crop Top',
    slug: 'textured-crop-top',
    price: 189900,
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1534126511673-b6899657816a?w=600&auto=format&fit=crop&q=80',
    shopName: 'Minimal Earth',
  },
  {
    id: '5',
    name: 'Oversized Co-ord Set',
    slug: 'oversized-co-ord-set',
    price: 349900,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    shopName: 'Clay Haus',
  },
  {
    id: '6',
    name: 'Linen Scarf',
    slug: 'linen-scarf',
    price: 119900,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80',
    shopName: 'The Calm Studio',
  },
]

const displayProducts = computed(() => {
  if (props.products && props.products.length > 0) {
    return props.products
  }
  return fallbackProducts
})

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount / 100)
}
</script>

<template>
  <section class="mt-12 sm:mt-14 border-t border-[#E8E2D8] pt-8" aria-labelledby="recommendations-heading">
    <!-- Section Heading -->
    <div class="flex items-center justify-between mb-6">
      <h2 id="recommendations-heading" class="font-serif text-2xl sm:text-[26px] font-medium text-[#1F2623] tracking-tight">
        You may also like
      </h2>

      <NuxtLink
        to="/shop"
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F2623] hover:text-[#94442A] transition-colors group"
      >
        <span>View All</span>
        <Icon name="ph:arrow-right" class="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </NuxtLink>
    </div>

    <!-- Recommendations 7-Column Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-3.5 items-stretch">
      <!-- 6 Product Cards -->
      <article
        v-for="item in displayProducts.slice(0, 6)"
        :key="item.id"
        class="group flex flex-col justify-between rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] p-2.5 transition-all duration-300 hover:shadow-md hover:border-[#1F2623]/30"
      >
        <NuxtLink :to="`/product/${item.slug}`" class="block flex-1 flex flex-col justify-between">
          <!-- Thumbnail Container -->
          <div class="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#EDE6DC]">
            <img
              :src="item.imageUrl"
              :alt="item.name"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <!-- Wishlist Button -->
            <button
              type="button"
              class="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm hover:text-red-600 transition-colors"
              aria-label="Save to wishlist"
              @click.prevent
            >
              <Icon name="ph:heart-bold" class="h-3 w-3" />
            </button>
          </div>

          <!-- Product Details -->
          <div class="pt-2 px-0.5">
            <h3 class="text-xs font-bold text-[#1F2623] truncate group-hover:text-[#94442A] transition-colors">
              {{ item.name }}
            </h3>
            <p class="text-[10.5px] text-[#7A746B] truncate mt-0.5">
              {{ item.shopName }}
            </p>

            <div class="mt-2 flex items-center justify-between text-xs">
              <span class="font-bold text-[#1F2623]">
                {{ formatPrice(item.price) }}
              </span>
              <span class="flex items-center gap-1 text-[11px] font-semibold text-stone-700">
                <span class="text-amber-500">★</span>
                <span>{{ item.rating }}</span>
              </span>
            </div>
          </div>
        </NuxtLink>
      </article>

      <!-- 1 Editorial Promo Story Card (7th Column) -->
      <aside
        class="col-span-2 sm:col-span-1 lg:col-span-1 relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#94442A] p-4 text-white shadow-md min-h-[220px]"
      >
        <!-- Story Headline -->
        <div class="relative z-10">
          <p class="font-serif text-lg sm:text-xl font-medium leading-tight tracking-tight">
            Everyday<br />Pieces.<br />
            Brighter<br />Stories.
          </p>
        </div>

        <!-- Ceramic Vase & Plant Branch Image overlay -->
        <div class="absolute right-0 bottom-0 top-6 w-3/5 opacity-85 pointer-events-none overflow-hidden">
          <img
            src="/images/promo-vase.jpg"
            alt="Artisanal Ceramic Vase"
            class="h-full w-full object-cover object-left mix-blend-luminosity brightness-110 contrast-105"
            loading="lazy"
          />
        </div>

        <!-- Bottom Action Arrow -->
        <div class="relative z-10 mt-auto pt-6 flex items-center justify-between">
          <NuxtLink
            to="/shop"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-white hover:bg-white hover:text-[#94442A] transition-all hover:scale-105"
            aria-label="Explore collection"
          >
            <Icon name="ph:arrow-right-bold" class="h-3.5 w-3.5" />
          </NuxtLink>
        </div>
      </aside>
    </div>
  </section>
</template>
