<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: string | number
    description?: string
  }>(),
  {
    description: '',
  },
)
</script>

<template>
  <div
    class="rounded-[1.75rem] border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-6 transition-transform duration-300 hover:-translate-y-1"
  >
    <p
      class="text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--shopizz-obsidian)]/45"
    >
      {{ label }}
    </p>

    <p
      class="mt-6 text-5xl font-medium tracking-[-0.06em]"
    >
      {{ value }}
    </p>

    <p
      v-if="description"
      class="mt-3 text-xs leading-5 text-[var(--shopizz-obsidian)]/45"
    >
      {{ description }}
    </p>
  </div>
</template>