<script setup lang="ts">
import { ref, computed } from 'vue'

export interface ISriMessage {
  identificador?: string
  mensaje?: string
  tipo?: string
  informacionAdicional?: string
}

export interface ISriDebugResponse {
  success: boolean
  estado: string
  claveAcceso?: string
  numeroComprobantes?: string
  numeroAutorizacion?: string
  fechaAutorizacion?: string
  ambiente?: string
  mensajes?: ISriMessage[]
  rawXml?: string
  rawResponseData?: any
}

const props = defineProps<{
  response: ISriDebugResponse | null
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const copiedXml = ref(false)
const copiedJson = ref(false)
const copiedClave = ref(false)

const statusColor = computed(() => {
  if (!props.response) return 'neutral'
  switch (props.response.estado) {
    case 'AUTORIZADO':
      return 'success'
    case 'NO REGISTRADO':
      return 'warning'
    case 'NO AUTORIZADO':
    case 'DEVUELTA':
    case 'ERROR_CONEXION':
    case 'ERROR_SRI_CONEXION':
      return 'error'
    default:
      return 'neutral'
  }
})

const messages = computed<ISriMessage[]>(() => {
  return props.response?.mensajes || []
})

const rawXml = computed<string>(() => {
  return props.response?.rawXml || ''
})

const jsonFormatted = computed<string>(() => {
  if (!props.response) return ''
  const payload = props.response.rawResponseData ?? props.response
  try {
    return JSON.stringify(payload, null, 2)
  } catch {
    return String(payload)
  }
})

const tabs = computed(() => [
  {
    label: 'Mensajes del SRI',
    icon: 'i-carbon-notification',
    slot: 'messages',
    badge: messages.value.length ? String(messages.value.length) : undefined
  },
  {
    label: 'XML SOAP Crudo',
    icon: 'i-carbon-code',
    slot: 'rawXml'
  },
  {
    label: 'Estructura JSON',
    icon: 'i-carbon-data-structured',
    slot: 'json'
  }
])

function copyText(text: string, type: 'xml' | 'json' | 'clave') {
  if (!text) return
  navigator.clipboard.writeText(text).then(() => {
    if (type === 'xml') {
      copiedXml.value = true
      setTimeout(() => { copiedXml.value = false }, 2000)
    } else if (type === 'json') {
      copiedJson.value = true
      setTimeout(() => { copiedJson.value = false }, 2000)
    } else if (type === 'clave') {
      copiedClave.value = true
      setTimeout(() => { copiedClave.value = false }, 2000)
    }
  })
}

function downloadRawXml() {
  if (!rawXml.value) return
  const blob = new Blob([rawXml.value], { type: 'text/xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const filename = props.response?.claveAcceso
    ? `sri-raw-response-${props.response.claveAcceso}.xml`
    : 'sri-raw-response.xml'
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Respuesta del Web Service del SRI"
    description="Detalle técnico completo y contenido XML retornado por el servidor del SRI."
    :ui="{ content: 'sm:max-w-4xl' }"
  >
    <template #body>
      <div
        v-if="response"
        class="space-y-4"
      >
        <!-- Resumen de metadatos de la consulta -->
        <div class="p-3 bg-muted/50 border border-default rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span class="text-muted block text-[10px] uppercase font-bold tracking-wider">Estado SRI</span>
            <div class="mt-1">
              <UBadge
                :label="response.estado"
                :color="statusColor"
                variant="subtle"
                size="sm"
                class="font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <span class="text-muted block text-[10px] uppercase font-bold tracking-wider">Ambiente</span>
            <p class="font-semibold text-highlighted mt-1">
              {{ response.ambiente || 'No especificado' }}
            </p>
          </div>

          <div>
            <span class="text-muted block text-[10px] uppercase font-bold tracking-wider">Comprobantes Retornados</span>
            <p class="font-semibold text-highlighted mt-1">
              {{ response.numeroComprobantes ?? '0' }}
            </p>
          </div>

          <div>
            <span class="text-muted block text-[10px] uppercase font-bold tracking-wider">Fecha Autorización</span>
            <p class="font-semibold text-highlighted mt-1">
              {{ response.fechaAutorizacion || 'N/A' }}
            </p>
          </div>

          <div
            v-if="response.claveAcceso"
            class="sm:col-span-2 md:col-span-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-default"
          >
            <div class="min-w-0">
              <span class="text-muted block text-[10px] uppercase font-bold tracking-wider">Clave de Acceso Consultada</span>
              <span class="font-mono text-xs text-highlighted break-all select-all font-medium">
                {{ response.claveAcceso }}
              </span>
            </div>
            <UButton
              size="xs"
              variant="ghost"
              color="neutral"
              :icon="copiedClave ? 'i-carbon-checkmark' : 'i-carbon-copy'"
              :label="copiedClave ? 'Copiada' : 'Copiar clave'"
              @click="copyText(response.claveAcceso || '', 'clave')"
            />
          </div>
        </div>

        <!-- Pestañas de inspección técnica -->
        <UTabs
          :items="tabs"
          variant="pill"
          color="primary"
          class="w-full"
        >
          <!-- 1. Mensajes y Errores -->
          <template #messages>
            <div class="mt-3 space-y-3">
              <div
                v-if="messages.length === 0"
                class="py-8 text-center border border-dashed border-default rounded-xl space-y-2"
              >
                <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto text-muted">
                  <UIcon
                    name="i-carbon-checkmark"
                    class="w-4 h-4 text-success"
                  />
                </div>
                <p class="text-xs font-semibold text-highlighted">
                  Sin mensajes de error registrados
                </p>
                <p class="text-[11px] text-muted max-w-sm mx-auto">
                  El servidor del SRI no adjuntó bloques de mensajes o advertencias adicionales en su nodo de respuesta.
                </p>
              </div>

              <div
                v-for="(msg, idx) in messages"
                :key="idx"
                class="p-3 rounded-xl border border-default bg-default space-y-2 text-xs"
              >
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <div class="flex items-center gap-1.5">
                    <UBadge
                      :label="msg.tipo || 'MENSAJE'"
                      :color="msg.tipo === 'ERROR' ? 'error' : msg.tipo === 'ALERTA' ? 'warning' : 'info'"
                      size="xs"
                      variant="subtle"
                      class="font-mono font-bold"
                    />
                    <span
                      v-if="msg.identificador"
                      class="font-mono font-bold text-muted"
                    >
                      [Código: {{ msg.identificador }}]
                    </span>
                  </div>
                </div>

                <p class="text-default font-medium leading-relaxed">
                  {{ msg.mensaje }}
                </p>

                <div
                  v-if="msg.informacionAdicional"
                  class="p-2 rounded-lg bg-muted/60 border border-default text-[11px] font-mono text-muted break-words"
                >
                  <span class="font-bold text-highlighted block mb-0.5">Información adicional SRI:</span>
                  {{ msg.informacionAdicional }}
                </div>
              </div>
            </div>
          </template>

          <!-- 2. XML SOAP Crudo -->
          <template #rawXml>
            <div class="mt-3 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[11px] text-muted font-mono">
                  Longitud: {{ rawXml.length.toLocaleString() }} caracteres
                </span>
                <div class="flex items-center gap-1.5">
                  <UButton
                    size="xs"
                    variant="soft"
                    color="neutral"
                    :icon="copiedXml ? 'i-carbon-checkmark' : 'i-carbon-copy'"
                    :label="copiedXml ? 'Copiado' : 'Copiar XML'"
                    :disabled="!rawXml"
                    @click="copyText(rawXml, 'xml')"
                  />
                  <UButton
                    size="xs"
                    variant="soft"
                    color="primary"
                    icon="i-carbon-download"
                    label="Descargar XML"
                    :disabled="!rawXml"
                    @click="downloadRawXml"
                  />
                </div>
              </div>

              <div
                v-if="rawXml"
                class="rounded-xl border border-default overflow-hidden bg-muted/40"
              >
                <pre class="p-3 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-[380px] whitespace-pre-wrap break-all text-default select-all"><code>{{ rawXml }}</code></pre>
              </div>

              <div
                v-else
                class="py-8 text-center border border-dashed border-default rounded-xl text-xs text-muted"
              >
                No se recibió un payload XML en bruto en esta respuesta.
              </div>
            </div>
          </template>

          <!-- 3. Estructura JSON -->
          <template #json>
            <div class="mt-3 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[11px] text-muted font-mono">
                  Estructura deserializada
                </span>
                <UButton
                  size="xs"
                  variant="soft"
                  color="neutral"
                  :icon="copiedJson ? 'i-carbon-checkmark' : 'i-carbon-copy'"
                  :label="copiedJson ? 'Copiado' : 'Copiar JSON'"
                  :disabled="!jsonFormatted"
                  @click="copyText(jsonFormatted, 'json')"
                />
              </div>

              <div
                v-if="jsonFormatted"
                class="rounded-xl border border-default overflow-hidden bg-muted/40"
              >
                <pre class="p-3 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-[380px] whitespace-pre-wrap break-all text-default select-all"><code>{{ jsonFormatted }}</code></pre>
              </div>
            </div>
          </template>
        </UTabs>
      </div>

      <div
        v-else
        class="py-8 text-center text-xs text-muted"
      >
        No hay datos de respuesta disponibles para mostrar.
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end w-full">
        <UButton
          color="neutral"
          variant="outline"
          label="Cerrar"
          @click="isOpen = false"
        />
      </div>
    </template>
  </UModal>
</template>
