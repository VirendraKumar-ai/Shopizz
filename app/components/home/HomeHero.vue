<script setup lang="ts">
const authStore = useAuthStore()

const isAuthenticated = computed(() => !!authStore.user)
const firstName = computed(() => {
  if (!authStore.user?.name) return 'there'
  return authStore.user.name.split(' ')[0]
})
</script>

<template>
  <section class="relative px-6 pt-8 pb-8 sm:px-8 sm:pt-10 sm:pb-10">
    <div class="mx-auto max-w-7xl">
      <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8">
        <!-- Left Content (5 cols) -->
        <div class="lg:col-span-5">
          <!-- Personalized Header when Logged In (Image 3) -->
          <template v-if="isAuthenticated">
            <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c56a32]">
              Welcome Back
            </p>

            <h1
              class="mt-4 font-serif text-4xl font-medium leading-[1.08] tracking-[-0.03em] text-[var(--shopizz-obsidian)] sm:text-5xl lg:text-6xl"
            >
              Hi, {{ firstName }}.
              <br />
              <span class="text-3xl sm:text-4xl lg:text-5xl text-[var(--shopizz-obsidian)]/90 font-normal">
                What are you looking for today?
              </span>
            </h1>

            <p class="mt-5 max-w-md text-sm leading-relaxed text-[var(--shopizz-obsidian)]/65 sm:text-base">
              Discover unique products from independent shops, made by people with something to say.
            </p>

            <!-- CTA Buttons matching Image 3 -->
            <div class="mt-7 flex flex-wrap items-center gap-3.5">
              <NuxtLink
                to="/shop"
                class="inline-flex items-center gap-2.5 rounded-full bg-[#293a30] px-6 py-3 text-xs font-medium tracking-wide text-white transition-all duration-300 hover:bg-[var(--shopizz-obsidian)] hover:shadow-md"
              >
                <span>Explore Collection</span>
                <span>→</span>
              </NuxtLink>

              <NuxtLink
                to="/shop"
                class="inline-flex items-center gap-2 rounded-full border border-[var(--shopizz-obsidian)]/20 bg-white/60 px-6 py-3 text-xs font-medium text-[var(--shopizz-obsidian)] transition-colors hover:bg-white hover:border-[var(--shopizz-obsidian)]"
              >
                <span>View Categories</span>
              </NuxtLink>
            </div>
          </template>

          <!-- Guest Header when Logged Out -->
          <template v-else>
            <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c56a32]">
              Welcome to Shopizz
            </p>

            <h1
              class="mt-4 text-5xl font-medium leading-[1.02] tracking-[-0.04em] text-[var(--shopizz-obsidian)] sm:text-6xl lg:text-7xl"
            >
              Commerce
              <br />
              with
              <span class="text-[var(--shopizz-moss)]">
                character.
              </span>
            </h1>

            <p class="mt-5 max-w-md text-sm leading-relaxed text-[var(--shopizz-obsidian)]/65 sm:text-base">
              A curated marketplace of independent shops, distinctive products and real stories.
            </p>

            <!-- CTA Button -->
            <div class="mt-7 flex items-center">
              <NuxtLink
                to="/shop"
                class="inline-flex items-center gap-2.5 rounded-full bg-[#293a30] px-6 py-2.5 text-xs font-medium tracking-wide text-white transition-all duration-300 hover:bg-[var(--shopizz-obsidian)] hover:shadow-md"
              >
                <span>Explore Collection</span>
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </NuxtLink>
            </div>
          </template>

          <!-- Trust Bar / Social Proof -->
          <div
            class="mt-8 flex flex-wrap items-center gap-6 border-t border-[var(--shopizz-obsidian)]/10 pt-5 text-xs font-medium text-[var(--shopizz-obsidian)]/70 sm:gap-7"
          >
            <div class="flex items-center gap-2">
              <svg class="h-4 w-4 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span>100+ Independent Shops</span>
            </div>
            <span class="text-[var(--shopizz-obsidian)]/20">|</span>
            <div class="flex items-center gap-2">
              <svg class="h-4 w-4 text-[var(--shopizz-saffron)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
              <span>Trusted by 10K+ Customers</span>
            </div>
          </div>
        </div>

        <!-- Right Hero Artwork: Asymmetrical Top-Left Arch (7 cols) -->
        <div class="relative lg:col-span-7">
          <div
            class="relative aspect-[16/10] w-full overflow-hidden rounded-tl-[160px] rounded-tr-none rounded-bl-none rounded-br-2xl bg-[#e5dfd3] shadow-lg sm:rounded-tl-[220px] lg:rounded-tl-[260px]"
          >
            <img
              src="/images/hero-editorial.jpg"
              alt="Editorial luxury interior scene with terracotta backdrop, green armchair and ceramic vase"
              class="h-full w-full object-cover object-[center_35%]"
            />

            <!-- Floating Dark Badge on Bottom-Right -->
            <div
              class="absolute bottom-0 right-0 rounded-tl-2xl bg-[#101010]/95 px-5 py-3.5 text-left text-xs font-medium tracking-wide text-white backdrop-blur-md shadow-xl"
            >
              <div class="text-[11px] leading-relaxed text-white/95">
                Curated.
                <br />
                Conscious.
                <br />
                Character.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
