<script setup lang="ts">
const emit = defineEmits<{
  (e: 'scrollToProducts'): void
}>()
</script>

<template>
  <section class="relative overflow-hidden bg-[#faf8f3] px-6 py-8 sm:px-8 sm:py-12 border-b border-[var(--shopizz-obsidian)]/10">
    <div class="mx-auto max-w-7xl">
      <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <!-- Left Editorial Copy (7 cols) -->
        <div class="lg:col-span-7">
          <div class="inline-flex items-center gap-2">
            <span class="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#a9572b]">
              02 / EXPLORE COLLECTION
            </span>
          </div>

          <h1 class="mt-3 text-4xl font-medium leading-[1.08] tracking-[-0.03em] text-[var(--shopizz-obsidian)] sm:text-5xl lg:text-6xl">
            Thoughtfully made,
            <br />
            <span class="font-serif italic text-[var(--shopizz-moss)]">
              for you.
            </span>
          </h1>

          <p class="mt-4 max-w-lg text-sm leading-relaxed text-[var(--shopizz-obsidian)]/70 sm:text-base">
            Discover curated artisan crafts, slow fashion, small-batch apothecary, and mindful home goods handcrafted by independent makers worldwide.
          </p>

          <div class="mt-7 flex flex-wrap items-center gap-4">
            <button
              type="button"
              class="inline-flex items-center gap-2.5 rounded-full bg-[var(--shopizz-obsidian)] px-6 py-3 text-xs font-medium tracking-wide text-white transition-all duration-300 hover:bg-[var(--shopizz-moss)] hover:shadow-md"
              @click="emit('scrollToProducts')"
            >
              <span>Shop All Products</span>
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            <NuxtLink
              to="/#shops"
              class="inline-flex items-center gap-2 rounded-full border border-[var(--shopizz-obsidian)]/20 px-5 py-3 text-xs font-medium text-[var(--shopizz-obsidian)] transition-all hover:border-[var(--shopizz-obsidian)] hover:bg-[#ede5d8]/40"
            >
              <span>Browse Independent Shops</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Right Arched Imagery (5 cols) -->
        <div class="relative flex justify-center lg:col-span-5">
          <div class="relative w-full max-w-sm">
            <!-- Arched Card -->
            <div class="relative aspect-[4/4.8] w-full overflow-hidden rounded-t-[140px] rounded-b-[28px] bg-[#e8e2d6] shadow-xl ring-1 ring-black/5">
              <img
                src="/images/shop-hero-botanical.jpg"
                alt="Artisan crafts and botanical styling"
                class="h-full w-full object-cover"
              />
            </div>

            <!-- Floating Stamp / Badge -->
            <div
              class="absolute -bottom-4 -left-4 rounded-2xl bg-white/90 p-3.5 shadow-lg backdrop-blur-md border border-[var(--shopizz-obsidian)]/10 sm:-left-6"
            >
              <div class="flex items-center gap-2.5">
                <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#ede5d8] text-[var(--shopizz-moss)]">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p class="text-[10px] font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]/50">
                    Curated Guarantee
                  </p>
                  <p class="text-xs font-bold text-[var(--shopizz-obsidian)]">
                    100% Verified Makers
                  </p>
                </div>
              </div>
            </div>

            <!-- Hand-lettered decorative tag (Top Right) -->
            <div class="absolute -right-3 -top-3 rotate-6 rounded-full bg-[#c56a32] px-3.5 py-1 text-[11px] font-medium text-white shadow-md">
              Support Small
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
