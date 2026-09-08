<template>
  <div class="min-h-screen bg-[#FAF8F5] text-[#1F2623] flex flex-col">
    <!-- Top Global AppHeader with Announcement Bar -->
    <AppHeader />

    <!-- Main Account Container -->
    <div class="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 flex-1">
      <div class="flex flex-col lg:flex-row gap-8 items-start">
        <!-- Left Sidebar Navigation -->
        <AccountSidebar class="w-full lg:w-64 shrink-0" />

        <!-- Main Account Content -->
        <main class="min-w-0 flex-1 w-full">
          <slot />
        </main>
      </div>
    </div>
    
    <!-- Shopizz Floating Concierge & Chat Support Widget -->
    <ChatConciergeWidget />
  </div>
</template>