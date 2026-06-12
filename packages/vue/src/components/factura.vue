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

const infoFactura = getInfoInvoice(props.document)
const infoAdicional = getInfoAdicional(props.document)
const pagos = getPagos(props.document)
const nameTypeDocument = computed(() => {
  const nameTypeDocument = TYPE_IDENTITY.find(a => a.value == infoFactura.tipoIdentificacionComprador)?.label
  if (nameTypeDocument) {
    return nameTypeDocument
  }
  return 'NO ENCONTRADO'
})
const detalles = getDetailsInvoiceNc(props.document)
function getColumnsDT() {
  if (detalles.length === 0)
    return []
  /* check si alguno tiene codigoAuxiliar */

  const isAux = detalles.some(rs => rs.codigoAuxiliar)
  const isUnidadMedida = detalles.some(rs => rs.unidadMedida)
  const firstItem = detalles[0]

  const columns = ['#']
  if (firstItem?.codigoPrincipal)
    columns.push('COD')

  if (isAux)
    columns.push('COD.aux')

  if (firstItem?.descripcion)
    columns.push('Descripcion')

  if (firstItem?.cantidad)
    columns.push('CANT')

  if (isUnidadMedida)
    columns.push('UNIDAD')

  if (firstItem?.precioUnitario)
    columns.push('PVP')

  if (firstItem?.descuento)
    columns.push('DESC')

  if (firstItem?.detallesAdicionales) {
    firstItem?.detallesAdicionales.detAdicional.forEach((rs) => {
      columns.push(rs['@nombre'])
    })
  }
  if (firstItem?.precioTotalSinImpuesto)
    columns.push('TOTAL')

  return columns
}
function getColumnsTB() {
  let item = []
  const itemArray: {
    valor: string | number
    clase?: string
  }[][] = []
  let columns = []

  item = detalles
  const isAux = item.some(rs => rs.codigoAuxiliar)
  const isUnidadMedida = item.some(rs => rs.unidadMedida)
  item.forEach((itemFirst, index) => {
    columns = []
    columns.push({ valor: index + 1, clase: 'text-center' })
    if (itemFirst.codigoPrincipal)
      columns.push({ valor: itemFirst.codigoPrincipal })
    if (isAux)
      columns.push({ valor: itemFirst.codigoAuxiliar ?? '' })

    if (itemFirst.descripcion)
      columns.push({ valor: itemFirst.descripcion })
    if (itemFirst.cantidad)
      columns.push({ valor: itemFirst.cantidad, clase: 'text-right' })

    if (isUnidadMedida)
      columns.push({ valor: itemFirst.unidadMedida ?? '', clase: 'text-right' })

    if (itemFirst.precioUnitario)
      columns.push({ valor: itemFirst.precioUnitario, clase: 'text-right' })
    if (itemFirst.descuento)
      columns.push({ valor: itemFirst.descuento, clase: 'text-right' })
    if (itemFirst.detallesAdicionales) {
      itemFirst.detallesAdicionales.detAdicional.forEach((rs) => {
        columns.push({ valor: rs['@valor'] })
      })
    }
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
            >
              {{ tag }}
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
                <td class="w-[100px] break-words !p-1 border border-default ">
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
      <div class="rounded-lg mt-1 w-[320px] shrink-0">
        <table class="w-full text-xs">
          <tableSubtotals :data="document" />
        </table>
      </div>
    </div>
  </div>
</template>
