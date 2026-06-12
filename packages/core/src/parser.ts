import { typesIvaFee, typesPaymentSRI, typeDocument, typeRtFee } from './constants'
import type { IDataKey, Detail, Taxes, Tax, AdditionalDetails, Payment, IFullInvoiceData, ITotal } from './types/general'

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'

export function parseXmlString(xml: string): Document {
  let cleanXml = (xml || '').trim()
  const firstLT = cleanXml.indexOf('<')
  if (firstLT > 0) {
    cleanXml = cleanXml.substring(firstLT)
  }
  if (isBrowser) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(cleanXml, 'text/xml')
    if (doc.getElementsByTagName('parsererror').length > 0) {
      throw new Error(doc.getElementsByTagName('parsererror')[0]?.textContent || 'Error de parseo de XML')
    }
    return doc
  } else {
    const GlobalDOMParser = (globalThis as any).DOMParser
    if (GlobalDOMParser) {
      const parser = new GlobalDOMParser()
      return parser.parseFromString(cleanXml, 'text/xml')
    }
    throw new Error('DOMParser no está disponible globalmente. Para entornos SSR / Node.js, por favor define globalThis.DOMParser usando una librería como @xmldom/xmldom.')
  }
}

export function getDataAccessKey(key: string): IDataKey {
  let emissionDate = ''
  let identify = ''
  let numero_doc = key.slice(24, 39)
  let type = ''
  let mode = null
  type = key.slice(8, 10)
  identify = key.slice(10, 23)
  mode = key.slice(23, 24)

  emissionDate = key.slice(0, 8)
  emissionDate = `${emissionDate.slice(0, 2)}/${emissionDate.slice(2, 4)}/${emissionDate.slice(4, 8)}`
  numero_doc = `${numero_doc.slice(0, 3)}-${numero_doc.slice(3, 6)}-${numero_doc.slice(6, 15)}`
  const name_doc = typeDocument.find(rs => rs.value === type)?.label ?? ''
  return {
    emissionDate: emissionDate,
    ruc: identify,
    numberDoc: numero_doc,
    type,
    typeWithName: name_doc,
    typeWithCode: type,
    mode,
  }
}

export function getKeyData(key: string): IDataKey {
  return getDataAccessKey(key)
}

export function getPagos(doc: Document): Payment[] {
  const result: Payment[] = []
  const data = doc?.getElementsByTagName('pagos') as HTMLCollectionOf<HTMLElement>
  if (!data)
    return result

  const firstElement = data.item(0)?.children // Obtiene el primer elemento
  if (!firstElement)
    return result

  for (let i = 0; i < firstElement.length; i++) {
    const child = firstElement[i]
    if (child?.tagName) {
      const codePago = child.getElementsByTagName('formaPago')[0]?.textContent || ''
      const namePago = typesPaymentSRI.find(rs => rs.value === codePago)?.label || (codePago ? `CÓDIGO ${codePago}` : 'OTROS')
      const obj = {
        formaPago: namePago,
        total: child.getElementsByTagName('total')[0]?.textContent || '',
        plazo: child.getElementsByTagName('plazo')[0]?.textContent || '',
        unidadTiempo: child.getElementsByTagName('unidadTiempo')[0]?.textContent || '',
      }
      result.push(obj)
    }
  }

  return result
}

export function getInfoAdicional(doc: Document): { name: string, value: string }[] {
  const result: { name: string, value: string }[] = []
  const data = doc?.getElementsByTagName('infoAdicional') as HTMLCollectionOf<HTMLElement>
  if (!data)
    return result

  const firstElement = data.item(0)?.children // Obtiene el primer elemento
  if (firstElement) {
    for (let i = 0; i < firstElement.length; i++) {
      const child = firstElement[i]
      if (child?.tagName) {
        const obj = {
          name: child.getAttribute('nombre') || child.getAttribute('name') || '',
          value: child.textContent || '',
        }
        result.push(obj)
      }
    }
  }
  return result
}

export function getInfoInvoice(doc: Document): Record<string, string> {
  const data = doc?.getElementsByTagName('infoFactura') as HTMLCollectionOf<HTMLElement>
  if (!data)
    return {}

  const result: Record<string, string> = {}
  const firstElement = data.item(0)?.children // Obtiene el primer elemento

  if (firstElement) {
    for (let i = 0; i < firstElement.length; i++) {
      const child = firstElement[i]
      switch (child?.tagName) {
        case 'pagos':
        case 'totalConImpuestos':
          continue
        case undefined:
          break
        default:
          if (child?.tagName)
            result[child.tagName || 'na'] = child.textContent || ''
          break
      }
    }
  }

  return result
}

export function getDetailsInvoiceNc(doc: Document): Detail[] {
  const data = doc?.getElementsByTagName('detalles') as HTMLCollectionOf<HTMLElement>
  const result: Detail[] = []
  if (!data)
    return result

  const firstElement = data.item(0)?.children // Obtiene el primer elemento
  if (firstElement) {
    for (let i = 0; i < firstElement.length; i++) {
      const elementDetail = firstElement[i]
      if (!elementDetail?.children)
        continue

      const impuestosElement = elementDetail?.getElementsByTagName('impuestos')[0]?.children
      const impuestos: Taxes = {
        impuesto: [],
      }
      if (impuestosElement) {
        for (let k = 0; k < impuestosElement.length; k++) {
          const impuestoElement = impuestosElement[k]
          const tax: Tax = {
            codigo: impuestoElement?.getElementsByTagName('codigo')[0]?.textContent || '',
            codigoPorcentaje: impuestoElement?.getElementsByTagName('codigoPorcentaje')[0]?.textContent || '',
            descuentoAdicional: impuestoElement?.getElementsByTagName('descuentoAdicional')[0]?.textContent || undefined,
            baseImponible: impuestoElement?.getElementsByTagName('baseImponible')[0]?.textContent || '',
            tarifa: impuestoElement?.getElementsByTagName('tarifa')[0]?.textContent || '',
            valor: impuestoElement?.getElementsByTagName('valor')[0]?.textContent || '',
          }
          impuestos.impuesto.push(tax)
        }
      }
      const detAdicionalElement = elementDetail?.getElementsByTagName('detallesAdicionales')[0]?.children
      const detallesAdicionales: AdditionalDetails = {
        detAdicional: [],
      }
      if (detAdicionalElement) {
        for (let k = 0; k < detAdicionalElement.length; k++) {
          const detAdicionalElementItem = detAdicionalElement[k]
          const item = {
            '@nombre': detAdicionalElementItem?.getElementsByTagName('nombre')[0]?.textContent || detAdicionalElementItem?.getAttribute('nombre') || detAdicionalElementItem?.getAttribute('name') || '',
            '@valor': detAdicionalElementItem?.getElementsByTagName('valor')[0]?.textContent || detAdicionalElementItem?.getAttribute('valor') || detAdicionalElementItem?.getAttribute('value') || '',
          }
          detallesAdicionales.detAdicional.push(item)
        }
      }
      const detail: Detail = {
        codigoPrincipal: elementDetail?.getElementsByTagName('codigoPrincipal')[0]?.textContent || '',
        codigoAuxiliar: elementDetail?.getElementsByTagName('codigoAuxiliar')[0]?.textContent || undefined,
        descripcion: elementDetail?.getElementsByTagName('descripcion')[0]?.textContent || '',
        unidadMedida: elementDetail?.getElementsByTagName('unidadMedida')[0]?.textContent || undefined,
        cantidad: elementDetail?.getElementsByTagName('cantidad')[0]?.textContent || '',
        precioUnitario: elementDetail?.getElementsByTagName('precioUnitario')[0]?.textContent || '0',
        precioSinSubsidio: elementDetail?.getElementsByTagName('precioSinSubsidio')[0]?.textContent || undefined,
        descuento: elementDetail?.getElementsByTagName('descuento')[0]?.textContent || '0',
        impuestos,
        detallesAdicionales: detallesAdicionales.detAdicional.length > 0 ? detallesAdicionales : undefined,
        precioTotalSinImpuesto: elementDetail?.getElementsByTagName('precioTotalSinImpuesto')[0]?.textContent || '0',
      }
      result.push(detail)
    }
  }

  return result
}

export function getTotals(doc: Document): { name: string, valor: string | number }[] {
  const accessKey = doc?.getElementsByTagName('claveAcceso')[0]?.textContent || ''

  const datakey = getDataAccessKey(accessKey)
  if (!datakey)
    return []
  switch (datakey.type) {
    case '01': {
      return getTotalInvoice(doc)
    }
    case '04': {
      return getTotalCreditNote(doc)
    }
    default:
      return []
  }
}

export function getInfoTributaria(doc: Document): Record<string, string> {
  const data = doc?.getElementsByTagName('infoTributaria') as HTMLCollectionOf<HTMLElement>
  if (!data)
    return {}
  const result: Record<string, string> = {}
  const firstElement = data.item(0)?.children // Obtiene el primer elemento
  if (firstElement) {
    for (let i = 0; i < firstElement.length; i++) {
      const child = firstElement[i]
      if (child?.tagName) {
        result[child.tagName || 'na'] = child.textContent || ''
      }
    }
  }
  return result
}

export function parseXml(xml: string) {
  if (!xml) {
    throw new Error('No se ha recibido el XML, el xml está vacío')
  }
  try {
    const dataOfSri = parseXmlString(xml)
    const fechaAutorizacion = dataOfSri.getElementsByTagName('fechaAutorizacion')[0]?.textContent || dataOfSri.getElementsByTagName('fechaAutorizacion')[0]?.innerHTML
    const comprobante = dataOfSri.getElementsByTagName('comprobante')[0]
    let accessKey = ''
    let dataComprobante: Document
    if (comprobante) {
      const childNodes = comprobante?.childNodes || []
      let cdataContent = ''
      if (childNodes.length === 0) {
        cdataContent = childNodes[0]?.nodeValue?.trim() || ''
      }
      else {
        for (let i = 0; i < childNodes.length; i++) {
          if (childNodes[i]?.nodeType === 4) {
            cdataContent = childNodes[i]?.nodeValue?.trim() || ''
            break
          }
        }
      }
      if (!cdataContent) {
        cdataContent = comprobante.textContent?.trim() || ''
      }
      dataComprobante = parseXmlString(cdataContent)
      accessKey = dataComprobante.getElementsByTagName('claveAcceso')[0]?.textContent || dataComprobante.getElementsByTagName('claveAcceso')[0]?.innerHTML || ''
    }
    else {
      accessKey = dataOfSri.getElementsByTagName('claveAcceso')[0]?.textContent || dataOfSri.getElementsByTagName('claveAcceso')[0]?.innerHTML || ''
      dataComprobante = dataOfSri
    }

    const dataKey = getDataAccessKey(accessKey)
    const data = {
      numAuto: accessKey,
      dateAuto: fechaAutorizacion || undefined,
      documentData: dataComprobante,
      numberDocument: dataKey.numberDoc,
      typeDoc: dataKey.type,
      emissionDate: dataKey.emissionDate,
    }
    return data
  }
  catch (e: any) {
    throw new TypeError(`Error al obtener datos del XML: ${e.message}`)
  }
}

function getTotalInvoice(doc: Document) {
  const dataTable: { name: string, valor: string | number }[] = []
  const allTypes = typesIvaFee.map((data) => {
    return {
      type: '2',
      code: data.code,
      name: data.label,
      fee: data.fee,
      base: 0,
      totalTax: 0,
    }
  })
  let totalIce = 0
  let totalIRBPNR = 0
  let totalDEVOLUCIONIVA = 0

  const totalConImpuestoElement = doc?.getElementsByTagName('totalConImpuestos')[0]

  if (!totalConImpuestoElement)
    return []

  for (let i = 0; i < totalConImpuestoElement.children.length; i++) {
    const child = totalConImpuestoElement.children[i]
    if (child?.tagName === 'totalImpuesto') {
      const cod = child.getElementsByTagName('codigo')[0]?.textContent || ''
      const codigoPorcentaje = child.getElementsByTagName('codigoPorcentaje')[0]?.textContent || ''
      switch (cod) {
        case '3':
          totalIce += Number.parseFloat(child.getElementsByTagName('valor')[0]?.textContent ?? '0')
          break
        case '5':
          totalIRBPNR += Number.parseFloat(child.getElementsByTagName('valor')[0]?.textContent ?? '0')
          break
        default:
          break
      }
      const valorDevolucionIva = child.getElementsByTagName('valorDevolucionIva')[0]?.textContent || undefined
      if (valorDevolucionIva) {
        totalDEVOLUCIONIVA += Number.parseFloat(valorDevolucionIva ?? '0')
      }

      const index = allTypes.findIndex((data) => {
        return data.code === codigoPorcentaje
      })
      if (index !== -1 && allTypes[index]) {
        const baseImponible = child.getElementsByTagName('baseImponible')[0]?.textContent || '0'
        const valor = child.getElementsByTagName('valor')[0]?.textContent || '0'

        allTypes[index].base = Number.parseFloat(baseImponible)
        allTypes[index].totalTax = Number.parseFloat(valor)
      }
    }
  }
  const newAllTypes = allTypes.filter(data => data.base > 0)
  newAllTypes.forEach((data) => {
    dataTable.push({ name: `SUBTOTAL ${data.fee} %`, valor: data.base })
  })
  const totalSinImpuestos = Number.parseFloat(doc?.getElementsByTagName('totalSinImpuestos')[0]?.textContent || '0')
  dataTable.push({ name: 'SUBTOTAL SIN IMPUESTOS', valor: totalSinImpuestos })

  const totalDescuento = Number.parseFloat(doc?.getElementsByTagName('totalDescuento')[0]?.textContent || '0')

  dataTable.push({
    name: 'TOTAL DESCUENTO',
    valor: totalDescuento,
  })
  dataTable.push({
    name: 'ICE',
    valor: totalIce,
  })
  newAllTypes.filter(rs => rs.fee > 0).forEach((data) => {
    dataTable.push({ name: `IVA ${data.fee}`, valor: data.totalTax })
  })

  dataTable.push({ name: 'TOTAL DEVOLUCIÓN IVA', valor: totalDEVOLUCIONIVA })

  dataTable.push({
    name: 'IRBPNR',
    valor: totalIRBPNR,
  })
  const importeTotal = Number.parseFloat(doc?.getElementsByTagName('importeTotal')[0]?.textContent || '0')
  dataTable.push({
    name: 'VALOR TOTAL',
    valor: importeTotal,
  })
  return dataTable
}

function getTotalCreditNote(doc: Document) {
  const dataTable: { name: string, valor: string | number }[] = []
  const allTypes = typesIvaFee.map((data) => {
    return {
      type: data.code,
      name: data.label,
      tarifa: data.fee,
      iva: 0,
      total: 0,
    }
  })
  let totalIce = 0
  let totalIRBPNR = 0
  const totalConImpuestoElement = doc?.getElementsByTagName('totalConImpuestos')[0]

  if (!totalConImpuestoElement)
    return []

  for (let i = 0; i < totalConImpuestoElement.children.length; i++) {
    const child = totalConImpuestoElement.children[i]
    if (child?.tagName === 'totalImpuesto') {
      const cod = child.getElementsByTagName('codigo')[0]?.textContent || ''
      const codigoPorcentaje = child.getElementsByTagName('codigoPorcentaje')[0]?.textContent || ''
      switch (cod) {
        case '3':
          totalIce += Number.parseFloat(child.getElementsByTagName('valor')[0]?.textContent ?? '0')
          break
        case '5':
          totalIRBPNR += Number.parseFloat(child.getElementsByTagName('valor')[0]?.textContent ?? '0')
          break
        default:
          break
      }

      const index = allTypes.findIndex((data) => {
        return data.type === codigoPorcentaje
      })
      if (index !== -1 && allTypes[index]) {
        const baseImponible = child.getElementsByTagName('baseImponible')[0]?.textContent || '0'
        const valor = child.getElementsByTagName('valor')[0]?.textContent || '0'
        allTypes[index].total = Number.parseFloat(baseImponible)
        allTypes[index].iva = Number.parseFloat(valor)
      }
    }
  }
  const impuestos = allTypes.filter(data => data.total > 0)
  const impuestos_0 = allTypes.filter(data => data.tarifa === 0)
  impuestos.forEach((data) => {
    dataTable.push({ name: `SUBTOTAL ${data.name}`, valor: data.total })
  })
  impuestos_0.forEach((data) => {
    dataTable.push({ name: `SUBTOTAL ${data.name}`, valor: data.total })
  })
  const totalSinImpuestos = Number.parseFloat(doc?.getElementsByTagName('totalSinImpuestos')[0]?.textContent || '0')

  dataTable.push({ name: 'SUBTOTAL SIN IMPUESTOS', valor: totalSinImpuestos })

  dataTable.push({
    name: 'ICE',
    valor: totalIce,
  })
  impuestos.forEach((data) => {
    dataTable.push({ name: `IVA ${data.name}`, valor: data.iva })
  })

  dataTable.push({
    name: 'IRBPNR',
    valor: totalIRBPNR,
  })
  const valorModificado = Number.parseFloat(doc?.getElementsByTagName('valorModificado')[0]?.textContent || '0')
  dataTable.push({
    name: 'VALOR TOTAL',
    valor: valorModificado,
  })
  return dataTable
}

export function nameCodeRetention(code: string): string {
  return code
}

export function getFullInvoiceDataFromXml(xmlString: string): IFullInvoiceData {
  const parsed = parseXml(xmlString)
  if (!parsed || !parsed.documentData) {
    throw new Error('No se pudo parsear el XML o no contiene datos del comprobante')
  }

  const doc = parsed.documentData
  return {
    accessKey: parsed.numAuto,
    dateAuthorization: parsed.dateAuto,
    numberDocument: parsed.numberDocument,
    typeDoc: parsed.typeDoc,
    emissionDate: parsed.emissionDate ?? '',
    documentData: doc,
    infoTributaria: getInfoTributaria(doc),
    infoFactura: getInfoInvoice(doc),
    details: getDetailsInvoiceNc(doc),
    totals: getTotals(doc),
    payments: getPagos(doc),
    additionalInfo: getInfoAdicional(doc),
  }
}
