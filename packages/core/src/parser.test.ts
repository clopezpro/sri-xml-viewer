// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { getFullInvoiceDataFromXml } from './parser'

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
  })
})
