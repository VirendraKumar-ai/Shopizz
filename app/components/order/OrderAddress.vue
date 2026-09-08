<script setup lang="ts">
defineProps<{
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingPostalCode: string
  shippingCountry?: string
  paymentMethod?: string
  paymentStatus?: string
}>()
</script>

<template>
  <div class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-6 sm:p-8 space-y-4">
    <div class="border-b border-[var(--shopizz-obsidian)]/10 pb-4">
      <p class="text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--shopizz-saffron)]">
        Fulfillment Destination
      </p>
      <h3 class="text-base font-medium tracking-tight">
        Delivery & Contact
      </h3>
    </div>

    <div class="space-y-3 text-xs leading-relaxed">
      <div>
        <p class="font-semibold text-sm">{{ shippingName }}</p>
        <p class="text-[var(--shopizz-obsidian)]/60 font-mono text-[11px]">{{ shippingPhone }}</p>
      </div>

      <div class="text-[var(--shopizz-obsidian)]/70">
        <p>{{ shippingAddress }}</p>
        <p>{{ shippingCity }}, {{ shippingState }} - {{ shippingPostalCode }}</p>
        <p>{{ shippingCountry || 'India' }}</p>
      </div>

      <div v-if="paymentMethod" class="pt-2 border-t border-[var(--shopizz-obsidian)]/10 flex items-center justify-between">
        <span class="text-[11px] text-[var(--shopizz-obsidian)]/50 uppercase tracking-wider">Method:</span>
        <span class="font-medium uppercase">{{ paymentMethod }}</span>
      </div>
    </div>
  </div>
</template>
