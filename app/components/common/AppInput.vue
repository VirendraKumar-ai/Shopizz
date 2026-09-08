<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
    type?: string
    error?: string
    disabled?: boolean
    autocomplete?: string
  }>(),
  {
    type: 'text',
    disabled: false,
  },
)

const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="space-y-2">
    <label
      v-if="label"
      class="block text-xs font-medium uppercase tracking-[0.18em] text-[var(--shopizz-obsidian)]/60"
    >
      {{ label }}
    </label>

    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 px-4 py-3.5 text-sm outline-none placeholder:text-[var(--shopizz-obsidian)]/35 transition-all duration-200 focus:border-[var(--shopizz-moss)] focus:bg-white focus:ring-2 focus:ring-[var(--shopizz-moss)]/10 disabled:cursor-not-allowed disabled:opacity-50"
      :class="{
        'border-[var(--shopizz-saffron)]': error,
      }"
    />

    <p
      v-if="error"
      class="text-xs text-[var(--shopizz-saffron)]"
    >
      {{ error }}
    </p>
  </div>
</template>