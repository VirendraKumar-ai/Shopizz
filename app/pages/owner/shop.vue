<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'owner'],
})

const authStore = useAuthStore()

const { data, pending, error, refresh } = await useFetch<{
  success: boolean
  shop: {
    id: string
    shopName: string
    description: string
    phone: string
    address: string
    reason: string
    imageUrl: string
    logoUrl: string
    status: string
    createdAt: string
    updatedAt: string
  }
}>('/api/owner/shop')

const form = reactive({
  shopName: '',
  description: '',
  phone: '',
  address: '',
  imageUrl: '',
  logoUrl: '',
})

watchEffect(() => {
  if (data.value?.shop) {
    form.shopName = data.value.shop.shopName || ''
    form.description = data.value.shop.description || ''
    form.phone = data.value.shop.phone || ''
    form.address = data.value.shop.address || ''
    form.imageUrl = data.value.shop.imageUrl || ''
    form.logoUrl = data.value.shop.logoUrl || ''
  }
})

const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

const handleSave = async () => {
  saving.value = true
  saveSuccess.value = false
  saveError.value = ''

  try {
    const res = await $fetch<{ success: boolean; shop: any }>('/api/owner/shop', {
      method: 'PATCH',
      body: form,
    })

    if (res.success) {
      saveSuccess.value = true
      await refresh()
      setTimeout(() => {
        saveSuccess.value = false
      }, 4000)
    }
  } catch (err: any) {
    saveError.value = err.data?.message || err.message || 'Failed to update store details'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--shopizz-saffron)]">
          Owner / Store Profile
        </p>

        <h1 class="mt-2 font-serif text-3xl font-medium tracking-tight text-[var(--shopizz-obsidian)] sm:text-4xl">
          Store Information & Narrative
        </h1>

        <p class="mt-2 max-w-xl text-xs leading-relaxed text-[var(--shopizz-obsidian)]/60">
          Curate your maker bio, contact details and visual presentation. These details are featured on the marketplace storefront.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink
          to="/#shops"
          class="flex items-center gap-1.5 rounded-full border border-[var(--shopizz-obsidian)]/15 bg-white/60 px-4 py-2.5 text-xs font-medium text-[var(--shopizz-obsidian)] transition-colors hover:bg-white"
        >
          <span>View on Storefront</span>
          <span class="text-xs">→</span>
        </NuxtLink>

        <NuxtLink
          to="/owner"
          class="flex items-center gap-1.5 rounded-full border border-[var(--shopizz-obsidian)]/15 bg-white/60 px-4 py-2.5 text-xs font-medium text-[var(--shopizz-obsidian)] transition-colors hover:bg-white"
        >
          <span>← Back to Dashboard</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Loading -->
    <AppLoading
      v-if="pending"
      text="Loading store details..."
    />

    <!-- Error -->
    <div
      v-else-if="error"
      class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-8 text-center"
    >
      <p class="text-sm text-[var(--shopizz-obsidian)]/70">
        Unable to load store information.
      </p>
      <AppButton
        class="mt-4"
        size="sm"
        @click="refresh()"
      >
        Retry
      </AppButton>
    </div>

    <!-- Main Editor Grid -->
    <div
      v-else
      class="grid gap-8 lg:grid-cols-12"
    >
      <!-- Left Form (7 cols) -->
      <div class="lg:col-span-7 space-y-6">
        <form
          class="space-y-5 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 p-6 sm:p-8"
          @submit.prevent="handleSave"
        >
          <div class="border-b border-[var(--shopizz-obsidian)]/10 pb-4">
            <h2 class="text-lg font-medium text-[var(--shopizz-obsidian)]">
              Store Details
            </h2>
            <p class="mt-0.5 text-xs text-[var(--shopizz-obsidian)]/50">
              Update the public profile for {{ authStore.user?.name }}'s studio.
            </p>
          </div>

          <!-- Alert Messages -->
          <div
            v-if="saveSuccess"
            class="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-medium text-emerald-800 flex items-center gap-2"
          >
            <span>✓</span>
            <span>Store information updated successfully! Changes are live on the marketplace.</span>
          </div>

          <div
            v-if="saveError"
            class="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs font-medium text-red-800 flex items-center gap-2"
          >
            <span>⚠️</span>
            <span>{{ saveError }}</span>
          </div>

          <!-- Field: Shop Name -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]/70">
              Shop Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.shopName"
              type="text"
              required
              placeholder="e.g. Bare & Bone Studio"
              class="mt-2 w-full rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-3 text-xs text-[var(--shopizz-obsidian)] outline-none transition-colors focus:border-[var(--shopizz-obsidian)]"
            >
          </div>

          <!-- Field: Description / Maker Story -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]/70">
              Maker Narrative & Studio Bio
            </label>
            <textarea
              v-model="form.description"
              rows="4"
              placeholder="Share the story behind your craft, materials, ethos and intentional production..."
              class="mt-2 w-full rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-3 text-xs leading-relaxed text-[var(--shopizz-obsidian)] outline-none transition-colors focus:border-[var(--shopizz-obsidian)]"
            />
            <p class="mt-1 text-[11px] text-[var(--shopizz-obsidian)]/40">
              A compelling story builds connection with conscious buyers.
            </p>
          </div>

          <!-- Grid: Studio Location & Phone -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]/70">
                Studio Location / City
              </label>
              <input
                v-model="form.address"
                type="text"
                placeholder="e.g. Fort Kochi, Kerala"
                class="mt-2 w-full rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-3 text-xs text-[var(--shopizz-obsidian)] outline-none transition-colors focus:border-[var(--shopizz-obsidian)]"
              >
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]/70">
                Business Contact Phone
              </label>
              <input
                v-model="form.phone"
                type="text"
                placeholder="e.g. +91 98765 43210"
                class="mt-2 w-full rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-3 text-xs text-[var(--shopizz-obsidian)] outline-none transition-colors focus:border-[var(--shopizz-obsidian)]"
              >
            </div>
          </div>

          <!-- Field: Cover Banner Image URL -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]/70">
              Shop Banner Image URL
            </label>
            <input
              v-model="form.imageUrl"
              type="url"
              placeholder="https://images.unsplash.com/... or Cloudinary URL"
              class="mt-2 w-full rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-3 text-xs text-[var(--shopizz-obsidian)] outline-none transition-colors focus:border-[var(--shopizz-obsidian)]"
            >
          </div>

          <!-- Submit Button -->
          <div class="pt-4 border-t border-[var(--shopizz-obsidian)]/10 flex items-center justify-end gap-3">
            <button
              type="submit"
              :disabled="saving"
              class="flex items-center gap-2 rounded-full bg-[var(--shopizz-obsidian)] px-7 py-3 text-xs font-semibold text-white transition-all hover:bg-[var(--shopizz-moss)] hover:scale-105 disabled:opacity-50 shadow-sm"
            >
              <span>{{ saving ? 'Saving Changes...' : 'Save Store Details' }}</span>
              <span>→</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Right Live Preview Card (5 cols) -->
      <div class="lg:col-span-5 space-y-6">
        <div class="sticky top-28 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/60 p-6 sm:p-7">
          <div class="flex items-center justify-between pb-4 border-b border-[var(--shopizz-obsidian)]/10">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--shopizz-saffron)]">
                Live Preview
              </p>
              <h3 class="mt-0.5 text-base font-medium text-[var(--shopizz-obsidian)]">
                Marketplace Storefront Card
              </h3>
            </div>
            <span class="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
              Live preview
            </span>
          </div>

          <!-- Preview Shop Card -->
          <div class="mt-6 overflow-hidden rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white shadow-sm">
            <!-- Cover Banner -->
            <div class="relative h-44 w-full bg-[var(--shopizz-stone)]">
              <img
                v-if="form.imageUrl"
                :src="form.imageUrl"
                :alt="form.shopName"
                class="h-full w-full object-cover"
              >
              <img
                v-else
                src="/images/shop-makers-banner.jpg"
                alt="Default Maker Studio"
                class="h-full w-full object-cover"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div class="absolute bottom-3 left-4 right-4">
                <span class="rounded-full bg-white/90 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--shopizz-obsidian)]">
                  Independent Studio
                </span>
                <h4 class="mt-1 font-serif text-lg font-semibold text-white">
                  {{ form.shopName || 'Your Shop Name' }}
                </h4>
              </div>
            </div>

            <!-- Card Body -->
            <div class="p-5 space-y-3">
              <p class="text-xs text-[var(--shopizz-obsidian)]/70 line-clamp-3 leading-relaxed">
                {{ form.description || 'Your maker narrative and philosophy will appear here to introduce conscious shoppers to your creations.' }}
              </p>

              <div class="pt-3 border-t border-[var(--shopizz-obsidian)]/8 flex items-center justify-between text-[11px] text-[var(--shopizz-obsidian)]/55">
                <span>📍 {{ form.address || 'Location' }}</span>
                <span>📞 {{ form.phone || 'Contact' }}</span>
              </div>
            </div>
          </div>

          <!-- Helpful hints -->
          <div class="mt-6 rounded-2xl bg-[var(--shopizz-stone)]/40 p-4 text-[11px] text-[var(--shopizz-obsidian)]/65 space-y-1.5">
            <p class="font-semibold text-[var(--shopizz-obsidian)]">
              💡 Tip for Shop Owners:
            </p>
            <p>
              Shops with a detailed narrative and authentic studio imagery experience higher buyer trust and repeat orders.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
