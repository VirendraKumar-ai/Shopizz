<template>
  <section id="journal" class="px-4 py-8 sm:px-6 lg:px-8 sm:py-10">
    <div class="mx-auto max-w-7xl overflow-hidden rounded-2xl sm:rounded-3xl bg-[#283c31] text-white shadow-lg">
      <div class="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <!-- Left Text Panel (5 cols) -->
        <div class="flex flex-col justify-between p-7 sm:p-9 lg:p-10 lg:col-span-5">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c56a32]">
              Journal
            </p>
            <h2 class="mt-3 font-serif text-2xl font-normal leading-snug tracking-tight sm:text-3xl lg:text-[34px] text-white">
              Stories worth discovering.
            </h2>
            <p class="mt-3 text-xs sm:text-[13px] leading-relaxed text-white/80 max-w-sm">
              Inspiration, guides and conversations
              <br class="hidden sm:inline" />
              from the Shopizz community.
            </p>
          </div>

          <div class="mt-6 sm:mt-8">
            <NuxtLink
              to="/journal"
              class="group inline-flex items-center gap-2 text-xs sm:text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            >
              <span class="underline underline-offset-4 decoration-white/40 group-hover:decoration-white">Read Journal</span>
              <span class="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Right Image Panel (7 cols) -->
        <div class="relative min-h-[220px] sm:min-h-[260px] lg:min-h-0 lg:col-span-7 overflow-hidden">
          <img
            src="/images/journal-editorial.jpg"
            alt="Stories worth discovering - Shopizz Journal"
            class="h-full w-full object-cover object-center transition-transform duration-700 ease-out hover:scale-105"
          />
        </div>
      </div>
    </div>
  </section>
</template>
