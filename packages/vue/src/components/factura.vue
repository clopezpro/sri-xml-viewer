<script setup lang="ts">
import { computed } from 'vue'
import headDoc from './headDoc.vue'
import tableSubtotals from './tableSubtotals.vue'
import {
  TYPE_IDENTITY,
  getInfoInvoice,
  getInfoAdicional,
  getPagos,
  getDetailsInvoiceNc,
} from '@sri-xml-viewer/core'
import { showAuthorizationDate } from '../utils.js'

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
})

const infoFactura = computed(() => getInfoInvoice(props.document))
const infoAdicional = computed(() => getInfoAdicional(props.document))
const pagos = computed(() => getPagos(props.document))
const nameTypeDocument = computed(() => {
  const label = TYPE_IDENTITY.find(a => a.value === infoFactura.value.tipoIdentificacionComprador)?.label
  if (label) {
    return label
  }
  return 'NO ENCONTRADO'
})
const detalles = computed(() => getDetailsInvoiceNc(props.document))
function getColumnsDT() {
  if (detalles.value.length === 0)
    return []
  /* check si alguno tiene codigoAuxiliar */

  const isAux = detalles.value.some(rs => rs.codigoAuxiliar)
  const isUnidadMedida = detalles.value.some(rs => rs.unidadMedida)
  const firstItem = detalles.value[0]

  const columns: { valor: string, style?: string }[] = [{ valor: '#', style: 'text-align: center;' }]
  if (firstItem?.codigoPrincipal)
    columns.push({ valor: 'COD' })

  if (isAux)
    columns.push({ valor: 'COD.aux' })

  if (firstItem?.descripcion)
    columns.push({ valor: 'Descripcion' })
  if (firstItem?.detallesAdicionales?.detAdicional) {
    firstItem.detallesAdicionales.detAdicional.forEach((rs) => {
      columns.push({ valor: rs['@nombre'] })
    })
  }

  if (firstItem?.cantidad)
    columns.push({ valor: 'CANT', style: 'text-align: right;' })

  if (isUnidadMedida)
    columns.push({ valor: 'UNIDAD', style: 'text-align: right;' })

  if (firstItem?.precioUnitario)
    columns.push({ valor: 'PVP', style: 'text-align: right;' })

  if (firstItem?.descuento)
    columns.push({ valor: 'DESC', style: 'text-align: right;' })

  if (firstItem?.precioTotalSinImpuesto)
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
  item.forEach((itemFirst, index) => {
    const columns: { valor: string | number, clase?: string }[] = []
    columns.push({ valor: index + 1, clase: 'text-center' })
    if (itemFirst.codigoPrincipal)
      columns.push({ valor: itemFirst.codigoPrincipal })
    if (isAux)
      columns.push({ valor: itemFirst.codigoAuxiliar ?? '' })

    if (itemFirst.descripcion)
      columns.push({ valor: itemFirst.descripcion })

    if (itemFirst.detallesAdicionales?.detAdicional) {
      itemFirst.detallesAdicionales.detAdicional.forEach((rs) => {
        columns.push({ valor: rs['@valor'] })
      })
    }
    if (itemFirst.cantidad)
      columns.push({ valor: itemFirst.cantidad, clase: 'text-right' })

    if (isUnidadMedida)
      columns.push({ valor: itemFirst.unidadMedida ?? '', clase: 'text-right' })

    if (itemFirst.precioUnitario)
      columns.push({ valor: itemFirst.precioUnitario, clase: 'text-right' })
    if (itemFirst.descuento)
      columns.push({ valor: itemFirst.descuento, clase: 'text-right' })
   
    if (itemFirst.precioTotalSinImpuesto) {
      columns.push({
        valor: itemFirst.precioTotalSinImpuesto,
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
    class=" font-sans antialiased text-default max-w-6xl mx-auto print:mx-0 print:w-full m-1 rounded-md p-1 printContent"
  >
    <div
      v-if="dateAuthorization"
      class="print:!hidden flex justify-end"
    >
      <div class="">
        Documento autorizado el <span
          class="font-bold text-primary  text-sm"
          :title="'Fecha de XML es ' + dateAuthorization"
        >{{ showAuthorizationDate(dateAuthorization) }}</span>
      </div>
    </div>
    <headDoc
      :document="document"
      :logoUrl="logoUrl"
      :dateAuthorization="showAuthorizationDate(dateAuthorization)"
    />
    <div class="flex mt-2 text-sm">
      <div class="border border-default rounded-lg w-full px-1">
        <div class="flex-none flex">
          <div class="font-bold pr-2">
            Razón Social / Nombres y Apellidos :
          </div>
          <div>
            {{ infoFactura.razonSocialComprador || 'no hay' }}
          </div>
        </div>
        <div class="flex-none flex gap-x-2">
          <div class="font-bold">
            Identificación:
          </div>
          <div>
            {{ infoFactura.identificacionComprador || 'no hay' }}
          </div>
          <div class="font-bold pr-2">
            {{ infoFactura.tipoIdentificacionComprador }}: {{ nameTypeDocument }}
          </div>
        </div>
        <div class="flex-none flex">
          <div class="font-bold pr-2">
            FECHA EMISION:
          </div>
          <div>{{ infoFactura.fechaEmision }}</div>
          <div class="font-bold pr-2 pl-4">
            GUIA:
          </div>
          <div v-if="infoFactura.guiaRemision">
            {{ infoFactura.guiaRemision }}
          </div>
        </div>
        <div
          v-if="infoFactura.direccionComprador"
          class="flex-none flex"
        >
          <div class="font-bold pr-2">
            Dirección:
          </div>
          <div>{{ infoFactura.direccionComprador }}</div>
        </div>
      </div>
    </div>
    <div class="overflow-x-auto mt-1">
      <table class="w-full table-bordered text-xs border border-default">
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
              class="break-words border border-default"
              :class="valor.clase ? valor.clase : ''"
              :style="(valor.clase || '').includes('right') ? 'text-align: right;' : ((valor.clase || '').includes('center') ? 'text-align: center;' : 'text-align: left;')"
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
          v-if="infoAdicional"
          class="text-center font-bold mb-1"
        >
          Información Adicional
        </div>
        <div
          v-if="infoAdicional"
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
          v-if="pagos"
          class="w-full text-xs border border-default"
        >
          <thead>
            <tr class=" text-left">
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
