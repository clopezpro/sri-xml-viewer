import type { AdditionalInfo } from './additionalInfo'
import type { TaxInfo } from './taxInfo'

export interface Retention {
  codigo: string
  codigoPorcentaje: string
  tarifa: string
  valor: string
}

export interface Retentions {
  retencion: Retention[]
}

export interface RetentionReceiptInfo {
  fechaEmision: string
  dirEstablecimiento?: string
  contribuyenteEspecial?: string
  obligadoContabilidad?: 'SI' | 'NO'
  tipoIdentificacionSujetoRetenido: string
  parteRel?: 'SI' | 'NO'
  razonSocialSujetoRetenido: string
  identificacionSujetoRetenido: string
  periodoFiscal: string
}

export interface SustenanceDocTax {
  codImpuestoDocSustento: string
  codigoPorcentaje: string
  baseImponible: string | number
  tarifa: string | number
  valorImpuesto: string | number
}

export interface SustenanceDocRetention {
  codigo: '1' | '2' | '3'
  codigoRetencion: string
  baseImponible: string | number
  porcentajeRetener: string | number
  valorRetenido: string | number
}

export interface SustenanceDocPayment {
  formaPago: string
  total: string | number
  dias?: string
  unidadTiempo?: string
}

export interface SustenanceDoc {
  codSustento: string
  codDocSustento: string
  numDocSustento: string
  fechaEmisionDocSustento: string
  fechaRegistroContable?: string
  numAutDocSustento: string
  pagoLocExt: string
  tipoRegi?: string /* cuando es exterior aplica */
  paisEfecPago?: string /* cuando es exterior aplica */
  aplicConvDobTrib?: 'SI' | 'NO' /* cuando es exterior aplica */
  pagExtSujRetNorLeg?: 'SI' | 'NO' /* cuando es exterior aplica */
  pagoRegFis?: 'SI' | 'NO' /* cuando es exterior aplica */
  totalComprobantesReembolso?: string | number
  totalBaseImponibleReembolso?: string | number
  totalImpuestoReembolso?: string | number
  totalSinImpuestos: string | number
  importeTotal: string | number
  impuestosDocSustento?: {
    impuestoDocSustento: SustenanceDocTax[] | SustenanceDocTax
  }
  retenciones?: {
    retencion: SustenanceDocRetention[] | SustenanceDocRetention
  }
  pagos?: {
    pago: SustenanceDocPayment[] | SustenanceDocPayment
  }
}

export interface SustenanceDocs {
  docSustento: SustenanceDoc[] | SustenanceDoc
}

export interface MachineFiscalInfo {
  marca: string
  modelo: string
  serie: string
}

export interface RetentionXml {
  comprobanteRetencion: {
    '@xmlns:ds'?: string
    '@xmlns:xsi'?: string
    '@id': string
    '@version': '2.0.0'
    'infoTributaria': TaxInfo
    'infoCompRetencion': RetentionReceiptInfo
    'docsSustento': SustenanceDocs
    'infoAdicional'?: AdditionalInfo
    'maquinaFiscal'?: MachineFiscalInfo
  }
}

export interface RetentionInput {
  infoTributaria: TaxInfo
  infoCompRetencion: RetentionReceiptInfo
  docsSustento: SustenanceDocs
  infoAdicional?: AdditionalInfo
  maquinaFiscal?: MachineFiscalInfo
}
