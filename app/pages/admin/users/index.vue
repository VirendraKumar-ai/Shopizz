<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const roleFilter = ref('ALL')
const searchQuery = ref('')
const statusFilter = ref('ALL')

const {
  data,
  pending,
  error,
  refresh,
} = await useFetch<any>('/api/admin/users', {
  query: computed(() => ({
    role: roleFilter.value,
    status: statusFilter.value,
    search: searchQuery.value,
  })),
})

const metrics = computed(() => data.value?.metrics || {
  total: 0,
  buyers: 0,
  owners: 0,
  admins: 0,
  active: 0,
  suspended: 0,
})

const usersList = computed(() => data.value?.users || [])

// Modal state
const selectedUser = ref<any>(null)
const isRoleModalOpen = ref(false)
const isSuspendModalOpen = ref(false)
const newRole = ref<'BUYER' | 'OWNER' | 'ADMIN'>('BUYER')
const isProcessing = ref(false)
const actionError = ref('')

function openRoleModal(user: any) {
  selectedUser.value = user
  newRole.value = user.role
  actionError.value = ''
  isRoleModalOpen.value = true
}

function openSuspendModal(user: any) {
  selectedUser.value = user
  actionError.value = ''
  isSuspendModalOpen.value = true
}

async function handleRoleUpdate() {
  if (!selectedUser.value) return
  isProcessing.value = true
  actionError.value = ''

  try {
    const res = await $fetch<{ success: boolean }>(`/api/admin/users/${selectedUser.value.id}/status`, {
      method: 'PATCH',
      body: {
        role: newRole.value,
      },
    })
    if (res.success) {
      isRoleModalOpen.value = false
      await refresh()
    }
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.message || 'Failed to update user role.'
  } finally {
    isProcessing.value = false
  }
}

async function handleStatusToggle(user: any) {
  isProcessing.value = true
  actionError.value = ''

  try {
    const res = await $fetch<{ success: boolean }>(`/api/admin/users/${user.id}/status`, {
      method: 'PATCH',
      body: {
        isActive: !user.isActive,
      },
    })
    if (res.success) {
      isSuspendModalOpen.value = false
      await refresh()
    }
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.message || 'Failed to toggle account status.'
  } finally {
    isProcessing.value = false
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

function getInitials(name: string) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
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
          Users & Access Control
        </h1>
        <p class="mt-1 text-xs text-[var(--shopizz-obsidian)]/55">
          Directory of registered buyers, artisanal shop owners, and administrators.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-2 text-xs font-medium text-[var(--shopizz-obsidian)] hover:bg-[var(--shopizz-porcelain)]"
          @click="() => refresh()"
        >
          <span>↻</span> Refresh Directory
        </button>
      </div>
    </div>

    <!-- KPI Metrics -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <div class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/60 p-5 backdrop-blur-sm">
        <p class="text-[10px] font-medium uppercase tracking-wider text-[var(--shopizz-obsidian)]/50">
          Total Registered
        </p>
        <p class="mt-2 font-serif text-2xl font-semibold text-[var(--shopizz-obsidian)]">
          {{ metrics.total }}
        </p>
      </div>

      <div class="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-5 backdrop-blur-sm">
        <p class="text-[10px] font-medium uppercase tracking-wider text-blue-800/70">
          Buyers
        </p>
        <p class="mt-2 font-serif text-2xl font-semibold text-blue-900">
          {{ metrics.buyers }}
        </p>
      </div>

      <div class="rounded-3xl border border-[var(--shopizz-terracotta)]/20 bg-[var(--shopizz-terracotta)]/5 p-5 backdrop-blur-sm">
        <p class="text-[10px] font-medium uppercase tracking-wider text-[var(--shopizz-terracotta)]">
          Artisanal Owners
        </p>
        <p class="mt-2 font-serif text-2xl font-semibold text-[var(--shopizz-terracotta)]">
          {{ metrics.owners }}
        </p>
      </div>

      <div class="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-5 backdrop-blur-sm">
        <p class="text-[10px] font-medium uppercase tracking-wider text-purple-800/70">
          Administrators
        </p>
        <p class="mt-2 font-serif text-2xl font-semibold text-purple-900">
          {{ metrics.admins }}
        </p>
      </div>

      <div class="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-5 backdrop-blur-sm">
        <p class="text-[10px] font-medium uppercase tracking-wider text-rose-800/70">
          Suspended
        </p>
        <p class="mt-2 font-serif text-2xl font-semibold text-rose-900">
          {{ metrics.suspended }}
        </p>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-col gap-4 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-4 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
      <!-- Role Filters -->
      <div class="flex flex-wrap items-center gap-1.5">
        <button
          v-for="rf in [
            { id: 'ALL', label: 'All Users' },
            { id: 'BUYER', label: 'Buyers' },
            { id: 'OWNER', label: 'Makers / Owners' },
            { id: 'ADMIN', label: 'Admins' },
          ]"
          :key="rf.id"
          type="button"
          class="rounded-full px-4 py-1.5 text-xs font-medium transition-all"
          :class="
            roleFilter === rf.id
              ? 'bg-[var(--shopizz-obsidian)] text-white shadow-sm'
              : 'text-[var(--shopizz-obsidian)]/60 hover:bg-black/5 hover:text-[var(--shopizz-obsidian)]'
          "
          @click="roleFilter = rf.id"
        >
          {{ rf.label }}
        </button>
      </div>

      <!-- Search & Status dropdown -->
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <select
          v-model="statusFilter"
          class="rounded-full border border-[var(--shopizz-obsidian)]/15 bg-white px-4 py-2 text-xs outline-none focus:border-[var(--shopizz-terracotta)]"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active Only</option>
          <option value="SUSPENDED">Suspended Only</option>
        </select>

        <div class="relative w-full sm:w-64">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--shopizz-obsidian)]/40">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or email..."
            class="w-full rounded-full border border-[var(--shopizz-obsidian)]/15 bg-white py-2 pl-9 pr-4 text-xs outline-none focus:border-[var(--shopizz-terracotta)]"
          />
        </div>
      </div>
    </div>

    <!-- Loading / Error / Table -->
    <AppLoading v-if="pending" text="Loading user directory..." />

    <div
      v-else-if="error"
      class="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center"
    >
      <p class="text-sm font-medium text-red-700">Failed to load user directory.</p>
      <AppButton size="sm" class="mt-4" @click="() => refresh()">Retry</AppButton>
    </div>

    <div
      v-else-if="usersList.length === 0"
      class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-12 text-center"
    >
      <p class="font-serif text-xl font-medium text-[var(--shopizz-obsidian)]">
        No users found
      </p>
      <p class="mt-1 text-xs text-[var(--shopizz-obsidian)]/55">
        No accounts match the selected filters.
      </p>
    </div>

    <!-- Users Table -->
    <div v-else class="overflow-hidden rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/70 shadow-sm backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-[var(--shopizz-obsidian)]/10 bg-[var(--shopizz-porcelain)]/80 text-[10px] font-semibold uppercase tracking-wider text-[var(--shopizz-obsidian)]/60">
              <th class="px-5 py-4">User</th>
              <th class="px-5 py-4">Role</th>
              <th class="px-5 py-4">Activity & Spend</th>
              <th class="px-5 py-4">Joined Date</th>
              <th class="px-5 py-4">Status</th>
              <th class="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--shopizz-obsidian)]/10">
            <tr
              v-for="u in usersList"
              :key="u.id"
              class="group hover:bg-[var(--shopizz-porcelain)]/40 transition-colors"
            >
              <!-- Avatar & Name -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-medium text-xs text-white"
                    :class="{
                      'bg-purple-700': u.role === 'ADMIN',
                      'bg-[var(--shopizz-terracotta)]': u.role === 'OWNER',
                      'bg-[var(--shopizz-obsidian)]': u.role === 'BUYER',
                    }"
                  >
                    {{ getInitials(u.name) }}
                  </div>
                  <div>
                    <p class="font-medium text-[var(--shopizz-obsidian)]">{{ u.name }}</p>
                    <p class="text-[10px] text-[var(--shopizz-obsidian)]/50">{{ u.email }}</p>
                  </div>
                </div>
              </td>

              <!-- Role -->
              <td class="px-5 py-4">
                <span
                  class="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                  :class="{
                    'bg-purple-100 text-purple-800 border border-purple-200': u.role === 'ADMIN',
                    'bg-amber-100 text-amber-800 border border-amber-200': u.role === 'OWNER',
                    'bg-blue-100 text-blue-800 border border-blue-200': u.role === 'BUYER',
                  }"
                >
                  {{ u.role }}
                </span>
              </td>

              <!-- Activity -->
              <td class="px-5 py-4">
                <div v-if="u.role === 'BUYER'">
                  <p class="font-medium text-[var(--shopizz-obsidian)]">{{ u.orderCount }} Orders</p>
                  <p class="text-[10px] text-[var(--shopizz-obsidian)]/50">Spent {{ formatPrice(u.totalSpentPaise) }}</p>
                </div>
                <div v-else-if="u.role === 'OWNER'">
                  <p class="font-medium text-[var(--shopizz-obsidian)]">{{ u.productCount }} Products</p>
                  <p class="text-[10px] text-[var(--shopizz-obsidian)]/50">Active Artisan</p>
                </div>
                <div v-else>
                  <span class="text-[10px] font-mono text-[var(--shopizz-obsidian)]/60">Full Governance</span>
                </div>
              </td>

              <!-- Joined Date -->
              <td class="px-5 py-4">
                <p class="text-[var(--shopizz-obsidian)]/80">{{ formatDate(u.createdAt) }}</p>
              </td>

              <!-- Status -->
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                  :class="
                    u.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  "
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="u.isActive ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                  {{ u.isActive ? 'Active' : 'Suspended' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    class="rounded-full border border-[var(--shopizz-obsidian)]/15 bg-white px-2.5 py-1 text-[11px] font-medium text-[var(--shopizz-obsidian)] hover:bg-[var(--shopizz-porcelain)]"
                    @click="openRoleModal(u)"
                  >
                    Change Role
                  </button>

                  <button
                    type="button"
                    class="rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
                    :class="
                      u.isActive
                        ? 'text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100'
                        : 'text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                    "
                    @click="handleStatusToggle(u)"
                  >
                    {{ u.isActive ? 'Suspend' : 'Reactivate' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Role Edit Modal -->
    <div
      v-if="isRoleModalOpen && selectedUser"
      class="fixed inset-0 z-50 flex items-center justify-center bg-[var(--shopizz-obsidian)]/60 p-4 backdrop-blur-sm"
    >
      <div class="w-full max-w-md rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-[var(--shopizz-porcelain)] p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
        <div class="flex items-start justify-between">
          <div>
            <span class="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--shopizz-terracotta)]">
              Access Control
            </span>
            <h3 class="mt-1 font-serif text-2xl font-medium text-[var(--shopizz-obsidian)]">
              Assign Account Role
            </h3>
          </div>
          <button
            class="rounded-full p-2 text-[var(--shopizz-obsidian)]/40 hover:bg-black/5 hover:text-[var(--shopizz-obsidian)]"
            @click="isRoleModalOpen = false"
          >
            ✕
          </button>
        </div>

        <div class="rounded-2xl border border-[var(--shopizz-obsidian)]/10 bg-white/60 p-4 space-y-1">
          <p class="font-medium text-[var(--shopizz-obsidian)]">{{ selectedUser.name }}</p>
          <p class="text-xs text-[var(--shopizz-obsidian)]/60">{{ selectedUser.email }}</p>
          <p class="text-xs text-[var(--shopizz-obsidian)]/60">Current Role: <span class="font-semibold">{{ selectedUser.role }}</span></p>
        </div>

        <div class="space-y-2">
          <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--shopizz-obsidian)]/70">
            Select New Platform Role
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="r in ['BUYER', 'OWNER', 'ADMIN'] as const"
              :key="r"
              type="button"
              class="rounded-2xl border p-3 text-xs font-medium text-center transition-all"
              :class="
                newRole === r
                  ? 'border-[var(--shopizz-obsidian)] bg-[var(--shopizz-obsidian)] text-white'
                  : 'border-[var(--shopizz-obsidian)]/15 bg-white text-[var(--shopizz-obsidian)] hover:border-[var(--shopizz-obsidian)]/30'
              "
              @click="newRole = r"
            >
              {{ r }}
            </button>
          </div>
        </div>

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
            @click="isRoleModalOpen = false"
          >
            Cancel
          </button>
          <AppButton
            size="sm"
            :disabled="isProcessing"
            @click="handleRoleUpdate"
          >
            {{ isProcessing ? 'Saving...' : 'Update Role' }}
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>
