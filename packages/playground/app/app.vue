<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { VisorXml, agentRetentionResolutions, getResolutionsByAgentCode } from '@sri-xml-viewer/vue'
import { mockFactura, mockNotaCredito, mockGuiaRemision, mockLiquidacionCompra } from './mocks'
import {
  useComprobantesDb,
  type IStoredComprobante,
  getTipoComprobanteLabel,
  extractTipoFromClave
} from './composables/useComprobantesDb'

const xmlInput = ref(mockFactura)
const claveAcceso = ref('')
const resolutionAgentNumber = ref('')
const companyPhone = ref('')
const companyEmail = ref('')
const fileError = ref('')
const loading = ref(false)
const toast = useToast()

const {
  getComprobante,
  saveComprobante,
  deleteComprobante,
  listComprobantes,
  clearAllComprobantes
} = useComprobantesDb()

const storedList = ref<IStoredComprobante[]>([])

async function refreshStoredList() {
  storedList.value = await listComprobantes()
}

const xmlAgenteRetencion = computed(() => {
  if (!xmlInput.value) return ''
  const match = xmlInput.value.match(/<(?:\w+:)?agenteRetencion>([^<]+)<\/(?:\w+:)?agenteRetencion>/i)
  return match ? match[1].trim() : ''
})

const availableResolutions = computed(() => {
  const code = xmlAgenteRetencion.value
  const filtered = code ? getResolutionsByAgentCode(code) : agentRetentionResolutions
  return filtered.map(r => ({ label: r.label, value: r.value }))
})

watch(xmlAgenteRetencion, () => {
  const isValid = availableResolutions.value.some(r => r.value === resolutionAgentNumber.value)
  if (!isValid) {
    resolutionAgentNumber.value = ''
  }
})

function loadMock(type: 'factura' | 'notaCredito' | 'guiaRemision' | 'liquidacionCompra') {
  if (type === 'factura') {
    xmlInput.value = mockFactura
  } else if (type === 'notaCredito') {
    xmlInput.value = mockNotaCredito
  } else if (type === 'guiaRemision') {
    xmlInput.value = mockGuiaRemision
  } else if (type === 'liquidacionCompra') {
    xmlInput.value = mockLiquidacionCompra
  }
}

function handleFileUpload(files: File | File[] | null | undefined) {
  if (!files) return
  const file = Array.isArray(files) ? files[0] : files
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

async function loadStoredComprobante(item: IStoredComprobante) {
  claveAcceso.value = item.claveAcceso
  xmlInput.value = item.xml
  toast.add({
    title: 'Comprobante cargado',
    description: `${getTipoComprobanteLabel(item.tipoComprobante)} recuperado del almacenamiento local.`,
    color: 'info'
  })
}

async function handleRemoveStored(clave: string) {
  await deleteComprobante(clave)
  await refreshStoredList()
  toast.add({
    title: 'Comprobante eliminado',
    description: 'El comprobante ha sido borrado de IndexedDB.',
    color: 'neutral'
  })
}

async function handleClearAll() {
  await clearAllComprobantes()
  await refreshStoredList()
  toast.add({
    title: 'Historial vaciado',
    description: 'Se eliminaron todos los comprobantes de la base de datos del navegador.',
    color: 'neutral'
  })
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
    // 1. Verificar si ya existe en la base de datos local (IndexedDB)
    const cached = await getComprobante(cleanClave)
    if (cached) {
      xmlInput.value = cached.xml
      loading.value = false
      toast.add({
        title: 'Comprobante recuperado de caché local',
        description: `Cargado desde IndexedDB (${getTipoComprobanteLabel(cached.tipoComprobante)} - ${cached.ambiente}).`,
        color: 'success'
      })
      return
    }

    // 2. Si no está en caché, consultar al SRI
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
      
      // 3. Guardar en IndexedDB para consultas futuras
      const tipoCode = extractTipoFromClave(cleanClave)
      await saveComprobante({
        claveAcceso: cleanClave,
        xml: response.xml,
        ambiente: response.ambiente || 'PRODUCCIÓN',
        numeroAutorizacion: response.numeroAutorizacion || cleanClave,
        fechaAutorizacion: response.fechaAutorizacion || new Date().toISOString(),
        tipoComprobante: tipoCode,
        createdAt: Date.now()
      })
      await refreshStoredList()

      toast.add({
        title: 'Comprobante obtenido y guardado',
        description: `El comprobante se obtuvo del SRI (${response.ambiente}) y se guardó en la base de datos local.`,
        color: 'success'
      })
    } else {
      let errors = response.mensajes?.map((m: any) => `[${m.identificador || 'SRI'}] ${m.mensaje}`).join('\n') || 'No se pudo obtener el comprobante.'
      if (
        errors.includes("does not match certificate's altnames") ||
        errors.includes("is not in the cert's list") ||
        errors.includes("altnames") ||
        errors.includes("no respondió") ||
        errors.includes("reintente")
      ) {
        errors = "El servidor del SRI no respondió adecuadamente o no está disponible temporalmente. Por favor, reintente la consulta; es muy probable que funcione en el segundo intento."
      }

      const isConnectionError = response.estado === 'ERROR_CONEXION' || response.estado === 'ERROR_SRI_CONEXION' || errors.includes('no respondió') || errors.includes('disponible') || errors.includes('reintente')

      toast.add({
        title: `Error del SRI - ${response.estado}`,
        description: errors,
        color: 'error',
        duration: isConnectionError ? 12000 : 8000,
        actions: isConnectionError ? [
          {
            label: 'Reintentar',
            color: 'primary',
            onClick: () => {
              searchByClave()
            }
          }
        ] : undefined
      })
    }
  } catch (error: any) {
    console.error('Error al buscar clave de acceso:', error)
    let errMsg = error.data?.message || error.message || 'Ocurrió un error inesperado al conectar con el servidor local.'
    if (
      errMsg.includes("does not match certificate's altnames") ||
      errMsg.includes("is not in the cert's list") ||
      errMsg.includes("altnames") ||
      errMsg.includes("no respondió") ||
      errMsg.includes("reintente") ||
      errMsg.includes("ECONNRESET") ||
      errMsg.includes("ETIMEDOUT") ||
      errMsg.includes("ENOTFOUND") ||
      errMsg.includes("hang up")
    ) {
      errMsg = "El servidor del SRI no respondió adecuadamente o no está disponible temporalmente. Por favor, reintente la consulta; es muy probable que funcione en el segundo intento."
    }

    const isConnectionError = errMsg.includes('no respondió') || errMsg.includes('disponible') || errMsg.includes('reintente')

    toast.add({
      title: 'Error de red / API',
      description: errMsg,
      color: 'error',
      duration: isConnectionError ? 12000 : 8000,
      actions: isConnectionError ? [
        {
          label: 'Reintentar',
          color: 'primary',
          onClick: () => {
            searchByClave()
          }
        }
      ] : undefined
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

onMounted(async () => {
  const savedLogo = localStorage.getItem('sri_visor_logo')
  if (savedLogo) {
    logoUrl.value = savedLogo
  }
  await refreshStoredList()
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

useSeoMeta({
  title: 'Lector online de comprobantes electrónicos de Ecuador | Descargar factura con clave de acceso SRI',
  ogTitle: 'Lector online de comprobantes electrónicos de Ecuador | Descargar factura con clave de acceso SRI',
  ogUrl: 'https://sxv.clopezpro.com/',
  description: 'Lector online de comprobantes electrónicos de Ecuador. Descargar factura con clave de acceso o archivo XML. Visualiza, valida y convierte a PDF comprobantes del SRI.',
  ogDescription: 'Lector online de comprobantes electrónicos de Ecuador: consulta y descarga tu factura con clave de acceso o archivo XML del SRI. Visualiza y exporta a PDF gratis.',
  ogImage: 'https://sxv.clopezpro.com/og-image.jpg',
  ogImageSecureUrl: 'https://sxv.clopezpro.com/og-image.jpg',
  ogImageType: 'image/jpeg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Lector online de comprobantes electrónicos de Ecuador',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Lector online de comprobantes electrónicos de Ecuador | Descargar factura con clave de acceso SRI',
  twitterDescription: 'Lector online de comprobantes electrónicos de Ecuador. Descarga factura con clave de acceso o archivo XML y convierte a PDF.',
  twitterImage: 'https://sxv.clopezpro.com/og-image.jpg',
  twitterImageAlt: 'Lector online de comprobantes electrónicos de Ecuador'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://sxv.clopezpro.com/' }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Lector online de comprobantes electrónicos de Ecuador',
        alternateName: [
          'Lector de comprobantes electrónicos SRI',
          'Descargar factura con clave de acceso',
          'Visualizador SRI Ecuador',
          'SXV Lector SRI'
        ],
        url: 'https://sxv.clopezpro.com/',
        image: 'https://sxv.clopezpro.com/og-image.jpg',
        description: 'Lector online y visualizador de comprobantes electrónicos autorizados por el SRI Ecuador. Consulta y descarga facturas con clave de acceso o archivo XML y convierte a PDF.',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All',
        inLanguage: 'es-EC',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        }
      })
    }
  ]
})
</script>


<template>
  <UApp>
    <div class="min-h-screen bg-muted flex flex-col gap-4 transition-colors duration-300 font-sans antialiased">
      <!-- Top Header / SEO & Branding -->
      <header class="max-w-7xl mt-1 mx-auto bg-default border border-default rounded-xl p-4   ">
        <div class="  flex flex-col   gap-4 ">
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <UBadge
                color="primary"
                variant="subtle"
                size="sm"
              >
                SRI Ecuador
              </UBadge>
              <UBadge
                color="neutral"
                variant="outline"
                size="sm"
              >
                Lector Online
              </UBadge>
              <span class="text-xs text-muted font-medium">Facturas, Retenciones, Notas de Crédito, Liquidaciones y Guías</span>
            </div>
            <h1 class="text-2xl lg:text-3xl font-black text-highlighted tracking-tight">
              Lector online de comprobantes electrónicos de Ecuador
            </h1>
          </div>
        </div>
      </header>

      <main class=" max-w-7xl mx-auto  grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
        <section class="bg-default lg:col-span-12 title-panel p-2 rounded-xl border border-default flex justify-between items-end gap-2">
          <div class="flex-1">
            <div class="p-4 border border-default">
              <p class="p-2 bg-accented text-sm">
                Parámetros Opcionales que recibe el lector para una mejor presentación 
              </p>
              <div class="flex items-center gap-1">
                <UFormField
                  label="Resolución de Agente de Retención (Opcional)"
                  class="w-full"
                >
                  <USelect
                    v-model="resolutionAgentNumber"
                    :items="availableResolutions"
                    placeholder="Sin resolución (por defecto)"
                    class="w-full"
                    size="sm"
                  />
                  <UButton
                    v-if="resolutionAgentNumber"
                    icon="i-carbon-close"
                    variant="ghost"
                    color="neutral"
                    size="sm"
                    title="Limpiar resolución"
                    @click="resolutionAgentNumber = ''"
                  />
                </UFormField>
              </div>
              <!-- Datos de Empresa Opcionales -->
              <div class="space-y-2">
                <p class="text-[10px] font-black text-dimmed uppercase tracking-wider">
                  Datos de Empresa (Opcionales)
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label class="text-[10px] font-bold text-muted block mb-1">Teléfono</label>
                    <UInput
                      v-model="companyPhone"
                      placeholder="Ej. 0991234567"
                      size="sm"
                      class="w-full"
                    />
                  </div>
                  <div>
                    <label class="text-[10px] font-bold text-muted block mb-1">Email</label>
                    <UInput
                      v-model="companyEmail"
                      placeholder="Ej. info@empresa.com"
                      size="sm"
                      class="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2" />
        </section>
        
        <!-- Input Panel (Left, 4 columns) -->
        <section class="lg:col-span-4 bg-default border border-default rounded-xl p-6 shadow-md space-y-6">
          <!-- Historial Local IndexedDB (Cumplimiento LOPDP) -->
          <div
            v-if="storedList.length > 0"
            class="space-y-2"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-black text-dimmed uppercase tracking-wider">Historial Local</span>
                <UBadge
                  color="primary"
                  variant="subtle"
                  size="sm"
                >
                  {{ storedList.length }}
                </UBadge>
              </div>
              <UButton
                size="xs"
                variant="ghost"
                color="error"
                icon="i-carbon-trash-can"
                @click="handleClearAll"
              >
                Vaciar
              </UButton>
            </div>

            <div class="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
              <div
                v-for="item in storedList"
                :key="item.claveAcceso"
                class="p-2.5 bg-muted/50 hover:bg-muted border border-default rounded-xl flex items-center justify-between gap-2 transition-colors"
              >
                <div
                  class="min-w-0 flex-1 cursor-pointer"
                  @click="loadStoredComprobante(item)"
                >
                  <div class="flex items-center gap-1.5 mb-0.5">
                    <UBadge
                      size="xs"
                      variant="outline"
                      color="neutral"
                    >
                      {{ getTipoComprobanteLabel(item.tipoComprobante) }}
                    </UBadge>
                    <span class="text-[10px] text-muted truncate">
                      {{ new Date(item.createdAt).toLocaleDateString() }}
                    </span>
                  </div>
                  <p
                    class="font-mono text-[10px] text-dimmed truncate"
                    :title="item.claveAcceso"
                  >
                    ...{{ item.claveAcceso.slice(-14) }}
                  </p>
                </div>
                <div class="flex items-center gap-1">
                  <UButton
                    size="xs"
                    icon="i-carbon-play"
                    variant="ghost"
                    color="primary"
                    title="Cargar comprobante"
                    @click="loadStoredComprobante(item)"
                  />
                  <UButton
                    size="xs"
                    icon="i-carbon-close"
                    variant="ghost"
                    color="error"
                    title="Eliminar de IndexedDB"
                    @click="handleRemoveStored(item.claveAcceso)"
                  />
                </div>
              </div>
            </div>
          </div>
       
          <template v-if="claveAcceso.length==0">
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
              @update:model-value="handleFileUpload"
            />
          </template>

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
            <div class="grid grid-cols-2 gap-2">
              <UButton 
                class="justify-center"
                variant="outline"
                color="neutral"
                @click="loadMock('factura')"
              >
                📄 Factura
              </UButton>
              <UButton 
                class="justify-center"
                variant="outline"
                color="neutral"
                @click="loadMock('liquidacionCompra')"
              >
                📄 Liq. Compra
              </UButton>
              <UButton 
                class="justify-center"
                variant="outline"
                color="neutral"
                @click="loadMock('notaCredito')"
              >
                📄 Nota de Crédito
              </UButton>
              <UButton 
                class="justify-center"
                variant="outline"
                color="neutral"
                @click="loadMock('guiaRemision')"
              >
                📄 Guía Remisión
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
        <section class="lg:col-span-8 space-y-2 ">
          <!-- Welcome Card if input is empty -->
          <div class="flex  justify-between bg-default ">
            <div class="flex flex-1 lg:max-w-150  gap-1">
              <UFieldGroup
                class="w-full"
                label="Email "
              >
                <UTooltip
                  text="Ingresa la clave de acceso de 49 dígitos del comprobante para buscarlo en el SRI aplica tiempo de espera si el SRI no responde, reintentar la consulta."
                  placement="input"
                >
                  <UInput
                    v-model="claveAcceso"
                    class="w-full"
                    :ui="{
                      base:'tabular-nums font-mono text-xs! h-full w-full',
                    }"
                    icon="i-carbon-virtual-column-key" 
                    placeholder="0101010101010101010101010101010101010101 49 dígitos"
                    :disabled="loading"
                    @keydown.enter="searchByClave"
                  />
                </UTooltip>
                <UTooltip
                  v-if="claveAcceso.length > 0 && !loading"
                  text="Buscar comprobante en el SRI por clave de acceso (49 dígitos) solo si fue emitido antes de 30 dias"
                  placement="bottom"
                >
                  <UButton
                    icon="i-carbon-search"
                    variant="solid"
                    color="primary"
                    aria-label="Buscar"
                    label="Buscar"
                    :loading="loading"
                    @click="searchByClave"
                  />
                </UTooltip> 
                <UTooltip
                  v-if="claveAcceso.length > 0 && !loading"
                  text="Descargar Archivo XML"
                  placement="bottom"
                >
                  <UButton 
                    v-if="xmlInput" 
                    icon="i-carbon-arrow-shift-down"
                    variant="solid"
                    label="XML"
                    color="error"
                    @click="downloadXml"
                  />
                </UTooltip>
              </UFieldGroup>

              <div class="flex gap-1">
                <UTooltip
                  v-if="claveAcceso.length > 0 && !loading"
                  text="Limpiar campo de clave de acceso"
                  placement="bottom"
                >
                  <UButton
                    icon="i-carbon-close"
                    variant="solid"
                    color="error"
                    aria-label="Limpiar"
                    @click="claveAcceso = ''"
                  />
                </UTooltip>
              </div>
            </div>
           
            <div>
              <UColorModeButton />
              <ClientOnly>
                <input
                  ref="logoInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onLogoChange"
                >
                <UTooltip
                  text="Cargar o quitar logo de la empresa"
                  placement="bottom"
                >
                  <UButton
                    icon="i-carbon-image"
                    :color="logoUrl ? 'error' : 'neutral'"
                    variant="outline"
                    :title="logoUrl ? 'Quitar logo cargado' : 'Cargar logo de la empresa'"
                    @click="handleLogoClick"
                  />
                </UTooltip>
                <UButton
                  icon="i-carbon-printer" 
                  color="primary"
                  variant="outline"
                  @click="print"
                >                  
                  <span>Imprimir</span>
                </UButton>
              </ClientOnly>
            </div>
          </div>
          <div
            v-if="!xmlInput"
            class="bg-default border border-default rounded-xl p-10 text-center shadow-md"
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
            class="sri-xml-viewer bg-default border border-default rounded-xl  shadow-md overflow-hidden"
          >
            <div class="p-6 overflow-x-auto w-full">
              <div class="min-w-[800px] lg:min-w-0 print:min-w-0">
                <VisorXml
                  :xml="xmlInput"
                  :logoUrl="logoUrl"
                  :resolutionAgentNumber="resolutionAgentNumber"
                  :companyPhone="companyPhone"
                  :companyEmail="companyEmail"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="border-t border-default mt-12 py-6 px-6 text-center text-xs text-muted font-medium">
        <p>Lector online de comprobantes electrónicos de Ecuador © 2026. Construido con Nuxt 4, Nuxt UI y Tailwind CSS.</p>
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
