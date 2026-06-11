import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SriXmlViewerReact',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@sri-xml-viewer/core', 'decimal.js'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@sri-xml-viewer/core': 'SriXmlViewerCore',
        },
      },
    },
  },
})
