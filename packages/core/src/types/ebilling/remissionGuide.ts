import type { AdditionalInfo } from './additionalInfo'
import type { AdditionalDetails } from './details'
import type { TaxInfo } from './taxInfo'

export interface RemissionGuideInfo {
  dirEstablecimiento: string
  dirPartida: string
  razonSocialTransportista: string
  tipoIdentificacionTransportista: string
  rucTransportista: string
  obligadoContabilidad: 'SI' | 'NO'
  contribuyenteEspecial?: string
  fechaIniTransporte: string
  fechaFinTransporte: string
  placa: string
}

export interface DetailGR {
  codigoInterno: string
  codigoAdicional?: string
  descripcion: string
  cantidad: string
  detallesAdicionales?: AdditionalDetails
}

export interface DetailsRemissionGuide {
  detalle: DetailGR[]
}

export interface RemissionGuideDestinationInfo {
  identificacionDestinatario: string
  razonSocialDestinatario: string
  dirDestinatario: string
  motivoTraslado: string
  docAduaneroUnico?: string
  codEstabDestino?: string
  ruta?: string
  codDocSustento?: string
  numDocSustento?: string
  numAutDocSustento?: string
  fechaEmisionDocSustento?: string
  detalles: DetailsRemissionGuide
}

export interface RemissionGuideDestination {
  destinatario: RemissionGuideDestinationInfo[] | RemissionGuideDestinationInfo
}

export interface RemissionGuide {
  guiaRemision: {
    '@xmlns:ds': string
    '@xmlns:xsi': string
    '@id': string
    '@version': string
    'infoTributaria': TaxInfo
    'infoGuiaRemision': RemissionGuideInfo
    'destinatarios': RemissionGuideDestination
    'infoAdicional'?: AdditionalInfo
  }
}

export interface RemissionGuideInput {
  infoTributaria: TaxInfo
  infoGuiaRemision: RemissionGuideInfo
  destinatarios: RemissionGuideDestination
  infoAdicional?: AdditionalInfo
}
