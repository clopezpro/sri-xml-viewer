export interface TaxDetail {
  codigo: string
  codigoPorcentaje: string
  tarifa: string
  baseImponibleReembolso: string
  impuestoReembolso: string
}

export interface TaxDetails {
  detalleImpuesto: TaxDetail[]
}

export interface ReimbursementCompensation {
  codigo: string
  tarifa: string
  valor: string
}

export interface ReimbursementCompensations {
  compensacionesReembolso: ReimbursementCompensation[]
}

export interface ReimbursementDetail {
  tipoIdentificacionProveedorReembolso: string
  identificacionProveedorReembolso: string
  codPaisPagoProveedorReembolso: string
  tipoProveedorReembolso: string
  codDocReembolso: string
  estabDocReembolso: string
  ptoEmiDocReembolso: string
  secuencialDocReembolso: string
  fechaEmisionDocReembolso: string
  numeroautorizacionDocReemb: string
  detalleImpuestos: TaxDetails
  compensacionesReembolso: ReimbursementCompensations
}

export interface Reimbursements {
  reembolsoDetalle: ReimbursementDetail[]
}
