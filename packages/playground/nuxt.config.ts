// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/main.css'],
  devServer: {
    port: 4007,
    host: '0.0.0.0', // Allows access from other devices on the network
  },
})
