<script setup lang="ts">
import { computed, toRefs } from 'vue'
import BarCode from './barCode.vue'
import { getDataAccessKey } from '@sri-xml-viewer/core'
import { showDateFormat } from '../utils'

const props = defineProps({
  document: {
    type: typeof Document !== 'undefined' ? Document : Object,
    required: true,
  },
  dateAuthorization: {
    type: String || undefined,
    default: undefined,
  },
  logoUrl: {
    type: String,
    required: false,
    default: undefined,
  },
})

const infoTributaria = computed(() => {
  const doc = props.document
  const data = doc?.getElementsByTagName('infoTributaria') as any
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
const nameDoc = computed(() => {
  if (infoTributaria.value?.claveAcceso) {
    const keyData = getDataAccessKey(infoTributaria.value?.claveAcceso)
    if (keyData)
      return keyData.typeWithName
    return ''
  }
  return ''
})
const infoDoc = computed(() => {
  const doc = props.document
  if (!doc) return {}

  // Buscar el primer nodo que coincida con alguno de los bloques de información del SRI
  const tags = ['infoFactura', 'infoNotaCredito', 'infoGuiaRemision', 'infoCompRetencion']
  let data: HTMLCollectionOf<Element> | null = null

  for (const tag of tags) {
    const found = doc.getElementsByTagName(tag)
    if (found && found.length > 0) {
      data = found
      break
    }
  }

  if (!data)
    return {}

  const result: Record<string, string> = {}

  const firstElement = data.item(0)?.children // Obtiene el primer elemento
  if (firstElement) {
    for (let i = 0; i < firstElement.length; i++) {
      const child = firstElement[i]
      if (child?.tagName)
        result[child.tagName] = child.textContent || ''
    }
  }

  return result
})

const mode = computed(() => {
  if (infoTributaria.value?.claveAcceso) {
    const keyData = getDataAccessKey(infoTributaria.value?.claveAcceso)
    if (keyData)
      return keyData.mode === '2' ? 'PRODUCCIÓN' : 'PRUEBAS'
  }
  return ''
})
/* if (infoTributaria.value?.claveAcceso) {
  const keyData = getKeyData(infoTributaria.value?.claveAcceso)
  if (keyData)
    mode.value = keyData.mode === '2' ? 'PRODUCCIÓN' : 'PRUEBAS'
} */
</script>

<template>
  <div class="grid grid-cols-2 gap-1">
    <div class="flex flex-col justify-between  m-1">
      <div class="flex items-center p-1 flex-1">
        <div
          v-if="!logoUrl"
          class="text-error font-bold text-4xl text-center w-full"
        >
          NO TIENE LOGO
        </div>
        <img
          v-else
          :src="logoUrl"
          alt="Logo"
          class="w-full h-full object-contain"
        >
      </div>
      <div class="w-full border border-default rounded-lg">
        <div
          v-if="infoTributaria.nombreComercial"
          class="text-center"
        >
          <strong>{{
            infoTributaria.nombreComercial
          }}</strong>
        </div>
        <div class="text-center text-2xl">
          <strong>{{
            infoTributaria.razonSocial
          }}</strong>
        </div>
        <div class="text-xs">
          <div class="flex-none flex">
            <div class="font-bold pr-2">
              Dirección Matriz
            </div>
            <div>{{ infoTributaria.dirMatriz }}</div>
          </div>
          <div
            v-if="infoDoc.dirEstablecimiento"
            class="flex-none flex pr-2"
          >
            <div class="font-bold pr-2">
              Dirección Sucursal
            </div>
            <div>
              {{ infoDoc.dirEstablecimiento }}
            </div>
          </div>
          <div
            v-if="infoDoc.contribuyenteEspecial"
            class="flex"
          >
            <div class="pr-1 font-bold">
              CONTRIBUYENTE ESPECIAL
            </div>
            <div>
              {{ infoDoc.contribuyenteEspecial }}
            </div>
          </div>
          <div
            class="flex gap-2"
          >
            <div class="pr-1 font-bold">
              OBLIGADO A LLEVAR CONTABILIDAD
            </div>
            <div>
              {{ infoDoc.obligadoContabilidad }}
            </div>
          </div>
          <div
            v-if="infoTributaria.agenteRetencion"
            class="text-center w-full"
          >
            <span class="pr-1 font-bold">Agente de Retencion</span>
            <span class="pr-1 font-bold text-error">
              Nº {{ infoTributaria.agenteRetencion }}
            </span>
          </div>
          <div
            v-if="infoTributaria.contribuyenteRimpe"
            class="flex w-full justify-center bg-accented p-2 mb-1"
          >
            <span class="pr-1 font-bold">
              <template
                v-if="infoTributaria.contribuyenteRimpe === 'CONTRIBUYENTE RÉGIMEN RIMPE'"
              >
                CONTRIBUYENTE RÉGIMEN RIMPE
              </template>
              <template
                v-else
              >
                {{ infoTributaria.contribuyenteRimpe }}
              </template>
            </span>
          </div>
          <div
            v-else-if="!infoTributaria.contribuyenteEspecial"
            class="flex w-full justify-center bg-accented rounded-lg p-2 mb-1"
          >
            <span class="pr-1 font-bold">
              CONTRIBUYENTE RÉGIMEN GENERAL
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="border border-default rounded-lg  m-1  p-2">
      <div>
        <strong> <span class="text-2xl"> R.U.C </span> <span class="mx-4 text-2xl">{{ infoTributaria.ruc }}</span></strong>
      </div>
      <div class="text-center text-3xl bg-accented">
        <strong>{{ nameDoc }}</strong>
      </div>
      <div class="text-sm">
        <div>
          <div class="font-bold">
            NUMERO COMPROBANTE
          </div>
          <div class="text-center text-2xl">
            {{ infoTributaria.estab }}-{{ infoTributaria.ptoEmi }}-{{ infoTributaria.secuencial }}
          </div>
        </div>
        <div class="font-bold">
          NUMERO DE AUTORIZACIÓN
        </div>
        <div class="text-center text-clave text-xs">
          {{ infoTributaria.claveAcceso }}
        </div>
        <div
          v-if="dateAuthorization"
          class="flex gap-2"
        >
          <div class="font-bold pr-2">
            FECHA AUTORIZACIÓN
          </div>
          <div>{{ dateAuthorization }}</div>
        </div>
        <div class="flex gap-2">
          <div class="font-bold pr-2">
            AMBIENTE
          </div>
          <div>{{ mode }}</div>
        </div>
        <div class="flex gap-2">
          <div class="font-bold pr-2">
            EMISIÓN
          </div>
          <div>
            {{
              infoTributaria.tipoEmision === "1"
                ? "NORMAL"
                : "ERROR"
            }}
          </div>
        </div>
        <div class="text-center font-bold">
          CLAVE DE ACCESO
        </div>
        <div class="text-center text-clave text-xs">
          {{ infoTributaria.claveAcceso }}
        </div>
        <div class="w-full p-2">
          <BarCode
            class="flex-1 barcode"
            :text="infoTributaria.claveAcceso"
          />
          <div id="barcode" />
        </div>
      </div>
    </div>
  </div>
</template>
