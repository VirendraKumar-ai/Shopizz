<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const statusFilter = ref('ALL')
const searchQuery = ref('')
const featuredOnly = ref(false)

const {
  data,
  pending,
  error,
  refresh,
} = await useFetch<any>('/api/admin/products', {
  query: computed(() => ({
    status: statusFilter.value,
    search: searchQuery.value,
    featured: featuredOnly.value ? 'true' : undefined,
  })),
})

const counts = computed(() => data.value?.counts || {
  total: 0,
  active: 0,
  draft: 0,
  archived: 0,
  featured: 0,
})

const products = computed(() => data.value?.products || [])

// Modal for quick status change / archive
const selectedProduct = ref<any>(null)
const isModalOpen = ref(false)
const modalAction = ref<'ARCHIVE' | 'ACTIVATE' | 'DRAFT'>('ARCHIVE')
const isProcessing = ref(false)
const actionError = ref('')

function openStatusModal(product: any, action: 'ARCHIVE' | 'ACTIVATE' | 'DRAFT') {
  selectedProduct.value = product
  modalAction.value = action
  actionError.value = ''
  isModalOpen.value = true
}

async function confirmStatusChange() {
  if (!selectedProduct.value) return
  isProcessing.value = true
  actionError.value = ''

  try {
    const res = await $fetch<{ success: boolean }>(`/api/admin/products/${selectedProduct.value.id}/status`, {
      method: 'PATCH',
      body: {
        status: modalAction.value === 'ARCHIVE' ? 'ARCHIVED' : modalAction.value === 'ACTIVATE' ? 'ACTIVE' : 'DRAFT',
      },
    })
    if (res.success) {
      isModalOpen.value = false
      await refresh()
    }
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.message || 'Failed to update product status.'
  } finally {
    isProcessing.value = false
  }
}

async function toggleFeatured(product: any) {
  try {
    await $fetch(`/api/admin/products/${product.id}/status`, {
      method: 'PATCH',
      body: {
        isFeatured: !product.isFeatured,
      },
    })
    await refresh()
  } catch (err: any) {
    console.error('Failed to toggle featured status', err)
  }
}

function formatPrice(paise: number) {
  return '₹' + Math.round((paise || 0) / 100).toLocaleString('en-IN')
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.25em] text-[var(--shopizz-terracotta)]">
          Platform Governance
        </p>
        <h1 class="mt-1 font-serif text-3xl font-medium tracking-tight text-[var(--shopizz-obsidian)] sm:text-4xl">
          Product Catalog & Moderation
        </h1>
        <p class="mt-1 text-xs text-[var(--shopizz-obsidian)]/55">
          Audit marketplace listings, feature top artisanal crafts, and manage seller catalog compliance.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-2 text-xs font-medium text-[var(--shopizz-obsidian)] hover:bg-[var(--shopizz-porcelain)]"
          @click="() => refresh()"
        >
          <span>↻</span> Refresh Catalog
        </button>
      </div>
    </div>

    <!-- Metric KPI Cards -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <div class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/60 p-5 backdrop-blur-sm">
        <p class="text-[10px] font-medium uppercase tracking-wider text-[var(--shopizz-obsidian)]/50">
          Total Listings
        </p>
        <p class="mt-2 font-serif text-2xl font-semibold text-[var(--shopizz-obsidian)]">
          {{ counts.total }}
        </p>
      </div>

      <div class="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 backdrop-blur-sm">
        <p class="text-[10px] font-medium uppercase tracking-wider text-emerald-800/70">
          Active / Live
        </p>
        <p class="mt-2 font-serif text-2xl font-semibold text-emerald-900">
          {{ counts.active }}
        </p>
      </div>

      <div class="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 backdrop-blur-sm">
        <p class="text-[10px] font-medium uppercase tracking-wider text-amber-800/70">
          Drafts / In Review
        </p>
        <p class="mt-2 font-serif text-2xl font-semibold text-amber-900">
          {{ counts.draft }}
        </p>
      </div>

      <div class="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-5 backdrop-blur-sm">
        <p class="text-[10px] font-medium uppercase tracking-wider text-rose-800/70">
          Archived / Delisted
        </p>
        <p class="mt-2 font-serif text-2xl font-semibold text-rose-900">
          {{ counts.archived }}
        </p>
      </div>

      <div class="rounded-3xl border border-[var(--shopizz-terracotta)]/20 bg-[var(--shopizz-terracotta)]/5 p-5 backdrop-blur-sm">
        <p class="text-[10px] font-medium uppercase tracking-wider text-[var(--shopizz-terracotta)]">
          Featured Pieces
        </p>
        <p class="mt-2 font-serif text-2xl font-semibold text-[var(--shopizz-terracotta)]">
          {{ counts.featured }}
        </p>
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="flex flex-col gap-4 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-4 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
      <!-- Status Tabs -->
      <div class="flex flex-wrap items-center gap-1.5">
        <button
          v-for="st in [
            { id: 'ALL', label: 'All Items' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'DRAFT', label: 'Drafts' },
            { id: 'ARCHIVED', label: 'Archived' },
          ]"
          :key="st.id"
          type="button"
          class="rounded-full px-4 py-1.5 text-xs font-medium transition-all"
          :class="
            statusFilter === st.id
              ? 'bg-[var(--shopizz-obsidian)] text-white shadow-sm'
              : 'text-[var(--shopizz-obsidian)]/60 hover:bg-black/5 hover:text-[var(--shopizz-obsidian)]'
          "
          @click="statusFilter = st.id"
        >
          {{ st.label }}
        </button>
      </div>

      <!-- Search & Featured Toggle -->
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <label class="flex items-center gap-2 text-xs text-[var(--shopizz-obsidian)]/70 cursor-pointer select-none">
          <input
            v-model="featuredOnly"
            type="checkbox"
            class="rounded border-[var(--shopizz-obsidian)]/20 text-[var(--shopizz-terracotta)] focus:ring-[var(--shopizz-terracotta)]"
          />
          <span>⭐ Featured Only</span>
        </label>

        <div class="relative w-full sm:w-64">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--shopizz-obsidian)]/40">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by title, SKU, maker..."
            class="w-full rounded-full border border-[var(--shopizz-obsidian)]/15 bg-white py-2 pl-9 pr-4 text-xs outline-none focus:border-[var(--shopizz-terracotta)]"
          />
        </div>
      </div>
    </div>

    <!-- Loading / Error / Table Content -->
    <AppLoading v-if="pending" text="Loading product catalog..." />

    <div
      v-else-if="error"
      class="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center"
    >
      <p class="text-sm font-medium text-red-700">Failed to load product catalog.</p>
      <AppButton size="sm" class="mt-4" @click="() => refresh()">Retry</AppButton>
    </div>

    <div
      v-else-if="products.length === 0"
      class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-12 text-center"
    >
      <p class="font-serif text-xl font-medium text-[var(--shopizz-obsidian)]">
        No products found
      </p>
      <p class="mt-1 text-xs text-[var(--shopizz-obsidian)]/55">
        No catalog listings matched the selected filter criteria.
      </p>
    </div>

    <!-- Products Table -->
    <div v-else class="overflow-hidden rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/70 shadow-sm backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-[var(--shopizz-obsidian)]/10 bg-[var(--shopizz-porcelain)]/80 text-[10px] font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]/60">
              <th class="px-5 py-4">Product & SKU</th>
              <th class="px-5 py-4">Maker / Shop</th>
              <th class="px-5 py-4">Category</th>
              <th class="px-5 py-4">Price</th>
              <th class="px-5 py-4">Stock</th>
              <th class="px-5 py-4">Status</th>
              <th class="px-5 py-4 text-center">Featured</th>
              <th class="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--shopizz-obsidian)]/10">
            <tr
              v-for="p in products"
              :key="p.id"
              class="group hover:bg-[var(--shopizz-porcelain)]/40 transition-colors"
            >
              <!-- Product Thumb & Title -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--shopizz-obsidian)]/10 bg-[var(--shopizz-porcelain)]">
                    <img
                      v-if="p.primaryImage"
                      :src="p.primaryImage"
                      :alt="p.name"
                      class="h-full w-full object-cover"
                    />
                    <div v-else class="flex h-full w-full items-center justify-center text-base">
                      🏺
                    </div>
                  </div>
                  <div>
                    <NuxtLink
                      :to="`/product/${p.slug}`"
                      target="_blank"
                      class="font-medium text-[var(--shopizz-obsidian)] hover:text-[var(--shopizz-terracotta)] hover:underline"
                    >
                      {{ p.name }}
                    </NuxtLink>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="font-mono text-[10px] text-[var(--shopizz-obsidian)]/50">
                        SKU: {{ p.sku }}
                      </span>
                      <span class="text-[10px] text-amber-600">
                        ★ {{ p.rating }} ({{ p.reviewCount }})
                      </span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Maker -->
              <td class="px-5 py-4">
                <p class="font-medium text-[var(--shopizz-obsidian)]">{{ p.owner.name }}</p>
                <p class="text-[10px] text-[var(--shopizz-obsidian)]/50">{{ p.owner.email }}</p>
              </td>

              <!-- Category -->
              <td class="px-5 py-4">
                <span class="rounded-full bg-[var(--shopizz-obsidian)]/5 px-2.5 py-1 text-[11px] font-medium text-[var(--shopizz-obsidian)]/75">
                  {{ p.category?.name || 'Uncategorized' }}
                </span>
              </td>

              <!-- Price -->
              <td class="px-5 py-4">
                <p class="font-medium text-[var(--shopizz-obsidian)]">{{ formatPrice(p.price) }}</p>
                <p class="text-[10px] text-[var(--shopizz-obsidian)]/50">Cost: {{ formatPrice(p.costPrice) }}</p>
              </td>

              <!-- Stock -->
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                  :class="
                    p.stock > 10
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : p.stock > 0
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                  "
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="p.stock > 10 ? 'bg-emerald-500' : p.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'"></span>
                  {{ p.stock }} units
                </span>
              </td>

              <!-- Status -->
              <td class="px-5 py-4">
                <span
                  class="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                  :class="{
                    'bg-emerald-500/10 text-emerald-800 border border-emerald-500/20': p.status === 'ACTIVE',
                    'bg-amber-500/10 text-amber-800 border border-amber-500/20': p.status === 'DRAFT',
                    'bg-rose-500/10 text-rose-800 border border-rose-500/20': p.status === 'ARCHIVED',
                  }"
                >
                  {{ p.status }}
                </span>
              </td>

              <!-- Featured Star Toggle -->
              <td class="px-5 py-4 text-center">
                <button
                  type="button"
                  class="rounded-full p-1.5 text-base transition-transform hover:scale-125"
                  :title="p.isFeatured ? 'Click to unfeature' : 'Click to feature on homepage'"
                  @click="toggleFeatured(p)"
                >
                  <span v-if="p.isFeatured" class="text-amber-500">⭐</span>
                  <span v-else class="text-black/20 hover:text-black/50">☆</span>
                </button>
              </td>

              <!-- Actions -->
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <NuxtLink
                    :to="`/product/${p.slug}`"
                    target="_blank"
                    class="rounded-full p-2 text-[var(--shopizz-obsidian)]/60 hover:bg-black/5 hover:text-[var(--shopizz-obsidian)]"
                    title="Preview Live Page"
                  >
                    👁
                  </NuxtLink>

                  <button
                    v-if="p.status !== 'ACTIVE'"
                    type="button"
                    class="rounded-full px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100"
                    @click="openStatusModal(p, 'ACTIVATE')"
                  >
                    Activate
                  </button>

                  <button
                    v-if="p.status === 'ACTIVE'"
                    type="button"
                    class="rounded-full px-2.5 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100"
                    @click="openStatusModal(p, 'ARCHIVE')"
                  >
                    Delist
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Status Change Confirmation Modal -->
    <div
      v-if="isModalOpen && selectedProduct"
      class="fixed inset-0 z-50 flex items-center justify-center bg-[var(--shopizz-obsidian)]/60 p-4 backdrop-blur-sm"
    >
      <div class="w-full max-w-md rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-[var(--shopizz-porcelain)] p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
        <div class="flex items-start justify-between">
          <div>
            <span class="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--shopizz-terracotta)]">
              Admin Moderation
            </span>
            <h3 class="mt-1 font-serif text-2xl font-medium text-[var(--shopizz-obsidian)]">
              {{ modalAction === 'ARCHIVE' ? 'Delist / Archive Product' : 'Activate Product Listing' }}
            </h3>
          </div>
          <button
            class="rounded-full p-2 text-[var(--shopizz-obsidian)]/40 hover:bg-black/5 hover:text-[var(--shopizz-obsidian)]"
            @click="isModalOpen = false"
          >
            ✕
          </button>
        </div>

        <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/60 p-4 space-y-2">
          <p class="font-medium text-[var(--shopizz-obsidian)]">{{ selectedProduct.name }}</p>
          <p class="text-xs text-[var(--shopizz-obsidian)]/60">Maker: {{ selectedProduct.owner.name }} ({{ selectedProduct.owner.email }})</p>
          <p class="text-xs text-[var(--shopizz-obsidian)]/60">SKU: {{ selectedProduct.sku }}</p>
        </div>

        <p class="text-xs text-[var(--shopizz-obsidian)]/70">
          <span v-if="modalAction === 'ARCHIVE'">
            Delisting this product will immediately remove it from the public storefront and search results.
          </span>
          <span v-else>
            Activating this product will make it publicly discoverable and purchasable by buyers.
          </span>
        </p>

        <div
          v-if="actionError"
          class="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200"
        >
          {{ actionError }}
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            class="rounded-full px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-[var(--shopizz-obsidian)]/60 hover:bg-black/5"
            @click="isModalOpen = false"
          >
            Cancel
          </button>
          <AppButton
            size="sm"
            :disabled="isProcessing"
            @click="confirmStatusChange"
          >
            {{ isProcessing ? 'Updating...' : modalAction === 'ARCHIVE' ? 'Confirm Delist' : 'Confirm Activate' }}
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>
