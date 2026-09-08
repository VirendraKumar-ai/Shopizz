export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-auth-utils'
  ],

  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
      },
    ],
  },

  devtools: {
    enabled: true
  },

  css: [
    '~/assets/css/main.css'
  ],

  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    },

    layoutTransition: {
      name: 'page',
      mode: 'out-in'
    }
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    sessionPassword: process.env.NUXT_SESSION_PASSWORD,
    adminEmail: process.env.ADMIN_EMAIL,
    adminName: process.env.ADMIN_NAME,
    adminPassword: process.env.ADMIN_PASSWORD,
    adminSetupSecret: process.env.ADMIN_SETUP_SECRET,

    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,

    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,

    public: {
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    },
  },

  compatibilityDate: '2026-09-01'
})