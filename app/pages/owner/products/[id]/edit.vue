<script setup lang="ts">
import type { Category } from '~~/shared/types/product'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'owner'],
})

const route = useRoute()
const router = useRouter()
const productId = computed(() => route.params.id as string)

// Fetch product details
const {
  data: productData,
  pending,
  error,
} = await useFetch<{
  success: boolean
  product: any
}>(() => `/api/owner/products/${productId.value}`)

// Fetch categories
const { data: categoryData } = await useFetch<{
  success: boolean
  categories: Category[]
}>('/api/categories')

const categories = computed(() => categoryData.value?.categories ?? [])

const form = ref({
  name: '',
  slug: '',
  categoryId: '',
  sku: '',
  shortDescription: '',
  description: '',
  priceRupees: 0,
  compareAtPriceRupees: 0,
  costPriceRupees: 0,
  stock: 0,
  status: 'ACTIVE',
  isFeatured: false,
})

// Dynamic Variants (Colors & Sizes)
const colorsList = ref<Array<{ name: string; hex: string; inStock: boolean }>>([
  { name: 'Oat', hex: '#D6C7B2', inStock: true },
  { name: 'Olive', hex: '#4B5320', inStock: true },
])
const newColorName = ref('')
const newColorHex = ref('#D6C7B2')

const addColorSwatch = () => {
  if (!newColorName.value.trim()) return
  colorsList.value.push({
    name: newColorName.value.trim(),
    hex: newColorHex.value,
    inStock: true,
  })
  newColorName.value = ''
}

const removeColorSwatch = (idx: number) => {
  colorsList.value.splice(idx, 1)
}

const sizesList = ref<string[]>(['XS', 'S', 'M', 'L', 'XL'])
const newSizeInput = ref('')

const addSizeChip = () => {
  if (!newSizeInput.value.trim()) return
  const sz = newSizeInput.value.trim().toUpperCase()
  if (!sizesList.value.includes(sz)) {
    sizesList.value.push(sz)
  }
  newSizeInput.value = ''
}

const removeSizeChip = (idx: number) => {
  sizesList.value.splice(idx, 1)
}

// Specifications (Details Tab)
const specifications = ref<Record<string, string>>({
  Fit: 'Relaxed',
  Closure: 'Button-down',
  Collar: 'Classic shirt collar',
  Sleeve: 'Full sleeve (with button cuffs)',
  Pocket: 'Single chest pocket',
  Length: 'Regular',
  Style: 'Overshirt / Layering piece',
  Occasion: 'Everyday, Work, Casual',
  Gender: 'Unisex',
})

const newSpecKey = ref('')
const newSpecVal = ref('')

const addSpecRow = () => {
  if (!newSpecKey.value.trim() || !newSpecVal.value.trim()) return
  specifications.value[newSpecKey.value.trim()] = newSpecVal.value.trim()
  newSpecKey.value = ''
  newSpecVal.value = ''
}

const removeSpecRow = (key: string) => {
  delete specifications.value[key]
}

// Materials & Care (Materials Tab)
const materialsInfo = ref({
  title: 'Materials & Care',
  intro: 'Made with carefully sourced materials and designed to last. Follow the care instructions to keep your piece looking its best.',
  composition: '100% Linen',
  careText: 'Machine wash cold (gentle cycle)\nUse mild detergent\nDo not bleach\nLine dry in shade\nWarm iron if needed\nDo not tumble dry\nDo not dry clean',
})

// Shipping Policy (Shipping Tab)
const shippingInfo = ref({
  freeShippingAbove: 1499,
  dispatchDays: '2–3 business days',
  deliveryDays: '4–7 business days',
  returnDays: '7 days',
})

// Multi-Image Gallery State
export interface ProductImageItem {
  id?: string
  url: string
  publicId?: string | null
  alt?: string
  sortOrder: number
  isPrimary: boolean
}

const images = ref<ProductImageItem[]>([])
const singleUrlInput = ref('')

// Image source mode: 'upload' (Cloudinary) vs 'url' (External URL)
const imageSourceMode = ref<'upload' | 'url'>('upload')
const isUploadingImage = ref(false)
const uploadError = ref('')
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    await uploadFilesToCloudinary(Array.from(files))
  }
}

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    await uploadFilesToCloudinary(Array.from(files))
  }
}

const uploadFilesToCloudinary = async (files: File[]) => {
  uploadError.value = ''
  isUploadingImage.value = true

  try {
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        uploadError.value = `File "${file.name}" is not a valid image format.`
        continue
      }

      if (file.size > 5 * 1024 * 1024) {
        uploadError.value = `File "${file.name}" exceeds 5MB size limit.`
        continue
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await $fetch<{
        success: boolean
        image: {
          url: string
          publicId: string
          alt: string
        }
      }>('/api/owner/upload-image', {
        method: 'POST',
        body: formData,
      })

      const isFirst = images.value.length === 0
      images.value.push({
        url: response.image.url,
        publicId: response.image.publicId,
        alt: response.image.alt || form.value.name || 'Product Image',
        sortOrder: images.value.length,
        isPrimary: isFirst,
      })
    }
  } catch (err: any) {
    uploadError.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      'Failed to upload image(s) to Cloudinary.'
  } finally {
    isUploadingImage.value = false
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

const addUrlImage = () => {
  const url = singleUrlInput.value.trim()
  if (!url) return

  const isFirst = images.value.length === 0
  images.value.push({
    url,
    publicId: null,
    alt: form.value.name || 'Product Image',
    sortOrder: images.value.length,
    isPrimary: isFirst,
  })

  singleUrlInput.value = ''
}

const setPrimaryImage = (index: number) => {
  images.value.forEach((img, idx) => {
    img.isPrimary = idx === index
  })
}

const moveImage = (index: number, direction: -1 | 1) => {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= images.value.length) return

  const currentItem = images.value[index]
  const targetItem = images.value[targetIndex]
  if (currentItem && targetItem) {
    images.value[index] = targetItem
    images.value[targetIndex] = currentItem
  }

  // Re-index sort order
  images.value.forEach((img, idx) => {
    img.sortOrder = idx
  })
}

const removeImage = (index: number) => {
  const wasPrimary = images.value[index]?.isPrimary
  images.value.splice(index, 1)

  // Re-index sort order
  images.value.forEach((img, idx) => {
    img.sortOrder = idx
  })

  // If primary was removed, make first remaining primary
  if (wasPrimary && images.value.length > 0 && images.value[0]) {
    images.value[0].isPrimary = true
  }
}

// Initialize form from fetched product
watch(
  () => productData.value?.product,
  (p) => {
    if (p) {
      form.value = {
        name: p.name || '',
        slug: p.slug || '',
        categoryId: p.categoryId || '',
        sku: p.sku || '',
        shortDescription: p.shortDescription || '',
        description: p.description || '',
        priceRupees: (p.price || 0) / 100,
        compareAtPriceRupees: p.compareAtPrice ? p.compareAtPrice / 100 : 0,
        costPriceRupees: (p.costPrice || 0) / 100,
        stock: p.stock ?? 0,
        status: p.status || 'ACTIVE',
        isFeatured: p.isFeatured || false,
      }

      // Populate colors & sizes
      if (Array.isArray(p.colors) && p.colors.length > 0) {
        colorsList.value = p.colors
      }
      if (Array.isArray(p.sizes) && p.sizes.length > 0) {
        sizesList.value = p.sizes
      }

      // Populate specifications
      if (p.details?.specifications) {
        specifications.value = { ...p.details.specifications }
      }

      // Populate materials & care
      if (p.details?.materials) {
        materialsInfo.value = {
          title: p.details.materials.title || 'Materials & Care',
          intro: p.details.materials.intro || '',
          composition: p.details.materials.composition || '100% Linen',
          careText: Array.isArray(p.details.materials.careInstructions)
            ? p.details.materials.careInstructions.map((c: any) => typeof c === 'string' ? c : c.text).join('\n')
            : (p.details.materials.careText || '')
        }
      }

      // Populate shipping
      if (p.details?.shipping) {
        shippingInfo.value = {
          freeShippingAbove: p.details.shipping.freeShippingThreshold || 1499,
          dispatchDays: p.details.shipping.dispatchDays || '2–3 business days',
          deliveryDays: p.details.shipping.deliveryDays || '4–7 business days',
          returnDays: p.details.shipping.returnDays || '7 days'
        }
      }

      if (Array.isArray(p.images) && p.images.length > 0) {
        images.value = p.images.map((img: any, idx: number) => ({
          id: img.id,
          url: img.url,
          publicId: img.publicId,
          alt: img.alt || p.name,
          sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : idx,
          isPrimary: Boolean(img.isPrimary),
        }))
      } else if (p.imageUrl) {
        images.value = [
          {
            url: p.imageUrl,
            publicId: p.publicId,
            alt: p.name,
            sortOrder: 0,
            isPrimary: true,
          },
        ]
      } else {
        images.value = []
      }
    }
  },
  { immediate: true }
)

const submitting = ref(false)
const errorMsg = ref('')

const handleUpdateProduct = async () => {
  errorMsg.value = ''

  if (!form.value.name.trim() || !form.value.slug.trim()) {
    errorMsg.value = 'Product name and URL slug are required.'
    return
  }

  submitting.value = true

  try {
    const primaryImg = images.value.find((i) => i.isPrimary) || images.value[0]
    const careList = materialsInfo.value.careText
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => ({
        icon: t.includes('wash') ? '🧺' : (t.includes('detergent') ? '🧴' : (t.includes('iron') ? '♨️' : (t.includes('dry') ? '🌬️' : '🚫'))),
        text: t
      }))

    const detailsPayload = {
      philosophy: "Thoughtfully designed for comfort, versatility and everyday wear. A modern classic you'll reach for again and again.",
      specifications: specifications.value,
      materials: {
        title: materialsInfo.value.title,
        intro: materialsInfo.value.intro,
        composition: materialsInfo.value.composition,
        badges: [
          { title: materialsInfo.value.composition || '100% Organic', desc: 'Natural, breathable, lightweight', icon: 'ph:shield-check-bold' },
          { title: 'Soft Texture', desc: 'Gets softer with every wash', icon: 'ph:sparkle-bold' },
          { title: 'Consciously Made', desc: 'Low impact, longer lasting', icon: 'ph:leaf-bold' }
        ],
        careInstructions: careList.length > 0 ? careList : [
          { icon: '🧺', text: 'Machine wash cold (gentle cycle)' },
          { icon: '🧴', text: 'Use mild detergent' },
          { icon: '🌬️', text: 'Line dry in shade' }
        ]
      },
      shipping: {
        freeShippingThreshold: Number(shippingInfo.value.freeShippingAbove) || 1499,
        shippingPoints: [
          `Dispatched within ${shippingInfo.value.dispatchDays || '2–3 business days'}`,
          `Delivery in ${shippingInfo.value.deliveryDays || '4–7 business days'}`,
          'Real-time tracking via email & account',
          'We currently ship across India'
        ],
        returnPoints: [
          `Easy returns within ${shippingInfo.value.returnDays || '7 days'} of delivery`,
          'Items must be unused, unwashed and in original condition',
          'Refund processed within 5–7 business days'
        ]
      }
    }

    const payload = {
      name: form.value.name.trim(),
      slug: form.value.slug.trim(),
      categoryId: form.value.categoryId || undefined,
      sku: form.value.sku.trim() || undefined,
      shortDescription: form.value.shortDescription.trim() || undefined,
      description: form.value.description.trim() || undefined,
      price: Math.round(form.value.priceRupees * 100),
      compareAtPrice: form.value.compareAtPriceRupees ? Math.round(form.value.compareAtPriceRupees * 100) : undefined,
      costPrice: Math.round(form.value.costPriceRupees * 100),
      colors: colorsList.value,
      sizes: sizesList.value,
      details: detailsPayload,
      stock: Number(form.value.stock) || 0,
      imageUrl: primaryImg?.url || undefined,
      publicId: primaryImg?.publicId || undefined,
      images: images.value,
      status: form.value.status,
      isFeatured: form.value.isFeatured,
    }

    await $fetch(`/api/owner/products/${productId.value}`, {
      method: 'PUT',
      body: payload,
    })

    await router.push('/owner/products')
  } catch (err: any) {
    errorMsg.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      'Failed to update product.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl space-y-10">
    <!-- Header -->
    <section>
      <div class="flex items-center justify-between">
        <button
          type="button"
          class="text-xs uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/50 hover:text-[var(--shopizz-obsidian)]"
          @click="router.back()"
        >
          ← Back to products
        </button>
      </div>

      <div class="mt-4">
        <p class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]">
          Owner / Edit Piece
        </p>

        <h1 class="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
          Edit {{ form.name || 'Product' }}
        </h1>
      </div>
    </section>

    <AppLoading v-if="pending" text="Loading product details..." />

    <div
      v-else-if="error"
      class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-8"
    >
      <p class="text-sm text-[var(--shopizz-obsidian)]/60">
        Product not found or access denied.
      </p>
      <NuxtLink to="/owner/products" class="mt-4 inline-block">
        <AppButton size="sm">
          Return to catalog
        </AppButton>
      </NuxtLink>
    </div>

    <!-- Edit Form -->
    <form v-else class="space-y-8" @submit.prevent="handleUpdateProduct">
      <div
        v-if="errorMsg"
        class="rounded-2xl border border-[var(--shopizz-saffron)]/20 bg-[var(--shopizz-saffron)]/10 p-4 text-xs text-[var(--shopizz-saffron)]"
      >
        {{ errorMsg }}
      </div>

      <!-- 1. Basics -->
      <div class="space-y-6 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-7 sm:p-8">
        <h2 class="text-base font-medium tracking-tight border-b border-[var(--shopizz-obsidian)]/10 pb-3">
          1. General Information
        </h2>

        <div class="grid gap-4 sm:grid-cols-2">
          <AppInput
            v-model="form.name"
            label="Product Name *"
            :disabled="submitting"
          />

          <AppInput
            v-model="form.slug"
            label="URL Slug *"
            :disabled="submitting"
          />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <label class="block text-xs font-medium uppercase tracking-[0.18em] text-[var(--shopizz-obsidian)]/60">
              Department / Category
            </label>
            <select
              v-model="form.categoryId"
              class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 px-4 py-3.5 text-sm outline-none focus:border-[var(--shopizz-obsidian)]"
            >
              <option value="">Select a Category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <AppInput
            v-model="form.sku"
            label="SKU Code"
            :disabled="submitting"
          />
        </div>

        <AppInput
          v-model="form.shortDescription"
          label="Short Summary"
          :disabled="submitting"
        />

        <div class="space-y-2">
          <label class="block text-xs font-medium uppercase tracking-[0.18em] text-[var(--shopizz-obsidian)]/60">
            Full Description
          </label>
          <textarea
            v-model="form.description"
            rows="4"
            class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 p-4 text-sm outline-none focus:border-[var(--shopizz-obsidian)]"
          />
        </div>
      </div>

      <!-- 2. Pricing -->
      <div class="space-y-6 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-7 sm:p-8">
        <h2 class="text-base font-medium tracking-tight border-b border-[var(--shopizz-obsidian)]/10 pb-3">
          2. Pricing & Financials (in ₹ INR)
        </h2>

        <div class="grid gap-4 sm:grid-cols-3">
          <div class="space-y-2">
            <label class="block text-xs font-medium uppercase tracking-[0.18em] text-[var(--shopizz-obsidian)]/60">
              Selling Price (₹) *
            </label>
            <input
              v-model.number="form.priceRupees"
              type="number"
              min="0"
              class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 px-4 py-3.5 text-sm outline-none focus:border-[var(--shopizz-obsidian)]"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-medium uppercase tracking-[0.18em] text-[var(--shopizz-obsidian)]/60">
              Compare-At Price (₹)
            </label>
            <input
              v-model.number="form.compareAtPriceRupees"
              type="number"
              min="0"
              class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 px-4 py-3.5 text-sm outline-none focus:border-[var(--shopizz-obsidian)]"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-medium uppercase tracking-[0.18em] text-[var(--shopizz-obsidian)]/60">
              Cost to Produce (₹)
            </label>
            <input
              v-model.number="form.costPriceRupees"
              type="number"
              min="0"
              class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 px-4 py-3.5 text-sm outline-none focus:border-[var(--shopizz-obsidian)]"
            />
          </div>
        </div>
      </div>

      <!-- 3. Multi-Image Gallery & Inventory -->
      <div class="space-y-6 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-7 sm:p-8">
        <h2 class="text-base font-medium tracking-tight border-b border-[var(--shopizz-obsidian)]/10 pb-3">
          3. Media Gallery & Inventory
        </h2>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <label class="block text-xs font-medium uppercase tracking-[0.18em] text-[var(--shopizz-obsidian)]/60">
              Available Stock (Units)
            </label>
            <input
              v-model.number="form.stock"
              type="number"
              min="0"
              class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 px-4 py-3.5 text-sm outline-none focus:border-[var(--shopizz-obsidian)]"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-medium uppercase tracking-[0.18em] text-[var(--shopizz-obsidian)]/60">
              Publication Status
            </label>
            <select
              v-model="form.status"
              class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 px-4 py-3.5 text-sm outline-none focus:border-[var(--shopizz-obsidian)]"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>

        <!-- Product Image Gallery Section -->
        <div class="space-y-4 pt-2">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <label class="block text-xs font-medium uppercase tracking-[0.18em] text-[var(--shopizz-obsidian)]/60">
                Product Images Gallery ({{ images.length }} {{ images.length === 1 ? 'image' : 'images' }})
              </label>
              <p class="text-[11px] text-[var(--shopizz-obsidian)]/40 mt-0.5">
                Upload multiple angles. The image marked "Primary" will be displayed on the storefront cover.
              </p>
            </div>

            <!-- Mode Switcher Tabs -->
            <div class="flex items-center rounded-full border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-1 text-xs">
              <button
                type="button"
                class="rounded-full px-3 py-1 font-medium transition-all"
                :class="
                  imageSourceMode === 'upload'
                    ? 'bg-[var(--shopizz-obsidian)] text-white shadow-sm'
                    : 'text-[var(--shopizz-obsidian)]/60 hover:text-[var(--shopizz-obsidian)]'
                "
                @click="imageSourceMode = 'upload'"
              >
                Upload Files (Cloudinary)
              </button>

              <button
                type="button"
                class="rounded-full px-3 py-1 font-medium transition-all"
                :class="
                  imageSourceMode === 'url'
                    ? 'bg-[var(--shopizz-obsidian)] text-white shadow-sm'
                    : 'text-[var(--shopizz-obsidian)]/60 hover:text-[var(--shopizz-obsidian)]'
                "
                @click="imageSourceMode = 'url'"
              >
                Add Image URL
              </button>
            </div>
          </div>

          <!-- Upload error message -->
          <div
            v-if="uploadError"
            class="rounded-2xl border border-[var(--shopizz-saffron)]/20 bg-[var(--shopizz-saffron)]/10 p-3 text-xs text-[var(--shopizz-saffron)]"
          >
            {{ uploadError }}
          </div>

          <!-- Upload Dropzone (Multi-select) -->
          <div v-if="imageSourceMode === 'upload'" class="space-y-3">
            <input
              ref="fileInputRef"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              class="hidden"
              @change="handleFileSelect"
            />

            <!-- Dropzone -->
            <div
              class="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all cursor-pointer"
              :class="[
                isDragging
                  ? 'border-[var(--shopizz-moss)] bg-[var(--shopizz-moss)]/5'
                  : 'border-[var(--shopizz-obsidian)]/15 bg-white/25 hover:border-[var(--shopizz-obsidian)]/30 hover:bg-white/40',
                isUploadingImage ? 'pointer-events-none opacity-60' : ''
              ]"
              @click="triggerFileInput"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
            >
              <div v-if="isUploadingImage" class="flex flex-col items-center gap-3">
                <span class="h-6 w-6 animate-spin rounded-full border-2 border-[var(--shopizz-obsidian)]/20 border-t-[var(--shopizz-moss)]" />
                <p class="text-xs font-medium text-[var(--shopizz-obsidian)]/70">Uploading images to Cloudinary...</p>
              </div>

              <div v-else class="space-y-2">
                <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--shopizz-stone)]/60 text-lg">
                  📸
                </div>
                <p class="text-sm font-medium">
                  Click to add more images or drag & drop files here
                </p>
                <p class="text-[11px] text-[var(--shopizz-obsidian)]/45">
                  JPG, PNG, WEBP, AVIF up to 5 MB each
                </p>
              </div>
            </div>
          </div>

          <!-- Add Image URL Input -->
          <div v-else class="flex gap-2">
            <input
              v-model="singleUrlInput"
              type="url"
              placeholder="Paste image URL (https://images.unsplash.com/...)"
              class="flex-1 rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 px-4 py-3 text-xs outline-none focus:border-[var(--shopizz-obsidian)]"
              @keydown.enter.prevent="addUrlImage"
            />
            <button
              type="button"
              class="rounded-2xl bg-[var(--shopizz-obsidian)] px-5 py-3 text-xs font-medium text-white hover:bg-[var(--shopizz-moss)] transition-colors"
              @click="addUrlImage"
            >
              + Add to Gallery
            </button>
          </div>

          <!-- Interactive Gallery Grid -->
          <div v-if="images.length > 0" class="space-y-3 pt-2">
            <p class="text-xs font-medium uppercase tracking-[0.2em] text-[var(--shopizz-obsidian)]/50">
              Gallery Preview (Drag or use arrows to reorder)
            </p>

            <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div
                v-for="(img, idx) in images"
                :key="img.url + idx"
                class="group relative overflow-hidden rounded-2xl border bg-white/50 p-3 transition-all"
                :class="
                  img.isPrimary
                    ? 'border-[var(--shopizz-moss)] ring-2 ring-[var(--shopizz-moss)]/20 shadow-sm'
                    : 'border-[var(--shopizz-obsidian)]/10 hover:border-[var(--shopizz-obsidian)]/30'
                "
              >
                <!-- Thumbnail -->
                <div class="relative overflow-hidden rounded-xl bg-[var(--shopizz-stone)]/40 aspect-[4/5]">
                  <img :src="img.url" :alt="img.alt || 'Product Image'" class="h-full w-full object-cover" />

                  <!-- Badges Top Left -->
                  <div class="absolute left-2 top-2 flex flex-col gap-1">
                    <span
                      v-if="img.isPrimary"
                      class="rounded-full bg-[var(--shopizz-moss)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow"
                    >
                      ★ Primary Cover
                    </span>

                    <span
                      class="rounded-full bg-[var(--shopizz-obsidian)]/80 px-2 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm"
                    >
                      #{{ idx + 1 }}
                    </span>
                  </div>

                  <!-- CDN Badge Top Right -->
                  <div class="absolute right-2 top-2">
                    <span
                      v-if="img.publicId"
                      class="rounded-full bg-white/90 px-2 py-0.5 text-[8px] font-bold text-[var(--shopizz-moss)] shadow-sm"
                    >
                      Cloudinary
                    </span>
                    <span
                      v-else
                      class="rounded-full bg-white/90 px-2 py-0.5 text-[8px] font-medium text-[var(--shopizz-obsidian)]/60 shadow-sm"
                    >
                      URL
                    </span>
                  </div>
                </div>

                <!-- Card Actions -->
                <div class="mt-3 flex items-center justify-between text-xs">
                  <!-- Set Primary Button -->
                  <button
                    type="button"
                    class="text-[11px] font-medium transition-colors"
                    :class="
                      img.isPrimary
                        ? 'text-[var(--shopizz-moss)] font-bold'
                        : 'text-[var(--shopizz-obsidian)]/60 hover:text-[var(--shopizz-obsidian)] underline'
                    "
                    @click="setPrimaryImage(idx)"
                  >
                    {{ img.isPrimary ? '✓ Cover' : 'Make Cover' }}
                  </button>

                  <!-- Reorder & Remove Controls -->
                  <div class="flex items-center gap-1.5">
                    <button
                      type="button"
                      :disabled="idx === 0"
                      class="flex h-6 w-6 items-center justify-center rounded-lg bg-white/80 border border-[var(--shopizz-obsidian)]/10 text-[10px] hover:bg-white disabled:opacity-30"
                      title="Move Left"
                      @click="moveImage(idx, -1)"
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      :disabled="idx === images.length - 1"
                      class="flex h-6 w-6 items-center justify-center rounded-lg bg-white/80 border border-[var(--shopizz-obsidian)]/10 text-[10px] hover:bg-white disabled:opacity-30"
                      title="Move Right"
                      @click="moveImage(idx, 1)"
                    >
                      →
                    </button>

                    <button
                      type="button"
                      class="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--shopizz-saffron)]/10 border border-[var(--shopizz-saffron)]/20 text-[10px] text-[var(--shopizz-saffron)] hover:bg-[var(--shopizz-saffron)] hover:text-white transition-colors"
                      title="Delete Image"
                      @click="removeImage(idx)"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dynamic Variants & Specifications Section -->
        <div class="space-y-6 pt-4 border-t border-[var(--shopizz-obsidian)]/10">
          <div>
            <h3 class="font-serif text-lg font-medium text-[var(--shopizz-obsidian)]">
              Colors, Sizes & Specifications
            </h3>
            <p class="text-xs text-[var(--shopizz-obsidian)]/60 mt-0.5">
              Configure variant swatches and dynamic data displayed in the product tabs.
            </p>
          </div>

          <!-- Colors & Sizes Grid -->
          <div class="grid gap-6 md:grid-cols-2">
            <!-- Colors Editor -->
            <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-4 space-y-3">
              <label class="block text-xs font-bold uppercase tracking-wider text-[var(--shopizz-obsidian)]">
                Color Swatches
              </label>

              <div class="flex flex-wrap gap-2">
                <div
                  v-for="(c, idx) in colorsList"
                  :key="c.name + idx"
                  class="flex items-center gap-1.5 rounded-full border border-[var(--shopizz-obsidian)]/15 bg-white px-3 py-1 text-xs shadow-sm"
                >
                  <span class="h-3 w-3 rounded-full border border-black/10 shrink-0" :style="{ backgroundColor: c.hex }" />
                  <span class="font-medium text-[var(--shopizz-obsidian)]">{{ c.name }}</span>
                  <button type="button" class="text-stone-400 hover:text-red-500 ml-1 text-xs" @click="removeColorSwatch(idx)">
                    ✕
                  </button>
                </div>
              </div>

              <!-- Add Color Input -->
              <div class="flex items-center gap-2 pt-1">
                <input
                  v-model="newColorHex"
                  type="color"
                  class="h-8 w-8 rounded-lg border border-[var(--shopizz-obsidian)]/20 cursor-pointer bg-white p-0.5"
                />
                <input
                  v-model="newColorName"
                  type="text"
                  placeholder="Color Name (e.g. Sage)"
                  class="flex-1 rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-3 py-1.5 text-xs outline-none focus:border-[var(--shopizz-obsidian)]"
                  @keydown.enter.prevent="addColorSwatch"
                />
                <button
                  type="button"
                  class="rounded-xl bg-[var(--shopizz-obsidian)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--shopizz-moss)]"
                  @click="addColorSwatch"
                >
                  + Add
                </button>
              </div>
            </div>

            <!-- Sizes Editor -->
            <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-4 space-y-3">
              <label class="block text-xs font-bold uppercase tracking-wider text-[var(--shopizz-obsidian)]">
                Available Sizes
              </label>

              <div class="flex flex-wrap gap-2">
                <div
                  v-for="(sz, idx) in sizesList"
                  :key="sz + idx"
                  class="flex items-center gap-1.5 rounded-full border border-[var(--shopizz-obsidian)]/15 bg-white px-3 py-1 text-xs shadow-sm"
                >
                  <span class="font-semibold text-[var(--shopizz-obsidian)]">{{ sz }}</span>
                  <button type="button" class="text-stone-400 hover:text-red-500 ml-1 text-xs" @click="removeSizeChip(idx)">
                    ✕
                  </button>
                </div>
              </div>

              <!-- Add Size Input -->
              <div class="flex items-center gap-2 pt-1">
                <input
                  v-model="newSizeInput"
                  type="text"
                  placeholder="Size (e.g. XXL, 32, Free Size)"
                  class="flex-1 rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-3 py-1.5 text-xs outline-none focus:border-[var(--shopizz-obsidian)]"
                  @keydown.enter.prevent="addSizeChip"
                />
                <button
                  type="button"
                  class="rounded-xl bg-[var(--shopizz-obsidian)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--shopizz-moss)]"
                  @click="addSizeChip"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          <!-- Specifications Table (Details Tab) -->
          <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-4 space-y-3">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold uppercase tracking-wider text-[var(--shopizz-obsidian)]">
                Specifications Table (Details Tab)
              </label>
              <span class="text-[11px] text-[var(--shopizz-obsidian)]/50">Displayed in the Details tab</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                v-for="(val, key) in specifications"
                :key="key"
                class="rounded-xl border border-[var(--shopizz-obsidian)]/10 bg-white p-2.5 flex items-center justify-between text-xs"
              >
                <div>
                  <p class="font-semibold text-[#7A746B] text-[10px] uppercase">{{ key }}</p>
                  <p class="font-medium text-[#1F2623] truncate max-w-[120px]">{{ val }}</p>
                </div>
                <button type="button" class="text-stone-400 hover:text-red-500 text-xs p-1" @click="removeSpecRow(String(key))">
                  ✕
                </button>
              </div>
            </div>

            <!-- Add Spec Row -->
            <div class="flex items-center gap-2 pt-1">
              <input
                v-model="newSpecKey"
                type="text"
                placeholder="Attribute (e.g. Material, Pattern)"
                class="w-1/3 rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-3 py-1.5 text-xs outline-none focus:border-[var(--shopizz-obsidian)]"
              />
              <input
                v-model="newSpecVal"
                type="text"
                placeholder="Value (e.g. 100% Cotton, Striped)"
                class="flex-1 rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-3 py-1.5 text-xs outline-none focus:border-[var(--shopizz-obsidian)]"
                @keydown.enter.prevent="addSpecRow"
              />
              <button
                type="button"
                class="rounded-xl bg-[var(--shopizz-obsidian)] px-4 py-1.5 text-xs font-medium text-white hover:bg-[var(--shopizz-moss)]"
                @click="addSpecRow"
              >
                + Add Spec
              </button>
            </div>
          </div>

          <!-- Materials & Shipping Row -->
          <div class="grid gap-6 md:grid-cols-2">
            <!-- Materials & Care -->
            <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-4 space-y-3">
              <label class="block text-xs font-bold uppercase tracking-wider text-[var(--shopizz-obsidian)]">
                Materials & Care Instructions
              </label>

              <div>
                <span class="text-[10px] text-[var(--shopizz-obsidian)]/60 uppercase font-semibold">Primary Composition</span>
                <input
                  v-model="materialsInfo.composition"
                  type="text"
                  placeholder="e.g. 100% Raw French Linen"
                  class="w-full mt-1 rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-3 py-2 text-xs outline-none focus:border-[var(--shopizz-obsidian)]"
                />
              </div>

              <div>
                <span class="text-[10px] text-[var(--shopizz-obsidian)]/60 uppercase font-semibold">Care Instructions (one per line)</span>
                <textarea
                  v-model="materialsInfo.careText"
                  rows="3"
                  class="w-full mt-1 rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white p-3 text-xs outline-none focus:border-[var(--shopizz-obsidian)] leading-relaxed resize-none"
                />
              </div>
            </div>

            <!-- Shipping Policy -->
            <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-4 space-y-3">
              <label class="block text-xs font-bold uppercase tracking-wider text-[var(--shopizz-obsidian)]">
                Shipping & Returns Policy
              </label>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <span class="text-[10px] text-[var(--shopizz-obsidian)]/60 uppercase font-semibold">Dispatch Window</span>
                  <input
                    v-model="shippingInfo.dispatchDays"
                    type="text"
                    placeholder="2–3 business days"
                    class="w-full mt-1 rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-3 py-2 text-xs outline-none focus:border-[var(--shopizz-obsidian)]"
                  />
                </div>

                <div>
                  <span class="text-[10px] text-[var(--shopizz-obsidian)]/60 uppercase font-semibold">Return Window</span>
                  <input
                    v-model="shippingInfo.returnDays"
                    type="text"
                    placeholder="7 days"
                    class="w-full mt-1 rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-3 py-2 text-xs outline-none focus:border-[var(--shopizz-obsidian)]"
                  />
                </div>
              </div>

              <div>
                <span class="text-[10px] text-[var(--shopizz-obsidian)]/60 uppercase font-semibold">Free Shipping Order Min (₹)</span>
                <input
                  v-model.number="shippingInfo.freeShippingAbove"
                  type="number"
                  placeholder="1499"
                  class="w-full mt-1 rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-3 py-2 text-xs outline-none focus:border-[var(--shopizz-obsidian)]"
                />
              </div>
            </div>
          </div>
        </div>

        <label class="flex items-center gap-3 cursor-pointer pt-2">
          <input
            v-model="form.isFeatured"
            type="checkbox"
            class="h-4 w-4 rounded border-[var(--shopizz-obsidian)]/20 text-[var(--shopizz-moss)] focus:ring-[var(--shopizz-moss)]"
          />
          <span class="text-xs font-medium">Highlight this piece as Featured</span>
        </label>
      </div>

      <div class="flex items-center justify-end gap-4 pt-4">
        <NuxtLink to="/owner/products">
          <AppButton variant="secondary" :disabled="submitting || isUploadingImage">
            Cancel
          </AppButton>
        </NuxtLink>

        <AppButton type="submit" :disabled="submitting || isUploadingImage">
          {{ submitting ? 'Saving...' : 'Save Product Changes' }}
        </AppButton>
      </div>
    </form>
  </div>
</template>
