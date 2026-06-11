export interface ITypesIvaFee {
  label: string
  code: string
  declarationCode: number
  fee: number
  status: boolean
}

export const typesIvaFee: ITypesIvaFee[] = [
  { label: '0%', code: '0', declarationCode: 507, fee: 0, status: true },
  { label: '12%', code: '2', declarationCode: 500, fee: 12, status: false },
  { label: '14%', code: '3', declarationCode: 500, fee: 14, status: false },
  { label: 'No Objeto de Impuesto', code: '6', declarationCode: 532, fee: 0, status: true },
  { label: 'Exento de IVA', code: '7', declarationCode: 532, fee: 0, status: true },
  { label: '13%', code: '10', declarationCode: 500, fee: 13, status: false },
  { label: '15%', code: '4', declarationCode: 500, fee: 15, status: true },
  { label: '5%', code: '5', declarationCode: 540, fee: 5, status: true },
  { label: 'Iva Diferenciado', code: '8', declarationCode: 500, fee: 5, status: false },
]

export const typeRtFee = [
  { value: '2', code: '1', label: 'I_Renta' },
  { value: '1', code: '2', label: 'IVA' },
  { value: '3', code: '6', label: 'ISD' },
]

export const typeDocument = [
  { value: '01', label: 'FACTURA', shortName: 'FAC' },
  { value: '03', label: 'LIQUIDACIÓN DE COMPRA DE BIENES Y PRESTACIÓN DE SERVICIOS', shortName: 'LIQ' },
  { value: '04', label: 'NOTA DE CRÉDITO', shortName: 'NC' },
  { value: '05', label: 'NOTA DE DÉBITO', shortName: 'ND' },
  { value: '06', label: 'GUÍA DE REMISIÓN', shortName: 'GR' },
  { value: '07', label: 'RETENCIÓN', shortName: 'RET' },
]

export const TYPE_IDENTITY = [
  { label: 'RUC', value: '04', forForm: true },
  { label: 'Cédula', value: '05', forForm: true },
  { label: 'Pasaporte', value: '06', forForm: true },
  { label: 'Consumidor Final', value: '07' },
  { label: 'Identificación del Exterior', value: '08', forForm: true },
  { label: 'Placa', value: '09' },
]

export const typesPaymentSRI = [
  { value: '01', label: 'SIN UTILIZACIÓN DEL SISTEMA FINANCIERO' },
  { value: '15', label: 'COMPENSACIÓN DE DEUDAS' },
  { value: '16', label: 'TARJETA DE DÉBITO' },
  { value: '17', label: 'DINERO ELECTRÓNICO' },
  { value: '18', label: 'TARJETA PREPAGO' },
  { value: '19', label: 'TARJETA DE CRÉDITO' },
  { value: '20', label: 'OTROS CON UTILIZACIÓN DEL SISTEMA FINANCIERO' },
  { value: '21', label: 'ENDOSO DE TÍTULOS' },
]
