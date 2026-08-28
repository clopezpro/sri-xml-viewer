<script setup lang="ts">
import { computed } from 'vue'
import headDoc from './headDoc.vue'
import tableSubtotals from './tableSubtotals.vue'
import {
  TYPE_IDENTITY,
  getInfoLiquidacionCompra,
  getInfoAdicional,
  getPagos,
  getDetailsInvoiceNc,
} from '@sri-xml-viewer/core'
import { showAuthorizationDate, formatToMoney, formatAdditionalDetails, getAdditionalDetailHeader } from '../utils'

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

const infoLiquidacionCompra = computed(() => getInfoLiquidacionCompra(props.document))
const infoAdicional = computed(() => getInfoAdicional(props.document))
const pagos = computed(() => getPagos(props.document))
const nameTypeDocument = computed(() => {
  const label = TYPE_IDENTITY.find(a => a.value === infoLiquidacionCompra.value.tipoIdentificacionProveedor)?.label
  if (label) {
    return label
  }
  return 'NO ENCONTRADO'
})
const detalles = computed(() => getDetailsInvoiceNc(props.document))

function getColumnsDT() {
  if (detalles.value.length === 0)
    return []

  const isAux = detalles.value.some(rs => rs.codigoAuxiliar)
  const isUnidadMedida = detalles.value.some(rs => rs.unidadMedida)
  const hasCodigoPrincipal = detalles.value.some(rs => rs.codigoPrincipal)
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
    columns.push({ valor: 'Descripcion' })

  if (hasDetallesAdicionales)
    columns.push({ valor: getAdditionalDetailHeader(detalles.value) })

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

  const isAux = item.some(rs => rs.codigoAuxiliar)
  const isUnidadMedida = item.some(rs => rs.unidadMedida)
  const hasCodigoPrincipal = item.some(rs => rs.codigoPrincipal)
  const hasDetallesAdicionales = item.some(
    rs => rs.detallesAdicionales?.detAdicional && rs.detallesAdicionales.detAdicional.length > 0
  )

  item.forEach((itemFirst, index) => {
    const columns: { valor: string | number, clase?: string }[] = []
    columns.push({ valor: index + 1, clase: 'text-center' })
    if (hasCodigoPrincipal)
      columns.push({ valor: itemFirst.codigoPrincipal ?? '' })
    if (isAux)
      columns.push({ valor: itemFirst.codigoAuxiliar ?? '' })

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
      v-if="dateAuthorization"
      class="print:!hidden flex justify-end"
    >
      <div>
        Documento autorizado el <span
          class="font-bold text-primary text-sm"
          :title="'Fecha de XML es ' + dateAuthorization"
        >{{ showAuthorizationDate(dateAuthorization) }}</span>
      </div>
    </div>
    <headDoc
      :document="document"
      :logoUrl="logoUrl"
      :dateAuthorization="showAuthorizationDate(dateAuthorization)"
      :resolutionAgentNumber="resolutionAgentNumber"
      :companyPhone="companyPhone || phone"
      :companyEmail="companyEmail || email"
    />
    <div class="flex mt-2 text-sm">
      <div class="border border-default rounded-lg w-full px-1">
        <div class="flex-none flex">
          <div class="font-bold pr-2 text-nowrap">
            Razón Social / Nombres y Apellidos (Proveedor):
          </div>
          <div>
            {{ infoLiquidacionCompra.razonSocialProveedor || 'no hay' }}
          </div>
        </div>
        <div class="flex-none flex gap-x-2">
          <div class="font-bold">
            Identificación:
          </div>
          <div>
            {{ infoLiquidacionCompra.identificacionProveedor || 'no hay' }}
          </div>
          <div class="font-bold pr-2">
            {{ infoLiquidacionCompra.tipoIdentificacionProveedor }}: {{ nameTypeDocument }}
          </div>
        </div>
        <div class="flex-none flex">
          <div class="font-bold pr-2">
            FECHA EMISION:
          </div>
          <div>{{ infoLiquidacionCompra.fechaEmision }}</div>
          <div
            v-if="infoLiquidacionCompra.guiaRemision"
            class="flex-none flex"
          >
            <div class="font-bold pr-2 pl-4">
              GUIA:
            </div>
            <div>
              {{ infoLiquidacionCompra.guiaRemision }}
            </div>
          </div>
        </div>
        <div
          v-if="infoLiquidacionCompra.direccionProveedor"
          class="flex-none flex"
        >
          <div class="font-bold pr-2">
            Dirección:
          </div>
          <div>{{ infoLiquidacionCompra.direccionProveedor }}</div>
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
        <table
          v-if="pagos && pagos.length > 0"
          class="w-full text-xs border border-default"
        >
          <thead>
            <tr class="text-left">
              <th class="p-1 border border-default">
                Forma de pago
              </th>
              <th class="p-1 border border-default text-right">
                Valor
              </th>
              <th class="p-1 border border-default text-right">
                PLAZO
              </th>
              <th class="p-1 border border-default">
                TIEMPO
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(dt, index) in pagos"
              :key="index"
            >
              <td class="p-1 border border-default text-center">
                {{ dt.formaPago }}
              </td>
              <td class="p-1 border border-default text-right">
                {{ dt.total }}
              </td>
              <td class="p-1 border border-default text-right">
                {{ dt.plazo }}
              </td>
              <td class="p-1 border border-default">
                {{ dt.unidadTiempo }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        class="rounded-lg mt-1 shrink-0"
        style="width: 320px;"
      >
        <tableSubtotals :data="document" />
      </div>
    </div>

    <!-- Sección de Firmas (Recibo) -->
    <div class="mt-12 grid grid-cols-2 gap-8 text-center px-12 pb-4">
      <div class="flex flex-col items-center">
        <div class="w-64 border-t border-default mb-2" />
        <span class="font-bold text-default text-xs">Entregado Conforme</span>
      </div>
      <div class="flex flex-col items-center">
        <div class="w-64 border-t border-default mb-2" />
        <span class="font-bold text-default text-xs">Recibí Conforme</span>
      </div>
    </div>
  </div>
</template>
