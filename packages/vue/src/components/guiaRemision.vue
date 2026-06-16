<script setup lang="ts">
import { computed } from 'vue'
import headDoc from './headDoc.vue'
import { getInfoAdicional } from '@sri-xml-viewer/core'
import { showAuthorizationDate } from '../utils'

interface DetalleAdicional {
  nombre: string
  valor: string
}

interface DetalleProducto {
  codigoInterno?: string
  codigoAdicional?: string
  descripcion?: string
  cantidad?: string
  detallesAdicionales?: DetalleAdicional[]
}

interface Destinatario {
  identificacionDestinatario?: string
  razonSocialDestinatario?: string
  dirDestinatario?: string
  motivoTraslado?: string
  docSustento?: string
  numDocSustento?: string
  fechaEmisionDocSustento?: string
  numAutDocSustento?: string
  ruta?: string
  codDocSustento?: string
  detalles: DetalleProducto[]
}

const props = defineProps({
  document: {
    type: typeof Document !== 'undefined' ? Document : Object,
    required: true,
  },
  authorization: {
    type: String,
    required: false,
    default: undefined,
  },
  logoUrl: {
    type: String,
    required: false,
    default: undefined,
  },
})

// Extraer Información de Guía de Remisión (Transportista, Placa, Fechas, etc.)
const infoGuiaRemision = computed(() => {
  const doc = props.document
  const node = doc?.getElementsByTagName('infoGuiaRemision').item(0)
  if (!node) return {}
  const result: Record<string, string> = {}
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    result[child.tagName] = child.textContent || ''
  }
  return result
})

// Extraer Destinatarios, sus Documentos de Sustento y Detalles de Productos
const destinatarios = computed<Destinatario[]>(() => {
  const doc = props.document
  const nodes = doc?.getElementsByTagName('destinatario')
  if (!nodes) return []
  const list: Destinatario[] = []
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes.item(i)
    if (!node) continue
    const dest: any = {}

    // Extraer campos planos del destinatario
    for (let j = 0; j < node.children.length; j++) {
      const child = node.children[j]
      if (child.tagName !== 'detalles') {
        dest[child.tagName] = child.textContent || ''
      }
    }

    // Extraer detalles de productos de este destinatario
    dest.detalles = []
    const detallesNode = node.getElementsByTagName('detalle')
    for (let k = 0; k < detallesNode.length; k++) {
      const detNode = detallesNode.item(k)
      if (!detNode) continue
      const det: DetalleProducto = {}
      for (let l = 0; l < detNode.children.length; l++) {
        const child = detNode.children[l]
        if (child.tagName === 'detallesAdicionales') {
          det.detallesAdicionales = []
          const adNodes = child.getElementsByTagName('detAdicional')
          for (let m = 0; m < adNodes.length; m++) {
            const ad = adNodes.item(m)
            if (ad) {
              det.detallesAdicionales.push({
                nombre: ad.getAttribute('nombre') || '',
                valor: ad.getAttribute('valor') || ad.textContent || '',
              })
            }
          }
        }
        else {
          det[child.tagName as keyof Omit<DetalleProducto, 'detallesAdicionales'>] = child.textContent || ''
        }
      }
      dest.detalles.push(det)
    }

    list.push(dest)
  }
  return list
})

// Extraer campos adicionales generales
const infoAdicional = computed(() => getInfoAdicional(props.document))

// Nombres únicos de detalles adicionales en los detalles de este destinatario
function getUniqueAdditionalDetailNames(detalles: DetalleProducto[]): string[] {
  const names = new Set<string>()
  detalles.forEach((item) => {
    if (item.detallesAdicionales && Array.isArray(item.detallesAdicionales)) {
      item.detallesAdicionales.forEach((ad) => {
        if (ad.nombre) {
          names.add(ad.nombre)
        }
      })
    }
  })
  return Array.from(names)
}

// Obtener cabeceras de la tabla dinámicamente
function getColumnsDT(detalles: DetalleProducto[]) {
  if (detalles.length === 0) return []

  const columns: { label: string, headerClassName?: string }[] = [{
    label: '#',
    headerClassName: 'text-center',
  }]
  columns.push({ label: 'CANT', headerClassName: 'text-center' })
  columns.push({ label: 'Descripción' })
  const hasCodInterno = detalles.some(item => item.codigoInterno)
  if (hasCodInterno) {
    columns.push({ label: 'Còdigo Princial' })
  }

  const hasCodAdicional = detalles.some(item => item.codigoAdicional)
  if (hasCodAdicional) {
    columns.push({ label: 'COD.aux' })
  }

  const extraDetailNames = getUniqueAdditionalDetailNames(detalles)
  extraDetailNames.forEach((name) => {
    columns.push({ label: name })
  })

  return columns
}

// Obtener filas de la tabla dinámicamente
function getColumnsTB(detalles: DetalleProducto[]) {
  const itemArray: { valor: string | number, clase?: string }[][] = []
  const hasCodInterno = detalles.some(item => item.codigoInterno)
  const hasCodAdicional = detalles.some(item => item.codigoAdicional)
  const extraDetailNames = getUniqueAdditionalDetailNames(detalles)

  detalles.forEach((item, index) => {
    const row: { valor: string | number, clase?: string }[] = []

    // 1. Índice
    row.push({ valor: index + 1, clase: 'text-center' })
    row.push({ valor: item.cantidad || '0', clase: 'text-right font-bold' })
    row.push({ valor: item.descripcion || '' })

    // 2. Código Principal
    if (hasCodInterno) {
      row.push({ valor: item.codigoInterno || '' })
    }

    // 3. Código Auxiliar
    if (hasCodAdicional) {
      row.push({ valor: item.codigoAdicional || '' })
    }

    // 4. Descripción

    // 5. Detalles adicionales dinámicos
    extraDetailNames.forEach((name) => {
      let val = ''
      if (item.detallesAdicionales && Array.isArray(item.detallesAdicionales)) {
        const found = item.detallesAdicionales.find(ad => ad.nombre === name)
        if (found) {
          val = found.valor
        }
      }
      row.push({ valor: val })
    })

    // 6. Cantidad

    itemArray.push(row)
  })

  return itemArray
}

// Mapeo del código de identificación para mostrar texto en lugar de números
function showTypeIdentificacion(code: string) {
  switch (code) {
    case '04': return 'RUC'
    case '05': return 'Cédula'
    case '06': return 'Pasaporte'
    case '07': return 'Consumidor Final'
    case '08': return 'Identificación Extranjera'
    default: return 'Identificación'
  }
}

// Mapeo del tipo de comprobante de sustento
function showTypeDocSustento(code: string) {
  switch (code) {
    case '01': return 'Factura'
    case '04': return 'Nota de Crédito'
    case '05': return 'Nota de Débito'
    default: return 'Comprobante'
  }
}
</script>

<template>
  <div class="text-xs flex flex-col gap-2 max-w-5xl mx-auto bg-default text-default m-1 rounded-md p-1 printContent print:mx-0 print:w-full">
    <div
      v-if="authorization"
      class="print:!hidden flex justify-end"
    >
      <div class="font-bold text-primary">
        Documento autorizado el {{ showAuthorizationDate(authorization) }}
      </div>
    </div>

    <!-- Encabezado General del SRI -->
    <headDoc
      :document="document"
      :dateAuthorization="showAuthorizationDate(authorization)"
      :logoUrl="logoUrl"
    />

    <!-- Datos de Movilización / Transporte -->
    <div class="border border-default rounded-lg p-2 mt-2">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <span class="font-bold text-dimmed">Transportista (Razón Social):</span> {{ infoGuiaRemision.razonSocialTransportista }}
        </div>
        <div>
          <span class="font-bold text-dimmed">R.U.C. / C.I.:</span> {{ infoGuiaRemision.rucTransportista }}
        </div>
        <div>
          <span class="font-bold text-dimmed">Placa del Vehículo:</span> <span class="bg-muted px-2 py-0.5 rounded font-mono font-bold">{{ infoGuiaRemision.placa }}</span>
        </div>
        <div>
          <span class="font-bold text-dimmed">Punto de Partida:</span> {{ infoGuiaRemision.dirPartida }}
        </div>
        <div>
          <span class="font-bold text-dimmed">Fecha Inicio Transporte:</span> {{ infoGuiaRemision.fechaIniTransporte }}
        </div>
        <div>
          <span class="font-bold text-dimmed">Fecha Fin Transporte:</span> {{ infoGuiaRemision.fechaFinTransporte }}
        </div>
      </div>
    </div>

    <!-- Bloque de Destinatarios y Productos -->
    <div
      v-for="(dest, index) in destinatarios"
      :key="index"
      class="border border-default rounded-lg p-2 mt-2"
    >
      <div class="grid grid-cols-[200px_1fr] gap-y-1">
        <template
          v-if="dest.numDocSustento"
        >
          <div class="text-dimmed">
            Comprobante de venta:
          </div>
          <div>
            <span class="font-bold uppercase text-primary">{{ showTypeDocSustento(dest.codDocSustento ?? '') }} {{ dest.numDocSustento }}</span>
            <span class="ml-5">
              Fecha de emisión: <span class="font-bold">{{ dest.fechaEmisionDocSustento }}</span>
            </span>
          </div>
          <div class="text-dimmed">
            Numero de autorización:
          </div>
          <div>
            <span class="font-bold">{{ dest.numAutDocSustento }}</span>
          </div>
        </template>

        <div class="text-dimmed">
          Motivo de Traslado:
        </div>
        <div class="font-bold">
          {{ dest.motivoTraslado }}
        </div>
        <div class="text-dimmed">
          DESTINO (punto de llegada) :
        </div>
        <div class="font-bold">
          {{ dest.dirDestinatario }}
        </div>
        <div class="text-dimmed">
          Identificación(Destinatario) :
        </div>
        <div class="font-bold">
          {{ dest.identificacionDestinatario }}
        </div>
        <div class="text-dimmed">
          Nombre / Razón Social
        </div>
        <div class="font-bold">
          {{ dest.razonSocialDestinatario }}
        </div>

        <div class="text-dimmed">
          Ruta:
        </div>
        <div class="font-bold">
          {{ dest.ruta??'' }}
        </div>
      </div>

      <!-- Tabla Dinámica de Productos del Destinatario -->
      <div class="p-2 mt-2">
        <table class="w-full border border-default text-xs">
          <thead>
            <tr class="bg-muted text-left text-default">
              <th
                v-for="(tag, colIdx) in getColumnsDT(dest.detalles)"
                :key="colIdx"
                class="border border-default p-1 font-bold"
                :class="tag.headerClassName ? tag.headerClassName : ''"
              >
                {{ tag.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, rowIdx) in getColumnsTB(dest.detalles)"
              :key="rowIdx"
            >
              <td
                v-for="(cell, cellIdx) in row"
                :key="cellIdx"
                class="border border-default p-1 break-words"
                :class="cell.clase ? cell.clase : ''"
              >
                {{ cell.valor }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Campos Adicionales Generales -->
    <div
      v-if="infoAdicional && infoAdicional.length > 0"
      class="mx-20 mt-2"
    >
      <table class="text-xs w-full table-fixed border border-default">
        <thead>
          <tr class="bg-muted text-default">
            <th
              colspan="2"
              class="p-1 text-center font-bold border border-default"
            >
              INFORMACIÓN ADICIONAL
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(dt, idx) in infoAdicional"
            :key="idx"
          >
            <td class="w-1/3 break-words !p-1 border border-default font-bold bg-muted">
              {{ dt.name }}
            </td>
            <td class="w-2/3 break-words !p-1 border border-default">
              {{ dt.value }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
