<script setup lang="ts">
import { ref, watchEffect } from 'vue'
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

watchEffect(() => {
  if (typeof window === 'undefined') return
  if (!props.xml) return
  try {
    data.value = getFullInvoiceDataFromXml(props.xml)
    error.value = ''
  } catch (e: any) {
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
  <div class="w-full visor-xml-container">
    <div
      v-if="error"
      class="p-6 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl"
    >
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 mb-3">
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


