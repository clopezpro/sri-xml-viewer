import { defineEventHandler, readBody, createError } from 'h3'
import { createClient } from 'soap'

interface IMensaje {
  identificador?: string
  mensaje?: string
  informacionAdicional?: string
  tipo?: string
}

interface IAutorizacion {
  estado?: string
  numeroAutorizacion?: string
  fechaAutorizacion?: string
  ambiente?: string
  comprobante?: string
  mensajes?: {
    mensaje?: IMensaje | IMensaje[]
  }
}

interface IAutorizarComprobanteResponse {
  RespuestaAutorizacionComprobante?: {
    claveAccesoConsultada?: string
    numeroComprobantes?: string
    autorizaciones?: {
      autorizacion?: IAutorizacion | IAutorizacion[]
    }
  }
}

function documentAuthorization(
  accessKey: string,
  authorizationUrl: string
): Promise<IAutorizarComprobanteResponse> {
  const params = { claveAccesoComprobante: accessKey }

  return new Promise((resolve, reject) => {
    createClient(authorizationUrl, (err: any, client: any) => {
      if (err) {
        reject(err)
        return
      }

      client.autorizacionComprobante(params, (err: any, result: IAutorizarComprobanteResponse) => {
        if (err) {
          reject(err)
          return
        }
        resolve(result)
      })
    })
  })
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { claveAcceso } = body

  if (!claveAcceso || typeof claveAcceso !== 'string' || claveAcceso.length !== 49) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La clave de acceso debe tener 49 dígitos.',
    })
  }

  // Obtener ambiente a partir del dígito 24 (índice 23) de la clave de acceso
  // 1 = PRUEBAS, 2 = PRODUCCIÓN
  const ambienteDigit = claveAcceso.charAt(23)
  const isProd = ambienteDigit === '2'
  const endpoint = isProd
    ? 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl'
    : 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl'

  try {
    const resp = await documentAuthorization(claveAcceso, endpoint)

    if (!resp || !resp.RespuestaAutorizacionComprobante) {
      return {
        success: false,
        estado: 'ERROR_SRI_CONEXION',
        mensajes: [{
          identificador: 'SRI-EMPTY',
          mensaje: 'El SRI devolvió una respuesta vacía o no respondió. Por favor, reintente la consulta.',
          tipo: 'ERROR'
        }]
      }
    }

    const autorizaciones = resp.RespuestaAutorizacionComprobante?.autorizaciones?.autorizacion
    if (!autorizaciones) {
      return {
        success: false,
        estado: 'NO REGISTRADO',
        mensajes: [{
          identificador: 'SRI-404',
          mensaje: 'El comprobante no se encuentra registrado en el SRI o el tiempo límite para su consulta ha expirado.',
          tipo: 'ERROR'
        }]
      }
    }

    const authList = Array.isArray(autorizaciones) ? autorizaciones : [autorizaciones]
    const auth = authList.find(a => a.estado === 'AUTORIZADO') || authList[0]

    const estado = typeof auth.estado === 'string' ? auth.estado.trim() : String(auth.estado || '')
    const numeroAutorizacion = typeof auth.numeroAutorizacion === 'string' ? auth.numeroAutorizacion.trim() : String(auth.numeroAutorizacion || '')
    
    let fechaAutorizacion = ''
    if (auth.fechaAutorizacion) {
      if (typeof auth.fechaAutorizacion === 'string') {
        fechaAutorizacion = auth.fechaAutorizacion.trim()
      } else if (auth.fechaAutorizacion instanceof Date) {
        fechaAutorizacion = auth.fechaAutorizacion.toISOString()
      } else {
        fechaAutorizacion = String(auth.fechaAutorizacion)
      }
    }

    const comprobanteXML = auth.comprobante || ''

    // Decodificamos entidades HTML para obtener el XML real y limpio si es necesario
    let rawComprobanteXML = typeof comprobanteXML === 'string' ? comprobanteXML.trim() : String(comprobanteXML)
    if (rawComprobanteXML.includes('&lt;')) {
      rawComprobanteXML = rawComprobanteXML
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&')
    }

    // Extraemos mensajes (si los hay)
    const mensajes: any[] = []
    if (auth.mensajes && auth.mensajes.mensaje) {
      const msgList = Array.isArray(auth.mensajes.mensaje)
        ? auth.mensajes.mensaje
        : [auth.mensajes.mensaje]

      for (const block of msgList) {
        const identificador = typeof block.identificador === 'string' ? block.identificador.trim() : String(block.identificador || '')
        const msgText = typeof block.mensaje === 'string' ? block.mensaje.trim() : String(block.mensaje || '')
        const tipo = typeof block.tipo === 'string' ? block.tipo.trim() : String(block.tipo || '')
        const informacionAdicional = typeof block.informacionAdicional === 'string' ? block.informacionAdicional.trim() : String(block.informacionAdicional || '')

        mensajes.push({ identificador, mensaje: msgText, tipo, informacionAdicional })
      }
    }

    if (estado !== 'AUTORIZADO') {
      return {
        success: false,
        estado,
        mensajes: mensajes.length > 0 ? mensajes : [{
          identificador: 'SRI-NO-AUT',
          mensaje: `El comprobante está en estado: ${estado}.`,
          tipo: 'ALERTA'
        }]
      }
    }

    const ambienteName = auth.ambiente || (isProd ? 'PRODUCCIÓN' : 'PRUEBAS')

    // Reconstruir el XML en el formato exacto del SRI
    const rebuiltXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<autorizacion>
  <estado>${estado}</estado>
  <numeroAutorizacion>${numeroAutorizacion}</numeroAutorizacion>
  <fechaAutorizacion>${fechaAutorizacion}</fechaAutorizacion>
  <ambiente>${ambienteName}</ambiente>
  <comprobante><![CDATA[${rawComprobanteXML}]]></comprobante>
</autorizacion>`

    return {
      success: true,
      estado,
      numeroAutorizacion,
      fechaAutorizacion,
      ambiente: ambienteName,
      xml: rebuiltXml
    }

  } catch (error: any) {
    console.error('Error al consultar SOAP del SRI:', error)
    const rawMsg = error.message || String(error)
    let mensaje = `No se pudo conectar con el servidor del SRI: ${rawMsg}`
    if (
      rawMsg.includes("does not match certificate's altnames") ||
      rawMsg.includes("is not in the cert's list") ||
      rawMsg.includes("altnames") ||
      rawMsg.includes("ECONNRESET") ||
      rawMsg.includes("ETIMEDOUT") ||
      rawMsg.includes("ENOTFOUND") ||
      rawMsg.includes("socket hang up")
    ) {
      mensaje = "El servidor del SRI no respondió adecuadamente o no está disponible temporalmente. Por favor, reintente la consulta; es muy probable que funcione en el segundo intento."
    }
    return {
      success: false,
      estado: 'ERROR_CONEXION',
      mensajes: [{
        identificador: 'CONN-500',
        mensaje,
        tipo: 'ERROR'
      }]
    }
  }
})
