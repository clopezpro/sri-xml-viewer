<script setup lang="ts">
import { getTotals } from '@sri-xml-viewer/core'
import { formatToMoney } from '../utils'
const props = defineProps({
  data: {
    type: typeof Document !== 'undefined' ? Document : Object,
    required: true,
  },
})
</script>

<template>
  <!-- <div>
    <pre>{{ getTotals }}</pre>
  </div> -->
  <table class="w-full text-xs border border-accented">
    <tbody>
      <tr
        v-for="(dt, index) in getTotals(props.data)"
        :key="index"
      >
        <td class="text-right border pr-1 border-accented">
          {{ dt.name }}
        </td>
        <td
          class="w-24 border border-accented"
          style="text-align: right; padding-right: .25rem;"
        >
          {{
            formatToMoney(dt.valor, 'decimal')
          }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
