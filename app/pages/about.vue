<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useHead({
  title: 'About Us | Our Story & Independent Makers — Shopizz',
  meta: [
    {
      name: 'description',
      content:
        'Learn about Shopizz, our mission to champion independent artisans and small shops, and how we bring soulful, handcrafted goods directly to conscious collectors.',
    },
  ],
})

const milestones = [
  { value: '100+', label: 'Independent Studios & Makers' },
  { value: '10,000+', label: 'Mindful Customers Delighted' },
  { value: '100%', label: 'Direct Artisan Support' },
  { value: '4.9★', label: 'Average Customer Rating' },
]

const values = [
  {
    number: '01',
    title: 'Rooted in Craft',
    description:
      'We celebrate the human touch. Every stitch, wheel spin, and botanical formulation tells a story of patience, skill, and creative integrity.',
  },
  {
    number: '02',
    title: 'Empowering Independent Studios',
    description:
      'Large marketplaces squeeze small shops with exorbitant fees. Shopizz provides fair economics so passionate makers can sustainably grow.',
  },
  {
    number: '03',
    title: 'Mindful & Sustainable Commerce',
    description:
      'We curate pieces designed to last a lifetime, rejecting fast consumption in favor of conscious materials and biodegradable packaging.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-[#faf8f3]">
    <!-- Breadcrumbs -->
    <div class="border-b border-[var(--shopizz-obsidian)]/10 bg-[#f7f4ee] px-6 py-2.5 sm:px-8">
      <div class="mx-auto flex max-w-7xl items-center gap-2 text-xs text-[var(--shopizz-obsidian)]/60">
        <NuxtLink to="/" class="hover:text-[var(--shopizz-obsidian)]">Home</NuxtLink>
        <span>/</span>
        <span class="font-medium text-[var(--shopizz-obsidian)]">About Us</span>
      </div>
    </div>

    <!-- Editorial Hero -->
    <section class="relative px-6 pt-12 pb-16 sm:px-8 sm:pt-16 sm:pb-20">
      <div class="mx-auto max-w-5xl text-center">
        <span class="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#a9572b]">
          Our Story & Philosophy
        </span>

        <h1 class="mt-4 text-4xl font-medium leading-[1.08] tracking-[-0.03em] text-[var(--shopizz-obsidian)] sm:text-5xl lg:text-6xl">
          Where craft meets
          <br />
          <span class="font-serif italic text-[var(--shopizz-moss)]">
            conscious commerce.
          </span>
        </h1>

        <p class="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[var(--shopizz-obsidian)]/70 sm:text-base">
          Shopizz was founded on a simple belief: that objects in our homes should carry warmth, human intention, and provenance. We are building a soulful digital home for independent makers and conscious collectors.
        </p>

        <div class="mt-8 flex justify-center gap-4">
          <NuxtLink
            to="/shop"
            class="inline-flex items-center gap-2 rounded-full bg-[var(--shopizz-obsidian)] px-7 py-3 text-xs font-medium text-white transition-all hover:bg-[var(--shopizz-moss)] hover:shadow-md"
          >
            <span>Explore Collection</span>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </NuxtLink>

          <NuxtLink
            to="/owner/apply"
            class="inline-flex items-center gap-2 rounded-full border border-[var(--shopizz-obsidian)]/20 px-6 py-3 text-xs font-medium text-[var(--shopizz-obsidian)] transition-all hover:bg-[#ede5d8]/50"
          >
            <span>Become a Seller</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Visual Storytelling Grid -->
    <section class="px-6 pb-20 sm:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-12">
          <!-- Big Left Image -->
          <div class="relative overflow-hidden rounded-3xl bg-[#ede5d8] md:col-span-7 aspect-[16/11]">
            <img
              src="/images/shop-makers-banner.jpg"
              alt="Artisan ceramic maker"
              class="h-full w-full object-cover"
            />
          </div>

          <!-- Small Right Cards -->
          <div class="flex flex-col justify-between gap-6 md:col-span-5">
            <div class="rounded-3xl bg-[#ede5d8] p-8 border border-[var(--shopizz-obsidian)]/10">
              <span class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a9572b]">
                Our Mission
              </span>
              <h3 class="mt-2 text-xl font-medium tracking-tight text-[var(--shopizz-obsidian)]">
                A Marketplace with Soul
              </h3>
              <p class="mt-3 text-xs leading-relaxed text-[var(--shopizz-obsidian)]/75">
                In an era dominated by mass manufacturing, we slow down. Every item you see on Shopizz has been touched by human hands and made with care.
              </p>
            </div>

            <div class="rounded-3xl bg-[#293a30] p-8 text-white">
              <span class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c56a32]">
                Our Community
              </span>
              <h3 class="mt-2 text-xl font-medium tracking-tight text-[#faf8f3]">
                Direct to the Maker
              </h3>
              <p class="mt-3 text-xs leading-relaxed text-[#faf8f3]/80">
                When you buy on Shopizz, your support goes straight to the studio owner. You help preserve traditional skills and empower independent creativity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Numbers / Milestones Strip -->
    <section class="border-y border-[var(--shopizz-obsidian)]/10 bg-[#f2ece2] py-12 px-6 sm:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
          <div v-for="m in milestones" :key="m.label" class="space-y-1">
            <p class="text-3xl font-bold tracking-tight text-[var(--shopizz-obsidian)] sm:text-4xl">
              {{ m.value }}
            </p>
            <p class="text-xs font-medium text-[var(--shopizz-obsidian)]/65">
              {{ m.label }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 3 Core Values -->
    <section class="px-6 py-20 sm:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="text-center max-w-2xl mx-auto mb-14">
          <span class="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#a9572b]">
            What We Stand For
          </span>
          <h2 class="mt-2 text-3xl font-medium tracking-tight text-[var(--shopizz-obsidian)] sm:text-4xl">
            Our Guiding Principles
          </h2>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div
            v-for="val in values"
            :key="val.number"
            class="rounded-3xl bg-white p-8 border border-[var(--shopizz-obsidian)]/10 shadow-xs"
          >
            <span class="text-2xl font-serif italic text-[var(--shopizz-moss)]">
              {{ val.number }}
            </span>
            <h3 class="mt-4 text-lg font-semibold text-[var(--shopizz-obsidian)]">
              {{ val.title }}
            </h3>
            <p class="mt-3 text-xs leading-relaxed text-[var(--shopizz-obsidian)]/70">
              {{ val.description }}
            </p>
          </div>
        </div>

        <div class="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-[#FAF8F5] p-8 space-y-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#94442a]/10 text-xl text-[#94442a]">
              🌿
            </div>
            <h3 class="text-lg font-semibold text-[var(--shopizz-obsidian)]">Artisanal First</h3>
            <p class="text-xs leading-relaxed text-[var(--shopizz-obsidian)]/65">
              We directly partner with studio makers and master craftspeople, bypassing excessive markups and industrial intermediaries.
            </p>
          </div>

          <div class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-[#FAF8F5] p-8 space-y-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#293a30]/10 text-xl text-[#293a30]">
              🛡️
            </div>
            <h3 class="text-lg font-semibold text-[var(--shopizz-obsidian)]">Honest Pricing</h3>
            <p class="text-xs leading-relaxed text-[var(--shopizz-obsidian)]/65">
              Transparent commission structures mean creators earn what they deserve while buyers receive fair pricing on genuine handmade creations.
            </p>
          </div>

          <div class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-[#FAF8F5] p-8 space-y-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c56a32]/10 text-xl text-[#c56a32]">
              ✨
            </div>
            <h3 class="text-lg font-semibold text-[var(--shopizz-obsidian)]">Concierge Service</h3>
            <p class="text-xs leading-relaxed text-[var(--shopizz-obsidian)]/65">
              Dedicated packaging, insured transit, hassle-free 7-day returns, and direct maker communication for every order.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Join Call To Action -->
    <section class="bg-[#293a30] py-16 px-6 sm:px-8 text-center text-white">
      <div class="mx-auto max-w-3xl">
        <h2 class="text-3xl font-medium tracking-tight sm:text-4xl">
          Are you an independent maker?
        </h2>
        <p class="mt-4 text-xs leading-relaxed text-white/80 sm:text-sm">
          Join our growing collective of studios, ceramicists, tailors, and artisans. Open your shop and start reaching conscious buyers who value your work.
        </p>
        <div class="mt-8 flex justify-center gap-4">
          <NuxtLink
            to="/owner/apply"
            class="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-xs font-semibold text-[var(--shopizz-obsidian)] transition-transform hover:scale-105"
          >
            <span>Apply to Sell on Shopizz</span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
