# SRI XML Viewer 🇪🇨

Monorepo con herramientas y componentes en **Vue 3** y **React** para procesar, validar, renderizar e imprimir comprobantes electrónicos autorizados por el **SRI (Servicio de Rentas Internas de Ecuador)**. 

Soporta comprobantes de tipo:
- Facturas (01)
- Notas de Crédito (04)
- Notas de Débito (05)
- Guías de Remisión (06)
- Comprobantes de Retención (07)

---

## 🚀 Instalación

Puedes instalar los paquetes desde tu gestor de dependencias preferido (`npm`, `pnpm` o `yarn`):

```bash
# Para aplicaciones Vue 3 o Nuxt 3/4
pnpm add @sri-xml-viewer/vue @sri-xml-viewer/core

# Para aplicaciones React
pnpm add @sri-xml-viewer/react @sri-xml-viewer/core
```

---

## 💻 Uso en Nuxt / Vue 3

A continuación, se detalla cómo implementar un modal de vista previa premium (como el de tu sistema) que incluye carga de logo, descarga del XML original, impresión a PDF y **anonimización de datos sensibles**.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VisorXml } from '@sri-xml-viewer/vue'
import '@sri-xml-viewer/vue/style.css'

// XML original autorizado obtenido del SRI o tu base de datos
const xmlOriginal = ref(`...`) 
const xmlRenderizado = ref('')
const logoUrl = ref('https://tudominio.com/logo.png')
const isOpen = ref(false)

// 🔒 Función para Anonimizar Datos Sensibles
function anonymizeXml(xmlStr: string): string {
  if (!xmlStr) return ''
  
  return xmlStr
    // 1. Anonimizar datos del comprador / cliente
    .replace(/<razonSocialComprador>([\s\S]*?)<\/razonSocialComprador>/g, '<razonSocialComprador>CONSUMIDOR FINAL</razonSocialComprador>')
    .replace(/<identificacionComprador>([\s\S]*?)<\/identificacionComprador>/g, '<identificacionComprador>9999999999999</identificacionComprador>')
    .replace(/<direccionComprador>([\s\S]*?)<\/direccionComprador>/g, '<direccionComprador>S/N</direccionComprador>')
    
    // 2. Anonimizar campos de información adicional (como emails)
    .replace(/<campoAdicional nombre="Email">([\s\S]*?)<\/campoAdicional>/g, '<campoAdicional nombre="Email">cliente@anonimo.com</campoAdicional>')
    .replace(/<campoAdicional nombre="Email Cliente">([\s\S]*?)<\/campoAdicional>/g, '<campoAdicional nombre="Email Cliente">cliente@anonimo.com</campoAdicional>')
    
    // 3. Anonimizar direcciones y teléfonos en campos específicos
    .replace(/<direccion>([\s\S]*?)<\/direccion>/g, '<direccion>QUITO, ECUADOR</direccion>')
    .replace(/<telefono>([\s\S]*?)<\/telefono>/g, '<telefono>0999999999</telefono>')
}

// Abrir vista previa anonimizando los datos al instante
function abrirVistaPrevia() {
  xmlRenderizado.value = anonymizeXml(xmlOriginal.value)
  isOpen.value = true
}

// 🖨️ Función para Imprimir / Guardar como PDF
function imprimirComprobante() {
  window.print()
}

// 💾 Función para Descargar el XML Autorizado
function descargarXml() {
  if (!xmlRenderizado.value) return
  
  const blob = new Blob([xmlRenderizado.value], { type: 'text/xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  
  // Buscar clave de acceso en el XML para usar como nombre
  const match = xmlRenderizado.value.match(/<claveAcceso>(\d{49})<\/claveAcceso>/)
  const filename = match ? `${match[1]}.xml` : 'comprobante_autorizado.xml'
  
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="p-6">
    <UButton color="primary" @click="abrirVistaPrevia">
      Ver Vista Previa Anonimizada
    </UButton>

    <!-- Modal de Vista Previa -->
    <UModal v-model="isOpen" fullscreen>
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-bold flex items-center gap-2">
              <UIcon name="i-carbon-document-view" class="text-primary w-5 h-5" />
              Vista Previa Comprobante SRI
            </span>
            <div class="flex gap-2">
              <UButton color="neutral" variant="ghost" icon="i-carbon-close" @click="isOpen = false">
                Cerrar
              </UButton>
              <UButton color="neutral" variant="solid" icon="i-carbon-printer" @click="imprimirComprobante">
                Imprimir
              </UButton>
              <UButton color="neutral" variant="solid" icon="i-carbon-download" @click="descargarXml">
                Descargar XML
              </UButton>
              <UButton color="primary" icon="i-carbon-document-pdf" @click="imprimirComprobante">
                Descargar PDF
              </UButton>
            </div>
          </div>
        </template>

        <!-- Componente VisorXml -->
        <div class="p-4 max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100">
          <VisorXml 
            v-if="xmlRenderizado" 
            :xml="xmlRenderizado" 
            :logoUrl="logoUrl" 
          />
        </div>
      </UCard>
    </UModal>
  </div>
</template>
