import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SriXmlViewerVue',
      formats: ['es'],
      fileName: () => 'index.js',
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
