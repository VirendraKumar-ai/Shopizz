<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'default' | 'success' | 'warning' | 'danger'
  }>(),
  {
    variant: 'default',
  },
)
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em]"
    :class="{
      'bg-[var(--shopizz-stone)] text-[var(--shopizz-obsidian)]/70':
        variant === 'default',

      'bg-[var(--shopizz-moss)]/10 text-[var(--shopizz-moss)]':
        variant === 'success',

      'bg-[var(--shopizz-saffron)]/10 text-[var(--shopizz-saffron)]':
        variant === 'warning',

      'bg-[var(--shopizz-obsidian)] text-white':
        variant === 'danger',
    }"
  >
    <slot />
  </span>
</template>