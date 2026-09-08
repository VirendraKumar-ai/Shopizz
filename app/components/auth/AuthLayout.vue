<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
}>()
</script>

<template>
  <div
    class="min-h-screen px-6 pb-20 pt-32"
  >
    <div class="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--shopizz-obsidian)]/10 bg-white/30 lg:grid-cols-2">

      <!-- Brand panel -->
      <div
        class="relative flex min-h-[420px] flex-col justify-between overflow-hidden bg-[var(--shopizz-moss)] p-8 text-[var(--shopizz-porcelain)] sm:p-12 lg:min-h-[650px]"
      >
        <div>
          <AppLogo />
        </div>

        <div class="relative z-10">
          <p class="mb-5 text-xs uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]">
            Shopizz
          </p>

          <h1 class="max-w-lg text-5xl font-medium leading-[0.92] tracking-[-0.05em] sm:text-6xl">
            Commerce
            <br>
            with
            <span class="text-[var(--shopizz-gold)]">
              character.
            </span>
          </h1>

          <p class="mt-6 max-w-md text-sm leading-7 text-[var(--shopizz-porcelain)]/65">
            Discover independent shops, distinctive products and
            a more considered way to shop.
          </p>
        </div>

        <!-- Decorative shape -->
        <div
          class="absolute -bottom-24 -right-24 h-72 w-72 rounded-full border-[60px] border-[var(--shopizz-saffron)]/20"
        />
      </div>

      <!-- Form panel -->
      <div class="flex items-center bg-[var(--shopizz-porcelain)] p-8 sm:p-12 lg:p-16">
        <div class="w-full max-w-md">
          <div class="mb-10">
            <p class="text-xs uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]">
              {{ eyebrow }}
            </p>

            <h2 class="mt-4 text-4xl font-medium tracking-[-0.04em]">
              {{ title }}
            </h2>

            <p class="mt-4 text-sm leading-6 text-[var(--shopizz-obsidian)]/55">
              {{ description }}
            </p>
          </div>

          <slot />
        </div>
      </div>
    </div>
  </div>
</template>