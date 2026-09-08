<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const route = useRoute()
const cartStore = useCartStore()
const slug = computed(() => route.params.slug as string)

const {
  data,
  pending,
} = await useFetch<any>(`/api/shops/${slug.value}`)

const shop = computed(() => data.value?.shop || null)
const productsList = computed(() => shop.value?.products || [])

const searchQuery = ref('')
const selectedCategory = ref('ALL')

const categoriesList = computed(() => {
  const cats = new Set<string>()
  productsList.value.forEach((p: any) => {
    if (p.categoryName) cats.add(p.categoryName)
  })
  return ['ALL', ...Array.from(cats)]
})

const filteredProducts = computed(() => {
  let list = [...productsList.value]

  if (selectedCategory.value !== 'ALL') {
    list = list.filter((p: any) => p.categoryName === selectedCategory.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter((p: any) =>
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    )
  }

  return list
})

function formatCurrency(paise: number) {
  return '₹ ' + Math.round((paise || 0) / 100).toLocaleString('en-IN')
}

function handleAddToCart(product: any) {
  cartStore.addItem({
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    productImage: product.imageUrl,
    price: product.price,
    quantity: 1,
    ownerName: shop.value?.name || 'Studio Maker',
  })
}
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="pending" class="py-24 text-center text-xs text-[#7A746B]">
      Loading studio collection...
    </div>

    <!-- Shop Not Found -->
    <div v-else-if="!shop" class="mx-auto max-w-xl py-24 text-center space-y-4">
      <h1 class="font-serif text-3xl font-bold text-[#1F2623]">Studio Not Found</h1>
      <p class="text-xs text-[#7A746B]">This artisan maker profile does not exist or has been relocated.</p>
      <NuxtLink to="/shop" class="inline-flex rounded-full bg-[#1F2623] px-6 py-2 text-xs font-semibold text-white">
        Back to Marketplace
      </NuxtLink>
    </div>

    <div v-else class="space-y-12">
      <!-- Studio Hero Banner -->
      <section class="relative bg-[#FAF8F5] border-b border-[#E8E2D8] overflow-hidden">
        <!-- Banner Image Background -->
        <div class="h-48 sm:h-64 md:h-72 w-full relative">
          <img
            :src="shop.bannerUrl"
            :alt="shop.name"
            class="h-full w-full object-cover opacity-80"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/40 to-transparent" />
        </div>

        <!-- Studio Profile Info Bar -->
        <div class="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 relative -mt-16 sm:-mt-20 pb-8">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div class="flex items-start gap-5">
              <!-- Studio Circular Logo Avatar -->
              <div class="flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center rounded-3xl bg-[#1F2623] font-serif text-3xl sm:text-4xl font-bold text-white shadow-xl ring-4 ring-[#FAF8F5]">
                {{ shop.name.charAt(0).toUpperCase() }}
              </div>

              <!-- Details -->
              <div class="space-y-1.5 pt-2 sm:pt-4">
                <div class="flex items-center gap-3 flex-wrap">
                  <h1 class="font-serif text-2xl sm:text-3xl font-bold text-[#1F2623]">
                    {{ shop.name }}
                  </h1>
                  <span class="inline-flex items-center rounded-full bg-[#EBF3EE] px-3 py-0.5 text-xs font-semibold text-[#2D5A43]">
                    ✓ Verified Studio Maker
                  </span>
                </div>

                <p class="flex items-center gap-2 text-xs text-[#7A746B]">
                  <span>📍 {{ shop.location }}</span>
                  <span>&bull;</span>
                  <span>Member since {{ shop.memberSince }}</span>
                </p>

                <p class="max-w-2xl text-xs text-[#5A544A] leading-relaxed pt-1">
                  {{ shop.bio }}
                </p>
              </div>
            </div>

            <!-- Stats Capsule -->
            <div class="flex items-center gap-6 rounded-2xl border border-[#E8E2D8] bg-white p-4 shadow-xs shrink-0 self-start md:self-auto">
              <div class="text-center px-2">
                <p class="font-serif text-lg font-bold text-[#1F2623]">{{ shop.totalProducts }}</p>
                <p class="text-[10px] text-[#7A746B] uppercase tracking-wider">Pieces Crafted</p>
              </div>
              <div class="h-8 w-px bg-[#E8E2D8]" />
              <div class="text-center px-2">
                <p class="font-serif text-lg font-bold text-[#94442A]">★ {{ shop.averageRating }}</p>
                <p class="text-[10px] text-[#7A746B] uppercase tracking-wider">{{ shop.totalReviews }} Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Shop Product Catalogue Section -->
      <section class="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        <!-- Controls Toolbar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
          <!-- Category Pills -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              v-for="cat in categoriesList"
              :key="cat"
              type="button"
              class="px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap"
              :class="selectedCategory === cat ? 'bg-[#1F2623] text-white shadow-xs' : 'bg-white border border-[#E8E2D8] text-[#1F2623] hover:bg-[#FAF8F5]'"
              @click="selectedCategory = cat"
            >
              {{ cat }}
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative w-full sm:w-64">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search in this studio..."
              class="w-full rounded-full border border-[#D5CEC4] bg-white pl-9 pr-4 py-1.5 text-xs text-[#1F2623] focus:border-[#1F2623] focus:outline-none"
            >
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
          </div>
        </div>

        <!-- Products Grid -->
        <div v-if="filteredProducts.length === 0" class="py-16 text-center text-xs text-[#7A746B]">
          No pieces match your search in this studio.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProductCard
            v-for="prod in filteredProducts"
            :key="prod.id"
            :product="{
              ...prod,
              ownerName: shop.name,
              images: [{ url: prod.imageUrl, alt: prod.name }],
            }"
          />
        </div>
      </section>
    </div>
  </div>
</template>
