export const mockFactura = `<?xml version="1.0" encoding="utf-8"?>
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
      <descripcion>Laptop Pro 15" M3 16GB RAM 512GB SSD</descripcion>
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
      <detallesAdicionales>
        <detAdicional nombre="Garantia" valor="1 año"/>
        <detAdicional nombre="Color" valor="Gris Espacial"/>
      </detallesAdicionales>
    </detalle>
    <detalle>
      <codigoPrincipal>PROD002</codigoPrincipal>
      <descripcion>Mouse Optico Inalambrico Ergonomico Recargable</descripcion>
      <cantidad>2.000000</cantidad>
      <precioUnitario>15.00</precioUnitario>
      <descuento>0.00</descuento>
      <precioTotalSinImpuesto>30.00</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>2</codigoPorcentaje>
          <tarifa>12.00</tarifa>
          <baseImponible>30.00</baseImponible>
          <valor>3.60</valor>
        </impuesto>
      </impuestos>
    </detalle>
  </detalles>
  <infoAdicional>
    <campoAdicional nombre="Email">juan.perez@example.com</campoAdicional>
    <campoAdicional nombre="Telefono">0999999999</campoAdicional>
    <campoAdicional nombre="Vendedor">Carlos Lopez</campoAdicional>
  </infoAdicional>
</factura>
]]></comprobante>
</autorizacion>`

export const mockNotaCredito = `<?xml version="1.0" encoding="utf-8"?>
<autorizacion>
  <estado>AUTORIZADO</estado>
  <numeroAutorizacion>1206202604179001124800120010040000004561234567819</numeroAutorizacion>
  <fechaAutorizacion>12/06/2026 09:12:15</fechaAutorizacion>
  <comprobante><![CDATA[<?xml version="1.0" encoding="utf-8"?>
<notaCredito id="comprobante" version="1.0.0">
  <infoTributaria>
    <ambiente>1</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>ALMACENES EL AHORRO S.A.</razonSocial>
    <nombreComercial>EL AHORRO DE ECUADOR</nombreComercial>
    <ruc>1790011248001</ruc>
    <claveAcceso>1206202604179001124800120010040000004561234567819</claveAcceso>
    <codDoc>04</codDoc>
    <estab>001</estab>
    <ptoEmi>001</ptoEmi>
    <secuencial>000000456</secuencial>
    <dirMatriz>Av. 10 de Agosto N34-12 y Rumipamba</dirMatriz>
  </infoTributaria>
  <infoNotaCredito>
    <fechaEmision>12/06/2026</fechaEmision>
    <dirEstablecimiento>Av. de los Shyris N38-45 y Holanda</dirEstablecimiento>
    <tipoIdentificacionComprador>04</tipoIdentificacionComprador>
    <razonSocialComprador>JUAN PEREZ SANDOVAL</razonSocialComprador>
    <identificacionComprador>1712345678001</identificacionComprador>
    <obligadoContabilidad>SI</obligadoContabilidad>
    <codDocModificado>01</codDocModificado>
    <numDocModificado>001-001-000000123</numDocModificado>
    <fechaEmisionDocSustento>11/06/2026</fechaEmisionDocSustento>
    <totalSinImpuestos>15.00</totalSinImpuestos>
    <valorModificado>16.80</valorModificado>
    <moneda>DOLAR</moneda>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>2</codigoPorcentaje>
        <baseImponible>15.00</baseImponible>
        <valor>1.80</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <motivo>DEVOLUCION DE MOUSE OPTICO INALAMBRICO POR DEFECTO</motivo>
  </infoNotaCredito>
  <detalles>
    <detalle>
      <codigoInterno>PROD002</codigoInterno>
      <descripcion>Mouse Optico Inalambrico Ergonomico Recargable</descripcion>
      <cantidad>1.000000</cantidad>
      <precioUnitario>15.00</precioUnitario>
      <descuento>0.00</descuento>
      <precioTotalSinImpuesto>15.00</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>2</codigoPorcentaje>
          <tarifa>12.00</tarifa>
          <baseImponible>15.00</baseImponible>
          <valor>1.80</valor>
        </impuesto>
      </impuestos>
    </detalle>
  </detalles>
  <infoAdicional>
    <campoAdicional nombre="Email">juan.perez@example.com</campoAdicional>
    <campoAdicional nombre="Observacion">Nota de crédito generada automáticamente por devolución de mercadería.</campoAdicional>
  </infoAdicional>
</notaCredito>
]]></comprobante>
</autorizacion>`
