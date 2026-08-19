import type { AdditionalInfo } from './additionalInfo'
import type { Details } from './details'
import type { Reimbursements } from './reimbursements'
import type { Retentions } from './retentions'
import type { SettlementPurchaseInfo } from './settlementPurchaseInfo'
import type { TaxInfo } from './taxInfo'

export interface SettlementPurchase {
  liquidacionCompra: {
    '@xmlns:ds': string
    '@xmlns:xsi': string
    '@id': string
    '@version': string
    'infoTributaria': TaxInfo
    'infoLiquidacionCompra': SettlementPurchaseInfo
    'detalles': Details
    'reembolsos'?: Reimbursements
    'retenciones'?: Retentions
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

export interface SettlementPurchaseInput {
  infoTributaria: TaxInfo
  infoLiquidacionCompra: SettlementPurchaseInfo
  detalles: Details
  reembolsos?: Reimbursements
  retenciones?: Retentions
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
