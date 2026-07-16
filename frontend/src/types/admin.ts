export interface AdminStats {
  totalIngresos: number
  totalPedidos: number
  clientesNuevos: number
  ticketPromedio: number
  tasaConversion: number
  enviosActivos: number
  pedidosPendientes: number
  mensajesSinResponder: number
}

export interface Customer {
  id: string
  nombre: string
  apellidos: string
  email: string
  telefono: string
  empresa?: string
  totalGastado: number
  numeroCompras: number
  ultimaCompra: string
  estado: 'activo' | 'inactivo' | 'suspendido'
  fechaAlta: string
}

export interface OrderAdmin {
  id: string
  numero: string
  cliente: {
    id: string
    nombre: string
    email: string
  }
  fecha: string
  estado: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado'
  total: number
  items: number
  estadoPago: 'pendiente' | 'pagado' | 'reembolsado'
}

export interface Invoice {
  id: string
  numero: string
  pedidoId: string
  cliente: string
  fecha: string
  total: number
  estado: 'pendiente' | 'pagada' | 'vencida'
  rutaPDF?: string
}

export interface SupportTicketAdmin {
  id: string
  numero: string
  cliente: string
  asunto: string
  estado: 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado'
  categoria: string
  fechaCreacion: string
  ultimaRespuesta: string
  respuestasNoLeidas: number
}

export interface DashboardChart {
  label: string
  datos: number[]
  meses: string[]
}

export interface ReportData {
  mes: string
  ingresos: number
  pedidos: number
  clientes: number
  devoluciones: number
}
