export const mockFactura = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<autorizacion>
  <estado>AUTORIZADO</estado>
  <numeroAutorizacion>0106202601093104800300120010010000001739257787819</numeroAutorizacion>
  <fechaAutorizacion>2026-06-01T12:42:57-05:00</fechaAutorizacion>
  <ambiente>PRODUCCIÓN</ambiente>
  <comprobante><![CDATA[<?xml version="1.0" encoding="UTF-8" standalone="no"?><factura xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="comprobante" version="1.1.0">
  <infoTributaria>
    <ambiente>2</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>Christian Manuel Lopez Camacho</razonSocial>
    <nombreComercial>clopezpro</nombreComercial>
    <ruc>0931048003001</ruc>
    <claveAcceso>1234567891111111111111111111111111111111111111111</claveAcceso>
    <codDoc>01</codDoc>
    <estab>001</estab>
    <ptoEmi>001</ptoEmi>
    <secuencial>000000173</secuencial>
    <dirMatriz>ECUADOR-GUAYAQUIL</dirMatriz>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>01/06/2026</fechaEmision>
    <dirEstablecimiento>ECUADOR-GUAYAQUIL</dirEstablecimiento>
    <obligadoContabilidad>NO</obligadoContabilidad>
    <tipoIdentificacionComprador>04</tipoIdentificacionComprador>
    <razonSocialComprador>ALMACENES EL AHORRO S.A.</razonSocialComprador>
    <identificacionComprador>12345678910</identificacionComprador>
    <direccionComprador>MANABI / PORTOVIEJO / AV. UNIVERSITARIA Y AVENIDA DE LOS ATLETAS</direccionComprador>
    <totalSinImpuestos>16.52</totalSinImpuestos>
    <totalDescuento>0</totalDescuento>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>4</codigoPorcentaje>
        <baseImponible>16.52</baseImponible>
        <tarifa>15</tarifa>
        <valor>2.48</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <importeTotal>19</importeTotal>
    <moneda>DOLAR</moneda>
    <pagos>
      <pago>
        <formaPago>20</formaPago>
        <total>19.00</total>
        <plazo>0</plazo>
        <unidadTiempo>dias</unidadTiempo>
      </pago>
    </pagos>
  </infoFactura>
  <detalles>
    <detalle>
      <codigoPrincipal>10002</codigoPrincipal>
      <descripcion>Visualizacion de ejemplo para el lector de xml sri</descripcion>
      <cantidad>1</cantidad>
      <precioUnitario>16.521739</precioUnitario>
      <descuento>0.00</descuento>
      <precioTotalSinImpuesto>16.52</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>4</codigoPorcentaje>
          <tarifa>15</tarifa>
          <baseImponible>16.52</baseImponible>
          <valor>2.48</valor>
        </impuesto>
      </impuestos>
    </detalle>
  </detalles>
  <infoAdicional>
    <campoAdicional nombre="Generado por">Pruebas de lectura</campoAdicional>
    <campoAdicional nombre="Se genera CXC-52 ">Por $ 19 a pagar en 0 días</campoAdicional>
    <campoAdicional nombre="Cuentas Autorizadas">B.Pichincha/ 2203811776/ ahorros / Chistrian Lopez</campoAdicional>
  </infoAdicional>
<ds:Signature xmlns:etsi="http://uri.etsi.org/01903/v1.3.2#" Id="Signature318228">
<ds:SignedInfo Id="Signature-SignedInfo723786">
<ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
<ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
<ds:Reference Id="SignedPropertiesID191857" Type="http://uri.etsi.org/01903#SignedProperties" URI="#Signature318228-SignedProperties543965">
<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
<ds:DigestValue>PS0bHiZEogct4orh0LqcD9VEoDk=</ds:DigestValue>
</ds:Reference>
<ds:Reference URI="#Certificate1539676">
<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
<ds:DigestValue>91QSBzC7Ztm51RQy3yrtdYGtygc=</ds:DigestValue>
</ds:Reference>
<ds:Reference Id="Reference-ID-403107" URI="#comprobante">
<ds:Transforms>
<ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
</ds:Transforms>
<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
<ds:DigestValue>29C0bB9/nFnfmoThHuqmoxIoUfo=</ds:DigestValue>
</ds:Reference>
</ds:SignedInfo>
<ds:SignatureValue Id="SignatureValue460581">
Huon9rvRX6nKWXS0T/nsusp2x6CmunknJSdidjkQ4aFpAqblxG3RFjP93p85AY2ry437V/WCqD95
+XgKlVy84C2UfAE1L9WEa4LPpGXjrfcUJzbn9EOovubXsLbQp6JAEv5o8qjI55wygqRCg119Ii8s
Du3ilq77/0Rt1V4GpnI3NjdhcgopSJrksvHkGj7pdSC7K1uWoDx3bzL9hGM1bHX4vurD3QQvg1jH
uUNYmIBz/5v/QRBYsg7nKcJJVt/COxLNr+maIZ3XxBeeePz6wKfWF5cMmeAJAWesYaUHtIs06k4Q
nPFoBqYrGPVYM6Q26sUobTBo3A2RrOLkwb7MSg==
</ds:SignatureValue>
<ds:KeyInfo Id="Certificate1539676">
<ds:X509Data>
<ds:X509Certificate>
MIIJIDCCBwigAwIBAgIIavjwz6s1+rYwDQYJKoZIhvcNAQELBQAwgbgxCzAJBgNVBAYTAkVTMUQw
QgYDVQQHDDtCYXJjZWxvbmEgKHNlZSBjdXJyZW50IGFkZHJlc3MgYXQgd3d3LnVhbmF0YWNhLmNv
bS9hZGRyZXNzKTEWMBQGA1UECgwNVUFOQVRBQ0EgUy5BLjEVMBMGA1UECwwMVFNQLVVBTkFUQUNB
MRowGAYDVQQDDBFVQU5BVEFDQSBDQTIgMjAxNjEYMBYGA1UEYQwPVkFURVMtQTY2NzIxNDk5MB4X
DTI2MDMwNjE5NDkwMFoXDTI3MDMwNjE5NDkwMFowgaIxCzAJBgNVBAYTAkVDMRYwFAYDVQQEDA1M
T1BFWiBDQU1BQ0hPMRkwFwYDVQQqDBBDSFJJU1RJQU4gTUFOVUVMMRkwFwYDVQQFExBJRENFQy0w
OTMxMDQ4MDAzMScwJQYDVQQDDB5DSFJJU1RJQU4gTUFOVUVMIExPUEVaIENBTUFDSE8xHDAaBgNV
BGEME1RJTkVDLTA5MzEwNDgwMDMwMDEwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCG
VbFqIKrrzvzl1N2fy67+zsJRixTCaEsIraAsoIYP/QAWYfUFg6IZJ/xOG5fubPHjXZ2krmdpullU
4WBFH3VGWYLr0jVxlQ8iCaKUq/kw6LK06xXF8CVUnjQ8ZVmXNEjIhBmrVd4sGhxydvxskGlK7YNL
7PeHqoH+U+akMNz0KMBvDy+iWJui4pAtAkn6pJvTgMxDmIfe4HyesDC7//bmf/MZJjf/lkTbOxyn
XzksIpGfTwIa4HQRMoyfghxoIZi3z8n6ZUhwhywUCdQX7pi+eMTdNl90PTy38UWtcMiKY11CfdWr
vQqToYegDh950AJYKTA8LQGceLzkdSAAjQTLAgMBAAGjggRAMIIEPDAbBgsrBgEEAYLxNmYDAQQM
DAowOTMxMDQ4MDAzMB4GCysGAQQBgvE2ZgMLBA8MDTA5MzEwNDgwMDMwMDEwgdcGCCsGAQUFBwEB
BIHKMIHHMFUGCCsGAQUFBzAChklodHRwOi8vd3d3LnVhbmF0YWNhLmNvbS9wdWJsaWMvZG93bmxv
YWQvdHNwX2NlcnRpZmljYXRlcy9zdWJvcmRpbmF0ZTIuY3J0MDYGCCsGAQUFBzABhipodHRwOi8v
b2NzcDEudWFuYXRhY2EuY29tL3B1YmxpYy9wa2kvb2NzcC8wNgYIKwYBBQUHMAGGKmh0dHA6Ly9v
Y3NwMi51YW5hdGFjYS5jb20vcHVibGljL3BraS9vY3NwLzAdBgNVHQ4EFgQUNG50EseWmWWR1PjR
wZMy5rr5FXAwDAYDVR0TAQH/BAIwADAfBgNVHSMEGDAWgBR9V+dgc84HRqnio2jw4RGydJJz/TCB
kAYDVR0gBIGIMIGFMIGCBgwrBgEEAYLxNmYCAQEwcjA3BggrBgEFBQcCARYraHR0cHM6Ly93d3cu
dWFuYXRhY2EuY29tL3B1YmxpYy9wa2kvZHBjLWVjLzA3BggrBgEFBQcCAjArDClDRVJUSUZJQ0FE
TyBERSBQRVJTT05BIE5BVFVSQUwgRU4gQVJDSElWTzCBjwYDVR0fBIGHMIGEMECgPqA8hjpodHRw
Oi8vY3JsMS51YW5hdGFjYS5jb20vcHVibGljL3BraS9jcmwvQ0Eyc3Vib3JkaW5hZGEuY3JsMECg
PqA8hjpodHRwOi8vY3JsMi51YW5hdGFjYS5jb20vcHVibGljL3BraS9jcmwvQ0Eyc3Vib3JkaW5h
ZGEuY3JsMA4GA1UdDwEB/wQEAwIF4DAdBgNVHSUEFjAUBggrBgEFBQcDAgYIKwYBBQUHAwQwggF/
BgNVHREEggF2MIIBcoEVY2xvcGV6cHJvQG91dGxvb2suY29toBsGCysGAQQBgvE2ZgMBoAwMCjA5
MzEwNDgwMDOgIQYLKwYBBAGC8TZmAwKgEgwQQ0hSSVNUSUFOIE1BTlVFTKAWBgsrBgEEAYLxNmYD
A6AHDAVMT1BFWqAYBgsrBgEEAYLxNmYDBKAJDAdDQU1BQ0hPoDAGCysGAQQBgvE2ZgMHoCEMH0xP
UkVOWk8gREUgR0FSQUlDT0EgWSBBUkdFTlRJTkGgHwYLKwYBBAGC8TZmAwigEAwOMDA1OTM5NjEy
NTU4NDigGgYLKwYBBAGC8TZmAwmgCwwJR1VBWUFRVUlMoB4GCysGAQQBgvE2ZgMLoA8MDTA5MzEw
NDgwMDMwMDGgEwYLKwYBBAGC8TZmAwygBAwCRUOgKQYLKwYBBAGC8TZmAzKgGgwYUEVSU09OQSBO
QVRVUkFMIE8gRklTSUNBoBgGCysGAQQBgvE2ZgMzoAkMB0FSQ0hJVk8wDQYJKoZIhvcNAQELBQAD
ggIBAJkdKdRrpYDqk04EFGP7a7yzH5CwUpqfr8NXf6SbhlHmxycB8UntDK16kvX52i6B6QKb4d7l
6py/2popGUsauAR1X3WkiJErzaxykO3i+OEdybBA6amXNHgQxZbPZbCvl/gCgH6SJYL2QJUOElmD
uZEfgFdw6BhLmqScbJb4FkXzaIkyMt2ULAWNm0JtVqmE0r0SoCF0DqkRbeN4bIguYD31P7jIp0qe
U9XG2v74sVgycO2WdrB270bnWopA4MNnmH+SJ6xIdX06vwVBkEBMIo03hoabjUIaBCnThj8lJoe6
Zef6nuYEBwM2Uyl+PAZjGtnIBlvsPx/ojJmgv9V71SC5kE+E0AVpMKzKgJNxEZKgnbpAgAmMQuqt
hRfjZHGw5yn9YMig3y64SdpKfxIAd5Hit5DXJJlGZZyvZJPq6vZYvrNKlYkmGeTFh0Vu53htYYJY
zp70YLVHix0iYSvbwSS5zl97hsvX4mt2UTebdpA1xYf8HSzdsXpLvO1Jv+1YWg4EEjklUpbaBHLE
64elKcREqKL/1nIV2wTe6sAeKhTK5ecxHhfrIzl7qRrO2z0YBXAjasmTY8hp2/a/sMQFyN21QGZY
Nutob0oMYRygLMUK5tQiOiN+rBR5/t/CDy+rqb9CNAWO95unBNwymqjK6py0Ii1GtgRvly2ekBIL
MozP
</ds:X509Certificate>
</ds:X509Data>
<ds:KeyValue>
<ds:RSAKeyValue>
<ds:Modulus>
hlWxaiCq68785dTdn8uu/s7CUYsUwmhLCK2gLKCGD/0AFmH1BYOiGSf8ThuX7mzx412dpK5nabpZ
VOFgRR91RlmC69I1cZUPIgmilKv5MOiytOsVxfAlVJ40PGVZlzRIyIQZq1XeLBoccnb8bJBpSu2D
S+z3h6qB/lPmpDDc9CjAbw8volibouKQLQJJ+qSb04DMQ5iH3uB8nrAwu//25n/zGSY3/5ZE2zsc
p185LCKRn08CGuB0ETKMn4IcaCGYt8/J+mVIcIcsFAnUF+6YvnjE3TZfdD08t/FFrXDIimNdQn3V
q70Kk6GHoA4fedACWCkwPC0BnHi85HUgAI0Eyw==
</ds:Modulus>
<ds:Exponent>AQAB</ds:Exponent>
</ds:RSAKeyValue>
</ds:KeyValue>
</ds:KeyInfo>
<ds:Object Id="Signature318228-Object408136"><etsi:QualifyingProperties Target="#Signature318228"><etsi:SignedProperties Id="Signature318228-SignedProperties543965"><etsi:SignedSignatureProperties><etsi:SigningTime>2026-06-01T17:42:56+00:00</etsi:SigningTime><etsi:SigningCertificate><etsi:Cert><etsi:CertDigest><ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/><ds:DigestValue>ztmNLu/U55gdOK0Sv1cfbzse6e4=</ds:DigestValue></etsi:CertDigest><etsi:IssuerSerial><ds:X509IssuerName>2.5.4.97=#0c0f56415445532d413636373231343939,CN=UANATACA CA2 2016,OU=TSP-UANATACA,O=UANATACA S.A.,L=Barcelona (see current address at www.uanataca.com/address),C=ES</ds:X509IssuerName><ds:X509SerialNumber>7708175536965941942</ds:X509SerialNumber></etsi:IssuerSerial></etsi:Cert></etsi:SigningCertificate></etsi:SignedSignatureProperties><etsi:SignedDataObjectProperties><etsi:DataObjectFormat ObjectReference="#Reference-ID-403107"><etsi:Description>contenido comprobante</etsi:Description><etsi:MimeType>text/xml</etsi:MimeType></etsi:DataObjectFormat></etsi:SignedDataObjectProperties></etsi:SignedProperties></etsi:QualifyingProperties></ds:Object></ds:Signature></factura>]]></comprobante>
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
