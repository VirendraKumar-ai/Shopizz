<template>
  <div
    class="min-h-screen bg-[var(--shopizz-porcelain)] text-[var(--shopizz-obsidian)]"
  >
    <AppHeader />

    <main>
      <slot />
    </main>

    <AppFooter />

    <!-- Shopizz Floating Concierge & Chat Support Widget -->
    <ChatConciergeWidget />
  </div>
</template>