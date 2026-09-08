<script setup lang="ts">
const props = defineProps<{
  subtotal: number
  shippingFee: number
  taxAmount?: number
  discountAmount?: number
  totalAmount: number
  paymentStatus?: string
  paymentMethod?: string
}>()

const formatRupees = (paise: number) => {
  return (paise / 100).toLocaleString('en-IN')
}
</script>

<template>
  <div class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-6 sm:p-8 space-y-4">
    <div class="flex items-center justify-between border-b border-[var(--shopizz-obsidian)]/10 pb-4">
      <div>
        <p class="text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--shopizz-saffron)]">
          Financials
        </p>
        <h3 class="text-base font-medium tracking-tight">
          Payment Summary
        </h3>
      </div>

      <OrderStatusBadge
        v-if="paymentStatus"
        :status="paymentStatus"
        type="payment"
      />
    </div>

    <div class="space-y-2.5 text-xs">
      <div class="flex justify-between text-[var(--shopizz-obsidian)]/70">
        <span>Items Subtotal</span>
        <span>₹{{ formatRupees(subtotal) }}</span>
      </div>

      <div class="flex justify-between text-[var(--shopizz-obsidian)]/70">
        <span>Shipping & Handling</span>
        <span>{{ shippingFee === 0 ? 'Complimentary' : `₹${formatRupees(shippingFee)}` }}</span>
      </div>

      <div v-if="taxAmount && taxAmount > 0" class="flex justify-between text-[var(--shopizz-obsidian)]/70">
        <span>Taxes</span>
        <span>₹{{ formatRupees(taxAmount) }}</span>
      </div>

      <div v-if="discountAmount && discountAmount > 0" class="flex justify-between text-[var(--shopizz-moss)]">
        <span>Savings</span>
        <span>-₹{{ formatRupees(discountAmount) }}</span>
      </div>

      <div class="border-t border-[var(--shopizz-obsidian)]/10 pt-3 flex items-baseline justify-between">
        <span class="text-sm font-semibold">Total Paid</span>
        <span class="text-lg font-bold text-[var(--shopizz-obsidian)]">
          ₹{{ formatRupees(totalAmount) }}
        </span>
      </div>
    </div>
  </div>
</template>
