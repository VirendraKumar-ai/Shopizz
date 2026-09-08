<script setup lang="ts">
withDefaults(
  defineProps<{
    text?: string
    fullPage?: boolean
  }>(),
  {
    text: 'Loading...',
    fullPage: false,
  },
)
</script>

<template>
  <div
    class="flex items-center justify-center gap-3"
    :class="fullPage ? 'min-h-[60vh]' : 'py-10'"
  >
    <span
      class="h-5 w-5 animate-spin rounded-full border-2 border-[var(--shopizz-obsidian)]/10 border-t-[var(--shopizz-moss)]"
    />

    <span class="text-sm text-[var(--shopizz-obsidian)]/60">
      {{ text }}
    </span>
  </div>
</template>