<script setup lang="ts">
const props = defineProps<{
  status: string
  type?: 'order' | 'payment'
}>()

const badgeConfig = computed(() => {
  const s = props.status?.toUpperCase()

  if (props.type === 'payment') {
    switch (s) {
      case 'PAID':
        return { label: 'PAID', variant: 'success' as const, dot: 'bg-[var(--shopizz-moss)]' }
      case 'PENDING':
        return { label: 'PAYMENT PENDING', variant: 'warning' as const, dot: 'bg-[var(--shopizz-saffron)]' }
      case 'FAILED':
        return { label: 'PAYMENT FAILED', variant: 'danger' as const, dot: 'bg-red-500' }
      case 'REFUNDED':
        return { label: 'REFUNDED', variant: 'neutral' as const, dot: 'bg-gray-500' }
      default:
        return { label: s || 'UNKNOWN', variant: 'neutral' as const, dot: 'bg-gray-400' }
    }
  }

  // Order lifecycle status
  switch (s) {
    case 'PLACED':
      return { label: 'ORDER PLACED', bg: 'bg-blue-500/10 text-blue-700 border-blue-500/20', dot: 'bg-blue-600' }
    case 'CONFIRMED':
      return { label: 'CONFIRMED', bg: 'bg-teal-500/10 text-teal-700 border-teal-500/20', dot: 'bg-teal-600' }
    case 'PROCESSING':
      return { label: 'IN CRAFT / PACKING', bg: 'bg-[var(--shopizz-saffron)]/10 text-[var(--shopizz-saffron)] border-[var(--shopizz-saffron)]/20', dot: 'bg-[var(--shopizz-saffron)]' }
    case 'SHIPPED':
      return { label: 'DISPATCHED & SHIPPED', bg: 'bg-purple-500/10 text-purple-700 border-purple-500/20', dot: 'bg-purple-600' }
    case 'OUT_FOR_DELIVERY':
      return { label: 'OUT FOR DELIVERY', bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20', dot: 'bg-indigo-600' }
    case 'DELIVERED':
      return { label: 'DELIVERED', bg: 'bg-[var(--shopizz-moss)]/10 text-[var(--shopizz-moss)] border-[var(--shopizz-moss)]/20', dot: 'bg-[var(--shopizz-moss)]' }
    case 'CANCELLED':
      return { label: 'CANCELLED', bg: 'bg-red-500/10 text-red-700 border-red-500/20', dot: 'bg-red-600' }
    case 'REFUNDED':
      return { label: 'REFUNDED', bg: 'bg-stone-500/10 text-stone-700 border-stone-500/20', dot: 'bg-stone-600' }
    default:
      return { label: s || 'PENDING', bg: 'bg-stone-500/10 text-stone-700 border-stone-500/20', dot: 'bg-stone-600' }
  }
})
</script>

<template>
  <span
    v-if="type === 'payment'"
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
    :class="[
      badgeConfig.variant === 'success' ? 'bg-[var(--shopizz-moss)]/10 text-[var(--shopizz-moss)] border border-[var(--shopizz-moss)]/20' : '',
      badgeConfig.variant === 'warning' ? 'bg-[var(--shopizz-saffron)]/10 text-[var(--shopizz-saffron)] border border-[var(--shopizz-saffron)]/20' : '',
      badgeConfig.variant === 'danger' ? 'bg-red-500/10 text-red-700 border border-red-500/20' : '',
      badgeConfig.variant === 'neutral' ? 'bg-[var(--shopizz-obsidian)]/10 text-[var(--shopizz-obsidian)]/70 border border-[var(--shopizz-obsidian)]/20' : '',
    ]"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="badgeConfig.dot" />
    {{ badgeConfig.label }}
  </span>

  <span
    v-else
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border"
    :class="badgeConfig.bg"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="badgeConfig.dot" />
    {{ badgeConfig.label }}
  </span>
</template>
