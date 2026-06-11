import type { AdditionalInfo } from './additionalInfo'
import type { CreditNoteInfo } from './creditNoteInfo'
import type { AdditionalDetails, Details, Taxes } from './details'
import type { TaxInfo } from './taxInfo'

export interface CreditNote {
  notaCredito: {
    '@xmlns:ds': string
    '@xmlns:xsi': string
    '@id': string
    '@version': string
    'infoTributaria': TaxInfo
    'infoNotaCredito': CreditNoteInfo
    'detalles': Details
    'infoAdicional'?: AdditionalInfo
  }
}
export interface DetailNC {
  codigoInterno: string
  codigoAdicional?: string
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

export interface DetailsNC {
  detalle: DetailNC[]
}

export interface CreditNoteInput {
  infoTributaria: TaxInfo
  infoNotaCredito: CreditNoteInfo
  detalles: DetailsNC
  infoAdicional?: AdditionalInfo
}
