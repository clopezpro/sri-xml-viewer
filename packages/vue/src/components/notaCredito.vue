<script setup lang="ts">
import { computed } from 'vue'
import headDoc from './headDoc.vue'
import tableSubtotals from './tableSubtotals.vue'
import { getInfoTributaria, getInfoAdicional, getDetailsInvoiceNc } from '@sri-xml-viewer/core'
import { showAuthorizationDate } from '../utils'

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
          return 'Cedula'
        case '04':
          return 'RUC'
        case '06':
          return 'Pasaporte'
        case '07':
          return 'Consumidor final'
        case '08':
          return 'Identificacion extranjera'
        case '09':
          return 'Placa'
      }
      break
    case 1:
      switch (type) {
        case '01':
          return 'FACTURA'
        case '04':
          return 'NOTA DE CREDITO'
        case '05':
          return 'NOTA DE DEBITO'
        case '06':
          return 'GUIA DE REMISION'
        case '07':
          return 'COMPROBANTE DE RETENCION'
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
  if (detalles.value.length === 0) return []
  const firstItem = detalles.value[0]
  const columns = ['#']
  if (firstItem.codigoPrincipal)
    columns.push('COD')
  if (firstItem.codigoAuxiliar)
    columns.push('COD.aux')
  if (firstItem.descripcion)
    columns.push('Descripcion')
  if (firstItem.cantidad)
    columns.push('CANT')
  if (firstItem.precioUnitario)
    columns.push('PVP')
  if (firstItem.descuento)
    columns.push('DESC')
  if (firstItem.precioTotalSinImpuesto)
    columns.push('TOTAL')
  return columns
}

function getColumnsTB() {
  const itemArray: any[] = []
  detalles.value.forEach((itemFirst, index) => {
    const columns = []
    columns.push({ valor: index + 1 })
    if (itemFirst.codigoPrincipal)
      columns.push({ valor: itemFirst.codigoPrincipal })
    if (itemFirst.codigoAuxiliar)
      columns.push({ valor: itemFirst.codigoAuxiliar })
    if (itemFirst.descripcion)
      columns.push({ valor: itemFirst.descripcion })
    if (itemFirst.cantidad)
      columns.push({ valor: itemFirst.cantidad, clase: 'text-right' })
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
    class="max-w-5xl mx-auto bg-default text-default m-1 rounded-md p-1 printContent print:mx-0 print:w-screen"
  >
    <div
      v-if="authorization"
      class="print:!hidden flex justify-end"
    >
      <div class="font-bold text-primary">
        Documento autorizado el {{ showAuthorizationDate(authorization) }}
      </div>
    </div>
    <headDoc
      :document="document"
      :logoUrl="logoUrl"
      :dateAuthorization="showAuthorizationDate(authorization)"
    />
    <div class="border border-default rounded-lg w-full mt-8 p-2">
      <div class="flex-none flex">
        <div class="font-bold pr-2">
          Razón Social / Nombres y Apellidos :
        </div>
        <div>
          {{ infoNotaCredito.razonSocialComprador }}
        </div>
        <div class="font-bold pr-2 mx-2">
          Identificacion :
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
      <div class="py-4">
        <hr class="border-default">
      </div>
      <div>
        <div class="flex gap-x-2">
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
            Fecha Emision (Comprobante a modificar) :
          </div>
          <div>
            {{ infoNotaCredito.fechaEmisionDocSustento }}
          </div>
        </div>
        <div class="flex justify-between items-center">
          <div class="font-bold pr-2">
            Razón de Modificación:
          </div>
          <div class="font-bold text-2xl">
            {{ infoNotaCredito.motivo }}
          </div>
          <div class="mx-10" />
        </div>
      </div>
    </div>
    <div class="border border-default rounded-lg w-full mt-8 p-1">
      <div class="overflow-x-auto">
        <table class="w-full table-bordered text-xs border border-default">
          <thead>
            <tr class="bg-muted">
              <th
                v-for="(tag, index) in getColumnsDT()"
                :key="index"
                class="border border-default p-1 text-left"
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
                class="break-words border border-default p-1"
                :class="valor.clase ? valor.clase : ''"
              >
                {{ valor.valor }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex justify-between gap-4 mt-2 p-1">
        <div class="border border-default rounded-lg w-1/2 p-2">
          <div class="text-center font-bold mb-1">
            Información Adicional
          </div>
          <div>
            <table
              v-if="infoAdicional && infoAdicional.length > 0"
              class="text-xs w-full table-fixed"
            >
              <tbody>
                <tr
                  v-for="(dt, index) in infoAdicional"
                  :key="index"
                >
                  <td class="break-words font-bold bg-muted p-1 border border-default w-[120px]">
                    {{ dt.name }}
                  </td>
                  <td class="break-words p-1 border border-default">
                    {{ dt.value }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="rounded-lg w-1/2">
          <tableSubtotals :data="document" />
        </div>
      </div>
    </div>
  </div>
</template>
