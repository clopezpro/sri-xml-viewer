<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import JsBarcode from 'jsbarcode'

const props = defineProps({
  text: {
    type: String,
    required: false,
  },
})
const text = computed(() => props.text)
const canvas = ref(null)
const options = {
  format: 'CODE128',
  lineColor: '#000',
  width: 2,
  height: 100,
  displayValue: false,
  fontOptions: '',
  font: 'monospace',
  textAlign: 'center',
  textPosition: 'bottom',
  textMargin: 2,
  fontSize: 20,
  background: '#fff',
  margin: 10,
  marginTop: undefined,
  marginBottom: undefined,
  marginLeft: undefined,
  marginRight: undefined,
}
function generate() {
  JsBarcode(canvas.value, text.value || '', options)
}
onMounted(() => {
  generate()
})
watch(() => props.text, () => {
  generate()
})
</script>

<template>
  <svg
    v-if="text"
    id="canvas"
    ref="canvas"
    class="flex flex-col items-center justify-center w-full h-full"
    viewbox="0 0 210 500"
    preserveAspectRatio="none"
  />
</template>
