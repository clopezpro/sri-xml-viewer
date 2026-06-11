export interface AdditionalDetail {
  '@nombre': string
  '@valor': string
}

export interface AdditionalDetails {
  detAdicional: AdditionalDetail[]
}

export interface Tax {
  codigo: string
  codigoPorcentaje: string
  tarifa: string
  baseImponible: string
  descuentoAdicional?: string
  valor: string
}

export interface Taxes {
  impuesto: Tax[]
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
  precioTotalSinImpuesto: string
  detallesAdicionales?: AdditionalDetails
  impuestos: Taxes
}

export interface Details {
  detalle: Detail[]
}
