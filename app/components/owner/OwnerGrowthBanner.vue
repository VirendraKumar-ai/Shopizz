<script setup lang="ts">
const authStore = useAuthStore()
</script>

<template>
  <section class="relative overflow-hidden rounded-[2.5rem] bg-[#1d2720] text-[#f7f4ee]">
    <div class="grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-12 lg:p-12">
      <!-- Left Editorial Text -->
      <div class="space-y-4 lg:col-span-8">
        <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d4af37]">
          Maker Narrative & Growth
        </p>

        <h2 class="font-serif text-2xl font-normal leading-snug tracking-tight sm:text-3xl lg:text-4xl text-[#f7f4ee]">
          Share your craft & story with conscious shoppers.
        </h2>

        <p class="max-w-xl text-xs leading-relaxed text-[#f7f4ee]/70 sm:text-sm">
          Keep your maker profile fresh, update product descriptions, and give customers a glimpse into your intentional process.
        </p>

        <div class="pt-2 flex flex-wrap items-center gap-4">
          <NuxtLink
            to="/owner/products/new"
            class="inline-flex items-center gap-2 rounded-full bg-[#ede5d8] px-6 py-3 text-xs font-semibold text-[var(--shopizz-obsidian)] transition-all hover:bg-white hover:scale-105"
          >
            <span>+ Add New Product</span>
            <span>→</span>
          </NuxtLink>

          <NuxtLink
            to="/shop"
            class="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-xs font-medium text-white transition-colors hover:bg-white/10"
          >
            <span>Explore Collection</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Right Artisan Photo -->
      <div class="relative hidden lg:col-span-4 lg:block">
        <div class="relative mx-auto aspect-[4/3] w-full max-w-[280px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
          <img
            src="/images/shop-makers-banner.jpg"
            alt="Artisan maker workshop"
            class="h-full w-full object-cover"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div class="absolute bottom-3 left-3 right-3 text-left">
            <p class="text-[10px] uppercase tracking-wider text-white/80">
              Independent Studio
            </p>
            <p class="text-xs font-serif text-white">
              {{ authStore.user?.name || 'Maker' }}'s Workshop
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
