<script setup lang="ts">
export interface OrderItem {
  id: string
  productId: string
  productName?: string | null
  productSku?: string | null
  productSlug?: string | null
  productImage?: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  ownerName?: string | null
}

defineProps<{
  items: OrderItem[]
}>()

const formatRupees = (paise: number) => {
  return (paise / 100).toLocaleString('en-IN')
}
</script>

<template>
  <div class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-6 sm:p-8 space-y-4">
    <div class="border-b border-[var(--shopizz-obsidian)]/10 pb-4">
      <p class="text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--shopizz-saffron)]">
        Manifest
      </p>
      <h3 class="text-base font-medium tracking-tight">
        Purchased Pieces ({{ items.length }})
      </h3>
    </div>

    <div class="divide-y divide-[var(--shopizz-obsidian)]/10">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center gap-4 py-4 first:pt-2 last:pb-0"
      >
        <!-- Thumbnail -->
        <div class="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[var(--shopizz-stone)]/30">
          <img
            v-if="item.productImage"
            :src="item.productImage"
            :alt="item.productName || 'Piece'"
            class="h-full w-full object-cover"
          />
          <div v-else class="flex h-full w-full items-center justify-center text-xs font-bold text-[var(--shopizz-obsidian)]/30">
            SZ
          </div>
        </div>

        <!-- Meta -->
        <div class="flex-1 min-w-0">
          <NuxtLink
            v-if="item.productSlug"
            :to="`/product/${item.productSlug}`"
            class="text-xs font-medium hover:text-[var(--shopizz-saffron)] transition-colors line-clamp-1"
          >
            {{ item.productName || 'Marketplace Piece' }}
          </NuxtLink>
          <p v-else class="text-xs font-medium line-clamp-1">
            {{ item.productName || 'Marketplace Piece' }}
          </p>

          <div class="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-[var(--shopizz-obsidian)]/50">
            <span v-if="item.productSku" class="font-mono uppercase bg-[var(--shopizz-stone)]/50 px-1.5 py-0.5 rounded">
              {{ item.productSku }}
            </span>

            <span v-if="item.ownerName">
              By {{ item.ownerName }}
            </span>

            <span>•</span>
            <span>Qty: {{ item.quantity }}</span>
          </div>
        </div>

        <!-- Pricing -->
        <div class="text-right">
          <p class="text-xs font-semibold">
            ₹{{ formatRupees(item.totalPrice) }}
          </p>
          <p class="text-[10px] text-[var(--shopizz-obsidian)]/45">
            ₹{{ formatRupees(item.unitPrice) }} ea.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
