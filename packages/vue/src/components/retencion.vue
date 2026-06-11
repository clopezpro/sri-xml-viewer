<script setup lang="ts">
import { computed } from 'vue'
import { getInfoAdicional, nameCodeRetention } from '@sri-xml-viewer/core'
import { formatToMoney, roundTo } from '../utils'
import headDoc from './headDoc.vue'

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
})
const getVersion = computed(() => {
  return props.document?.getElementsByTagName('comprobanteRetencion').item(0)?.getAttribute('version')
})
const infoAdicional = getInfoAdicional(props.document)
function nameCode(code: string) {
  return nameCodeRetention(code)
}
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
          return 'IVA'
        case '1':
          return 'RENTA'
      }
  }
}
function getColumsDT() {
  const colums = [
    '#',
    'TIPO',
    'CODIGO',
    'PORCENTAJE',
    'BASE IMPONIBLE',
    'VALOR',
  ]
  return colums
}
function getColumsDTV1() {
  const colums = [
    'Comprobante',
    'Número',
    'Fecha Emisión',
    'Ejercicio Fiscal',
    'Base Imponible para la Retención',
    'Impuesto',
    'Porcentaje Retención',
    'Valor Retenido',
  ]
  return colums
}
function showMeNumber(text: string) {
  const number1 = text.substring(0, 3)
  const number2 = text.substring(3, 6)
  const number3 = text.substring(6, 15)

  return `${number1}-${number2}-${number3}`
}
function showFormaPago(pagos: { formaPago: string, total: string, plazo: string, unidadTiempo: string }[]) {
  const paymentType = [
    {
      name: 'SIN UTILIZACION DEL SISTEMA FINANCIERO',
      value: '01',
    },
    {
      name: 'COMPENSACIÓN DE DEUDAS',
      value: '15',
    },
    {
      name: 'TARJETA DE DÉBITO',
      value: '16',
    },
    {
      name: 'DINERO ELECTRÓNICO',
      value: '17',
    },
    {
      name: 'TARJETA PREPAGO',
      value: '18',
    },
    {
      name: 'TARJETA DE CRÉDITO',
      value: '19',
    },
    {
      name: 'OTROS CON UTILIZACION DEL SISTEMA FINANCIERO',
      value: '20',
    },
    {
      name: 'ENDOSO DE TÍTULOS',
      value: '21',
    },
  ]

  const dataPay = pagos.map((rs) => {
    return {
      formaPago: paymentType.find(p => p.value === rs.formaPago)?.name || '',
      total: rs.total,
      plazo: rs.plazo ? rs.plazo || 0 : 0,
      unidadTiempo: rs.unidadTiempo ? rs.unidadTiempo || 0 : 0,
    }
  })
  return dataPay
}
function showTax(taxs: { codImpuestoDocSustento: string, codigoPorcentaje: string, tarifa: string, baseImponible: string, valorImpuesto: string }[]) {
  const taxType = [
    {
      name: 'IVA',
      value: '2',
    },
    {
      name: 'ICE',
      value: '3',
    },
    {
      name: 'IRBPNR',
      value: '5',
    },
  ]
  const typePor = [
    {
      name: '0%',
      value: '0',
    },
    {
      name: 'IVA 12% ',
      value: '2',
    },
    {
      name: 'IVA 15% ',
      value: '7',
    },
    {
      name: 'IVA 5% ',
      value: '6',
    },
    {
      name: 'IVA 5% ',
      value: '6',
    },
    {
      name: 'IVA 14%',
      value: '3',
    },
    {
      name: 'No Objeto de Impuesto',
      value: '6',
    },
    {
      name: 'Exento de IVA',
      value: '7',
    },
  ]

  const dataTax = taxs.map((rs) => {
    return {
      typeTax: taxType.find(p => p.value === rs.codImpuestoDocSustento)?.name || '',
      typePor: typePor.find(p => p.value === rs.codigoPorcentaje)?.name || '',
      tarifa: rs.tarifa,
      baseImponible: rs.baseImponible,
      valor: rs.valorImpuesto,
    }
  })
  return dataTax
}
const getDetailsV1 = computed(() => {
  const doc = props.document
  if (!doc)
    return []

  const data = doc.getElementsByTagName('impuesto') // Obtiene cada impuesto
  const result = []

  for (let i = 0; i < data.length; i++) {
    const impuesto = data[i]
    const obj: Record<string, string> = {}

    if (!impuesto)
      continue
    for (let j = 0; j < impuesto.children.length; j++) {
      const child = impuesto.children[j]
      if (child) {
        obj[child.tagName] = child.textContent || ''
      }
    }

    result.push(obj)
  }

  return result
})
const getDetailsV2 = computed(() => {
  const doc = props.document
  if (!doc)
    return []

  const data = doc.getElementsByTagName('docSustento') // Obtiene cada documento de sustento
  const result = []

  for (let i = 0; i < data.length; i++) {
    const docSustento = data[i]
    const obj: Record<string, string> = {}

    // Extraer valores directos de docSustento
    if (!docSustento)
      continue
    for (let j = 0; j < docSustento.children.length; j++) {
      const child = docSustento.children[j]

      if (child && (child.tagName === 'impuestosDocSustento' || child.tagName === 'retenciones' || child.tagName === 'pagos')) {
        // Procesar nodos anidados en arrays
        obj[child.tagName] = []
        for (let k = 0; k < child.children.length; k++) {
          const subChild = child.children[k]
          if (!subChild)
            continue
          const subObj: Record<string, string> = {}
          for (let l = 0; l < subChild.children.length; l++) {
            const subSubChild = subChild.children[l]
            if (!subSubChild)
              continue
            subObj[subSubChild.tagName] = subSubChild.textContent || ''
          }
          obj[child.tagName].push(subObj)
        }
      }
      else {
        if (child)
          obj[child.tagName] = child.textContent || ''
      }
    }

    result.push(obj)
  }

  return result
})

const getTotalRtV1 = computed(() => {
  const detail = getDetailsV1.value
  let total = 0
  detail.forEach((rs) => {
    total += Number.parseFloat(rs.valorRetenido || '0')
  })
  return roundTo(total, 2)
})

const getTotalRtV2 = computed(() => {
  const detail = getDetailsV2.value
  let total = 0
  detail.forEach((rs) => {
    rs.retenciones.forEach((rt: { valorRetenido: string }) => {
      total += Number.parseFloat(rt.valorRetenido)
    })
  })
  return roundTo(total, 2)
})
const infoRetention = computed(() => {
  const doc = props.document
  const data = doc?.getElementsByTagName('infoCompRetencion')
  if (!data)
    return {}

  const result: Record<string, string> = {}

  const firstElement = data.item(0)?.children // Obtiene el primer elemento
  if (firstElement) {
    for (let i = 0; i < firstElement.length; i++) {
      const child = firstElement[i]
      if (child?.tagName)
        result[child.tagName || 'na'] = child.textContent || ''
    }
  }

  return result
})
</script>

<template>
  <div

    class="text-xs flex flex-col gap-1 max-w-5xl mx-auto  bg-gray-50 text-black m-1 rounded-md p-1 printContent print:mx-0 print:w-full"
  >
    <div
      v-if="authorization"
      class="print:hidden flex justify-end"
    >
      <div class="font-bold text-green-700">
        Documento autorizado el {{ authorization }}
      </div>
    </div>
    <headDoc
      :document="document"
      :dateAuthorization="authorization"
    />
    <div class="flex mt-5 ">
      <div class="border rounded-lg w-full">
        <div class="flex-none flex">
          <div class="font-bold pr-2">
            Razón Social / Nombres y Apellidos :
          </div>
          <div>
            {{ infoRetention.razonSocialSujetoRetenido }}
          </div>
        </div>
        <div class="flex-none flex">
          <div class="font-bold pr-2">
            Identificación:
          </div>
          <div>
            {{ infoRetention.identificacionSujetoRetenido }}
          </div>
          <div class="mx-2 font-bold">
            ({{
              showTypeDoc(
                infoRetention.tipoIdentificacionSujetoRetenido,
              )
            }})
          </div>
        </div>

        <div class="flex-none flex">
          <div class="font-bold pr-2">
            FECHA EMISION:
          </div>
          <div>{{ infoRetention.fechaEmision }}</div>
          <div class="font-bold pr-2 pl-4">
            Es obligado a llevar Contablilidad:
          </div>
          <div v-if="infoRetention.obligadoContabilidad">
            {{ infoRetention.obligadoContabilidad }}
          </div>
          <div class="font-bold pr-2 pl-4">
            Parte Relacionada:
          </div>
          <div>
            {{ infoRetention.parteRel ?? 'NO' }}
          </div>
          <div class="font-bold pr-2 pl-4">
            Periodo Fiscal:
          </div>
          <div v-if="infoRetention.periodoFiscal">
            {{ infoRetention.periodoFiscal }}
          </div>
        </div>

        <div v-if="getVersion === '2.0.0'">
          <div
            v-for="(docSustento, key) in getDetailsV2"
            :key="key"
            class="border border-gray-500 mt-4"
          >
            <div class="text-center font-bold italic">
              DATOS DOCUMENTOS DE SUSTENTO  V2.0.0
            </div>
            <div class="flex gap-2">
              <div class="flex gap-2">
                <div class="flex gap-2">
                  <div class="font-bold">
                    {{
                      showTypeDoc(docSustento.codDocSustento, 1)
                    }}
                  </div>
                  <div class=" px-2 rounded-md border bg-gray-300">
                    {{
                      showMeNumber(docSustento.numDocSustento as string)
                    }}
                  </div>
                </div>
                <div
                  v-if="docSustento.numAutDocSustento"
                  class="flex mx-4"
                >
                  <div class="font-bold">
                    Numero Autorización:
                  </div>
                  <div>
                    {{ docSustento.numAutDocSustento }}
                  </div>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <div>
                <div class="font-bold">
                  Fecha Emisión:
                </div>
                <div class="text-center">
                  {{ docSustento.fechaEmisionDocSustento }}
                </div>
              </div>
              <div v-if="docSustento.fechaRegistroContable">
                <div class="font-bold">
                  Fecha Registro Contable:
                </div>
                <div class="text-center">
                  {{ docSustento.fechaRegistroContable }}
                </div>
              </div>
              <div>
                <div class="font-bold">
                  Pago a Residente:
                </div>
                <div class="text-center">
                  {{ docSustento.pagoLocExt === '01' ? 'SI' : 'NO' }}
                </div>
              </div>

              <div>
                <div class="font-bold">
                  Total Sin impuestos:
                </div>
                <div class="text-center">
                  {{ docSustento.totalSinImpuestos }}
                </div>
              </div>
              <div>
                <div class="font-bold">
                  Importe Total:
                </div>
                <div class="text-center">
                  {{ docSustento.importeTotal }}
                </div>
              </div>
            </div>
            <div class=" hidden">
              <div class="w-full">
                <div class="text-center">
                  FORMAS DE PAGOS
                </div>
                <table
                  v-if="docSustento.pagos.pago"
                  class="w-full text-xs"
                >
                  <thead>
                    <tr>
                      <th class="border">
                        TIPO
                      </th>
                      <th class="border">
                        VALOR
                      </th>
                      <th class="border">
                        PAZO
                      </th>
                      <th class="border">
                        TIEMPO
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(dt, index) in showFormaPago(
                        docSustento.pagos.pago,
                      )"
                      :key="index"
                    >
                      <td class="border text-center">
                        {{ dt.formaPago }}
                      </td>
                      <td class="border text-right">
                        {{ dt.total }}
                      </td>
                      <td class="border text-right">
                        {{ dt.plazo }}
                      </td>
                      <td class="border">
                        {{ dt.unidadTiempo }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="w-full">
                <div class="text-center">
                  Detalle Impuestos Doc de Sustento
                </div>
                <table
                  v-if="docSustento?.pagos?.pago"
                  class="w-full text-xs"
                >
                  <tbody>
                    <tr
                      v-for="(dt, index) in showTax(
                        docSustento.impuestosDocSustento
                          .impuestoDocSustento,
                      )"
                      :key="index"
                    >
                      <td class="border text-right">
                        {{ dt.typePor }}
                      </td>
                      <td class="border text-right">
                        {{ dt.baseImponible }}
                      </td>
                      <td class="border text-right">
                        {{ dt.valor }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <div class="px-4 pt-4 ">
                <div
                  border
                  border-gray-500
                  mb-2
                >
                  <table class="w-full table-bordered text-xs ">
                    <thead>
                      <tr>
                        <td
                          class="text-center font-bold"
                          :colspan="getColumsDT().length"
                        >
                          DETALLES DE LA RETENCION
                        </td>
                      </tr>
                      <tr>
                        <th
                          v-for="(tag, index) in getColumsDT()"
                          :key="index"
                          class="border"
                        >
                          {{ tag }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(dt, index) in docSustento.retenciones"
                        :key="index"
                      >
                        <td class="break-words border">
                          {{ index + 1 }}
                        </td>
                        <td class="break-words border text-center">
                          {{ showTypeDoc(dt.codigo, 2) }}
                        </td>
                        <td class="break-words border">
                          {{ nameCode(dt.codigoRetencion) }}
                        </td>
                        <td class="break-words border text-right">
                          %{{ dt.porcentajeRetener }}
                        </td>
                        <td class="break-words border text-right">
                          {{ dt.baseImponible }}
                        </td>
                        <td class="break-words border text-right">
                          {{ dt.valorRetenido }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="5" />
                        <td class="text-right">
                          TOTAL RETENIDO
                          <span class="px-2  bg-gray-300">
                            {{ formatToMoney(getTotalRtV2) }}

                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <!-- <div

            class="text-right font-bold p-4"
          >
            TOTAL
            <span class="px-2 rounded-md border bg-gray-300">
              {{ showTotalRTV2() }}

            </span>
          </div> -->
        </div>
        <div
          v-if="getVersion === '1.0.0'"
          class="border border-gray-500 mt-4"
        >
          <div
            border
            border-gray-500
            mb-2
          >
            <table class="w-full table-bordered text-xs ">
              <thead>
                <tr>
                  <td
                    class="text-center font-bold"
                    :colspan="getColumsDTV1().length"
                  >
                    DETALLES DE LA RETENCION  V1
                  </td>
                </tr>
                <tr>
                  <th
                    v-for="(tag, index) in getColumsDTV1()"
                    :key="index"
                    class="border"
                  >
                    {{ tag }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(dt, index) in getDetailsV1"
                  :key="index"
                >
                  <td class="break-words border text-center">
                    {{
                      showTypeDoc(dt.codDocSustento, 1)
                    }}
                  </td>

                  <td class="break-words border text-center">
                    {{ showMeNumber(dt.numDocSustento as string) }}
                  </td>
                  <td class="break-words border">
                    {{ dt.fechaEmisionDocSustento }}
                  </td>
                  <td class="break-words border">
                    {{ infoRetention.periodoFiscal }}
                  </td>
                  <td class="break-words border text-right">
                    {{ dt.baseImponible }}
                  </td>
                  <td class="break-words border text-right">
                    {{
                      showTypeDoc(dt.codigo, 2)
                    }}
                    {{ dt.codigoRetencion }}
                  </td>
                  <td class="break-words border text-right">
                    %{{ dt.porcentajeRetener }}
                  </td>
                  <td class="break-words border text-right">
                    {{ dt.valorRetenido }}
                  </td>
                </tr>
                <tr>
                  <td colspan="7" />
                  <td class="text-right">
                    TOTAL RETENIDO
                    <span class="px-2  bg-gray-300">
                      {{ getTotalRtV1 }}

                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="p-8">
          <div class="border rounded-lg w-full mt-2">
            <div class="text-center text-lg font-bold">
              INFORMACIÓN ADICIONAL
            </div>
            <div>
              <table
                v-if="infoAdicional"
                class="text-xs w-full table-fixed"
              >
                <tbody>
                  <tr
                    v-for="(dt, index) in infoAdicional"
                    :key="index"
                  >
                    <td class="w-1/3 break-words">
                      {{ dt.name }}
                    </td>
                    <td class="w-full break-words">
                      {{ dt.value }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
