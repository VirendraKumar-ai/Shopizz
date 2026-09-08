<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F6F3EC] px-6">
    <div class="text-center">
      <p class="text-sm tracking-[0.3em] uppercase text-[#D66B45]">
        SHOPIZZ / 403
      </p>

      <h1 class="mt-6 text-7xl font-black text-[#111111]">
        Access denied.
      </h1>

      <p class="mt-5 text-[#526158]">
        You don't have permission to enter this space.
      </p>

      <NuxtLink
        to="/"
        class="inline-flex mt-8 rounded-full bg-[#111111] px-7 py-3 text-white"
      >
        Back to Shop
      </NuxtLink>
    </div>
  </div>
</template>