import type { AdditionalInfo } from './additionalInfo'
import type { Details } from './details'
import type { InvoiceInfo } from './invoiceInfo'
import type {
  OtherThirdPartyValues,
} from './otherThirdPartyValues'

import type { Reimbursements } from './reimbursements'

import type { RemissionGuideSubstitutiveInfo } from './RemissionGuideSubstitutiveInfo'
import type { Retentions } from './retentions'
import type { TaxInfo } from './taxInfo'

export interface XMLAuthorized {
  ambiente: string
  comprobante: {
    $: string
  }
  estado: string
  fechaAutorizacion: string
  numeroAutorizacion: string
}

export interface Invoice {
  factura: {
    '@xmlns:ds': string
    '@xmlns:xsi': string
    '@id': string
    '@version': string
    'infoTributaria': TaxInfo
    'infoFactura': InvoiceInfo
    'detalles': Details
    'reembolsos'?: Reimbursements
    'retenciones'?: Retentions
    'infoSustitutivaGuiaRemission'?: RemissionGuideSubstitutiveInfo
    'otrosRubrosTerceros'?: OtherThirdPartyValues
    'tipoNegociable'?: {
      correo: string
    }
    'maquinaFiscal'?: {
      marca: string
      modelo: string
      serie: string
    }
    'infoAdicional'?: AdditionalInfo
  }
}

export interface InvoiceInput {
  infoTributaria: TaxInfo
  infoFactura: InvoiceInfo
  detalles: Details
  reembolsos?: Reimbursements
  retenciones?: Retentions
  infoSustitutivaGuiaRemission?: RemissionGuideSubstitutiveInfo
  otrosRubrosTerceros?: OtherThirdPartyValues
  tipoNegociable?: {
    correo: string
  }
  maquinaFiscal?: {
    marca: string
    modelo: string
    serie: string
  }
  infoAdicional?: AdditionalInfo
}
