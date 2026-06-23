<script setup lang="ts">
import { ref, watchEffect, onMounted } from 'vue'
import { getFullInvoiceDataFromXml } from '@sri-xml-viewer/core'
import FacturaComponent from './components/factura.vue'
import NotaCreditoComponent from './components/notaCredito.vue'
import GuiaRemisionComponent from './components/guiaRemision.vue'
import RetencionComponent from './components/retencion.vue'

const props = defineProps<{
  xml: string
  logoUrl?: string
}>()

const data = ref<any>(null)
const error = ref<string>('')
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
  if (typeof window !== 'undefined' && !document.getElementById('sri-xml-viewer-print-styles')) {
    const style = document.createElement('style')
    style.id = 'sri-xml-viewer-print-styles'
    style.textContent = `
      @media print {
        .visor-xml-container,
        .visor-xml-container * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          border-color: #000000 !important;
        }
        .visor-xml-container .border,
        .visor-xml-container .border-default,
        .visor-xml-container .border-accented {
          border: 1px solid #000000 !important;
        }
        .visor-xml-container .border-t { border-top: 1px solid #000000 !important; }
        .visor-xml-container .border-b { border-bottom: 1px solid #000000 !important; }
        .visor-xml-container .border-l { border-left: 1px solid #000000 !important; }
        .visor-xml-container .border-r { border-right: 1px solid #000000 !important; }
        
        .visor-xml-container th,
        .visor-xml-container td {
          border: 1px solid #000000 !important;
          padding: 4px 6px !important;
        }
        .visor-xml-container .print-hidden,
        .visor-xml-container .print\\:hidden,
        .visor-xml-container .print\\:\\!hidden {
          display: none !important;
        }
      }
    `
    document.head.appendChild(style)
  }
})

watchEffect(() => {
  const xml = props.xml
  if (typeof window === 'undefined') return
  if (!xml) {
    data.value = null
    error.value = ''
    return
  }
  try {
    data.value = getFullInvoiceDataFromXml(xml)
    error.value = ''
  } catch (e: any) {
    data.value = null
    error.value = e.message || 'Error al procesar el XML'
    console.error(e)
  }
})

function formatCurrency(val: any): string {
  if (val === undefined || val === null || val === '') return '$0.00'
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return '$0.00'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}

function formatQuantity(val: any): string {
  if (val === undefined || val === null || val === '') return '0.00'
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}

const copied = ref(false)
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  })
}

function getAmbientName(val: string): string {
  return val === '1' ? 'PRUEBAS' : 'PRODUCCIÓN'
}

function getEmissionName(val: string): string {
  return val === '1' ? 'NORMAL' : 'CONTINGENCIA'
}
</script>

<template>
  <div
    v-if="isMounted"
    class="w-full visor-xml-container"
  >
    <div
      v-if="error"
      class="p-6 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl"
    >
      <div
        class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 mb-3"
      >
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h4 class="text-base font-bold text-red-800 dark:text-red-400 mb-1">
        Error al procesar el comprobante
      </h4>
      <p class="text-sm text-red-600 dark:text-red-300">
        {{ error }}
      </p>
    </div>

    <div
      v-else-if="data"
    >
      <!-- Specialized SRI Document Component Views -->
      <template v-if="data.typeDoc === '01'">
        <FacturaComponent
          :document="data.documentData"
          :logoUrl="logoUrl"
          :dateAuthorization="data.dateAuthorization"
        />
      </template>
      <template v-else-if="data.typeDoc === '04'">
        <NotaCreditoComponent
          :document="data.documentData"
          :logoUrl="logoUrl"
          :authorization="data.dateAuthorization"
        />
      </template>
      <template v-else-if="data.typeDoc === '06'">
        <GuiaRemisionComponent
          :document="data.documentData"
          :logoUrl="logoUrl"
          :authorization="data.dateAuthorization"
        />
      </template>
      <template v-else-if="data.typeDoc === '07'">
        <RetencionComponent
          :document="data.documentData"
          :authorization="data.dateAuthorization"
        />
      </template>
    </div>
  </div>
</template>


