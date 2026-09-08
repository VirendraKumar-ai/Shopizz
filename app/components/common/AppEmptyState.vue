<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: 'Nothing here yet',
    description: 'There is nothing to display right now.',
  },
)
</script>

<template>
  <div
    class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 px-6 py-16 text-center"
  >
    <div
      class="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--shopizz-stone)]"
    >
      <span class="text-lg">○</span>
    </div>

    <h3 class="text-lg font-medium tracking-[-0.02em]">
      {{ title }}
    </h3>

    <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--shopizz-obsidian)]/50">
      {{ description }}
    </p>

    <div
      v-if="$slots.default"
      class="mt-6"
    >
      <slot />
    </div>
  </div>
</template>