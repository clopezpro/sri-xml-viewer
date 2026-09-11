<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  type IStoredComprobante,
  getTipoComprobanteLabel
} from '../composables/useComprobantesDb'

const props = defineProps<{
  items: IStoredComprobante[]
}>()

const emit = defineEmits<{
  load: [item: IStoredComprobante]
  remove: [claveAcceso: string]
  clear: []
}>()

const isOpen = ref(false)
const searchQuery = ref('')

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return props.items

  return props.items.filter((item) => {
    const label = getTipoComprobanteLabel(item.tipoComprobante).toLowerCase()
    const clave = item.claveAcceso.toLowerCase()
    const ambiente = (item.ambiente || '').toLowerCase()
    return label.includes(query) || clave.includes(query) || ambiente.includes(query)
  })
})

function handleSelect(item: IStoredComprobante) {
  emit('load', item)
  isOpen.value = false
}

function handleClear() {
  if (confirm('¿Estás seguro de que deseas eliminar todos los comprobantes guardados en este navegador?')) {
    emit('clear')
  }
}
</script>

<template>
  <UTooltip
    :text="items.length > 0 ? `Historial local (${items.length} comprobante${items.length === 1 ? '' : 's'})` : 'Historial local (0 comprobantes)'"
    placement="bottom"
  >
    <UButton
      icon="i-carbon-catalog"
      color="neutral"
      variant="outline"
      aria-label="Historial local de comprobantes"
      @click="isOpen = true"
    >
      <UBadge
        :label="String(items.length)"
        size="xs"
        variant="subtle"
        :color="items.length > 0 ? 'primary' : 'neutral'"
        class="px-1 py-0 min-w-4 text-[10px]"
      />
    </UButton>
  </UTooltip>

  <UModal
    v-model:open="isOpen"
    title="Historial Local de Comprobantes"
    description="Comprobantes autorizados por el SRI almacenados en la memoria de este navegador."
  >
    <template #body>
      <div class="space-y-4">
        <!-- Declaración explícita de privacidad / almacenamiento local -->
        <div class="p-3 bg-info/10 border border-info/20 rounded-xl flex items-start gap-2.5 text-xs text-default">
          <UIcon
            name="i-carbon-security"
            class="w-4 h-4 text-info shrink-0 mt-0.5"
          />
          <div class="space-y-1">
            <p class="font-bold text-highlighted">
              Almacenamiento exclusivo en este navegador
            </p>
            <p class="text-muted leading-relaxed">
              Estos archivos están guardados únicamente de forma local en la memoria de su navegador (IndexedDB). No se encuentran en ninguna base de datos externa ni se transmiten a servidores de terceros.
            </p>
          </div>
        </div>

        <!-- Filtro si hay más de 4 elementos -->
        <div v-if="items.length > 4">
          <UInput
            v-model="searchQuery"
            icon="i-carbon-search"
            placeholder="Filtrar por clave de acceso, tipo o ambiente..."
            size="sm"
            class="w-full"
          />
        </div>

        <!-- Estado vacío -->
        <div
          v-if="items.length === 0"
          class="py-8 text-center space-y-2 border border-dashed border-default rounded-xl"
        >
          <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted">
            <UIcon
              name="i-carbon-document-blank"
              class="w-5 h-5"
            />
          </div>
          <p class="text-sm font-semibold text-highlighted">
            No hay comprobantes guardados
          </p>
          <p class="text-xs text-muted max-w-xs mx-auto">
            Los comprobantes que consultes por clave de acceso o cargues se guardarán automáticamente aquí.
          </p>
        </div>

        <!-- Sin resultados de filtro -->
        <div
          v-else-if="filteredItems.length === 0"
          class="py-6 text-center text-xs text-muted"
        >
          No se encontraron comprobantes que coincidan con la búsqueda.
        </div>

        <!-- Lista de comprobantes -->
        <div
          v-else
          class="max-h-80 overflow-y-auto space-y-2 pr-1 text-xs"
        >
          <div
            v-for="item in filteredItems"
            :key="item.claveAcceso"
            class="p-2.5 bg-muted/40 hover:bg-muted/80 border border-default rounded-xl flex items-center justify-between gap-3 transition-colors"
          >
            <div
              class="min-w-0 flex-1 cursor-pointer"
              @click="handleSelect(item)"
            >
              <div class="flex items-center gap-1.5 mb-1 flex-wrap">
                <UBadge
                  size="xs"
                  variant="outline"
                  color="neutral"
                >
                  {{ getTipoComprobanteLabel(item.tipoComprobante) }}
                </UBadge>
                <UBadge
                  v-if="item.ambiente"
                  size="xs"
                  variant="subtle"
                  :color="item.ambiente.toUpperCase().includes('PROD') ? 'success' : 'warning'"
                >
                  {{ item.ambiente }}
                </UBadge>
                <span class="text-[10px] text-muted">
                  {{ new Date(item.createdAt).toLocaleDateString() }} {{ new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                </span>
              </div>
              <p
                class="font-mono text-[11px] text-dimmed truncate select-all"
                :title="item.claveAcceso"
              >
                {{ item.claveAcceso }}
              </p>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <UButton
                size="xs"
                icon="i-carbon-play"
                variant="soft"
                color="primary"
                title="Cargar comprobante"
                label="Cargar"
                @click="handleSelect(item)"
              />
              <UButton
                size="xs"
                icon="i-carbon-trash-can"
                variant="ghost"
                color="error"
                title="Eliminar de IndexedDB"
                aria-label="Eliminar"
                @click="emit('remove', item.claveAcceso)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <span class="text-xs text-muted">
          Total: <strong class="text-highlighted">{{ items.length }}</strong> comprobante{{ items.length === 1 ? '' : 's' }}
        </span>

        <div class="flex items-center gap-2">
          <UButton
            v-if="items.length > 0"
            size="xs"
            variant="ghost"
            color="error"
            icon="i-carbon-trash-can"
            label="Vaciar todo"
            @click="handleClear"
          />
          <UButton
            size="xs"
            variant="outline"
            color="neutral"
            label="Cerrar"
            @click="isOpen = false"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
