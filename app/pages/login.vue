<script setup lang="ts">
definePageMeta({
  layout: 'default',
})
</script>

<template>
  <AuthLayout
    eyebrow="Account / 001"
    title="Welcome back."
    description="Sign in to continue shopping, manage your orders and discover independent shops."
  >
    <LoginForm />
  </AuthLayout>
</template>