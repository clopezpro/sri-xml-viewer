// @vitest-environment jsdom
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { getFullInvoiceDataFromXml } from './parser'
import { getResolutionsByAgentCode, agentRetentionResolutions } from './constants'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const mockXml = `<?xml version="1.0" encoding="utf-8"?>
<autorizacion>
  <estado>AUTORIZADO</estado>
  <numeroAutorizacion>1106202601179001124800120010010000001231234567818</numeroAutorizacion>
  <fechaAutorizacion>11/06/2026 12:45:30</fechaAutorizacion>
  <comprobante><![CDATA[<?xml version="1.0" encoding="utf-8"?>
<factura id="comprobante" version="1.1.0">
  <infoTributaria>
    <ambiente>1</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>ALMACENES EL AHORRO S.A.</razonSocial>
    <nombreComercial>EL AHORRO DE ECUADOR</nombreComercial>
    <ruc>1790011248001</ruc>
    <claveAcceso>1106202601179001124800120010010000001231234567818</claveAcceso>
    <codDoc>01</codDoc>
    <estab>001</estab>
    <ptoEmi>001</ptoEmi>
    <secuencial>000000123</secuencial>
    <dirMatriz>Av. 10 de Agosto N34-12 y Rumipamba</dirMatriz>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>11/06/2026</fechaEmision>
    <dirEstablecimiento>Av. de los Shyris N38-45 y Holanda</dirEstablecimiento>
    <obligadoContabilidad>SI</obligadoContabilidad>
    <tipoIdentificacionComprador>04</tipoIdentificacionComprador>
    <razonSocialComprador>JUAN PEREZ SANDOVAL</razonSocialComprador>
    <identificacionComprador>1712345678001</identificacionComprador>
    <direccionComprador>Quito, Av. Amazonas y Colon</direccionComprador>
    <totalSinImpuestos>120.00</totalSinImpuestos>
    <totalDescuento>10.00</totalDescuento>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>2</codigoPorcentaje>
        <baseImponible>110.00</baseImponible>
        <tarifa>12.00</tarifa>
        <valor>13.20</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <propina>0.00</propina>
    <importeTotal>123.20</importeTotal>
    <moneda>DOLAR</moneda>
    <pagos>
      <pago>
        <formaPago>20</formaPago>
        <total>123.20</total>
        <plazo>30</plazo>
        <unidadTiempo>dias</unidadTiempo>
      </pago>
    </pagos>
  </infoFactura>
  <detalles>
    <detalle>
      <codigoPrincipal>PROD001</codigoPrincipal>
      <codigoAuxiliar>AUX001</codigoAuxiliar>
      <descripcion>Laptop Pro 15 pulgadas Intel i7 16GB RAM</descripcion>
      <cantidad>1.000000</cantidad>
      <precioUnitario>100.00</precioUnitario>
      <descuento>10.00</descuento>
      <precioTotalSinImpuesto>90.00</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>2</codigoPorcentaje>
          <tarifa>12.00</tarifa>
          <baseImponible>90.00</baseImponible>
          <valor>10.80</valor>
        </impuesto>
      </impuestos>
    </detalle>
  </detalles>
</factura>
]]></comprobante>
</autorizacion>`

describe('SRI XML Parser core tests', () => {
  it('should successfully parse a valid mock electronic invoice XML', () => {
    const data = getFullInvoiceDataFromXml(mockXml)

    // Verify access key and basic details
    expect(data.accessKey).toBe('1106202601179001124800120010010000001231234567818')
    expect(data.numberDocument).toBe('001-001-000000123')
    expect(data.emissionDate).toBe('11/06/2026')
    expect(data.typeDoc).toBe('01')

    // Verify infoTributaria
    expect(data.infoTributaria?.razonSocial).toBe('ALMACENES EL AHORRO S.A.')
    expect(data.infoTributaria?.ruc).toBe('1790011248001')

    // Verify infoFactura
    expect(data.infoFactura?.razonSocialComprador).toBe('JUAN PEREZ SANDOVAL')
    expect(data.infoFactura?.identificacionComprador).toBe('1712345678001')
    expect(data.infoFactura?.importeTotal).toBe('123.20')

    // Verify details
    expect(data.details).toHaveLength(1)
    expect(data.details[0]?.codigoPrincipal).toBe('PROD001')
    expect(data.details[0]?.descripcion).toBe('Laptop Pro 15 pulgadas Intel i7 16GB RAM')
    expect(data.details[0]?.cantidad).toBe('1.000000')

    // Verify payments
    expect(data.payments).toHaveLength(1)
    expect(data.payments[0]?.formaPago).toBe('OTROS CON UTILIZACIÓN DEL SISTEMA FINANCIERO') // formaPago 20 is OTROS CON UTILIZACIÓN...
    expect(data.payments[0]?.total).toBe('123.20')

    // Verify totals including PROPINA
    expect(data.totals).toContainEqual({ name: 'PROPINA', valor: 0 })
    const valorTotalIndex = data.totals.findIndex(t => t.name === 'VALOR TOTAL')
    const propinaIndex = data.totals.findIndex(t => t.name === 'PROPINA')
    expect(propinaIndex).toBe(valorTotalIndex - 1)
  })

  it('should parse non-zero propina and place it above VALOR TOTAL', () => {
    const xmlWithPropina = mockXml.replace('<propina>0.00</propina>', '<propina>10.50</propina>')
    const data = getFullInvoiceDataFromXml(xmlWithPropina)
    expect(data.totals).toContainEqual({ name: 'PROPINA', valor: 10.5 })
    const valorTotalIndex = data.totals.findIndex(t => t.name === 'VALOR TOTAL')
    const propinaIndex = data.totals.findIndex(t => t.name === 'PROPINA')
    expect(propinaIndex).toBe(valorTotalIndex - 1)
  })

  it('should parse missing propina as 0 and place it above VALOR TOTAL', () => {
    const xmlWithoutPropina = mockXml.replace('<propina>0.00</propina>', '')
    const data = getFullInvoiceDataFromXml(xmlWithoutPropina)
    expect(data.totals).toContainEqual({ name: 'PROPINA', valor: 0 })
    const valorTotalIndex = data.totals.findIndex(t => t.name === 'VALOR TOTAL')
    const propinaIndex = data.totals.findIndex(t => t.name === 'PROPINA')
    expect(propinaIndex).toBe(valorTotalIndex - 1)
  })

  it('should successfully parse invoice.xml asset', () => {
    const xmlPath = path.resolve(__dirname, '../../playground/app/assets/invoice.xml')
    const xml = fs.readFileSync(xmlPath, 'utf8')
    const data = getFullInvoiceDataFromXml(xml)
    expect(data.accessKey).toBe('0106202601112345678900120010010000001739257787819')
    expect(data.typeDoc).toBe('01')
  })

  it('should parse optional placa field in infoFactura (Ficha Técnica v2.33 / NAC-DGERCGC26-00000024)', () => {
    const xmlWithPlaca = mockXml.replace(
      '<moneda>DOLAR</moneda>',
      '<moneda>DOLAR</moneda>\n    <placa>PBC-1234</placa>',
    )
    const data = getFullInvoiceDataFromXml(xmlWithPlaca)
    expect(data.infoFactura?.placa).toBe('PBC-1234')
  })

  it('should resolve typeDoc from codDoc tag when claveAcceso type is mock or non-standard', () => {
    const mockXmlWithMockKey = `<?xml version="1.0" encoding="utf-8"?>
<autorizacion>
  <estado>AUTORIZADO</estado>
  <numeroAutorizacion>1234567891111111111111111111111111111111111111111</numeroAutorizacion>
  <comprobante><![CDATA[<?xml version="1.0" encoding="utf-8"?>
<factura id="comprobante" version="1.1.0">
  <infoTributaria>
    <claveAcceso>1234567891111111111111111111111111111111111111111</claveAcceso>
    <codDoc>01</codDoc>
  </infoTributaria>
</factura>
]]></comprobante>
</autorizacion>`
    const data = getFullInvoiceDataFromXml(mockXmlWithMockKey)
    expect(data.typeDoc).toBe('01')
  })

  it('should successfully parse a mock remission guide (Guia de Remision) XML', () => {
    const mockGuiaXml = `<?xml version="1.0" encoding="utf-8"?>
<autorizacion>
  <estado>AUTORIZADO</estado>
  <numeroAutorizacion>1806202606093104800300120010010000001859257787812</numeroAutorizacion>
  <fechaAutorizacion>2026-06-18T15:30:22-05:00</fechaAutorizacion>
  <comprobante><![CDATA[<?xml version="1.0" encoding="utf-8"?>
<guiaRemision id="comprobante" version="1.1.0">
  <infoTributaria>
    <ambiente>2</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>Christian Manuel Lopez Camacho</razonSocial>
    <ruc>0931048003001</ruc>
    <claveAcceso>1806202606093104800300120010010000001859257787812</claveAcceso>
    <codDoc>06</codDoc>
    <estab>001</estab>
    <ptoEmi>001</ptoEmi>
    <secuencial>000000185</secuencial>
  </infoTributaria>
  <infoGuiaRemision>
    <dirPartida>AV. GENERAL CORDOVA 1024 Y ESCALINATA</dirPartida>
    <dirLlegada>AV. 9 DE OCTUBRE Y MALECON</dirLlegada>
    <razonSocialTransportista>TRANSPORTE RAPIDO S.A.</razonSocialTransportista>
    <rucTransportista>0990001234001</rucTransportista>
    <fechaIniTransporte>18/06/2026</fechaIniTransporte>
    <fechaFinTransporte>19/06/2026</fechaFinTransporte>
    <placa>GYE-9876</placa>
  </infoGuiaRemision>
  <destinatarios>
    <destinatario>
      <identificacionDestinatario>0921234567</identificacionDestinatario>
      <razonSocialDestinatario>JUAN CRISTOBAL PEREZ</razonSocialDestinatario>
      <dirDestinatario>AV. FRANCISCO DE ORELLANA Y PLAZA DAÑIN</dirDestinatario>
      <motivoTraslado>TRASLADO POR VENTA</motivoTraslado>
      <docSustento>01</docSustento>
      <numDocSustento>001-001-000012345</numDocSustento>
      <fechaEmisionDocSustento>18/06/2026</fechaEmisionDocSustento>
      <numAutDocSustento>1806202601093104800300120010010000001231234567818</numAutDocSustento>
      <ruta>GUAYAQUIL-SAMANES</ruta>
      <codDocSustento>01</codDocSustento>
      <detalles>
        <detalle>
          <codigoInterno>PROD-005</codigoInterno>
          <descripcion>Monitor Gamer UltraWide 34 Pulgadas Curved</descripcion>
          <cantidad>2</cantidad>
        </detalle>
      </detalles>
    </destinatario>
  </destinatarios>
</guiaRemision>
]]></comprobante>
</autorizacion>`
    const data = getFullInvoiceDataFromXml(mockGuiaXml)
    expect(data.accessKey).toBe('1806202606093104800300120010010000001859257787812')
    expect(data.typeDoc).toBe('06')
  })

  it('should successfully parse a mock settlement purchase (Liquidación de Compra) XML', () => {
    const mockLiqXml = `<?xml version="1.0" encoding="utf-8"?>
<autorizacion>
  <estado>AUTORIZADO</estado>
  <numeroAutorizacion>1508202603093104800300120010010000000991234567814</numeroAutorizacion>
  <fechaAutorizacion>15/08/2026 10:20:45</fechaAutorizacion>
  <comprobante><![CDATA[<?xml version="1.0" encoding="utf-8"?>
<liquidacionCompra id="comprobante" version="1.1.0">
  <infoTributaria>
    <ambiente>2</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>CORPORACION AGROPECUARIA S.A.</razonSocial>
    <nombreComercial>AGROCORP</nombreComercial>
    <ruc>0931048003001</ruc>
    <claveAcceso>1508202603093104800300120010010000000991234567814</claveAcceso>
    <codDoc>03</codDoc>
    <estab>001</estab>
    <ptoEmi>001</ptoEmi>
    <secuencial>000000099</secuencial>
    <dirMatriz>Km 14.5 Via a Daule</dirMatriz>
  </infoTributaria>
  <infoLiquidacionCompra>
    <fechaEmision>15/08/2026</fechaEmision>
    <dirEstablecimiento>Guayaquil, Parque Industrial</dirEstablecimiento>
    <obligadoContabilidad>SI</obligadoContabilidad>
    <tipoIdentificacionProveedor>05</tipoIdentificacionProveedor>
    <razonSocialProveedor>MANUEL ANTONIO QUINTO ZAMBRANO</razonSocialProveedor>
    <identificacionProveedor>0923456789</identificacionProveedor>
    <direccionProveedor>Recinto Los Laureles, Manabi</direccionProveedor>
    <totalSinImpuestos>250.00</totalSinImpuestos>
    <totalDescuento>0.00</totalDescuento>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>4</codigoPorcentaje>
        <baseImponible>250.00</baseImponible>
        <tarifa>15.00</tarifa>
        <valor>37.50</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <importeTotal>287.50</importeTotal>
    <moneda>DOLAR</moneda>
    <pagos>
      <pago>
        <formaPago>01</formaPago>
        <total>287.50</total>
        <plazo>0</plazo>
        <unidadTiempo>dias</unidadTiempo>
      </pago>
    </pagos>
  </infoLiquidacionCompra>
  <detalles>
    <detalle>
      <codigoPrincipal>SERV-001</codigoPrincipal>
      <descripcion>Servicio de cosecha manual de cacao fino de aroma</descripcion>
      <cantidad>50.000000</cantidad>
      <precioUnitario>5.000000</precioUnitario>
      <descuento>0.00</descuento>
      <precioTotalSinImpuesto>250.00</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>4</codigoPorcentaje>
          <tarifa>15.00</tarifa>
          <baseImponible>250.00</baseImponible>
          <valor>37.50</valor>
        </impuesto>
      </impuestos>
    </detalle>
  </detalles>
  <infoAdicional>
    <campoAdicional nombre="Sector">Agricola</campoAdicional>
  </infoAdicional>
</liquidacionCompra>
]]></comprobante>
</autorizacion>`
    const data = getFullInvoiceDataFromXml(mockLiqXml)
    expect(data.accessKey).toBe('1508202603093104800300120010010000000991234567814')
    expect(data.typeDoc).toBe('03')
    expect(data.numberDocument).toBe('001-001-000000099')
    expect(data.emissionDate).toBe('15/08/2026')

    // Info Liquidacion
    expect(data.infoLiquidacionCompra?.razonSocialProveedor).toBe('MANUEL ANTONIO QUINTO ZAMBRANO')
    expect(data.infoLiquidacionCompra?.identificacionProveedor).toBe('0923456789')
    expect(data.infoLiquidacionCompra?.tipoIdentificacionProveedor).toBe('05')
    expect(data.infoLiquidacionCompra?.importeTotal).toBe('287.50')

    // Details
    expect(data.details).toHaveLength(1)
    expect(data.details[0]?.codigoPrincipal).toBe('SERV-001')
    expect(data.details[0]?.descripcion).toBe('Servicio de cosecha manual de cacao fino de aroma')
    expect(data.details[0]?.precioTotalSinImpuesto).toBe('250.00')

    // Payments
    expect(data.payments).toHaveLength(1)
    expect(data.payments[0]?.formaPago).toBe('SIN UTILIZACIÓN DEL SISTEMA FINANCIERO')

    // Totals
    expect(data.totals).toContainEqual({ name: 'SUBTOTAL 15 %', valor: 250 })
    expect(data.totals).toContainEqual({ name: 'SUBTOTAL SIN IMPUESTOS', valor: 250 })
    expect(data.totals).toContainEqual({ name: 'IVA 15', valor: 37.5 })
    expect(data.totals).toContainEqual({ name: 'VALOR TOTAL', valor: 287.5 })
  })

  it('filters retention agent resolutions by code correctly', () => {
    const res1 = getResolutionsByAgentCode('1')
    expect(res1.length).toBe(3)
    expect(res1.map(r => r.value)).toEqual([
      'NAC-DNCRASC20-00000001',
      'NAC-GTRRIOC21-00000001',
      'NAC-GTRRIOC22-00000001',
    ])

    const res8 = getResolutionsByAgentCode('8')
    expect(res8.length).toBe(1)
    expect(res8[0].value).toBe('NAC-DGERCGC24-00000008')

    const res10 = getResolutionsByAgentCode('10')
    expect(res10.length).toBe(2)
    expect(res10.map(r => r.value)).toEqual([
      'NAC-DGERCGC25-00000010',
      'NAC-DGERCGC26-00000010',
    ])

    const all = getResolutionsByAgentCode()
    expect(all.length).toBe(7)
  })

  it('should successfully parse a mock Credit Note (Nota de Crédito) with 0% IVA without duplicate subtotals', () => {
    const mockNcXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<autorizacion>
  <estado>AUTORIZADO</estado>
  <numeroAutorizacion>2108202604070648210600120020020000000062295140519</numeroAutorizacion>
  <fechaAutorizacion>2026-08-21T20:48:47.000Z</fechaAutorizacion>
  <ambiente>PRODUCCIÓN</ambiente>
  <comprobante><![CDATA[<?xml version="1.0" encoding="UTF-8" standalone="no"?><notaCredito xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="comprobante" version="1.1.0">
  <infoTributaria>
    <ambiente>2</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>RAMIREZ BLACIO MARIA ANDREA</razonSocial>
    <nombreComercial>RAMIREZ BLACIO MARIA ANDREA</nombreComercial>
    <ruc>0706482106001</ruc>
    <claveAcceso>2108202604070648210600120020020000000062295140519</claveAcceso>
    <codDoc>04</codDoc>
    <estab>002</estab>
    <ptoEmi>002</ptoEmi>
    <secuencial>000000006</secuencial>
    <dirMatriz>EL ORO / MACHALA / MACHALA / CENTRAL S/N</dirMatriz>
  </infoTributaria>
  <infoNotaCredito>
    <fechaEmision>21/08/2026</fechaEmision>
    <dirEstablecimiento>EL ORO / MACHALA / MACHALA / CENTRAL S/N</dirEstablecimiento>
    <tipoIdentificacionComprador>04</tipoIdentificacionComprador>
    <razonSocialComprador>CAMARONERA CAMANMOR S A</razonSocialComprador>
    <identificacionComprador>0791768209001</identificacionComprador>
    <obligadoContabilidad>NO</obligadoContabilidad>
    <codDocModificado>01</codDocModificado>
    <numDocModificado>002-002-000000810</numDocModificado>
    <fechaEmisionDocSustento>12/08/2026</fechaEmisionDocSustento>
    <totalSinImpuestos>47.5</totalSinImpuestos>
    <valorModificacion>47.5</valorModificacion>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>0</codigoPorcentaje>
        <baseImponible>47.50</baseImponible>
        <valor>0.00</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <motivo>Error Facturación</motivo>
  </infoNotaCredito>
  <detalles>
    <detalle>
      <codigoInterno>11005</codigoInterno>
      <descripcion>CADENILLA DISTRINBUCION P/M CB1/JL110/XY125-30A/RAY-Z 25H-90L</descripcion>
      <cantidad>5</cantidad>
      <precioUnitario>9.5</precioUnitario>
      <descuento>0.00</descuento>
      <precioTotalSinImpuesto>47.50</precioTotalSinImpuesto>
      <detallesAdicionales>
        <detAdicional nombre="Name.Orden" valor="5 CADENILLAS"/>
      </detallesAdicionales>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>0</codigoPorcentaje>
          <tarifa>0.00</tarifa>
          <baseImponible>47.50</baseImponible>
          <valor>0.00</valor>
        </impuesto>
      </impuestos>
    </detalle>
  </detalles>
  <infoAdicional>
    <campoAdicional nombre="RUC Proveedor">0931048003001</campoAdicional>
    <campoAdicional nombre="Comentarios">Por Error de Facturacion Item</campoAdicional>
  </infoAdicional>
</notaCredito>
]]></comprobante>
</autorizacion>`
    const data = getFullInvoiceDataFromXml(mockNcXml)
    expect(data.accessKey).toBe('2108202604070648210600120020020000000062295140519')
    expect(data.typeDoc).toBe('04')
    expect(data.details).toHaveLength(1)
    expect(data.details[0]?.codigoPrincipal).toBe('11005')
    expect(data.details[0]?.codigoInterno).toBe('11005')
    expect(data.details[0]?.detallesAdicionales?.detAdicional[0]?.['@nombre']).toBe('Name.Orden')
    expect(data.details[0]?.detallesAdicionales?.detAdicional[0]?.['@valor']).toBe('5 CADENILLAS')

    // Verify totals: exactly one SUBTOTAL 0 % and correct VALOR TOTAL from valorModificacion
    const subtotal0Count = data.totals.filter(t => t.name === 'SUBTOTAL 0 %').length
    expect(subtotal0Count).toBe(1)
    expect(data.totals).toContainEqual({ name: 'SUBTOTAL 0 %', valor: 47.5 })
    expect(data.totals).toContainEqual({ name: 'SUBTOTAL SIN IMPUESTOS', valor: 47.5 })
    expect(data.totals).toContainEqual({ name: 'IVA 0%', valor: 0 })
    expect(data.totals).toContainEqual({ name: 'VALOR TOTAL', valor: 47.5 })
    // TOTAL DESCUENTO should not be present when discount is 0 on credit note
    expect(data.totals.some(t => t.name === 'TOTAL DESCUENTO')).toBe(false)
  })

  it('should parse Credit Note item with codigoInterno (e.g. 10967) and additional details correctly', () => {
    const userNcXml = `<?xml version="1.0" encoding="utf-8"?>
<autorizacion>
  <estado>AUTORIZADO</estado>
  <numeroAutorizacion>2408202604093104800300120010010000000551234567811</numeroAutorizacion>
  <fechaAutorizacion>24/08/2026 19:30:00</fechaAutorizacion>
  <comprobante><![CDATA[<?xml version="1.0" encoding="utf-8"?>
<notaCredito id="comprobante" version="1.1.0">
  <infoTributaria>
    <ambiente>2</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>REPUESTOS Y MOTOS S.A.</razonSocial>
    <ruc>0931048003001</ruc>
    <claveAcceso>2408202604093104800300120010010000000551234567811</claveAcceso>
    <codDoc>04</codDoc>
    <estab>001</estab>
    <ptoEmi>001</ptoEmi>
    <secuencial>000000055</secuencial>
    <dirMatriz>Guayaquil</dirMatriz>
  </infoTributaria>
  <infoNotaCredito>
    <fechaEmision>24/08/2026</fechaEmision>
    <tipoIdentificacionComprador>04</tipoIdentificacionComprador>
    <razonSocialComprador>MOTOS DEL ECUADOR S.A.</razonSocialComprador>
    <identificacionComprador>0991234567001</identificacionComprador>
    <obligadoContabilidad>SI</obligadoContabilidad>
    <codDocModificado>01</codDocModificado>
    <numDocModificado>001-001-000012345</numDocModificado>
    <fechaEmisionDocSustento>20/08/2026</fechaEmisionDocSustento>
    <totalSinImpuestos>8.55</totalSinImpuestos>
    <valorModificacion>8.55</valorModificacion>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>0</codigoPorcentaje>
        <baseImponible>8.55</baseImponible>
        <valor>0.00</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <motivo>DEVOLUCION PARCIAL</motivo>
  </infoNotaCredito>
  <detalles>
    <detalle>
      <codigoInterno>10967</codigoInterno>
      <descripcion>KIT TEMPLADOR GUIA DE CADENILLA DISTRIBUCIÓN P/MOTO SHINERAY GN125/150</descripcion>
      <cantidad>1</cantidad>
      <precioUnitario>8.55</precioUnitario>
      <descuento>0.00</descuento>
      <precioTotalSinImpuesto>8.55</precioTotalSinImpuesto>
      <detallesAdicionales>
        <detAdicional nombre="Name.Orden" valor="1 TEMPLADORES DE CADENILLA P/M SHINERAY 150"/>
      </detallesAdicionales>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>0</codigoPorcentaje>
          <tarifa>0.00</tarifa>
          <baseImponible>8.55</baseImponible>
          <valor>0.00</valor>
        </impuesto>
      </impuestos>
    </detalle>
  </detalles>
</notaCredito>
]]></comprobante>
</autorizacion>`

    const data = getFullInvoiceDataFromXml(userNcXml)
    expect(data.typeDoc).toBe('04')
    expect(data.details).toHaveLength(1)
    expect(data.details[0]?.codigoPrincipal).toBe('10967')
    expect(data.details[0]?.codigoInterno).toBe('10967')
    expect(data.details[0]?.descripcion).toBe('KIT TEMPLADOR GUIA DE CADENILLA DISTRIBUCIÓN P/MOTO SHINERAY GN125/150')
    expect(data.details[0]?.detallesAdicionales?.detAdicional[0]?.['@nombre']).toBe('Name.Orden')
    expect(data.details[0]?.detallesAdicionales?.detAdicional[0]?.['@valor']).toBe('1 TEMPLADORES DE CADENILLA P/M SHINERAY 150')
    expect(data.totals).toContainEqual({ name: 'SUBTOTAL 0 %', valor: 8.55 })
    expect(data.totals).toContainEqual({ name: 'SUBTOTAL SIN IMPUESTOS', valor: 8.55 })
    expect(data.totals).toContainEqual({ name: 'IVA 0%', valor: 0 })
    expect(data.totals).toContainEqual({ name: 'VALOR TOTAL', valor: 8.55 })
  })
})
