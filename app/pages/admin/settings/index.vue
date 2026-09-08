<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const {
  data,
  pending,
  error,
  refresh,
} = await useFetch<any>('/api/admin/settings')

const form = ref({
  announcementText: '',
  commissionRatePercent: 10,
  supportEmail: '',
  supportPhone: '',
})

watch(
  () => data.value?.settings,
  (settings) => {
    if (settings) {
      form.value = {
        announcementText: settings.announcementText || '',
        commissionRatePercent: settings.commissionRatePercent ?? 10,
        supportEmail: settings.supportEmail || '',
        supportPhone: settings.supportPhone || '',
      }
    }
  },
  { immediate: true }
)

const isSaving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

async function saveSettings() {
  isSaving.value = true
  saveSuccess.value = false
  saveError.value = ''

  try {
    const res = await $fetch<{ success: boolean; settings: any }>('/api/admin/settings', {
      method: 'PATCH',
      body: form.value,
    })
    if (res.success) {
      saveSuccess.value = true
      await refresh()
      setTimeout(() => {
        saveSuccess.value = false
      }, 4000)
    }
  } catch (err: any) {
    saveError.value = err?.data?.statusMessage || err?.message || 'Failed to update platform settings.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-8 max-w-4xl">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.25em] text-[var(--shopizz-terracotta)]">
          Platform Governance
        </p>
        <h1 class="mt-1 font-serif text-3xl font-medium tracking-tight text-[var(--shopizz-obsidian)] sm:text-4xl">
          Platform Settings
        </h1>
        <p class="mt-1 text-xs text-[var(--shopizz-obsidian)]/55">
          Configure marketplace commission rates, global announcements, and customer support channels.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <AppButton
          size="sm"
          :disabled="isSaving || pending"
          @click="saveSettings"
        >
          {{ isSaving ? 'Saving Changes...' : 'Save Platform Settings' }}
        </AppButton>
      </div>
    </div>

    <!-- Feedback Alerts -->
    <div
      v-if="saveSuccess"
      class="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-900 animate-fade-in"
    >
      <span>✓</span>
      <span>Platform settings updated successfully and applied across all storefront sessions.</span>
    </div>

    <div
      v-if="saveError"
      class="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-medium text-rose-900 animate-fade-in"
    >
      <span>✕</span>
      <span>{{ saveError }}</span>
    </div>

    <!-- Loading -->
    <AppLoading v-if="pending" text="Loading platform settings..." />

    <!-- Settings Form -->
    <form v-else class="space-y-8" @submit.prevent="saveSettings">
      <!-- Section 1: Announcement Bar -->
      <div class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/70 p-6 sm:p-8 shadow-sm backdrop-blur-sm space-y-5">
        <div>
          <span class="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--shopizz-terracotta)]">
            Storefront Broadcast
          </span>
          <h2 class="mt-1 font-serif text-xl font-medium text-[var(--shopizz-obsidian)]">
            Global Announcement Banner
          </h2>
          <p class="mt-1 text-xs text-[var(--shopizz-obsidian)]/55">
            This marquee text appears continuously at the top of every public marketplace page.
          </p>
        </div>

        <!-- Live Preview Banner -->
        <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-[var(--shopizz-obsidian)] text-white/90 p-3 text-center text-xs font-medium tracking-wide">
          <p class="truncate">{{ form.announcementText || '✦ Complimentary shipping on all artisanal orders above ₹1,499 ✦' }}</p>
        </div>

        <div>
          <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--shopizz-obsidian)]/70 mb-1.5">
            Announcement Banner Text
          </label>
          <input
            v-model="form.announcementText"
            type="text"
            placeholder="e.g. ✦ Handcrafted Festive Edit • Enjoy 15% off orders above ₹2499 with code ARTISAN ✦"
            required
            class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-3 text-xs outline-none focus:border-[var(--shopizz-terracotta)]"
          />
        </div>
      </div>

      <!-- Section 2: Marketplace Commission -->
      <div class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/70 p-6 sm:p-8 shadow-sm backdrop-blur-sm space-y-5">
        <div>
          <span class="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--shopizz-terracotta)]">
            Monetization Engine
          </span>
          <h2 class="mt-1 font-serif text-xl font-medium text-[var(--shopizz-obsidian)]">
            Artisanal Commission Rate
          </h2>
          <p class="mt-1 text-xs text-[var(--shopizz-obsidian)]/55">
            The marketplace fee deducted automatically from each order line before calculating seller payout balances.
          </p>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 items-center">
          <div>
            <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--shopizz-obsidian)]/70 mb-1.5">
              Platform Take Rate (%)
            </label>
            <div class="relative">
              <input
                v-model.number="form.commissionRatePercent"
                type="number"
                min="0"
                max="100"
                step="1"
                required
                class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--shopizz-terracotta)]"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--shopizz-obsidian)]/40">%</span>
            </div>
            <p class="mt-1.5 text-[10px] text-[var(--shopizz-obsidian)]/50">Standard luxury craft tier: 10% - 15%</p>
          </div>

          <div class="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-1">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-amber-900/70">
              Payout Calculation Example
            </p>
            <p class="text-xs text-amber-950">
              On an artisanal piece sold at <strong>₹2,000</strong>:
            </p>
            <div class="text-[11px] text-amber-900/80 space-y-0.5 pt-1">
              <p>• Platform Fee ({{ form.commissionRatePercent }}%): <strong>₹{{ (2000 * (form.commissionRatePercent / 100)).toLocaleString('en-IN') }}</strong></p>
              <p>• Maker Disbursed Net: <strong>₹{{ (2000 * (1 - form.commissionRatePercent / 100)).toLocaleString('en-IN') }}</strong></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: Concierge Support Channels -->
      <div class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/70 p-6 sm:p-8 shadow-sm backdrop-blur-sm space-y-5">
        <div>
          <span class="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--shopizz-terracotta)]">
            Customer Support & Concierge
          </span>
          <h2 class="mt-1 font-serif text-xl font-medium text-[var(--shopizz-obsidian)]">
            Support Channels & Help Desk
          </h2>
          <p class="mt-1 text-xs text-[var(--shopizz-obsidian)]/55">
            Public contact points displayed on order receipts, tracking emails, and footer links.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--shopizz-obsidian)]/70 mb-1.5">
              Support Email Address
            </label>
            <input
              v-model="form.supportEmail"
              type="email"
              placeholder="concierge@shopizz.com"
              required
              class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-3 text-xs outline-none focus:border-[var(--shopizz-terracotta)]"
            />
          </div>

          <div>
            <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--shopizz-obsidian)]/70 mb-1.5">
              Support Helpline / Phone Number
            </label>
            <input
              v-model="form.supportPhone"
              type="text"
              placeholder="+91 1800 123 4567"
              required
              class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-3 text-xs outline-none focus:border-[var(--shopizz-terracotta)]"
            />
          </div>
        </div>
      </div>

      <!-- Bottom Save Action -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-[var(--shopizz-obsidian)]/10">
        <AppButton
          type="submit"
          size="md"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Saving Platform Settings...' : 'Save Platform Settings' }}
        </AppButton>
      </div>
    </form>
  </div>
</template>
