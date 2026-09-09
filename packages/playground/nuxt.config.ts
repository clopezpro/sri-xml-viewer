// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@vercel/analytics'],
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
      title: 'Lector online de comprobantes electrónicos de Ecuador | Descargar factura con clave de acceso SRI',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Lector online de comprobantes electrónicos de Ecuador. Descargar factura con clave de acceso o archivo XML. Visualiza, valida y convierte a PDF comprobantes del SRI.'
        },
        {
          name: 'keywords',
          content: 'descargar factura con clave de acceso, lector de comprobantes electronicos, lector online de comprobantes electronicos de ecuador, consultar factura sri con clave de acceso, descargar factura sri, lector xml sri, visor sri, ride sri, facturacion electronica ecuador, retenciones sri, notas de credito sri, liquidaciones de compra sri, guias de remision sri, comprobantes electronicos ecuador, conversor sri xml a pdf, sxv, sri ecuador'
        },
        { name: 'author', content: 'Christian Lopez (clopezpro)' },
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#059669' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#09090b' },
        // Open Graph / Facebook / WhatsApp / LinkedIn
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://sxv.clopezpro.com/' },
        { property: 'og:site_name', content: 'Lector online de comprobantes electrónicos de Ecuador' },
        { property: 'og:title', content: 'Lector online de comprobantes electrónicos de Ecuador | Descargar factura con clave de acceso SRI' },
        {
          property: 'og:description',
          content: 'Lector online de comprobantes electrónicos de Ecuador: consulta y descarga tu factura con clave de acceso o archivo XML del SRI. Visualiza y exporta a PDF gratis.'
        },
        { property: 'og:image', content: 'https://sxv.clopezpro.com/og-image.jpg' },
        { property: 'og:image:secure_url', content: 'https://sxv.clopezpro.com/og-image.jpg' },
        { property: 'og:image:type', content: 'image/jpeg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Lector online de comprobantes electrónicos de Ecuador' },
        { property: 'og:locale', content: 'es_EC' },
        // Twitter / X
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:url', content: 'https://sxv.clopezpro.com/' },
        { name: 'twitter:title', content: 'Lector online de comprobantes electrónicos de Ecuador | Descargar factura con clave de acceso SRI' },
        {
          name: 'twitter:description',
          content: 'Lector online de comprobantes electrónicos de Ecuador. Descarga factura con clave de acceso o archivo XML y convierte a PDF.'
        },
        { name: 'twitter:image', content: 'https://sxv.clopezpro.com/og-image.jpg' },
        { name: 'twitter:image:alt', content: 'Lector online de comprobantes electrónicos de Ecuador' }
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
