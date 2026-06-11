export interface IDataKey {
  emissionDate: string
  ruc: string
  numberDoc: string
  type: string
  typeWithName: string
  typeWithCode: string
  mode: string | null
}

export interface Tax {
  codigo: string
  codigoPorcentaje: string
  descuentoAdicional?: string
  baseImponible: string
  tarifa: string
  valor: string
}

export interface Taxes {
  impuesto: Tax[]
}

export interface AdditionalDetailItem {
  '@nombre': string
  '@valor': string
}

export interface AdditionalDetails {
  detAdicional: AdditionalDetailItem[]
}

export interface Detail {
  codigoPrincipal: string
  codigoAuxiliar?: string
  descripcion: string
  unidadMedida?: string
  cantidad: string
  precioUnitario: string
  precioSinSubsidio?: string
  descuento: string
  impuestos: Taxes
  detallesAdicionales?: AdditionalDetails
  precioTotalSinImpuesto: string
}

export interface Payment {
  formaPago: string
  total: string
  plazo?: string
  unidadTiempo?: string
}

export interface ITotal {
  name: string
  value: number
  code: string
  taxType?: string
  order?: number
}

export interface IFullInvoiceData {
  accessKey: string
  dateAuthorization?: string
  numberDocument: string
  typeDoc: string
  emissionDate: string
  documentData: Document
  infoTributaria: Record<string, string>
  infoFactura: Record<string, string>
  details: Detail[]
  totals: { name: string, valor: string | number }[]
  payments: Payment[]
  additionalInfo: { name: string, value: string }[]
}
