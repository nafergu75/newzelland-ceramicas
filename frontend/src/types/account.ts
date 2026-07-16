export interface AccountSummary {
  totalFacturado: number
  totalPedidos: number
  pedidosEsteAño: number
  miembroDesde: string
  enviosPendientes: number
  emailVerificado: boolean
  contraseñaRobusta: boolean
}

export interface Producto {
  id: string
  nombre: string
  codigo: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface Pedido {
  id: string
  numero: string
  fecha: string
  estado: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado'
  total: number
  items: Producto[]
  direccion: {
    calle: string
    ciudad: string
    codigoPostal: string
    pais: string
  }
  estadoEnvio?: string
  codigoSeguimiento?: string
}

export interface Envio {
  id: string
  numeroPedido: string
  estado: 'preparacion' | 'en_transito' | 'entregado' | 'incidencia'
  transportista: string
  codigoSeguimiento: string
  enlaceTracking?: string
  timeline: TimelineEvent[]
}

export interface TimelineEvent {
  estado: string
  fecha: string
  descripcion: string
}

export interface Ticket {
  id: string
  numero: string
  asunto: string
  estado: 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado'
  categoria: 'pedido' | 'envio' | 'producto' | 'factura' | 'otro'
  fechaCreacion: string
  ultimaRespuesta: string
  respuestasNoLeidas: number
}

export interface Mensaje {
  id: string
  remitente: 'cliente' | 'soporte'
  contenido: string
  fecha: string
  archivos?: string[]
}

export interface ConversacionTicket {
  ticket: Ticket
  mensajes: Mensaje[]
}

export interface DatosPersonales {
  nombre: string
  apellidos: string
  email: string
  telefono: string
  empresa?: string
  direccion: {
    calle: string
    ciudad: string
    codigoPostal: string
    pais: string
  }
}
