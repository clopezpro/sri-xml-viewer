import { defineEventHandler, readBody, createError } from 'h3'

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
    ? 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline'
    : 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline'

  const soapEnvelope = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.autorizacion">
   <soapenv:Header/>
   <soapenv:Body>
      <ec:autorizacionComprobante>
         <claveAccesoComprobante>${claveAcceso}</claveAccesoComprobante>
      </ec:autorizacionComprobante>
   </soapenv:Body>
</soapenv:Envelope>
  `.trim()

  try {
    // Desactivar validación estricta de SSL en Node para los endpoints del SRI

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
      },
      body: soapEnvelope
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const responseText = await response.text()

    // Buscamos el bloque <autorizacion>
    const autorizacionBlockMatch = responseText.match(/<autorizacion>([\s\S]*?)<\/autorizacion>/)
    if (!autorizacionBlockMatch) {
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

    const autorizacionBlock = autorizacionBlockMatch[1] || ''

    // Extraemos campos principales
    const estado = (autorizacionBlock.match(/<estado>([\s\S]*?)<\/estado>/)?.[1] || '').trim()
    const numeroAutorizacion = (autorizacionBlock.match(/<numeroAutorizacion>([\s\S]*?)<\/numeroAutorizacion>/)?.[1] || '').trim()
    const fechaAutorizacion = (autorizacionBlock.match(/<fechaAutorizacion>([\s\S]*?)<\/fechaAutorizacion>/)?.[1] || '').trim()

    // Extraemos el comprobante CDATA
    let rawComprobanteXML = ''
    const comprobanteMatch = autorizacionBlock.match(/<comprobante>([\s\S]*?)<\/comprobante>/)
    if (comprobanteMatch) {
      let content = (comprobanteMatch[1] || '').trim()

      // Si está envuelto en CDATA, extraemos el contenido interior
      const cdataMatch = content.match(/<!\[CDATA\[([\s\S]*?)\]\]>/)
      if (cdataMatch) {
        content = (cdataMatch[1] || '').trim()
      }

      // Decodificamos entidades HTML para obtener el XML real y limpio
      rawComprobanteXML = content
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&')
    }

    // Extraemos mensajes (si los hay)
    const mensajes: any[] = []
    const mensajesMatch = autorizacionBlock.match(/<mensajes>([\s\S]*?)<\/mensajes>/)
    if (mensajesMatch) {
      const mensajeBlocks = mensajesMatch[1]?.match(/<mensaje>([\s\S]*?)<\/mensaje>/g) || []
      for (const block of mensajeBlocks) {
        const identificador = (block.match(/<identificador>([\s\S]*?)<\/identificador>/)?.[1] || '').trim()
        const msgText = (block.match(/<mensaje>([\s\S]*?)<\/mensaje>/)?.[1] || '').trim()
        const tipo = (block.match(/<tipo>([\s\S]*?)<\/tipo>/)?.[1] || '').trim()
        const informacionAdicional = (block.match(/<informacionAdicional>([\s\S]*?)<\/informacionAdicional>/)?.[1] || '').trim()

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

    const ambienteName = isProd ? 'PRODUCCIÓN' : 'PRUEBAS'

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
    return {
      success: false,
      estado: 'ERROR_CONEXION',
      mensajes: [{
        identificador: 'CONN-500',
        mensaje: `No se pudo conectar con el servidor del SRI: ${error.message || error}`,
        tipo: 'ERROR'
      }]
    }
  }
})
