<script setup lang="ts">
import { ref } from 'vue'
import { VisorXml } from '@sri-xml-viewer/vue'
import { mockFactura, mockNotaCredito } from './mocks'

const xmlInput = ref(mockFactura)
const fileError = ref('')

function loadMock(type: 'factura' | 'notaCredito') {
  if (type === 'factura') {
    xmlInput.value = mockFactura
  } else if (type === 'notaCredito') {
    xmlInput.value = mockNotaCredito
  }
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result
    if (typeof text === 'string') {
      xmlInput.value = text
      fileError.value = ''
    }
  }
  reader.onerror = () => {
    fileError.value = 'Error al leer el archivo XML'
  }
  reader.readAsText(file)
}

function clearXml() {
  xmlInput.value = ''
  fileError.value = ''
}

const colorMode = useColorMode()
const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300 font-sans antialiased">
    <!-- Navigation Header -->
    <header class="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/60 dark:border-slate-800/80 px-6 py-4 flex items-center justify-between shadow-sm">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-black text-lg">
          SRI
        </div>
        <div>
          <h1 class="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Visor XML SRI Ecuador
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Parsea y visualiza comprobantes electrónicos del SRI
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <!-- Live Demo Badge -->
        <span class="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800/50">
          Demo Pública
        </span>
        <!-- Dark Mode Toggle Button -->
        <button 
          class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 dark:text-slate-300 transition-all shadow-sm" 
          aria-label="Toggle theme"
          @click="isDark = !isDark"
        >
          <svg
            v-if="isDark"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-3.364l-.707.707M6.343 17.657l-.707.707m2.828 0l-.707-.707m12.022-12.022l-.707-.707M12 5a7 7 0 00-7 7 7 7 0 007 7 7 7 0 007-7 7 7 0 00-7-7z"
            />
          </svg>
          <svg
            v-else
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Input Panel (Left, 4 columns) -->
      <section class="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
        <div>
          <h2 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">
            Cargar Comprobante
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Sube un archivo .xml descargado del SRI o pega el contenido directamente.
          </p>
        </div>

        <!-- File Upload Area -->
        <div class="relative border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 transition-all text-center bg-slate-50/50 dark:bg-slate-950/20 group">
          <input 
            type="file" 
            accept=".xml" 
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            @change="handleFileUpload" 
          >
          <div class="space-y-2">
            <div class="inline-flex p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-800 text-slate-400 group-hover:text-blue-500 transition-colors shadow-sm">
              <svg
                class="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div class="text-xs font-bold text-slate-700 dark:text-slate-300">
              Seleccionar o soltar archivo .xml
            </div>
            <div class="text-[10px] text-slate-400">
              Tamaño máximo 5MB
            </div>
          </div>
        </div>

        <div
          v-if="fileError"
          class="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-800 rounded-xl"
        >
          {{ fileError }}
        </div>

        <!-- Mock Loader Buttons -->
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
            Comprobantes de Ejemplo
          </p>
          <div class="flex gap-2">
            <button 
              class="flex-1 text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition" 
              @click="loadMock('factura')"
            >
              📄 Factura
            </button>
            <button 
              class="flex-1 text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition" 
              @click="loadMock('notaCredito')"
            >
              📄 Nota de Crédito
            </button>
          </div>
        </div>

        <!-- Raw Textarea Input -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Contenido XML Raw</label>
            <button 
              v-if="xmlInput" 
              class="text-[10px] font-bold text-red-500 hover:text-red-600 dark:text-red-400 flex items-center transition" 
              @click="clearXml"
            >
              Limpiar
            </button>
          </div>
          <textarea 
            v-model="xmlInput" 
            placeholder="Pega el contenido XML de tu comprobante aquí..." 
            class="w-full h-80 p-4 font-mono text-[10px] bg-slate-950 text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y shadow-inner"
          />
        </div>
      </section>

      <!-- View Panel (Right, 8 columns) -->
      <section class="lg:col-span-8 space-y-6">
        <!-- Welcome Card if input is empty -->
        <div
          v-if="!xmlInput"
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center shadow-md"
        >
          <div class="w-16 h-16 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              class="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-black text-slate-900 dark:text-white mb-2">
            Visor Listo
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Por favor, pega el contenido XML de un comprobante en el panel de la izquierda o carga un archivo XML para visualizarlo de forma estructurada.
          </p>
        </div>

        <!-- Render SRI XML Component -->
        <div
          v-else
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-1 shadow-md overflow-hidden"
        >
          <div class="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Visualización del Comprobante v</span>
            <!-- Print Button (uses window.print) -->
            <button 
              class="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/40 transition shadow-sm" 
              @click="window?.print()"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 022-2v-3a2 2 0 00-2-2H5a2 2 0 00-2 2v3a2 2 0 022 2zm0-11V4a2 2 0 012-2h4a2 2 0 012 2v3m-6 0h6"
                />
              </svg>
              <span>Imprimir / PDF</span>
            </button>
          </div>
          <div class="p-6">
            <VisorXml :xml="xmlInput" />
          </div>
        </div>
      </section>
    </main>

    <footer class="border-t border-slate-200/60 dark:border-slate-800/80 mt-12 py-6 px-6 text-center text-xs text-slate-400 font-medium">
      <p>Visor XML SRI Ecuador © 2026. Construido con Nuxt 4, Nuxt UI y Tailwind CSS.</p>
    </footer>
  </div>
</template>

<style>
/* Print Styles to output just the invoice viewer */
@media print {
  body {
    background-color: white !important;
    color: black !important;
  }
  header, footer, section:first-of-type, button, .px-6.py-4.bg-slate-50 {
    display: none !important;
  }
  main {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  section:last-of-type {
    grid-column: span 12 / span 12 !important;
    border: none !important;
    box-shadow: none !important;
  }
  .sri-xml-viewer {
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
    background-color: white !important;
  }
}
</style>
