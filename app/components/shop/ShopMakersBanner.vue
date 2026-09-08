<template>
  <section class="my-16 overflow-hidden rounded-3xl bg-[#ede5d8] border border-[var(--shopizz-obsidian)]/10 shadow-xs">
    <div class="grid grid-cols-1 items-center lg:grid-cols-12">
      <!-- Left Content (6 cols) -->
      <div class="p-8 sm:p-12 lg:col-span-6 lg:p-16">
        <span class="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#a9572b]">
          The Artisans Behind The Work
        </span>

        <h2 class="mt-3 text-2xl font-medium leading-tight tracking-tight text-[var(--shopizz-obsidian)] sm:text-3xl lg:text-4xl">
          More than products.
          <br />
          <span class="font-serif italic text-[var(--shopizz-moss)]">
            Real people. Real stories.
          </span>
        </h2>

        <p class="mt-4 text-xs leading-relaxed text-[var(--shopizz-obsidian)]/75 sm:text-sm">
          Every piece in our collection is crafted by an independent artisan studio, ceramicist, weaver, or apothecary who puts care into every batch. When you shop here, you directly support their livelihood and heritage craftsmanship.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-4">
          <NuxtLink
            to="/#shops"
            class="inline-flex items-center gap-2 rounded-full bg-[var(--shopizz-obsidian)] px-6 py-3 text-xs font-medium text-white transition-all duration-300 hover:bg-[var(--shopizz-moss)] hover:shadow-md"
          >
            <span>Explore Independent Shops</span>
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </NuxtLink>

          <NuxtLink
            to="/about"
            class="inline-flex items-center gap-2 text-xs font-medium text-[var(--shopizz-obsidian)] underline underline-offset-4 hover:text-[var(--shopizz-moss)]"
          >
            <span>Read Our Story</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Right Image Banner (6 cols) -->
      <div class="relative h-72 w-full lg:col-span-6 lg:h-full min-h-[320px]">
        <img
          src="/images/shop-makers-banner.jpg"
          alt="Artisan ceramic maker working in studio"
          class="h-full w-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#ede5d8] lg:via-transparent lg:to-transparent" />

        <!-- Floating Badge -->
        <div class="absolute bottom-6 right-6 rounded-2xl bg-white/90 p-3 shadow-lg backdrop-blur-md border border-[var(--shopizz-obsidian)]/10">
          <div class="flex items-center gap-2">
            <span class="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p class="text-xs font-semibold text-[var(--shopizz-obsidian)]">
              Small Shops, Big Impact
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
