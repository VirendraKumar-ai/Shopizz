<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'owner'],
})

const {
  data,
  pending,
  error,
  refresh,
} = await useFetch<{
  success: boolean
  products: any[]
}>('/api/owner/products')

const products = computed(() => data.value?.products ?? [])

const searchQuery = ref('')
const selectedStatus = ref('ALL')

const filteredProducts = computed(() => {
  let result = products.value

  if (selectedStatus.value !== 'ALL') {
    result = result.filter((p) => p.status === selectedStatus.value)
  }

  const search = searchQuery.value.trim().toLowerCase()
  if (search) {
    result = result.filter((p) =>
      p.name?.toLowerCase().includes(search) ||
      p.sku?.toLowerCase().includes(search) ||
      p.category?.name?.toLowerCase().includes(search)
    )
  }

  return result
})

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

const isDeleting = ref<string | null>(null)

// Quick Restock Modal State
const isRestockModalOpen = ref(false)
const selectedProductForRestock = ref<any>(null)
const restockDelta = ref<number>(5)
const isUpdatingStock = ref(false)
const stockFeedback = ref('')

function openRestockModal(product: any) {
  selectedProductForRestock.value = product
  restockDelta.value = 5
  stockFeedback.value = ''
  isRestockModalOpen.value = true
}

async function handleUpdateStock() {
  if (!selectedProductForRestock.value) return
  isUpdatingStock.value = true
  try {
    await $fetch(`/api/owner/products/${selectedProductForRestock.value.id}/stock`, {
      method: 'PATCH',
      body: { delta: restockDelta.value },
    })
    stockFeedback.value = `Stock updated for "${selectedProductForRestock.value.name}"`
    await refresh()
    setTimeout(() => {
      isRestockModalOpen.value = false
      stockFeedback.value = ''
    }, 1200)
  } catch (err: any) {
    alert(err?.data?.statusMessage || err?.message || 'Failed to update stock')
  } finally {
    isUpdatingStock.value = false
  }
}

const handleArchive = async (productId: string) => {
  if (!confirm('Are you sure you want to archive this product? It will no longer appear in the marketplace.')) {
    return
  }

  isDeleting.value = productId
  try {
    await $fetch(`/api/owner/products/${productId}`, {
      method: 'DELETE',
    })
    await refresh()
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to archive product')
  } finally {
    isDeleting.value = null
  }
}
</script>

<template>
  <div class="space-y-10">
    <!-- Header -->
    <section>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]">
            Owner / 002
          </p>

          <h1 class="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
            My Products
          </h1>

          <p class="mt-3 max-w-xl text-sm leading-7 text-[var(--shopizz-obsidian)]/55">
            Manage your shop listings, modify pricing, stock levels and publish new pieces.
          </p>
        </div>

        <NuxtLink to="/owner/products/new">
          <AppButton>
            + Create New Product
          </AppButton>
        </NuxtLink>
      </div>
    </section>

    <!-- Filters Bar -->
    <section class="flex flex-col gap-4 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div class="w-full sm:w-72">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Filter by product name, SKU or category..."
          class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-[var(--shopizz-obsidian)]"
        />
      </div>

      <div class="flex items-center gap-2">
        <button
          v-for="status in ['ALL', 'ACTIVE', 'DRAFT', 'ARCHIVED']"
          :key="status"
          type="button"
          class="rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider transition-all"
          :class="
            selectedStatus === status
              ? 'bg-[var(--shopizz-obsidian)] text-white'
              : 'bg-white/40 text-[var(--shopizz-obsidian)]/60 hover:bg-white'
          "
          @click="selectedStatus = status"
        >
          {{ status }}
        </button>
      </div>
    </section>

    <!-- Loading -->
    <AppLoading v-if="pending" text="Loading product catalog..." />

    <!-- Error -->
    <div
      v-else-if="error"
      class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-8"
    >
      <p class="text-sm text-[var(--shopizz-obsidian)]/60">
        Failed to load your products.
      </p>
      <AppButton class="mt-4" size="sm" @click="refresh()">
        Try again
      </AppButton>
    </div>

    <!-- Products Table -->
    <section v-else class="overflow-hidden rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30">
      <div v-if="!filteredProducts.length" class="p-12 text-center text-sm text-[var(--shopizz-obsidian)]/50">
        No products found matching your filter criteria.
      </div>

      <table v-else class="w-full text-left text-xs">
        <thead class="border-b border-[var(--shopizz-obsidian)]/10 bg-white/40 text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">
          <tr>
            <th class="px-6 py-4">Piece</th>
            <th class="px-6 py-4">Category</th>
            <th class="px-6 py-4">Price</th>
            <th class="px-6 py-4">Stock</th>
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--shopizz-obsidian)]/10">
          <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-white/40 transition-colors">
            <!-- Piece -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-4">
                <div class="h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-[var(--shopizz-stone)]/40">
                  <img
                    v-if="product.imageUrl"
                    :src="product.imageUrl"
                    :alt="product.name"
                    class="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p class="font-medium text-sm text-[var(--shopizz-obsidian)]">{{ product.name }}</p>
                  <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">
                    SKU: {{ product.sku }}
                  </p>
                </div>
              </div>
            </td>

            <!-- Category -->
            <td class="px-6 py-4 text-[var(--shopizz-obsidian)]/65">
              {{ product.category?.name || '—' }}
            </td>

            <!-- Price -->
            <td class="px-6 py-4 font-medium">
              {{ formatPrice(product.price) }}
            </td>

            <!-- Stock -->
            <td class="px-6 py-4">
              <span
                class="inline-flex items-center gap-1.5 font-medium"
                :class="product.stock <= 5 ? 'text-[var(--shopizz-saffron)]' : 'text-[var(--shopizz-obsidian)]/80'"
              >
                <span class="h-1.5 w-1.5 rounded-full" :class="product.stock <= 5 ? 'bg-[var(--shopizz-saffron)]' : 'bg-[var(--shopizz-moss)]'" />
                {{ product.stock }} units
              </span>
            </td>

            <!-- Status -->
            <td class="px-6 py-4">
              <AppBadge
                :variant="
                  product.status === 'ACTIVE'
                    ? 'success'
                    : product.status === 'DRAFT'
                    ? 'warning'
                    : 'danger'
                "
              >
                {{ product.status }}
              </AppBadge>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 text-right space-x-3">
              <button
                type="button"
                class="font-semibold text-[#94442A] hover:underline cursor-pointer"
                @click="openRestockModal(product)"
              >
                + Restock
              </button>

              <NuxtLink
                :to="`/owner/products/${product.id}/edit`"
                class="font-medium text-[var(--shopizz-obsidian)]/70 hover:text-[var(--shopizz-obsidian)] underline"
              >
                Edit
              </NuxtLink>

              <button
                v-if="product.status !== 'ARCHIVED'"
                type="button"
                :disabled="isDeleting === product.id"
                class="font-medium text-[var(--shopizz-saffron)]/80 hover:text-[var(--shopizz-saffron)] underline disabled:opacity-40 cursor-pointer"
                @click="handleArchive(product.id)"
              >
                Archive
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Quick Restock Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isRestockModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <div
            class="fixed inset-0 bg-[#1F2623]/60 backdrop-blur-sm"
            @click="isRestockModalOpen = false"
          />

          <div class="relative w-full max-w-sm rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 shadow-2xl space-y-4">
            <div class="flex items-start justify-between pb-3 border-b border-[#E8E2D8]">
              <div>
                <h3 class="font-serif text-lg font-bold text-[#1F2623]">Quick Restock</h3>
                <p class="text-xs text-[#7A746B] truncate max-w-[200px]">
                  {{ selectedProductForRestock?.name }}
                </p>
              </div>
              <button
                type="button"
                class="rounded-full p-1 text-gray-400 hover:text-gray-700"
                @click="isRestockModalOpen = false"
              >
                ✕
              </button>
            </div>

            <div v-if="stockFeedback" class="rounded-xl bg-[#EBF3EE] p-3 text-xs text-[#2D5A43] font-semibold text-center">
              ✓ {{ stockFeedback }}
            </div>

            <div class="space-y-4 text-xs">
              <div class="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E8E2D8]">
                <span class="text-[#7A746B]">Current Inventory</span>
                <span class="font-bold text-sm text-[#1F2623]">{{ selectedProductForRestock?.stock }} units</span>
              </div>

              <div>
                <label class="block font-medium text-[#7A746B] mb-2">Add Stock Quantity</label>
                <div class="flex items-center gap-2">
                  <button
                    v-for="d in [1, 5, 10, 25]"
                    :key="d"
                    type="button"
                    class="flex-1 rounded-xl border py-2 text-center font-bold transition-all cursor-pointer"
                    :class="restockDelta === d ? 'border-[#94442A] bg-[#FDF3EE] text-[#94442A]' : 'border-[#D5CEC4] bg-white text-[#1F2623]'"
                    @click="restockDelta = d"
                  >
                    +{{ d }}
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D8]">
                <button
                  type="button"
                  class="rounded-full px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  @click="isRestockModalOpen = false"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  :disabled="isUpdatingStock"
                  class="rounded-full bg-[#1F2623] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2E3C32] disabled:opacity-50 cursor-pointer"
                  @click="handleUpdateStock"
                >
                  {{ isUpdatingStock ? 'Updating...' : `Add +${restockDelta} Units` }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
