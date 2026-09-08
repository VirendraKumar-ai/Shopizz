<script setup lang="ts">
const email = ref('')
const isSubscribed = ref(false)

const handleSubscribe = () => {
  if (email.value.trim()) {
    isSubscribed.value = true
    email.value = ''
    setTimeout(() => {
      isSubscribed.value = false
    }, 4000)
  }
}
</script>

<template>
  <footer class="border-t border-[var(--shopizz-obsidian)]/10 bg-[var(--shopizz-porcelain)] px-4 pt-12 pb-10 sm:px-6 lg:px-8 sm:pt-14">
    <div class="mx-auto max-w-[1380px]">

      <!-- 5-Column Grid -->
      <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <!-- Col 1: Brand & Social (3 cols) -->
        <div class="lg:col-span-3">
          <AppLogo />

          <p class="mt-3.5 max-w-[240px] text-xs leading-relaxed text-[var(--shopizz-obsidian)]/65">
            A curated marketplace of independent
            <br />
            shops and distinctive products.
          </p>

          <!-- Social Icons -->
          <div class="mt-5 flex items-center gap-4 text-[var(--shopizz-obsidian)]/70">
            <!-- Instagram -->
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              class="transition-colors hover:text-[var(--shopizz-obsidian)]"
              aria-label="Instagram"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" stroke-width="2"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke-width="2"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </a>

            <!-- Pinterest -->
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              class="transition-colors hover:text-[var(--shopizz-obsidian)]"
              aria-label="Pinterest"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0a12 12 0 0 0-4.37 23.18c-.05-.98-.09-2.5.02-3.57l.66-2.79s-.16-.33-.16-.83c0-1.2.7-2.1 1.57-2.1.74 0 1.1.55 1.1 1.22 0 .74-.47 1.86-.72 2.89-.2.87.43 1.58 1.29 1.58 1.55 0 2.74-1.64 2.74-4 0-2.09-1.5-3.56-3.65-3.56-2.66 0-4.22 2-4.22 4.06 0 .8.31 1.67.7 2.14.08.1.09.18.06.29l-.26 1.07c-.04.17-.14.21-.33.13-1.24-.58-2.02-2.38-2.02-3.83 0-3.12 2.27-5.99 6.54-5.99 3.44 0 6.1 2.45 6.1 5.73 0 3.42-2.16 6.17-5.15 6.17-1.01 0-1.95-.52-2.28-1.14l-.62 2.37c-.22.87-.83 1.95-1.24 2.62A12 12 0 1 0 12 0z"/>
              </svg>
            </a>

            <!-- YouTube -->
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              class="transition-colors hover:text-[var(--shopizz-obsidian)]"
              aria-label="YouTube"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>

            <!-- Mail -->
            <a
              href="mailto:support@shopizz.market"
              class="transition-colors hover:text-[var(--shopizz-obsidian)]"
              aria-label="Email"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect width="20" height="16" x="2" y="4" rx="2" stroke-width="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke-width="2"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Col 2: Shop (2 cols) -->
        <div class="lg:col-span-2">
          <p class="text-xs sm:text-[13px] font-semibold text-[var(--shopizz-obsidian)]">
            Shop
          </p>
          <ul class="mt-3.5 space-y-2 text-xs text-[var(--shopizz-obsidian)]/70">
            <li>
              <NuxtLink to="/" class="hover:text-[var(--shopizz-obsidian)] transition-colors">All Products</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/#new-in" class="hover:text-[var(--shopizz-obsidian)] transition-colors">New In</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/" class="hover:text-[var(--shopizz-obsidian)] transition-colors">Best Sellers</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/" class="hover:text-[var(--shopizz-obsidian)] transition-colors">Gift Cards</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 3: Categories (2 cols) -->
        <div class="lg:col-span-2">
          <p class="text-xs sm:text-[13px] font-semibold text-[var(--shopizz-obsidian)]">
            Categories
          </p>
          <ul class="mt-3.5 space-y-2 text-xs text-[var(--shopizz-obsidian)]/70">
            <li>
              <NuxtLink to="/category/fashion" class="hover:text-[var(--shopizz-obsidian)] transition-colors">Fashion</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/category/accessories" class="hover:text-[var(--shopizz-obsidian)] transition-colors">Accessories</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/category/beauty" class="hover:text-[var(--shopizz-obsidian)] transition-colors">Beauty</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/category/home-living" class="hover:text-[var(--shopizz-obsidian)] transition-colors">Home & Living</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/category/lifestyle" class="hover:text-[var(--shopizz-obsidian)] transition-colors">Lifestyle</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/category/books" class="hover:text-[var(--shopizz-obsidian)] transition-colors">Books</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 4: Company (2 cols) -->
        <div class="lg:col-span-2">
          <p class="text-xs sm:text-[13px] font-semibold text-[var(--shopizz-obsidian)]">
            Company
          </p>
          <ul class="mt-3.5 space-y-2 text-xs text-[var(--shopizz-obsidian)]/70">
            <li>
              <NuxtLink to="/#about" class="hover:text-[var(--shopizz-obsidian)] transition-colors">About Us</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/journal" class="hover:text-[var(--shopizz-obsidian)] transition-colors">Our Journal</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/signup" class="hover:text-[var(--shopizz-obsidian)] transition-colors">Become a Seller</NuxtLink>
            </li>
            <li>
              <a href="mailto:support@shopizz.market" class="hover:text-[var(--shopizz-obsidian)] transition-colors">Contact Us</a>
            </li>
            <li>
              <NuxtLink to="/#faq" class="hover:text-[var(--shopizz-obsidian)] transition-colors">FAQs</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 5: Join Community Newsletter (3 cols) -->
        <div class="lg:col-span-3">
          <p class="text-xs sm:text-[13px] font-semibold text-[var(--shopizz-obsidian)]">
            Join the community
          </p>
          <p class="mt-3.5 text-xs leading-relaxed text-[var(--shopizz-obsidian)]/65">
            Subscribe for updates, new arrivals
            <br />
            and exclusive offers.
          </p>

          <form @submit.prevent="handleSubscribe" class="mt-4 flex h-10 items-stretch overflow-hidden rounded-md border border-[var(--shopizz-obsidian)]/20 bg-white shadow-sm">
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              required
              class="w-full bg-transparent px-3 text-xs text-[var(--shopizz-obsidian)] outline-none placeholder:text-[var(--shopizz-obsidian)]/40"
            />
            <button
              type="submit"
              class="shrink-0 bg-[#283c31] px-4 text-xs font-medium text-white transition-colors hover:bg-[#1d2d25]"
            >
              Subscribe
            </button>
          </form>

          <p v-if="isSubscribed" class="mt-2 text-[11px] text-[var(--shopizz-moss)] font-medium">
            ✓ Welcome to the Shopizz community!
          </p>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div
        class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--shopizz-obsidian)]/10 pt-6 sm:flex-row text-xs text-[var(--shopizz-obsidian)]/55"
      >
        <div>
          © 2026 Shopizz. All rights reserved.
        </div>

        <div class="flex items-center gap-2.5 sm:gap-3 text-xs">
          <NuxtLink to="/" class="hover:text-[var(--shopizz-obsidian)] transition-colors">Terms of Use</NuxtLink>
          <span class="text-[var(--shopizz-obsidian)]/30">|</span>
          <NuxtLink to="/" class="hover:text-[var(--shopizz-obsidian)] transition-colors">Privacy Policy</NuxtLink>
          <span class="text-[var(--shopizz-obsidian)]/30">|</span>
          <NuxtLink to="/" class="hover:text-[var(--shopizz-obsidian)] transition-colors">Shipping & Returns</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>