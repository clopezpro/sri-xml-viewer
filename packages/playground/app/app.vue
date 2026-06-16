<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { VisorXml } from '@sri-xml-viewer/vue'
import { mockFactura, mockNotaCredito } from './mocks'

const xmlInput = ref(mockFactura)
const claveAcceso = ref('')
const fileError = ref('')
const loading = ref(false)
const toast = useToast()

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

async function searchByClave() {
  const cleanClave = claveAcceso.value.trim()
  if (!cleanClave) {
    toast.add({
      title: 'Clave de acceso requerida',
      description: 'Por favor ingresa una clave de acceso de 49 dígitos.',
      color: 'warning'
    })
    return
  }

  if (cleanClave.length !== 49 || !/^\d+$/.test(cleanClave)) {
    toast.add({
      title: 'Clave de acceso inválida',
      description: 'La clave de acceso debe contener exactamente 49 dígitos numéricos.',
      color: 'warning'
    })
    return
  }

  loading.value = true
  fileError.value = ''

  try {
    const response = await $fetch<{
      success: boolean
      estado: string
      xml?: string
      ambiente?: string
      numeroAutorizacion?: string
      fechaAutorizacion?: string
      mensajes?: Array<{
        identificador?: string
        mensaje?: string
        tipo?: string
        informacionAdicional?: string
      }>
    }>('/api/sri', {
      method: 'POST',
      body: { claveAcceso: cleanClave }
    })

    if (response.success && response.xml) {
      xmlInput.value = response.xml
      toast.add({
        title: 'Comprobante obtenido',
        description: `El comprobante se obtuvo correctamente del ambiente de ${response.ambiente}.`,
        color: 'success'
      })
    } else {
      let errors = response.mensajes?.map((m: any) => `[${m.identificador || 'SRI'}] ${m.mensaje}`).join('\n') || 'No se pudo obtener el comprobante.'
      if (errors.includes("does not match certificate's altnames") || errors.includes("is not in the cert's list") || errors.includes("altnames")) {
        errors = "El servidor del SRI no respondió adecuadamente o no está disponible temporalmente (Error de certificado SSL/IP). Por favor, reintente la consulta; es muy probable que funcione en el segundo intento."
      }
      toast.add({
        title: `Error del SRI - ${response.estado}`,
        description: errors,
        color: 'error',
        duration: 8000
      })
    }
  } catch (error: any) {
    console.error('Error al buscar clave de acceso:', error)
    let errMsg = error.data?.message || error.message || 'Ocurrió un error inesperado al conectar con el servidor local.'
    if (errMsg.includes("does not match certificate's altnames") || errMsg.includes("is not in the cert's list") || errMsg.includes("altnames")) {
      errMsg = "El servidor del SRI no respondió adecuadamente o no está disponible temporalmente (Error de certificado SSL/IP). Por favor, reintente la consulta; es muy probable que funcione en el segundo intento."
    }
    toast.add({
      title: 'Error de red / API',
      description: errMsg,
      color: 'error',
      duration: 8000
    })
  } finally {
    loading.value = false
  }
}

function downloadXml() {
  if (!xmlInput.value) return

  const blob = new Blob([xmlInput.value], { type: 'text/xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url

  let filename = 'comprobante.xml'
  if (claveAcceso.value && claveAcceso.value.trim().length === 49) {
    filename = `${claveAcceso.value.trim()}.xml`
  } else {
    const match = xmlInput.value.match(/<claveAcceso>(\d{49})<\/claveAcceso>/)
    if (match) {
      filename = `${match[1]}.xml`
    } else {
      const numAutMatch = xmlInput.value.match(/<numeroAutorizacion>(\d{49})<\/numeroAutorizacion>/)
      if (numAutMatch) {
        filename = `${numAutMatch[1]}.xml`
      }
    }
  }

  a.download = filename
  a.click()
  URL.revokeObjectURL(url)

  toast.add({
    title: 'Descarga iniciada',
    description: `El archivo ${filename} se ha descargado correctamente.`,
    color: 'success'
  })
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

const print = () => {
  window.print()
}

const logoUrl = ref('')
const logoInputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  const savedLogo = localStorage.getItem('sri_visor_logo')
  if (savedLogo) {
    logoUrl.value = savedLogo
  }
})

function handleLogoClick() {
  if (logoUrl.value) {
    logoUrl.value = ''
    localStorage.removeItem('sri_visor_logo')
    if (logoInputRef.value) {
      logoInputRef.value.value = ''
    }
  } else {
    logoInputRef.value?.click()
  }
}

function onLogoChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target?.result
    if (typeof base64 === 'string') {
      logoUrl.value = base64
      localStorage.setItem('sri_visor_logo', base64)
    }
  }
  reader.readAsDataURL(file)
}
</script>


<template>
  <UApp>
    <div class="min-h-screen bg-muted transition-colors duration-300 font-sans antialiased">
      <main class="max-w-7xl mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Input Panel (Left, 4 columns) -->
        <section class="lg:col-span-4 bg-default border border-default rounded-3xl p-6 shadow-md space-y-6">
          <div>
            <p class="text-sm font-black text-dimmed uppercase tracking-widest mb-1">
              Con clave de Acceso
            </p>
            <div class="flex gap-2">
              <UInput
                v-model="claveAcceso"
                class="w-full"
                icon="i-carbon-virtual-column-key" 
                placeholder="0101010101010101010101010101010101010101 49 dígitos"
                :disabled="loading"
                @keydown.enter="searchByClave"
              />
              <div class="flex gap-1">
                <UButton
                  icon="i-carbon-search"
                  variant="solid"
                  color="primary"
                  aria-label="Buscar"
                  :loading="loading"
                  @click="searchByClave"
                />
                <UButton
                  v-if="claveAcceso.length > 0 && !loading"
                  icon="i-carbon-close"
                  variant="solid"
                  color="error"
                  aria-label="Limpiar"
                  @click="claveAcceso = ''"
                />
              </div>
            </div>
          </div>
       
       
          <div>
            <h2 class="text-sm font-black text-dimmed uppercase tracking-widest mb-1">
              Con Comprobante XML
            </h2>
            <p class="text-xs text-muted">
              Sube un archivo .xml descargado del SRI o pega el contenido directamente en Contenido XML más abajo.
            </p>
          </div>

          <!-- File Upload Area -->
          <UFileUpload
            :preview="false"
            accept=".xml"
            color="primary"
            label="Seleccionar o soltar archivo .xml"
            description="Tamaño máximo 5MB"
            @change="handleFileUpload"
          />

          <div
            v-if="fileError"
            class="text-xs text-error font-bold bg-error/10 p-3 border border-error/20 rounded-xl"
          >
            {{ fileError }}
          </div>

          <!-- Mock Loader Buttons -->
          <div>
            <p class="text-[10px] font-black text-dimmed uppercase tracking-wider mb-2">
              Comprobantes de Ejemplo
            </p>
            <div class="flex gap-2">
              <UButton 
                class="flex-1 justify-center"
                variant="outline"
                color="neutral"
                @click="loadMock('factura')"
              >
                📄 Factura
              </UButton>
              <UButton 
                class="flex-1 justify-center"
                variant="outline"
                color="neutral"
                @click="loadMock('notaCredito')"
              >
                📄 Nota de Crédito
              </UButton>
            </div>
          </div>

          <!-- Raw Textarea Input -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-[10px] font-black text-dimmed uppercase tracking-wider">Contenido XML Raw</label>
              <div class="flex gap-2">
                <UButton 
                  v-if="xmlInput" 
                  size="sm"
                  icon="i-carbon-download"
                  variant="soft"
                  color="primary"
                  @click="downloadXml"
                >
                  Descargar XML
                </UButton>
                <UButton 
                  v-if="xmlInput" 
                  size="sm"
                  icon="i-carbon-close"
                  variant="soft"
                  color="error"
                  @click="clearXml"
                >
                  Limpiar
                </UButton>
              </div>
            </div>
            <UTextarea 
              v-model="xmlInput" 
              placeholder="Pega el contenido XML de tu comprobante aquí..." 
              color="neutral"
              variant="outline"
              class="font-mono text-[10px] w-full"
              :rows="15"
              size="md"
            />
          </div>
        </section>

        <!-- View Panel (Right, 8 columns) -->
        <section class="lg:col-span-8 space-y-6">
          <!-- Welcome Card if input is empty -->
          <div
            v-if="!xmlInput"
            class="bg-default border border-default rounded-3xl p-10 text-center shadow-md"
          >
            <div class="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
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
            <h3 class="text-lg font-black text-highlighted mb-2">
              Visor Listo
            </h3>
            <p class="text-sm text-muted max-w-md mx-auto">
              Por favor, pega el contenido XML de un comprobante en el panel de la izquierda o carga un archivo XML para visualizarlo de forma estructurada.
            </p>
          </div>

          <!-- Render SRI XML Component -->
          <div
            v-else
            class="sri-xml-viewer bg-default border border-default rounded-3xl  shadow-md overflow-hidden"
          >
            <div class="title-panel p-2 border-b border-default flex justify-between items-center">
              <span class="text-xs font-black text-dimmed uppercase tracking-widest">Visualización del Comprobante</span>
              <div class="flex items-center gap-2">
                <UColorModeButton />
                <ClientOnly>
                  <input
                    ref="logoInputRef"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="onLogoChange"
                  >
                  <UButton
                    :icon="logoUrl ? 'i-carbon-trash-can' : 'i-carbon-image'"
                    :color="logoUrl ? 'error' : 'neutral'"
                    :variant="logoUrl ? 'solid' : 'ghost'"
                    :title="logoUrl ? 'Quitar logo cargado' : 'Cargar logo de la empresa'"
                    @click="handleLogoClick"
                  />
                  <UButton
                    icon="i-carbon-printer" 
                    color="primary"
                    @click="print"
                  >                  
                    <span>Imprimir / PDF</span>
                  </UButton>
                </ClientOnly>
              </div>
            </div>
            <div class="p-6 overflow-x-auto w-full">
              <div class="min-w-[800px] lg:min-w-0 print:min-w-0">
                <VisorXml
                  :xml="xmlInput"
                  :logoUrl="logoUrl"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="border-t border-default mt-12 py-6 px-6 text-center text-xs text-muted font-medium">
        <p>Visor XML SRI Ecuador © 2026. Construido con Nuxt 4, Nuxt UI y Tailwind CSS.</p>
      </footer>
    </div>
  </UApp>
</template>

<style>
/* Print Styles to output just the invoice viewer */
@media print {
  /* Force exact color reproduction of backgrounds and borders */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Force light mode color tokens globally during print, overriding any dark mode states */
  html,
  body,
  .dark,
  :root,
  * {
    --ui-bg: white !important;
    --ui-bg-muted: #f9fafb !important;
    --ui-bg-elevated: #f3f4f6 !important;
    --ui-bg-accented: #e5e7eb !important;
    --ui-bg-inverted: #111827 !important;
    
    --ui-text-dimmed: #000000 !important;
    --ui-text-muted: #000000 !important;
    --ui-text-toned: #000000 !important;
    --ui-text: #000000 !important;
    --ui-text-highlighted: #000000 !important;
    --ui-text-inverted: white !important;

    --ui-border: #e5e7eb !important;
    --ui-border-muted: #f3f4f6 !important;
    --ui-border-accented: #d1d5db !important;

    /* Override primary theme color for high contrast print output (e.g. dark green) */
    --ui-primary: #15803d !important; 
    --ui-error: #dc2626 !important;
  }

  body {
    background-color: white !important;
    color: black !important;
    font-size: 11px !important;
  }

  /* Hide playground shell elements (header, footer, buttons, left panel, card header) */
  header, 
  footer, 
  button, 
  .px-6.py-4, /* card header wrapper */
  .border-b, 
  section:first-of-type, /* input panel */
  nav, 
  aside {
    display: none !important;
  }

  /* Reset main layouts to block, utilizing full A4 width */
  main {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  section:last-of-type {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }

  /* Strip all card container decoration and padding */
  section:last-of-type > div {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
    border-radius: 0 !important;
  }

  section:last-of-type > div > div:last-child {
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Enhance printed tables borders and contrast */
  table {
    border-collapse: collapse !important;
    width: 100% !important;
  }

  th, td {
    border: 1px solid #000 !important;
    padding: 4px 6px !important;
  }

  /* Hide print-specific sections if any */
  .print-hidden {
    display: none !important;
  }
}
</style>
