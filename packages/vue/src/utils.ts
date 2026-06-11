export function formatToMoney(val: any, type?: string): string {
  if (val === undefined || val === null || val === '') return type === 'decimal' ? '0.00' : '$0.00'
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return type === 'decimal' ? '0.00' : '$0.00'
  if (type === 'decimal') {
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
