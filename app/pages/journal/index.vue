<script setup lang="ts">
useHead({
  title: 'Journal • Shopizz | Stories & Maker Interviews',
  meta: [
    {
      name: 'description',
      content:
        'Inspiration, maker stories, craft guides, and mindful living conversations from the Shopizz community.',
    },
  ],
})

const articles = [
  {
    id: 1,
    category: 'Maker Spotlight',
    title: 'Studio Earth: Cultivating Calm Through Botanical Living',
    excerpt:
      'We step inside the sunlit botanical studio of Elena Vance to explore how mindful arrangement of organic florals brings tranquility to modern spaces.',
    author: 'Editorial Desk',
    readTime: '4 min read',
    date: 'Sep 2026',
    image: '/images/studio-earth.jpg',
    tag: 'Craft & Nature',
  },
  {
    id: 2,
    category: 'Artisan Craft',
    title: 'Bare & Bone: Hand-Thrown Clay and the Beauty of Imperfection',
    excerpt:
      'Exploring the meditative rhythm of the ceramicist wheel and the tactile alchemy of earth, water, and fire.',
    author: 'Aarohi Mehta',
    readTime: '6 min read',
    date: 'Aug 2026',
    image: '/images/bare-and-bone.jpg',
    tag: 'Ceramics',
  },
  {
    id: 3,
    category: 'Slow Living',
    title: 'The Morning Ritual: Pure Oils, Warm Sunlight & Stillness',
    excerpt:
      'How small intentional moments and clean botanical formulations transform daily skin routines into grounding rituals.',
    author: 'Pooja Iyer',
    readTime: '5 min read',
    date: 'Aug 2026',
    image: '/images/nuvie.jpg',
    tag: 'Clean Beauty',
  },
  {
    id: 4,
    category: 'Design & Style',
    title: 'Fovea: Modern Heirlooms Handcrafted to Last a Lifetime',
    excerpt:
      'Sculptural jewelry that bridges contemporary geometry with age-old metalsmithing techniques.',
    author: 'Rohan Sharma',
    readTime: '3 min read',
    date: 'Jul 2026',
    image: '/images/fovea.jpg',
    tag: 'Jewelry',
  },
]
</script>

<template>
  <div class="px-6 py-12 sm:px-8 sm:py-16">
    <div class="mx-auto max-w-7xl">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-xs text-[var(--shopizz-obsidian)]/50">
        <NuxtLink to="/" class="hover:text-[var(--shopizz-obsidian)] transition-colors">Home</NuxtLink>
        <span>/</span>
        <span class="text-[var(--shopizz-obsidian)] font-medium">Journal</span>
      </div>

      <!-- Header -->
      <div class="mt-8 max-w-3xl">
        <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c56a32]">
          Shopizz Journal
        </p>
        <h1 class="mt-3 font-serif text-4xl font-normal tracking-tight text-[var(--shopizz-obsidian)] sm:text-5xl lg:text-6xl">
          Stories worth discovering.
        </h1>
        <p class="mt-4 text-sm sm:text-base leading-relaxed text-[var(--shopizz-obsidian)]/65 max-w-2xl">
          In-depth interviews with independent makers, thoughtful interior inspirations, and conversations on conscious living.
        </p>
      </div>

      <!-- Featured Banner Article -->
      <section class="mt-12 overflow-hidden rounded-3xl bg-[#283c31] text-white shadow-xl">
        <div class="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div class="flex flex-col justify-between p-8 sm:p-12 lg:col-span-6">
            <div>
              <span class="inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#e8cbb0]">
                Featured Story
              </span>
              <h2 class="mt-4 font-serif text-2xl font-normal leading-snug tracking-tight sm:text-3xl lg:text-4xl text-white">
                The Architecture of a Quiet Morning
              </h2>
              <p class="mt-4 text-xs sm:text-sm leading-relaxed text-white/80">
                Finding presence in simple physical objects — a textured ceramic cup, warm linen throws, and the quiet tactile pleasure of putting ink to parchment.
              </p>
            </div>

            <div class="mt-8 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-white/70">
              <span>By Editorial Desk • 5 min read</span>
              <NuxtLink
                to="/"
                class="inline-flex items-center gap-2 font-medium text-white hover:underline underline-offset-4"
              >
                Back to Market →
              </NuxtLink>
            </div>
          </div>

          <div class="relative min-h-[300px] lg:col-span-6 overflow-hidden">
            <img
              src="/images/journal-editorial.jpg"
              alt="The Architecture of a Quiet Morning"
              class="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>
      </section>

      <!-- Articles Grid -->
      <section class="mt-16">
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="article in articles"
            :key="article.id"
            class="group flex flex-col justify-between overflow-hidden rounded-2xl bg-[#f2ece2] p-4 transition-all duration-300 hover:shadow-lg"
          >
            <div>
              <div class="aspect-[4/3.2] w-full overflow-hidden rounded-xl bg-[#e8e2d6]">
                <img
                  :src="article.image"
                  :alt="article.title"
                  class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div class="mt-4">
                <span class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c56a32]">
                  {{ article.category }}
                </span>
                <h3 class="mt-2 font-serif text-lg font-medium leading-snug tracking-tight text-[var(--shopizz-obsidian)] group-hover:text-[var(--shopizz-moss)] transition-colors">
                  {{ article.title }}
                </h3>
                <p class="mt-2 text-xs leading-relaxed text-[var(--shopizz-obsidian)]/65 line-clamp-3">
                  {{ article.excerpt }}
                </p>
              </div>
            </div>

            <div class="mt-6 flex items-center justify-between border-t border-[var(--shopizz-obsidian)]/10 pt-3 text-[11px] text-[var(--shopizz-obsidian)]/50">
              <span>{{ article.date }}</span>
              <span>{{ article.readTime }}</span>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>
