<script setup lang="ts">
const pillars = [
  {
    icon: 'sparkles',
    title: 'Unique & Handcrafted',
    description: 'Every product is handpicked from independent makers who pour passion into their craft.',
  },
  {
    icon: 'heart-handshake',
    title: 'Support Small Businesses',
    description: 'Directly empower local artisans, independent studios, and passionate creators worldwide.',
  },
  {
    icon: 'shield-check',
    title: 'Secure Shopping',
    description: 'End-to-end encrypted checkout with verified payment options and purchase protection.',
  },
  {
    icon: 'truck',
    title: 'Fast & Reliable Delivery',
    description: 'Carefully packaged and tracked shipping directly from the artisan makers to your door.',
  },
]
</script>

<template>
  <section class="border-t border-[var(--shopizz-obsidian)]/10 bg-[#f7f4ee] py-14 px-6 sm:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="pillar in pillars"
          :key="pillar.title"
          class="flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-300 hover:bg-white/60"
        >
          <!-- Icon Circle Badge -->
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-[#ede5d8] text-[var(--shopizz-moss)] mb-4"
          >
            <!-- Sparkles -->
            <svg
              v-if="pillar.icon === 'sparkles'"
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.75"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z"
              />
            </svg>

            <!-- Support / Heart -->
            <svg
              v-else-if="pillar.icon === 'heart-handshake'"
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.75"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>

            <!-- Shield -->
            <svg
              v-else-if="pillar.icon === 'shield-check'"
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.75"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>

            <!-- Truck -->
            <svg
              v-else-if="pillar.icon === 'truck'"
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.75"
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
          </div>

          <!-- Title -->
          <h3 class="text-sm font-semibold tracking-tight text-[var(--shopizz-obsidian)] mb-1.5">
            {{ pillar.title }}
          </h3>

          <!-- Description -->
          <p class="text-xs leading-relaxed text-[var(--shopizz-obsidian)]/65 max-w-xs">
            {{ pillar.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
