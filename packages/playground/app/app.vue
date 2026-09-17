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
import LocalHistoryModal from './components/LocalHistoryModal.vue'
import SriResponseModal, { type ISriDebugResponse } from './components/SriResponseModal.vue'

export type MockType = 'factura' | 'notaCredito' | 'guiaRemision' | 'liquidacionCompra'
export type ComprobanteSource = 'mock' | 'sri' | 'cache' | 'upload' | 'manual'

const mockConfigs: Record<MockType, { getXml: () => string; label: string }> = {
  factura: {
    getXml: () => mockFactura,
    label: 'Factura'
  },
  liquidacionCompra: {
    getXml: () => mockLiquidacionCompra,
    label: 'Liq. Compra'
  },
  notaCredito: {
    getXml: () => mockNotaCredito,
    label: 'Nota de Crédito'
  },
  guiaRemision: {
    getXml: () => mockGuiaRemision,
    label: 'Guía Remisión'
  }
}

function extractClaveAccesoFromXml(xml: string): string {
  if (!xml) return ''
  const claveMatch = xml.match(/<(?:\w+:)?claveAcceso>(\d{49})<\/(?:\w+:)?claveAcceso>/i)
  if (claveMatch) return claveMatch[1]
  const numAutMatch = xml.match(/<(?:\w+:)?numeroAutorizacion>(\d{49})<\/(?:\w+:)?numeroAutorizacion>/i)
  if (numAutMatch) return numAutMatch[1]
  return ''
}

const activeMock = ref<MockType | null>('factura')
const comprobanteSource = ref<ComprobanteSource>('mock')
const xmlInput = ref(mockFactura)
const claveAcceso = ref(extractClaveAccesoFromXml(mockFactura))
const resolutionAgentNumber = ref('')
const companyPhone = ref('')
const companyEmail = ref('')
const logoUrl = ref('')
const logoInputRef = ref<HTMLInputElement | null>(null)
const isParamsOpen = ref(false)

const lastSriResponse = ref<ISriDebugResponse | null>(null)
const isSriModalOpen = ref(false)

const activeParamsCount = computed(() => {
  let count = 0
  if (resolutionAgentNumber.value) count++
  if (companyPhone.value.trim()) count++
  if (companyEmail.value.trim()) count++
  if (logoUrl.value) count++
  return count
})

function resetAllParams() {
  resolutionAgentNumber.value = ''
  companyPhone.value = ''
  companyEmail.value = ''
  logoUrl.value = ''
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sri_visor_logo')
    localStorage.removeItem('sri_visor_phone')
    localStorage.removeItem('sri_visor_email')
  }
  if (logoInputRef.value) {
    logoInputRef.value.value = ''
  }
  toast.add({
    title: 'Parámetros restablecidos',
    description: 'Se han restaurado los valores predeterminados del lector.',
    color: 'neutral'
  })
}

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

function loadMock(type: MockType) {
  if (activeMock.value === type) {
    clearXml()
    return
  }
  const config = mockConfigs[type]
  if (config) {
    const xml = config.getXml()
    xmlInput.value = xml
    claveAcceso.value = extractClaveAccesoFromXml(xml)
    activeMock.value = type
    comprobanteSource.value = 'mock'
    fileError.value = ''
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
      activeMock.value = null
      comprobanteSource.value = 'upload'
      const extracted = extractClaveAccesoFromXml(text)
      if (extracted) {
        claveAcceso.value = extracted
      }
    }
  }
  reader.onerror = () => {
    fileError.value = 'Error al leer el archivo XML'
  }
  reader.readAsText(file)
}

function clearXml() {
  xmlInput.value = ''
  claveAcceso.value = ''
  fileError.value = ''
  activeMock.value = null
  comprobanteSource.value = 'manual'
}

function handleClearClaveAcceso() {
  clearXml()
}

watch(claveAcceso, (newVal, oldVal) => {
  if (oldVal && !newVal.trim() && xmlInput.value) {
    clearXml()
  }
})

watch(xmlInput, (newXml) => {
  if (!newXml) {
    activeMock.value = null
    return
  }
  if (activeMock.value) {
    const currentMockXml = mockConfigs[activeMock.value]?.getXml()
    if (newXml !== currentMockXml) {
      activeMock.value = null
      comprobanteSource.value = 'manual'
    }
  }
})

async function loadStoredComprobante(item: IStoredComprobante) {
  activeMock.value = null
  comprobanteSource.value = 'cache'
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

 

  try {
     loading.value = true
     fileError.value = ''
     xmlInput.value=''
    // 1. Verificar si ya existe en la base de datos local (IndexedDB)
    const cached = await getComprobante(cleanClave)
    if (cached) {
      activeMock.value = null
      comprobanteSource.value = 'cache'
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
    const response = await $fetch<ISriDebugResponse & { xml?: string }>('/api/sri', {
      method: 'POST',
      body: { claveAcceso: cleanClave }
    })

    lastSriResponse.value = response

    if (response.success && response.xml) {
      activeMock.value = null
      comprobanteSource.value = 'sri'
      xmlInput.value = response.xml
      
      // 3. Guardar en IndexedDB para consultas futuras
      const tipoCode = extractTipoFromClave(cleanClave)
      await saveComprobante({
        claveAcceso: cleanClave,
        xml: response.xml,
        ambiente: response.ambiente || 'PRODUCCIÓN',
        numeroAutorizacion: response.numeroAutorizacion || cleanClave,
        fechaAutorizacion: response.fechaAutorizacion || '',
        tipoComprobante: tipoCode,
        createdAt: Date.now()
      })
      await refreshStoredList()

      toast.add({
        title: 'Comprobante obtenido y guardado',
        description: `El comprobante se obtuvo del SRI (${response.ambiente}) y se guardó en la base de datos local.`,
        color: 'success',
        actions: [
          {
            label: 'Ver respuesta SRI',
            color: 'neutral',
            onClick: () => {
              isSriModalOpen.value = true
            }
          }
        ]
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

      const toastActions: any[] = []
      if (isConnectionError) {
        toastActions.push({
          label: 'Reintentar',
          color: 'primary',
          onClick: () => {
            searchByClave()
          }
        })
      }
      toastActions.push({
        label: 'Ver respuesta SRI',
        color: 'neutral',
        onClick: () => {
          isSriModalOpen.value = true
        }
      })

      toast.add({
        title: `Error del SRI - ${response.estado}`,
        description: errors,
        color: 'error',
        duration: isConnectionError ? 12000 : 8000,
        actions: toastActions
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

    lastSriResponse.value = {
      success: false,
      estado: 'ERROR_RED',
      claveAcceso: cleanClave,
      numeroComprobantes: '0',
      mensajes: [{
        identificador: 'NET-ERR',
        mensaje: errMsg,
        tipo: 'ERROR'
      }],
      rawResponseData: error.data || error
    }

    const errorActions: any[] = []
    if (isConnectionError) {
      errorActions.push({
        label: 'Reintentar',
        color: 'primary',
        onClick: () => {
          searchByClave()
        }
      })
    }
    errorActions.push({
      label: 'Ver respuesta SRI',
      color: 'neutral',
      onClick: () => {
        isSriModalOpen.value = true
      }
    })

    toast.add({
      title: 'Error de red / API',
      description: errMsg,
      color: 'error',
      duration: isConnectionError ? 12000 : 8000,
      actions: errorActions
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

onMounted(async () => {
  if (typeof window !== 'undefined') {
    const savedLogo = localStorage.getItem('sri_visor_logo')
    if (savedLogo) {
      logoUrl.value = savedLogo
    }
    const savedPhone = localStorage.getItem('sri_visor_phone')
    if (savedPhone) {
      companyPhone.value = savedPhone
    }
    const savedEmail = localStorage.getItem('sri_visor_email')
    if (savedEmail) {
      companyEmail.value = savedEmail
    }
  }
  await refreshStoredList()
})

watch(companyPhone, (val) => {
  if (typeof window === 'undefined') return
  const clean = val.trim()
  if (clean) {
    localStorage.setItem('sri_visor_phone', clean)
  } else {
    localStorage.removeItem('sri_visor_phone')
  }
})

watch(companyEmail, (val) => {
  if (typeof window === 'undefined') return
  const clean = val.trim()
  if (clean) {
    localStorage.setItem('sri_visor_email', clean)
  } else {
    localStorage.removeItem('sri_visor_email')
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
      <header class="max-w-7xl mt-1 mx-auto bg-default border border-default rounded-xl p-2 print:hidden">
        <h1 class="text-2xl lg:text-3xl font-black text-highlighted ">
          Lector online de comprobantes electrónicos de Ecuador
        </h1>
      </header>

      <main class=" max-w-7xl mx-auto  lg:w-full grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
        <!-- Optional Presentation Parameters (Progressive Disclosure) -->
        <section class="lg:col-span-12 print:hidden">
          <UCollapsible
            v-model:open="isParamsOpen"
            :unmountOnHide="false"
            class="w-full"
          >
            <div
              class="bg-default border border-default rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 transition-colors hover:border-accented cursor-pointer select-none"
              @click="isParamsOpen = !isParamsOpen"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <UIcon
                    name="i-carbon-settings-adjust"
                    class="w-4 h-4"
                  />
                </div>
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h2 class="text-sm font-bold text-highlighted tracking-tight">
                      Parámetros de Presentación del RIDE
                    </h2>
                  </div>
                  <p class="text-xs text-muted truncate sm:whitespace-normal">
                    Personaliza logo, datos de contacto y resolución oficial en el membrete del comprobante.
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-2 shrink-0"
                @click.stop
              >
                <UButton
                  v-if="activeParamsCount > 0"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-carbon-reset"
                  label="Restablecer"
                  title="Restablecer todos los parámetros opcionales a valores predeterminados"
                  @click="resetAllParams"
                />
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  :icon="isParamsOpen ? 'i-carbon-chevron-up' : 'i-carbon-chevron-down'"
                  :aria-expanded="isParamsOpen"
                  :aria-label="isParamsOpen ? 'Contraer parámetros de presentación' : 'Expandir parámetros de presentación'"
                  @click="isParamsOpen = !isParamsOpen"
                />
              </div>
            </div>

            <template #content>
              <div class="mt-2 bg-default border border-default rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                  <!-- 1. Logo de la Empresa -->
                  <UFormField
                    label="Logotipo del Emisor"
                    description="Imagen para el membrete superior"
                    size="sm"
                  >
                    <div class="space-y-2">
                      <div
                        v-if="logoUrl"
                        class="flex items-center gap-2 p-2 bg-muted/30 border border-default rounded-lg"
                      >
                        <img
                          :src="logoUrl"
                          alt="Logo del emisor"
                          class="h-8 max-w-[80px] object-contain rounded bg-white p-0.5 border border-default"
                        >
                        <div class="flex-1 min-w-0">
                          <p class="text-xs font-medium text-highlighted truncate">
                            Logo cargado
                          </p>
                          <span class="text-[10px] text-muted">Se mostrará en el RIDE</span>
                        </div>
                        <UButton
                          size="xs"
                          variant="ghost"
                          color="error"
                          icon="i-carbon-trash-can"
                          title="Quitar logotipo"
                          aria-label="Quitar logotipo"
                          @click="handleLogoClick"
                        />
                      </div>

                      <div
                        v-else
                        class="flex items-center gap-2"
                      >
                        <UButton
                          icon="i-carbon-image"
                          variant="outline"
                          color="neutral"
                          size="sm"
                          class="w-full justify-center"
                          @click="handleLogoClick"
                        >
                          Cargar logo
                        </UButton>
                      </div>
                    </div>
                  </UFormField>

                  <!-- 2. Resolución de Agente de Retención -->
                  <UFormField
                    label="Resolución Agente SRI"
                    :description="xmlAgenteRetencion ? `Filtrado por agente #${xmlAgenteRetencion}` : 'Reemplaza el código genérico'"
                    size="sm"
                  >
                    <div class="flex items-center gap-1.5">
                      <USelect
                        v-model="resolutionAgentNumber"
                        :items="availableResolutions"
                        icon="i-carbon-certificate"
                        placeholder="Sin resolución oficial"
                        size="sm"
                        class="w-full"
                      />
                      <UButton
                        v-if="resolutionAgentNumber"
                        icon="i-carbon-close"
                        variant="ghost"
                        color="neutral"
                        size="xs"
                        title="Limpiar resolución"
                        aria-label="Limpiar resolución"
                        @click="resolutionAgentNumber = ''"
                      />
                    </div>
                  </UFormField>

                  <!-- 3. Teléfono de Contacto -->
                  <UFormField
                    label="Teléfono de Contacto"
                    description="Datos adicionales del emisor"
                    size="sm"
                  >
                    <UInput
                      v-model="companyPhone"
                      icon="i-carbon-phone"
                      placeholder="Ej. 0991234567"
                      size="sm"
                      class="w-full"
                      :ui="{ trailing: 'pe-1' }"
                    >
                      <template
                        v-if="companyPhone.length"
                        #trailing
                      >
                        <UButton
                          color="neutral"
                          variant="link"
                          size="xs"
                          icon="i-carbon-close"
                          aria-label="Limpiar teléfono"
                          @click="companyPhone = ''"
                        />
                      </template>
                    </UInput>
                  </UFormField>

                  <!-- 4. Correo de Contacto -->
                  <UFormField
                    label="Correo de Contacto"
                    description="Email informativo en el membrete"
                    size="sm"
                  >
                    <UInput
                      v-model="companyEmail"
                      icon="i-carbon-email"
                      placeholder="Ej. info@empresa.com"
                      size="sm"
                      class="w-full"
                      :ui="{ trailing: 'pe-1' }"
                    >
                      <template
                        v-if="companyEmail.length"
                        #trailing
                      >
                        <UButton
                          color="neutral"
                          variant="link"
                          size="xs"
                          icon="i-carbon-close"
                          aria-label="Limpiar correo"
                          @click="companyEmail = ''"
                        />
                      </template>
                    </UInput>
                  </UFormField>
                </div>
              </div>
            </template>
          </UCollapsible>
        </section>
        
        <!-- Input Panel (Left, 4 columns) -->
        <section class="lg:col-span-4 bg-default border border-default rounded-xl p-6 space-y-6 print:hidden">
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
            <div class="flex items-center justify-between mb-2">
              <p class="text-[10px] font-black text-dimmed uppercase tracking-wider">
                Comprobantes de Ejemplo
              </p>
              <UBadge
                v-if="activeMock"
                color="warning"
                variant="subtle"
                size="xs"
              >
                Ejemplo activo
              </UBadge>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <UButton 
                class="justify-center transition-all"
                :variant="activeMock === 'factura' ? 'solid' : 'outline'"
                :color="activeMock === 'factura' ? 'primary' : 'neutral'"
                :icon="activeMock === 'factura' ? 'i-carbon-checkmark' : undefined"
                @click="loadMock('factura')"
              >
                📄 Factura
              </UButton>
              <UButton 
                class="justify-center transition-all"
                :variant="activeMock === 'liquidacionCompra' ? 'solid' : 'outline'"
                :color="activeMock === 'liquidacionCompra' ? 'primary' : 'neutral'"
                :icon="activeMock === 'liquidacionCompra' ? 'i-carbon-checkmark' : undefined"
                @click="loadMock('liquidacionCompra')"
              >
                📄 Liq. Compra
              </UButton>
              <UButton 
                class="justify-center transition-all"
                :variant="activeMock === 'notaCredito' ? 'solid' : 'outline'"
                :color="activeMock === 'notaCredito' ? 'primary' : 'neutral'"
                :icon="activeMock === 'notaCredito' ? 'i-carbon-checkmark' : undefined"
                @click="loadMock('notaCredito')"
              >
                📄 Nota de Crédito
              </UButton>
              <UButton 
                class="justify-center transition-all"
                :variant="activeMock === 'guiaRemision' ? 'solid' : 'outline'"
                :color="activeMock === 'guiaRemision' ? 'primary' : 'neutral'"
                :icon="activeMock === 'guiaRemision' ? 'i-carbon-checkmark' : undefined"
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
          <!-- Toolbar (clave de acceso, buscar, acciones) -->
          <div class="flex justify-between bg-default print:hidden">
            <div class="flex flex-1  w-full  gap-1">
              <UFieldGroup
                class="w-full"
                :ui="{
                  base:'w-full'
                }"
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
                      trailing: 'pe-1'
                    }"
                    icon="i-carbon-virtual-column-key" 
                    placeholder="0101010101010101010101010101010101010101 49 dígitos"
                    :disabled="loading"
                    @keydown.enter="searchByClave"
                  >
                    <template
                      v-if="claveAcceso.length > 0 && !loading"
                      #trailing
                    >
                      <UButton
                        color="neutral"
                        variant="link"
                        size="xs"
                        icon="i-carbon-close"
                        aria-label="Limpiar clave de acceso"
                        @click="handleClearClaveAcceso"
                      />
                    </template>
                  </UInput>
                </UTooltip>
                <UTooltip
                  v-if="claveAcceso.length > 0 "
                  text="Buscar comprobante en el SRI por clave de acceso (49 dígitos) solo si fue emitido antes de 30 dias"
                  placement="bottom"
                >
                  <UButton
                    icon="i-carbon-search"
                    variant="solid"
                    color="primary"
                    aria-label="Buscar"
                    :label="loading?'Buscando...':'Buscar'"
                    :loading="loading"
                    @click="searchByClave"
                  />
                </UTooltip> 
                <UTooltip
                  v-if="xmlInput"
                  text="Descargar Archivo XML"
                  placement="bottom"
                >
                  <UButton 
                    icon="i-carbon-arrow-shift-down"
                    variant="solid"
                    label="XML"
                    color="error"
                    @click="downloadXml"
                  />
                </UTooltip>
              </UFieldGroup>

              <div
                v-if="claveAcceso.length > 0 && !loading"
                class="flex gap-1"
              >
                <UTooltip
                 
                  text="Limpiar campo de clave de acceso"
                  placement="bottom"
                >
                  <UButton
                    icon="i-carbon-close"
                    variant="solid"
                    color="error"
                    aria-label="Limpiar"
                    @click="handleClearClaveAcceso"
                  />
                </UTooltip>
              </div>
            </div>
           
            <div class="flex items-center gap-1.5">
              <UColorModeButton />
              <ClientOnly>
                <input
                  ref="logoInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onLogoChange"
                >
                <LocalHistoryModal
                  :items="storedList"
                  @load="loadStoredComprobante"
                  @remove="handleRemoveStored"
                  @clear="handleClearAll"
                />
                <UTooltip
                  v-if="lastSriResponse"
                  text="Ver respuesta técnica del SRI de la última consulta"
                  placement="bottom"
                >
                  <UButton
                    icon="i-carbon-debug"
                    :color="lastSriResponse.success ? 'neutral' : 'warning'"
                    variant="outline"
                    aria-label="Ver respuesta técnica del SRI"
                    @click="isSriModalOpen = true"
                  />
                </UTooltip>
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
            class="space-y-4 print:hidden"
          >
            <!-- Banner diagnóstico cuando la consulta al SRI no retorna comprobante autorizado -->
            <div
              v-if="lastSriResponse && !lastSriResponse.success"
              class="bg-default border border-warning/30 rounded-xl p-8 text-center space-y-4 shadow-xs"
            >
              <div class="w-14 h-14 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto">
                <UIcon
                  name="i-carbon-warning-alt"
                  class="w-7 h-7"
                />
              </div>
              <div class="space-y-1.5">
                <h3 class="text-base sm:text-lg font-black text-highlighted">
                  El SRI no retornó un comprobante autorizado
                </h3>
                <p class="text-xs text-muted max-w-lg mx-auto leading-relaxed">
                  La consulta finalizó con estado <span class="font-mono font-bold text-highlighted">«{{ lastSriResponse.estado }}»</span>. Puedes revisar la respuesta XML completa, los códigos de validación y los motivos devueltos por el servidor del SRI.
                </p>
              </div>
              <div class="flex flex-wrap items-center justify-center gap-2 pt-1">
                <UButton
                  icon="i-carbon-debug"
                  color="warning"
                  variant="solid"
                  size="sm"
                  label="Ver respuesta completa del SRI"
                  @click="isSriModalOpen = true"
                />
                <UButton
                  icon="i-carbon-renew"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  label="Reintentar consulta"
                  :loading="loading"
                  @click="searchByClave"
                />
              </div>
            </div>

            <!-- Visor Listo normal -->
            <div
              v-else
              class="bg-default border border-default rounded-xl p-10 text-center"
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
          </div>

          <!-- Render SRI XML Component -->
          <div
            v-else
            class="sri-xml-viewer bg-default border border-default rounded-xl overflow-hidden"
          >
            <!-- Banner informativo si el comprobante visualizado es un MOCK de ejemplo -->
            <div
              v-if="activeMock"
              class="bg-warning/10 border-b border-warning/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 print:hidden"
            >
              <div class="flex items-center gap-2 min-w-0">
                <UIcon
                  name="i-carbon-information"
                  class="w-4 h-4 text-warning shrink-0"
                />
                <p class="text-xs text-highlighted">
                  <span class="font-bold">Comprobante de Ejemplo ({{ mockConfigs[activeMock]?.label }}):</span>
                  <span class="text-muted ml-1">Datos de prueba con fines ilustrativos. No corresponde a una consulta real del SRI.</span>
                </p>
              </div>
              <UButton
                size="xs"
                variant="ghost"
                color="warning"
                icon="i-carbon-close"
                label="Quitar ejemplo"
                @click="clearXml"
              />
            </div>

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

      <footer class="border-t border-default mt-12 py-6 px-6 text-center text-xs text-muted font-medium print:hidden">
        <p>
          Lector online de comprobantes electrónicos de Ecuador © 2026. Construido por <ULink
            to="https://clopezpro.com"
            target="_blank"
          >
            @clopezpro
          </ULink>  con Nuxt 4, Nuxt UI y Tailwind CSS.
        </p>
      </footer>

      <ClientOnly>
        <SriResponseModal
          v-model:open="isSriModalOpen"
          :response="lastSriResponse"
        />
      </ClientOnly>
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

  /* Hide playground shell elements */
  header, 
  footer, 
  button, 
  nav, 
  aside,
  section.lg\:col-span-12,
  section.lg\:col-span-4,
  .print-hidden,
  .print\:hidden {
    display: none !important;
  }

  .min-h-screen {
    min-height: auto !important;
    background: transparent !important;
    gap: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Reset main layouts to block, utilizing full A4 width */
  main {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    gap: 0 !important;
  }

  section.lg\:col-span-8 {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }

  /* Strip all card container decoration and padding */
  .sri-xml-viewer {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
    border-radius: 0 !important;
    overflow: visible !important;
  }

  .sri-xml-viewer > div {
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
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
}
</style>
