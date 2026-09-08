<script setup lang="ts">
interface LowStockProduct {
  id: string
  name: string
  slug: string
  sku: string
  price: number
  quantity: number
  categoryName?: string
  imageUrl?: string | null
}

interface Props {
  products: LowStockProduct[]
}

defineProps<Props>()

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount / 100)
}
</script>

<template>
  <div class="flex flex-col justify-between rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-6 sm:p-7">
    <div>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#94442a]">
            Inventory Warning
          </p>
          <h3 class="mt-1 text-lg font-medium tracking-tight text-[var(--shopizz-obsidian)]">
            Low Stock Products
          </h3>
        </div>

        <NuxtLink
          to="/owner/products"
          class="text-xs font-medium text-[var(--shopizz-obsidian)]/60 hover:text-[var(--shopizz-obsidian)] hover:underline"
        >
          Restock →
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div
        v-if="!products.length"
        class="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 py-12 text-center"
      >
        <span class="text-2xl">🌱</span>
        <p class="mt-2 text-xs font-medium text-emerald-800">
          Inventory is healthy
        </p>
        <p class="mt-1 text-[11px] text-emerald-700/60">
          All your active products have 6 or more units in stock.
        </p>
      </div>

      <!-- Low Stock List -->
      <div
        v-else
        class="mt-5 space-y-3"
      >
        <div
          v-for="prod in products"
          :key="prod.id"
          class="flex items-center justify-between rounded-2xl border border-[var(--shopizz-obsidian)]/8 bg-white/80 p-3.5 transition-all hover:bg-white hover:shadow-sm"
        >
          <div class="flex items-center gap-3 min-w-0">
            <!-- Thumbnail -->
            <div class="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[var(--shopizz-stone)]">
              <img
                v-if="prod.imageUrl"
                :src="prod.imageUrl"
                :alt="prod.name"
                class="h-full w-full object-cover"
              >
              <div
                v-else
                class="flex h-full w-full items-center justify-center text-xs font-serif text-[var(--shopizz-obsidian)]/40"
              >
                {{ prod.name.charAt(0) }}
              </div>
            </div>

            <div class="min-w-0">
              <p class="truncate text-xs font-semibold text-[var(--shopizz-obsidian)]">
                {{ prod.name }}
              </p>
              <p class="mt-0.5 text-[11px] text-[var(--shopizz-obsidian)]/55">
                {{ formatPrice(prod.price) }} • SKU: {{ prod.sku }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <span class="rounded-full bg-[#faece7] px-2.5 py-1 text-[10px] font-bold text-[#94442a]">
              {{ prod.quantity }} left
            </span>

            <NuxtLink
              :to="`/owner/products/${prod.id}/edit`"
              class="rounded-full border border-[var(--shopizz-obsidian)]/15 px-3 py-1 text-[11px] font-medium text-[var(--shopizz-obsidian)] transition-colors hover:bg-[var(--shopizz-obsidian)] hover:text-white"
            >
              Update
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 pt-4 border-t border-[var(--shopizz-obsidian)]/10 text-right">
      <NuxtLink
        to="/owner/products"
        class="text-xs font-medium text-[var(--shopizz-saffron)] hover:underline"
      >
        View full product catalog & inventory →
      </NuxtLink>
    </div>
  </div>
</template>
