export interface Arrival {
  motivoTraslado: string
  docAduaneroUnico: string
  codEstabDestino: string
  ruta: string
}

export interface Arrivals {
  destino: Arrival[]
}

export interface RemissionGuideSubstitutiveInfo {
  dirPartida: string
  dirDestinatario: string
  fechaIniTransporte: string
  fechaFinTransporte: string
  razonSocialTransportista: string
  tipoIdentificacionTransportista: string
  rucTransportista: string
  placa: string
  destinos: Arrivals
}
