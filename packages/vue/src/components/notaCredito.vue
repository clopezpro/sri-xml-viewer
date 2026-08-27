<script setup lang="ts">
import { computed } from 'vue'
import headDoc from './headDoc.vue'
import tableSubtotals from './tableSubtotals.vue'
import { getInfoTributaria, getInfoAdicional, getDetailsInvoiceNc } from '@sri-xml-viewer/core'
import { showAuthorizationDate, formatToMoney, formatAdditionalDetails } from '../utils'

const props = defineProps({
  document: {
    type: typeof Document !== 'undefined' ? Document : Object,
    required: true,
  },
  dateAuthorization: {
    type: String,
    required: false,
    default: undefined,
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
  resolutionAgentNumber: {
    type: String,
    required: false,
    default: undefined,
  },
  companyPhone: {
    type: String,
    required: false,
    default: undefined,
  },
  companyEmail: {
    type: String,
    required: false,
    default: undefined,
  },
  phone: {
    type: String,
    required: false,
    default: undefined,
  },
  email: {
    type: String,
    required: false,
    default: undefined,
  },
})

const effectiveAuthDate = computed(() => props.dateAuthorization || props.authorization)
const infoTributaria = computed(() => getInfoTributaria(props.document))
const infoAdicional = computed(() => getInfoAdicional(props.document))
const detalles = computed(() => getDetailsInvoiceNc(props.document))

const infoNotaCredito = computed(() => {
  const nodes = props.document.getElementsByTagName('infoNotaCredito')
  if (!nodes || nodes.length === 0) return {}
  const node = nodes[0]
  const result: Record<string, string> = {}
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    result[child.tagName] = child.textContent || ''
  }
  return result
})

function showTypeDoc(type: string, mode = 0) {
  switch (mode) {
    case 0:
      switch (type) {
        case '05':
          return 'Cédula'
        case '04':
          return 'RUC'
        case '06':
          return 'Pasaporte'
        case '07':
          return 'Consumidor final'
        case '08':
          return 'Identificación extranjera'
        case '09':
          return 'Placa'
      }
      break
    case 1:
      switch (type) {
        case '01':
          return 'FACTURA'
        case '04':
          return 'NOTA DE CRÉDITO'
        case '05':
          return 'NOTA DE DÉBITO'
        case '06':
          return 'GUÍA DE REMISIÓN'
        case '07':
          return 'COMPROBANTE DE RETENCIÓN'
        default:
          return 'FACTURA'
      }
    case 2:
      switch (type) {
        case '2':
          return 'RENTA'
        case '1':
          return 'IVA'
      }
  }
  return ''
}

function getColumnsDT() {
  if (detalles.value.length === 0)
    return []

  const isAux = detalles.value.some(rs => rs.codigoAuxiliar || rs.codigoAdicional)
  const isUnidadMedida = detalles.value.some(rs => rs.unidadMedida)
  const hasCodigoPrincipal = detalles.value.some(rs => rs.codigoPrincipal || rs.codigoInterno)
  const hasDetallesAdicionales = detalles.value.some(
    rs => rs.detallesAdicionales?.detAdicional && rs.detallesAdicionales.detAdicional.length > 0
  )
  const firstItem = detalles.value[0]

  const columns: { valor: string, style?: string }[] = [{ valor: '#', style: 'text-align: center;' }]
  if (hasCodigoPrincipal)
    columns.push({ valor: 'COD' })

  if (isAux)
    columns.push({ valor: 'COD.aux' })

  if (firstItem?.descripcion !== undefined)
    columns.push({ valor: 'Descripción' })

  if (hasDetallesAdicionales)
    columns.push({ valor: 'Detalle Adicional' })

  if (firstItem?.cantidad !== undefined)
    columns.push({ valor: 'CANT', style: 'text-align: right;' })

  if (isUnidadMedida)
    columns.push({ valor: 'UNIDAD', style: 'text-align: right;' })

  if (firstItem?.precioUnitario !== undefined)
    columns.push({ valor: 'PVP', style: 'text-align: right;' })

  if (firstItem?.descuento !== undefined)
    columns.push({ valor: 'DESC', style: 'text-align: right;' })

  if (firstItem?.precioTotalSinImpuesto !== undefined)
    columns.push({ valor: 'TOTAL', style: 'text-align: right;' })

  return columns
}

function getColumnsTB() {
  const item = detalles.value
  const itemArray: {
    valor: string | number
    clase?: string
  }[][] = []

  const isAux = item.some(rs => rs.codigoAuxiliar || rs.codigoAdicional)
  const isUnidadMedida = item.some(rs => rs.unidadMedida)
  const hasCodigoPrincipal = item.some(rs => rs.codigoPrincipal || rs.codigoInterno)
  const hasDetallesAdicionales = item.some(
    rs => rs.detallesAdicionales?.detAdicional && rs.detallesAdicionales.detAdicional.length > 0
  )

  item.forEach((itemFirst, index) => {
    const columns: { valor: string | number, clase?: string }[] = []
    columns.push({ valor: index + 1, clase: 'text-center' })
    if (hasCodigoPrincipal)
      columns.push({ valor: itemFirst.codigoPrincipal || itemFirst.codigoInterno || '' })
    if (isAux)
      columns.push({ valor: itemFirst.codigoAuxiliar || itemFirst.codigoAdicional || '' })

    if (itemFirst.descripcion !== undefined)
      columns.push({ valor: itemFirst.descripcion })

    if (hasDetallesAdicionales) {
      columns.push({
        valor: formatAdditionalDetails(itemFirst.detallesAdicionales?.detAdicional),
        clase: 'whitespace-pre-line',
      })
    }

    if (itemFirst.cantidad !== undefined)
      columns.push({ valor: itemFirst.cantidad, clase: 'text-right' })

    if (isUnidadMedida)
      columns.push({ valor: itemFirst.unidadMedida ?? '', clase: 'text-right' })

    if (itemFirst.precioUnitario !== undefined)
      columns.push({ valor: formatToMoney(itemFirst.precioUnitario, 'decimal'), clase: 'text-right' })
    if (itemFirst.descuento !== undefined)
      columns.push({ valor: formatToMoney(itemFirst.descuento, 'decimal'), clase: 'text-right' })

    if (itemFirst.precioTotalSinImpuesto !== undefined) {
      columns.push({
        valor: formatToMoney(itemFirst.precioTotalSinImpuesto, 'decimal'),
        clase: 'text-right',
      })
    }
    itemArray.push(columns)
  })
  return itemArray
}
</script>

<template>
  <div
    class="font-sans antialiased text-default max-w-6xl mx-auto print:mx-0 print:w-full m-1 rounded-md p-1 printContent"
  >
    <div
      v-if="effectiveAuthDate"
      class="print:!hidden flex justify-end"
    >
      <div>
        Documento autorizado el <span
          class="font-bold text-primary text-sm"
          :title="'Fecha de XML es ' + effectiveAuthDate"
        >{{ showAuthorizationDate(effectiveAuthDate) }}</span>
      </div>
    </div>
    <headDoc
      :document="document"
      :logoUrl="logoUrl"
      :dateAuthorization="showAuthorizationDate(effectiveAuthDate)"
      :resolutionAgentNumber="resolutionAgentNumber"
      :companyPhone="companyPhone || phone"
      :companyEmail="companyEmail || email"
    />
    <div class="border border-default rounded-lg w-full mt-2 p-2 text-xs">
      <div class="flex-none flex flex-wrap gap-2">
        <div class="font-bold pr-2 text-nowrap">
          Razón Social / Nombres y Apellidos :
        </div>
        <div>
          {{ infoNotaCredito.razonSocialComprador }}
        </div>
        <div class="font-bold ">
          Identificación :
        </div>
        <div>
          {{ infoNotaCredito.identificacionComprador }}
        </div>

        <div class="font-bold mx-2">
          ({{
            showTypeDoc(infoNotaCredito.tipoIdentificacionComprador, 0)
          }})
        </div>
      </div>
      <div class="flex">
        <div class="flex">
          <div class="font-bold pr-2">
            Fecha Emisión :
          </div>
          <div>
            {{ infoNotaCredito.fechaEmision }}
          </div>
        </div>
      </div>
      <div class="py-2">
        <hr class="border-default">
      </div>
      <div>
        <div class="flex flex-wrap gap-x-2">
          <div class="font-bold pr-2">
            Comprobante que se modifica :
          </div>
          <div>
            {{ showTypeDoc(infoNotaCredito.codDocModificado, 1) }}
          </div>
          <div class="mx-10">
            {{ infoNotaCredito.numDocModificado }}
          </div>
        </div>
        <div class="flex">
          <div class="font-bold pr-2">
            Fecha Emisión (Comprobante a modificar) :
          </div>
          <div>
            {{ infoNotaCredito.fechaEmisionDocSustento }}
          </div>
        </div>
        <div class="flex justify-between items-center">
          <div class="font-bold pr-2 ">
            Razón de Modificación:
          </div>
          <div class="font-semibold text-left text-xl">
            {{ infoNotaCredito.motivo }}
          </div>
          <div class="mx-10" />
        </div>
      </div>
    </div>
    <div class="overflow-x-auto mt-1">
      <table
        class="w-full table-bordered text-xs border border-default tabular-nums text-left"
        style="font-variant-numeric: tabular-nums; text-align: left;"
      >
        <thead>
          <tr>
            <th
              v-for="(tag, index) in getColumnsDT()"
              :key="index"
              class="border border-default"
              :style="tag.style || 'text-align: left;'"
            >
              {{ tag.valor }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(dt, index) in getColumnsTB()"
            :key="index"
          >
            <td
              v-for="(valor, i) in dt"
              :key="i"
              class="break-words border border-default tabular-nums"
              :class="valor.clase ? valor.clase : ''"
              :style="(valor.clase || '').includes('right') ? 'text-align: right; font-variant-numeric: tabular-nums;' : ((valor.clase || '').includes('center') ? 'text-align: center; font-variant-numeric: tabular-nums;' : 'text-align: left; font-variant-numeric: tabular-nums;')"
            >
              {{ valor.valor }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex justify-between gap-2 mt-2">
      <div class="flex-1">
        <div
          v-if="infoAdicional && infoAdicional.length > 0"
          class="text-center font-bold mb-1"
        >
          Información Adicional
        </div>
        <div
          v-if="infoAdicional && infoAdicional.length > 0"
          class="mb-2"
        >
          <table
            class="text-xs w-full table-fixed border border-default"
          >
            <tbody>
              <tr
                v-for="(dt, index) in infoAdicional"
                :key="index"
              >
                <td
                  class="break-words !p-1 border border-default"
                  style="max-width: 100px;"
                >
                  {{ dt.name }}
                </td>
                <td class="break-words !p-1 border border-default">
                  {{ dt.value }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div
        class="rounded-lg mt-1 shrink-0"
        style="width: 320px;"
      >
        <tableSubtotals :data="document" />
      </div>
    </div>
  </div>
</template>
