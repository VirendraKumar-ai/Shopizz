<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

interface AdminCategory {
  id: string
  name: string
  slug: string
  description?: string | null
  imageUrl?: string | null
  status: 'ACTIVE' | 'ARCHIVED'
  sortOrder: number
  productCount: number
  createdAt: string
  updatedAt: string
}

const {
  data,
  pending,
  error,
  refresh,
} = await useFetch<{
  success: boolean
  categories: AdminCategory[]
}>('/api/admin/categories')

const categories = computed(() => data.value?.categories ?? [])

const searchQuery = ref('')
const selectedStatus = ref<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL')

const filteredCategories = computed(() => {
  let result = categories.value

  if (selectedStatus.value !== 'ALL') {
    result = result.filter((c) => c.status === selectedStatus.value)
  }

  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    result = result.filter((c) =>
      c.name.toLowerCase().includes(query) ||
      c.slug.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query)
    )
  }

  return result
})

// Stats
const activeCount = computed(() => categories.value.filter((c) => c.status === 'ACTIVE').length)
const archivedCount = computed(() => categories.value.filter((c) => c.status === 'ARCHIVED').length)
const totalProductCount = computed(() => categories.value.reduce((sum, c) => sum + (c.productCount || 0), 0))

// Modal / Drawer state for Create & Edit
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

const form = ref({
  name: '',
  slug: '',
  description: '',
  imageUrl: '',
  sortOrder: 0,
  status: 'ACTIVE' as 'ACTIVE' | 'ARCHIVED',
})

const formSubmitting = ref(false)
const formError = ref('')

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = {
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    sortOrder: categories.value.length,
    status: 'ACTIVE',
  }
  formError.value = ''
  isModalOpen.value = true
}

const openEditModal = (cat: AdminCategory) => {
  isEditing.value = true
  editingId.value = cat.id
  form.value = {
    name: cat.name,
    slug: cat.slug,
    description: cat.description || '',
    imageUrl: cat.imageUrl || '',
    sortOrder: cat.sortOrder,
    status: cat.status,
  }
  formError.value = ''
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  formError.value = ''
}

// Slug generator
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

watch(
  () => form.value.name,
  (newName) => {
    if (!isEditing.value) {
      form.value.slug = slugify(newName)
    }
  }
)

const handleSaveCategory = async () => {
  formError.value = ''

  if (!form.value.name.trim()) {
    formError.value = 'Category name is required.'
    return
  }

  formSubmitting.value = true

  try {
    const payload = {
      name: form.value.name.trim(),
      slug: form.value.slug.trim() || slugify(form.value.name),
      description: form.value.description.trim() || undefined,
      imageUrl: form.value.imageUrl.trim() || undefined,
      sortOrder: Number(form.value.sortOrder) || 0,
      status: form.value.status,
    }

    if (isEditing.value && editingId.value) {
      await $fetch(`/api/admin/categories/${editingId.value}`, {
        method: 'PATCH',
        body: payload,
      })
    } else {
      await $fetch('/api/admin/categories', {
        method: 'POST',
        body: payload,
      })
    }

    await refresh()
    closeModal()
  } catch (err: any) {
    formError.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      'Failed to save category.'
  } finally {
    formSubmitting.value = false
  }
}

// Toggle status (Archive / Reactivate)
const togglingId = ref<string | null>(null)

const toggleStatus = async (cat: AdminCategory) => {
  const newStatus = cat.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE'
  const actionName = newStatus === 'ARCHIVED' ? 'archive' : 'reactivate'

  if (newStatus === 'ARCHIVED' && cat.productCount > 0) {
    if (!confirm(`This category contains ${cat.productCount} product(s). Archiving will hide it from new product creation and public filters, but existing products will remain safe. Proceed?`)) {
      return
    }
  }

  togglingId.value = cat.id

  try {
    await $fetch(`/api/admin/categories/${cat.id}`, {
      method: 'PATCH',
      body: { status: newStatus },
    })
    await refresh()
  } catch (err: any) {
    alert(err?.data?.message || `Failed to ${actionName} category`)
  } finally {
    togglingId.value = null
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
            Admin / 004
          </p>

          <h1 class="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
            Category Management
          </h1>

          <p class="mt-3 max-w-xl text-sm leading-7 text-[var(--shopizz-obsidian)]/55">
            Configure global departments and curated catalog classifications for the marketplace.
          </p>
        </div>

        <AppButton @click="openCreateModal">
          + Add New Category
        </AppButton>
      </div>
    </section>

    <!-- Stats Grid -->
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardStat
        label="Total Categories"
        :value="categories.length"
        description="All registered marketplace departments"
      />

      <DashboardStat
        label="Active Categories"
        :value="activeCount"
        description="Visible in navigation & seller dropdowns"
      />

      <DashboardStat
        label="Archived Categories"
        :value="archivedCount"
        description="Hidden from new product assignment"
      />

      <DashboardStat
        label="Cataloged Pieces"
        :value="totalProductCount"
        description="Total products linked across categories"
      />
    </section>

    <!-- Filters Bar -->
    <section class="flex flex-col gap-4 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div class="w-full sm:w-80">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Filter categories by name or slug..."
          class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-[var(--shopizz-obsidian)]"
        />
      </div>

      <div class="flex items-center gap-2">
        <button
          v-for="status in (['ALL', 'ACTIVE', 'ARCHIVED'] as const)"
          :key="status"
          type="button"
          class="rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider transition-all"
          :class="
            selectedStatus === status
              ? 'bg-[var(--shopizz-obsidian)] text-white shadow-sm'
              : 'bg-white/40 text-[var(--shopizz-obsidian)]/60 hover:bg-white'
          "
          @click="selectedStatus = status"
        >
          {{ status }}
        </button>
      </div>
    </section>

    <!-- Loading -->
    <AppLoading v-if="pending" text="Loading categories..." />

    <!-- Error -->
    <div
      v-else-if="error"
      class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-8"
    >
      <p class="text-sm text-[var(--shopizz-obsidian)]/60">
        Failed to load categories.
      </p>
      <AppButton class="mt-4" size="sm" @click="refresh()">
        Try again
      </AppButton>
    </div>

    <!-- Empty State -->
    <AppEmptyState
      v-else-if="!filteredCategories.length"
      title="No categories found"
      description="No categories match your search or filter criteria."
    />

    <!-- Categories Table -->
    <section v-else class="overflow-hidden rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30">
      <table class="w-full text-left text-xs">
        <thead class="border-b border-[var(--shopizz-obsidian)]/10 bg-white/40 text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">
          <tr>
            <th class="px-6 py-4">Department / Slug</th>
            <th class="px-6 py-4">Product Count</th>
            <th class="px-6 py-4">Sort Order</th>
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--shopizz-obsidian)]/10">
          <tr v-for="cat in filteredCategories" :key="cat.id" class="hover:bg-white/40 transition-colors">
            <!-- Name & Slug -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[var(--shopizz-stone)]/40">
                  <img
                    v-if="cat.imageUrl"
                    :src="cat.imageUrl"
                    :alt="cat.name"
                    class="h-full w-full object-cover"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center text-xs font-bold text-[var(--shopizz-obsidian)]/30">
                    {{ cat.name.charAt(0) }}
                  </div>
                </div>
                <div>
                  <p class="font-medium text-sm text-[var(--shopizz-obsidian)]">{{ cat.name }}</p>
                  <p class="text-[10px] text-[var(--shopizz-obsidian)]/45">/category/{{ cat.slug }}</p>
                </div>
              </div>
            </td>

            <!-- Products Count -->
            <td class="px-6 py-4">
              <span class="inline-flex items-center rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-[var(--shopizz-obsidian)]/80">
                {{ cat.productCount }} {{ cat.productCount === 1 ? 'piece' : 'pieces' }}
              </span>
            </td>

            <!-- Sort Order -->
            <td class="px-6 py-4 font-mono text-xs text-[var(--shopizz-obsidian)]/60">
              #{{ cat.sortOrder }}
            </td>

            <!-- Status -->
            <td class="px-6 py-4">
              <AppBadge :variant="cat.status === 'ACTIVE' ? 'success' : 'danger'">
                {{ cat.status }}
              </AppBadge>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 text-right space-x-3">
              <button
                type="button"
                class="font-medium text-[var(--shopizz-obsidian)]/70 hover:text-[var(--shopizz-obsidian)] underline"
                @click="openEditModal(cat)"
              >
                Edit
              </button>

              <button
                type="button"
                :disabled="togglingId === cat.id"
                class="font-medium underline disabled:opacity-40 transition-colors"
                :class="
                  cat.status === 'ACTIVE'
                    ? 'text-[var(--shopizz-saffron)] hover:text-[var(--shopizz-saffron)]/80'
                    : 'text-[var(--shopizz-moss)] hover:text-[var(--shopizz-moss)]/80'
                "
                @click="toggleStatus(cat)"
              >
                {{ cat.status === 'ACTIVE' ? 'Archive' : 'Reactivate' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Create / Edit Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div class="w-full max-w-lg rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-[var(--shopizz-porcelain)] p-7 sm:p-9 shadow-2xl space-y-6">
        <div class="flex items-center justify-between border-b border-[var(--shopizz-obsidian)]/10 pb-4">
          <h2 class="text-xl font-medium tracking-tight">
            {{ isEditing ? 'Edit Category' : 'Create New Category' }}
          </h2>
          <button
            type="button"
            class="text-sm text-[var(--shopizz-obsidian)]/40 hover:text-[var(--shopizz-obsidian)]"
            @click="closeModal"
          >
            ✕
          </button>
        </div>

        <div
          v-if="formError"
          class="rounded-2xl border border-[var(--shopizz-saffron)]/20 bg-[var(--shopizz-saffron)]/10 p-3 text-xs text-[var(--shopizz-saffron)]"
        >
          {{ formError }}
        </div>

        <form class="space-y-4 text-xs" @submit.prevent="handleSaveCategory">
          <AppInput
            v-model="form.name"
            label="Category Name *"
            placeholder="e.g. Jewelry & Watches"
            :disabled="formSubmitting"
          />

          <AppInput
            v-model="form.slug"
            label="URL Slug *"
            placeholder="e.g. jewelry-watches"
            :disabled="formSubmitting"
          />

          <div class="space-y-2">
            <label class="block text-xs font-medium uppercase tracking-[0.18em] text-[var(--shopizz-obsidian)]/60">
              Description (Optional)
            </label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Brief summary of pieces in this category..."
              class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 p-3 text-xs outline-none focus:border-[var(--shopizz-obsidian)]"
            />
          </div>

          <AppInput
            v-model="form.imageUrl"
            label="Department Image URL (Optional)"
            placeholder="https://images.unsplash.com/photo-..."
            :disabled="formSubmitting"
          />

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-xs font-medium uppercase tracking-[0.18em] text-[var(--shopizz-obsidian)]/60">
                Sort Order
              </label>
              <input
                v-model.number="form.sortOrder"
                type="number"
                min="0"
                class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 px-4 py-3 text-xs outline-none focus:border-[var(--shopizz-obsidian)]"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-medium uppercase tracking-[0.18em] text-[var(--shopizz-obsidian)]/60">
                Status
              </label>
              <select
                v-model="form.status"
                class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 px-4 py-3 text-xs outline-none focus:border-[var(--shopizz-obsidian)]"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-[var(--shopizz-obsidian)]/10">
            <AppButton variant="secondary" size="sm" :disabled="formSubmitting" @click="closeModal">
              Cancel
            </AppButton>

            <AppButton type="submit" size="sm" :disabled="formSubmitting">
              {{ formSubmitting ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category' }}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
