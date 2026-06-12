# SRI XML Viewer 🇪🇨

Monorepo con herramientas y componentes en **Vue 3** y **React** para procesar, validar, renderizar e imprimir comprobantes electrónicos autorizados por el **SRI (Servicio de Rentas Internas de Ecuador)**. 

Soporta comprobantes de tipo:
- Facturas (01)
- Notas de Crédito (04)
- Notas de Débito (05)
- Guías de Remisión (06)
- Comprobantes de Retención (07)

---

## 🚀 Instalación

Puedes instalar los paquetes desde tu gestor de dependencias preferido (`npm`, `pnpm` o `yarn`):

```bash
# Para aplicaciones Vue 3 o Nuxt 3/4
pnpm add @sri-xml-viewer/vue @sri-xml-viewer/core

# Para aplicaciones React
pnpm add @sri-xml-viewer/react @sri-xml-viewer/core
```

---

## 💻 Uso en Nuxt / Vue 3

A continuación, se detalla cómo implementar un modal de vista previa premium  que incluye carga de logo, descarga del XML original, impresión a PDF.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VisorXml } from '@sri-xml-viewer/vue'
/**
 * si no usas tailwindcss
 * import '@sri-xml-viewer/vue/standalone.css'
 * si usas tailwincss y no usas nuxt-ui
 * en el archivo main.css o en donde importes tailwindcss
 * @import "tailwindcss";
 * @import "@sri-xml-viewer/vue/theme.css";
 */
// si usas nuxt-ui no importes ningun css


// XML original autorizado obtenido del SRI o tu base de datos (formato SRI)
const xmlString = ref(`...`) 

</script>

<template>
  <div class="p-6">
    <VisorXml 
      v-if="xmlString" 
      :xml="xmlString" 
    />
  </div>
</template>
