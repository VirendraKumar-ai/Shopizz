<script setup lang="ts">
</script>

<template>
  <div
    class="min-h-screen bg-[var(--shopizz-porcelain)] text-[var(--shopizz-obsidian)]"
  >
    <div class="flex min-h-screen">

      <!-- Sidebar -->
      <DashboardSidebar />

      <!-- Main -->
      <div class="flex min-w-0 flex-1 flex-col">

        <!-- Header -->
        <DashboardHeader />

        <!-- Content -->
        <main class="flex-1">
          <div
            class="mx-auto w-full max-w-[1500px] px-6 py-10 lg:px-12 lg:py-12"
          >
            <slot />
          </div>
        </main>

      </div>
    </div>
  </div>
</template>