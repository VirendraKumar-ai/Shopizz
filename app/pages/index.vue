<script setup lang="ts">
import type { Product, Category } from '~~/shared/types/product'
import type { Shop } from '~~/shared/types/shop'
import HomeHero from '~/components/home/HomeHero.vue'
import HomeCategoryBar from '~/components/home/HomeCategoryBar.vue'
import HomeNewInCarousel from '~/components/home/HomeNewInCarousel.vue'
import HomeShopsSection from '~/components/home/HomeShopsSection.vue'
import HomeJournalBanner from '~/components/home/HomeJournalBanner.vue'
import HomeTestimonials from '~/components/home/HomeTestimonials.vue'
import HomeSocialMarquee from '~/components/home/HomeSocialMarquee.vue'

definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Shopizz — Curated Independent Marketplace',
  meta: [
    {
      name: 'description',
      content:
        'A curated marketplace of independent shops, distinctive handcrafted products, and real maker stories.',
    },
  ],
})

const router = useRouter()

// Fetch products, categories and shops from backend API
const { data, pending, error, refresh } = await useFetch<{
  success: boolean
  products: Product[]
}>('/api/products')

const { data: categoryData } = await useFetch<{
  success: boolean
  categories: Category[]
}>('/api/categories')

const { data: shopsData } = await useFetch<{
  success: boolean
  shops: Shop[]
}>('/api/shops')

const products = computed(() => data.value?.products ?? [])
const categories = computed(() => categoryData.value?.categories ?? [])
const shops = computed(() => shopsData.value?.shops ?? [])

const handleSelectCategory = (slug: string) => {
  router.push({ path: '/shop', query: { category: slug } })
}
</script>

<template>
  <div class="overflow-x-hidden">
    <!-- SECTION 01: HERO / WELCOME TO SHOPIZZ -->
    <HomeHero />

    <!-- QUICK CATEGORY ICON BAR -->
    <HomeCategoryBar @select-category="handleSelectCategory" />

    <!-- SECTION 02: NEW IN (Split Sidebar + Curated Carousel) -->
    <HomeNewInCarousel
      :products="products"
      :pending="pending"
      :error="error"
      @refresh="refresh"
    />

    <!-- SECTION 03: INDEPENDENT SHOPS (Meet the Makers) -->
    <HomeShopsSection :shops="shops" />

    <!-- EDITORIAL JOURNAL BANNER (Deep Forest Green Split Panel) -->
    <HomeJournalBanner />

    <!-- COMMUNITY TESTIMONIALS (Autoplaying Slider with Hover Pause) -->
    <HomeTestimonials />

    <!-- SOCIAL GALLERY STRIP (@SHOPIZZ.MARKET - Continuous 60fps Marquee) -->
    <HomeSocialMarquee />
  </div>
</template>

<style scoped>
/* Page specific styling */
</style>