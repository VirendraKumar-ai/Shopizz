<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const {
  owners,
  ownersLoading,
  error,
  fetchOwners,
} = useAdmin()

onMounted(async () => {
  await fetchOwners()
})

const searchQuery = ref('')

const filteredOwners = computed(() => {
  const search = searchQuery.value.trim().toLowerCase()
  if (!search) return owners.value

  return owners.value.filter((o) =>
    o.name?.toLowerCase().includes(search) ||
    o.email?.toLowerCase().includes(search)
  )
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-10">
    <!-- Header -->
    <section>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]">
            Admin / 003
          </p>

          <h1 class="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
            Approved Shop Owners
          </h1>

          <p class="mt-3 max-w-xl text-sm leading-7 text-[var(--shopizz-obsidian)]/55">
            Directory of verified independent sellers operating shops on the Shopizz platform.
          </p>
        </div>

        <AppBadge variant="success">
          {{ owners.length }} active {{ owners.length === 1 ? 'owner' : 'owners' }}
        </AppBadge>
      </div>
    </section>

    <!-- Search filter -->
    <section class="flex rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-6">
      <div class="w-full sm:w-80">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Filter owners by name or email..."
          class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-[var(--shopizz-obsidian)]"
        />
      </div>
    </section>

    <!-- Loading -->
    <AppLoading v-if="ownersLoading && !owners.length" text="Loading shop owners..." />

    <!-- Error -->
    <div
      v-else-if="error"
      class="rounded-3xl border border-[var(--shopizz-saffron)]/20 bg-[var(--shopizz-saffron)]/5 p-6"
    >
      <p class="text-sm text-[var(--shopizz-saffron)]">
        {{ error }}
      </p>
      <AppButton class="mt-4" size="sm" @click="fetchOwners">
        Try again
      </AppButton>
    </div>

    <!-- Empty -->
    <AppEmptyState
      v-else-if="!filteredOwners.length"
      title="No owners found"
      description="No approved shop owners match your criteria."
    />

    <!-- Owners Table -->
    <section v-else class="overflow-hidden rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30">
      <table class="w-full text-left text-xs">
        <thead class="border-b border-[var(--shopizz-obsidian)]/10 bg-white/40 text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">
          <tr>
            <th class="px-6 py-4">Seller Name</th>
            <th class="px-6 py-4">Email Address</th>
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4">Registered Date</th>
            <th class="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--shopizz-obsidian)]/10">
          <tr v-for="owner in filteredOwners" :key="owner.id" class="hover:bg-white/40 transition-colors">
            <td class="px-6 py-4 font-medium text-sm text-[var(--shopizz-obsidian)]">
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--shopizz-moss)] text-xs text-white">
                  {{ owner.name?.charAt(0)?.toUpperCase() || 'O' }}
                </div>
                <span>{{ owner.name }}</span>
              </div>
            </td>

            <td class="px-6 py-4 text-[var(--shopizz-obsidian)]/70">
              {{ owner.email }}
            </td>

            <td class="px-6 py-4">
              <AppBadge :variant="owner.isActive ? 'success' : 'danger'">
                {{ owner.isActive ? 'ACTIVE' : 'SUSPENDED' }}
              </AppBadge>
            </td>

            <td class="px-6 py-4 text-[var(--shopizz-obsidian)]/50">
              {{ formatDate(owner.createdAt) }}
            </td>

            <td class="px-6 py-4 text-right">
              <NuxtLink
                :to="`/admin/owners/${owner.id}`"
                class="font-medium text-[var(--shopizz-obsidian)]/70 hover:text-[var(--shopizz-obsidian)] underline"
              >
                Owner Details →
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
