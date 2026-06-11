import type { TotalWithTaxes } from './invoiceInfo'

export interface CreditNoteInfo {
  fechaEmision: string
  dirEstablecimiento: string
  tipoIdentificacionComprador: string
  razonSocialComprador: string
  identificacionComprador: string
  contribuyenteEspecial?: string
  obligadoContabilidad: 'SI' | 'NO'
  codDocModificado: string
  numDocModificado: string
  fechaEmisionDocSustento: string
  /*
  RUC 04
  CÉDULA 05
  PASAPORTE 06
  VENTA A CONSUMIDOR FINAL* 07
  IDENTIFICACIÓN DELEXTERIOR* 08
  */

  totalSinImpuestos: string
  valorModificacion: string
  totalConImpuestos: TotalWithTaxes
  motivo: string
}
