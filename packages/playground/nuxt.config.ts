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
  app: {
    head: {
      htmlAttrs: {
        lang: 'es'
      },
      title: 'SRI XML Viewer | Visualizador de Comprobantes Electrónicos SRI Ecuador',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Visualizador, validador y conversor a PDF para comprobantes electrónicos del SRI (Ecuador): Facturas, Retenciones, Notas de Crédito, Liquidaciones de Compra y Guías de Remisión.'
        },
        {
          name: 'keywords',
          content: 'SRI, XML SRI, Facturación Electrónica Ecuador, Comprobantes Electrónicos, Visor SRI, RIDE SRI, Factura Electrónica, SRI Ecuador XML, Clave de Acceso SRI'
        },
        { name: 'author', content: 'Christian Lopez (clopezpro)' },
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#059669' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#09090b' },
        // Open Graph / Facebook / WhatsApp / LinkedIn
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://sxv.clopezpro.com/' },
        { property: 'og:site_name', content: 'SRI XML Viewer' },
        { property: 'og:title', content: 'SRI XML Viewer | Visualizador de Comprobantes Electrónicos SRI Ecuador' },
        {
          property: 'og:description',
          content: 'Visualiza, valida y exporta a PDF tus comprobantes electrónicos del SRI (Facturas, Retenciones, Notas de Crédito, Liquidaciones) por clave de acceso o archivo XML.'
        },
        { property: 'og:image', content: 'https://sxv.clopezpro.com/og-image.jpg' },
        { property: 'og:image:secure_url', content: 'https://sxv.clopezpro.com/og-image.jpg' },
        { property: 'og:image:type', content: 'image/jpeg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'SRI XML Viewer - Visualizador y conversor de comprobantes electrónicos SRI Ecuador' },
        { property: 'og:locale', content: 'es_EC' },
        // Twitter / X
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:url', content: 'https://sxv.clopezpro.com/' },
        { name: 'twitter:title', content: 'SRI XML Viewer | Visualizador de Comprobantes Electrónicos SRI Ecuador' },
        {
          name: 'twitter:description',
          content: 'Visualiza, valida y exporta a PDF comprobantes electrónicos del SRI Ecuador por clave de acceso o archivo XML.'
        },
        { name: 'twitter:image', content: 'https://sxv.clopezpro.com/og-image.jpg' },
        { name: 'twitter:image:alt', content: 'SRI XML Viewer - Visualizador y conversor de comprobantes electrónicos SRI Ecuador' }
      ],
      link: [
        { rel: 'canonical', href: 'https://sxv.clopezpro.com/' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'alternate icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ]
    }
  }
})
