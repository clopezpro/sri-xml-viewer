import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SriXmlViewerVue',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue', '@sri-xml-viewer/core', 'decimal.js'],
      output: {
        globals: {
          vue: 'Vue',
          '@sri-xml-viewer/core': 'SriXmlViewerCore',
        },
      },
    },
  },
})
