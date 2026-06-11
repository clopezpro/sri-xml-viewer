<script setup lang="ts">
import { computed } from 'vue'
import headDoc from './headDoc.vue'
import { getInfoAdicional } from '@sri-xml-viewer/core'

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
const infoAdicional = getInfoAdicional(props.document)

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
  <div class="text-xs flex flex-col gap-2 max-w-5xl mx-auto bg-gray-50 text-black m-1 rounded-md p-1 printContent print:mx-0 print:w-full">
    <div
      v-if="authorization"
      class="print:hidden flex justify-end"
    >
      <div class="font-bold text-green-700">
        Documento autorizado el {{ authorization }}
      </div>
    </div>

    <!-- Encabezado General del SRI -->
    <headDoc
      :document="document"
      :dateAuthorization="authorization"
      :logoUrl="logoUrl"
    />

    <!-- Datos de Movilización / Transporte -->
    <div class="border rounded-lg p-2 mt-2">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <span class="font-bold">Transportista (Razón Social):</span> {{ infoGuiaRemision.razonSocialTransportista }}
        </div>
        <div>
          <span class="font-bold">R.U.C. / C.I.:</span> {{ infoGuiaRemision.rucTransportista }}
        </div>
        <div>
          <span class="font-bold">Placa del Vehículo:</span> <span class="bg-gray-200 px-2 py-0.5 rounded font-mono font-bold">{{ infoGuiaRemision.placa }}</span>
        </div>
        <div>
          <span class="font-bold">Punto de Partida:</span> {{ infoGuiaRemision.dirPartida }}
        </div>
        <div>
          <span class="font-bold">Fecha Inicio Transporte:</span> {{ infoGuiaRemision.fechaIniTransporte }}
        </div>
        <div>
          <span class="font-bold">Fecha Fin Transporte:</span> {{ infoGuiaRemision.fechaFinTransporte }}
        </div>
      </div>
    </div>

    <!-- Bloque de Destinatarios y Productos -->
    <div
      v-for="(dest, index) in destinatarios"
      :key="index"
      class="border rounded-lg p-2 mt-2"
    >
      <div class="grid grid-cols-[200px_1fr]  ">
        <template
          v-if="dest.numDocSustento"
        >
          <div>
            Comprobante de venta:
          </div>
          <div>
            <span class="font-bold uppercase">{{ showTypeDocSustento(dest.codDocSustento ?? '') }} {{ dest.numDocSustento }}</span>
            <span class="ml-5">
              Fecha de emisión: <span class="font-bold">{{ dest.fechaEmisionDocSustento }}</span>
            </span>
          </div>
          <div>
            Numero de autorización:
          </div>
          <div>
            <span class="font-bold">{{ dest.numAutDocSustento }}</span>
          </div>
        </template>

        <div>
          Motivo de Traslado:
        </div>
        <div class="font-bold">
          {{ dest.motivoTraslado }}
        </div>
        <div>
          DESTINO (punto de llegada) :
        </div>
        <div class="font-bold">
          {{ dest.dirDestinatario }}
        </div>
        <div>
          Identificación(Destinatario) :
        </div>
        <div class="font-bold">
          {{ dest.identificacionDestinatario }}
        </div>
        <div>
          Nombre / Razón Social
        </div>
        <div class="font-bold">
          {{ dest.razonSocialDestinatario }}
        </div>

        <div>
          Ruta:
        </div>
        <div class="font-bold">
          {{ dest.ruta??'' }}
        </div>
      </div>

      <!-- Tabla Dinámica de Productos del Destinatario -->
      <div class="p-4">
        <table class="w-full border border-accented text-xs">
          <thead>
            <tr class="bg-accented text-left text-gray-700">
              <th
                v-for="(tag, colIdx) in getColumnsDT(dest.detalles)"
                :key="colIdx"
                class=" p-1  font-bold"
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
                class="border border-accented p-1 break-words"
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
      class=" mx-20"
    >
      <table class="text-xs w-full table-fixed border border-accented">
        <thead class="border">
          <tr class="bg-gray-100 text-gray-700">
            <th
              colspan="2"
              class=" p-1 text-center font-bold"
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
            <td class="w-1/3 break-words !p-1 border  font-bold bg-gray-50">
              {{ dt.name }}
            </td>
            <td class="w-2/3 break-words !p-1 border ">
              {{ dt.value }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
