<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary' | 'ghost' | 'accent'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
  }>(),
  {
    type: 'button',
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
    :class="[
      {
        'px-4 py-2 text-xs': size === 'sm',
        'px-6 py-3 text-sm': size === 'md',
        'px-7 py-3.5 text-sm': size === 'lg',
      },

      {
        'bg-[var(--shopizz-obsidian)] text-white hover:-translate-y-0.5 hover:bg-[var(--shopizz-moss)]':
          variant === 'primary',

        'border border-[var(--shopizz-obsidian)]/15 bg-white/40 hover:-translate-y-0.5 hover:bg-white':
          variant === 'secondary',

        'bg-transparent text-[var(--shopizz-obsidian)] hover:bg-[var(--shopizz-stone)]':
          variant === 'ghost',

        'bg-[var(--shopizz-saffron)] text-white hover:-translate-y-0.5':
          variant === 'accent',
      },
    ]"
  >
    <slot />
  </button>
</template>