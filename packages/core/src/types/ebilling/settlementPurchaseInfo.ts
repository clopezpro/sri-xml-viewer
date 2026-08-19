import type { TotalWithTaxes, Payments } from './invoiceInfo'
import type { Reimbursements } from './reimbursements'
import type { Retentions } from './retentions'

export interface SettlementPurchaseInfo {
  fechaEmision: string
  dirEstablecimiento?: string
  contribuyenteEspecial?: string
  obligadoContabilidad?: 'SI' | 'NO'
  /*
  RUC 04
  CÉDULA 05
  PASAPORTE 06
  IDENTIFICACIÓN DEL EXTERIOR* 08
  */
  tipoIdentificacionProveedor: string
  guiaRemision?: string
  razonSocialProveedor: string
  identificacionProveedor: string
  direccionProveedor?: string
  totalSinImpuestos: string
  totalDescuento: string
  codDocReembolso?: string
  totalComprobantesReembolso?: string
  totalBaseImponibleReembolso?: string
  totalImpuestoReembolso?: string
  totalConImpuestos: TotalWithTaxes
  importeTotal: string
  moneda: string
  pagos: Payments
  reembolsos?: Reimbursements
  retenciones?: Retentions
}
