export function formatToMoney(val: any, type?: string): string {
  if (val === undefined || val === null || val === '') return type === 'decimal' ? '0.00' : '$0.00'
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return type === 'decimal' ? '0.00' : '$0.00'
  if (type === 'decimal') {
    const str = String(val).trim()
    const parts = str.split('.')
    if (parts.length === 2 && parts[1].length > 2) {
      return num.toFixed(parts[1].length)
    }
    return num.toFixed(2)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}

export function roundTo(num: number, decimals: number = 2): number {
  return Math.round((num + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export function showDateFormat(dateStr: any, format?: string): string {
  if (!dateStr) return ''
  return String(dateStr)
}
export function showAuthorizationDate(datStr: string | undefined | null) {
  if (!datStr) return undefined
  /* check format */
  const match = datStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)
  if (match) {
    const [_, year, month, day, hour, minute, second] = match
    return `${day}/${month}/${year} ${hour}:${minute}:${second} EC`
  }
  if (datStr.includes('T')) {
    return datStr.split('T')[0] + ' ' + datStr.split('T')[1] + ' ' + 'EC'
  }
  return datStr
}

export function getAdditionalDetailHeader(
  detalles: Array<any>
): string {
  const names: string[] = []
  detalles.forEach((item) => {
    const list = item.detallesAdicionales?.detAdicional || (Array.isArray(item.detallesAdicionales) ? item.detallesAdicionales : [])
    if (Array.isArray(list)) {
      list.forEach((d) => {
        const name = (d['@nombre'] || d.nombre || '').trim()
        if (name && !names.includes(name)) {
          names.push(name)
        }
      })
    }
  })
  if (names.length > 0) {
    return names.join(' / ')
  }
  return 'Detalle Adicional'
}

export function formatAdditionalDetails(
  details?: { '@nombre'?: string, '@valor'?: string, nombre?: string, valor?: string }[]
): string {
  if (!details || !Array.isArray(details) || details.length === 0) return ''
  return details
    .map((d) => {
      const valor = (d['@valor'] || d.valor || '').trim()
      const nombre = (d['@nombre'] || d.nombre || '').trim()
      return valor || nombre
    })
    .filter(Boolean)
    .join('\n')
}


