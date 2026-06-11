import React, { useState, useEffect } from 'react'
import { getFullInvoiceDataFromXml } from '@sri-xml-viewer/core'

export interface VisorXmlProps {
  xml: string
  logoUrl?: string
}

export const VisorXml: React.FC<VisorXmlProps> = ({ xml, logoUrl }) => {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!xml) return
    try {
      const parsed = getFullInvoiceDataFromXml(xml)
      setData(parsed)
      setError('')
    } catch (e: any) {
      setError(e.message || 'Error al procesar el XML')
      console.error(e)
    }
  }, [xml])

  return (
    <div style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>Visor XML (React)</h3>
      {error && <div style={{ color: 'red', fontWeight: 'bold' }}>{error}</div>}
      {data && !error && (
        <div style={{ fontSize: '14px' }}>
          <p><strong>Clave de Acceso:</strong> {data.accessKey}</p>
          <p><strong>Fecha de Emisión:</strong> {data.emissionDate}</p>
          <p><strong>RUC Emisor:</strong> {data.infoTributaria?.ruc}</p>
          <p><strong>Razón Social:</strong> {data.infoTributaria?.razonSocial}</p>
        </div>
      )}
    </div>
  )
}

export default VisorXml
