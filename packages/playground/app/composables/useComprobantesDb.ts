export interface IStoredComprobante {
  claveAcceso: string
  xml: string
  ambiente: string
  numeroAutorizacion: string
  fechaAutorizacion: string
  tipoComprobante?: string // '01', '04', '05', '06', '07', '03'
  createdAt: number
}

const DB_NAME = 'sri_comprobantes_db'
const DB_VERSION = 1
const STORE_NAME = 'comprobantes'

export function getTipoComprobanteLabel(codigo?: string): string {
  if (!codigo) return 'Comprobante'
  const tipos: Record<string, string> = {
    '01': 'Factura',
    '03': 'Liq. Compra',
    '04': 'Nota de Crédito',
    '05': 'Nota de Débito',
    '06': 'Guía de Remisión',
    '07': 'Retención'
  }
  return tipos[codigo] || `Tipo ${codigo}`
}

export function extractTipoFromClave(claveAcceso: string): string {
  if (claveAcceso && claveAcceso.length >= 10) {
    return claveAcceso.substring(8, 10)
  }
  return '01'
}

export function useComprobantesDb() {
  function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!import.meta.client || typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB no está disponible en este entorno.'))
        return
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'claveAcceso' })
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('tipoComprobante', 'tipoComprobante', { unique: false })
        }
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(request.error || new Error('Error desconocido al abrir IndexedDB.'))
      }
    })
  }

  async function getComprobante(claveAcceso: string): Promise<IStoredComprobante | null> {
    if (!import.meta.client || !window.indexedDB) return null

    try {
      const db = await openDb()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.get(claveAcceso)

        request.onsuccess = () => {
          resolve((request.result as IStoredComprobante) || null)
        }

        request.onerror = () => {
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('Error al obtener comprobante de IndexedDB:', error)
      return null
    }
  }

  async function saveComprobante(item: IStoredComprobante): Promise<void> {
    if (!import.meta.client || !window.indexedDB) return

    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(item)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  async function deleteComprobante(claveAcceso: string): Promise<void> {
    if (!import.meta.client || !window.indexedDB) return

    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(claveAcceso)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  async function listComprobantes(): Promise<IStoredComprobante[]> {
    if (!import.meta.client || !window.indexedDB) return []

    try {
      const db = await openDb()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.getAll()

        request.onsuccess = () => {
          const results = (request.result as IStoredComprobante[]) || []
          // Ordenar de más reciente a más antiguo
          results.sort((a, b) => b.createdAt - a.createdAt)
          resolve(results)
        }

        request.onerror = () => {
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('Error al listar comprobantes de IndexedDB:', error)
      return []
    }
  }

  async function clearAllComprobantes(): Promise<void> {
    if (!import.meta.client || !window.indexedDB) return

    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  return {
    getComprobante,
    saveComprobante,
    deleteComprobante,
    listComprobantes,
    clearAllComprobantes,
    getTipoComprobanteLabel,
    extractTipoFromClave
  }
}
