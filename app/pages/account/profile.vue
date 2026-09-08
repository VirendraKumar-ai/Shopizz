<script setup lang="ts">
definePageMeta({
  layout: 'account',
  middleware: ['auth'],
})

const authStore = useAuthStore()

const user = computed(() => authStore.user)
</script>

<template>
  <div class="space-y-10">
    <!-- Header -->
    <section>
      <p class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]">
        Account / Profile
      </p>

      <h1 class="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
        My Profile
      </h1>

      <p class="mt-3 max-w-2xl text-sm leading-7 text-[var(--shopizz-obsidian)]/55">
        Manage your Shopizz personal identity and credentials.
      </p>
    </section>

    <!-- Profile Details Card -->
    <section class="max-w-3xl space-y-6 rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/30 p-8 sm:p-10">
      <div class="flex items-center gap-5 border-b border-[var(--shopizz-obsidian)]/10 pb-8">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--shopizz-moss)] text-xl font-medium text-white">
          {{ user?.name?.charAt(0)?.toUpperCase() || 'U' }}
        </div>

        <div>
          <h2 class="text-2xl font-medium tracking-tight">
            {{ user?.name }}
          </h2>
          <p class="text-xs uppercase tracking-wider text-[var(--shopizz-obsidian)]/40 mt-0.5">
            Role: {{ user?.role }}
          </p>
        </div>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 pt-2 text-sm">
        <div>
          <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Full Name</p>
          <p class="mt-1 font-medium">{{ user?.name }}</p>
        </div>

        <div>
          <p class="text-[10px] uppercase tracking-wider text-[var(--shopizz-obsidian)]/40">Email Address</p>
          <p class="mt-1 font-medium">{{ user?.email }}</p>
        </div>
      </div>

      <!-- Owner Status -->
      <div v-if="user?.role === 'OWNER'" class="mt-6 rounded-2xl border border-[var(--shopizz-moss)]/20 bg-[var(--shopizz-moss)]/5 p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[10px] font-medium uppercase tracking-wider text-[var(--shopizz-moss)]">
              Approved Independent Seller
            </p>
            <p class="text-sm font-medium mt-1">You operate a registered Shopizz shop.</p>
          </div>
          <NuxtLink to="/owner">
            <AppButton size="sm">
              Open workspace →
            </AppButton>
          </NuxtLink>
        </div>
      </div>

      <div v-else-if="user?.role === 'BUYER'" class="mt-6 rounded-2xl border border-[var(--shopizz-saffron)]/20 bg-[var(--shopizz-saffron)]/5 p-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p class="text-[10px] font-medium uppercase tracking-wider text-[var(--shopizz-saffron)]">
              Interested in selling?
            </p>
            <p class="text-sm font-medium mt-1">Open an independent shop on Shopizz.</p>
          </div>
          <NuxtLink to="/account/settings">
            <AppButton size="sm" variant="secondary">
              Apply to become a seller →
            </AppButton>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
