import axios from 'axios'
import { AdminStats, Customer, OrderAdmin, Invoice, SupportTicketAdmin, ReportData } from '../types/admin'
import { FacturaExtraida } from '../types/invoice'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const adminService = {
  async getStats(): Promise<AdminStats> {
    try {
      const response = await api.get<AdminStats>('/admin/stats')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas')
    }
  },

  async getIngresosPorMes(): Promise<DashboardChart> {
    try {
      const response = await api.get('/admin/ingresos-mes')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener ingresos')
    }
  },

  async getClientes(page: number = 1, filtros?: any): Promise<{ clientes: Customer[]; total: number; paginas: number }> {
    try {
      const response = await api.get('/admin/clientes', {
        params: { page, ...filtros },
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener clientes')
    }
  },

  async getClienteDetalle(id: string): Promise<Customer> {
    try {
      const response = await api.get<Customer>(`/admin/clientes/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener cliente')
    }
  },

  async getPedidos(page: number = 1, filtros?: any): Promise<{ pedidos: OrderAdmin[]; total: number; paginas: number }> {
    try {
      const response = await api.get('/admin/pedidos', {
        params: { page, ...filtros },
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener pedidos')
    }
  },

  async getPedidoDetalle(id: string): Promise<OrderAdmin> {
    try {
      const response = await api.get<OrderAdmin>(`/admin/pedidos/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener pedido')
    }
  },

  async actualizarEstadoPedido(id: string, estado: string): Promise<void> {
    try {
      await api.patch(`/admin/pedidos/${id}`, { estado })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar pedido')
    }
  },

  async getFacturas(page: number = 1, filtros?: any): Promise<{ facturas: Invoice[]; total: number; paginas: number }> {
    try {
      const response = await api.get('/admin/facturas', {
        params: { page, ...filtros },
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener facturas')
    }
  },

  async descargarFactura(id: string): Promise<Blob> {
    try {
      const response = await api.get(`/admin/facturas/${id}/pdf`, {
        responseType: 'blob',
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al descargar factura')
    }
  },

  // Punto de entrada de contabilización: recibe el JSON del lector OCR
  // (ver types/invoice.ts) y lo envía al backend para grabar el asiento.
  async contabilizarFactura(factura: Omit<FacturaExtraida, 'textoExtraido'>): Promise<{ ok: boolean; id: string }> {
    try {
      const response = await api.post('/admin/facturas/contabilizar', factura)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al contabilizar la factura')
    }
  },

  async getTicketsSoporte(filtros?: any): Promise<SupportTicketAdmin[]> {
    try {
      const response = await api.get<SupportTicketAdmin[]>('/admin/soporte/tickets', {
        params: filtros,
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener tickets')
    }
  },

  async responderTicketAdmin(ticketId: string, mensaje: string): Promise<void> {
    try {
      await api.post(`/admin/soporte/tickets/${ticketId}/responder`, { mensaje })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al responder ticket')
    }
  },

  async getReporte(tipo: string, desde: string, hasta: string): Promise<ReportData[]> {
    try {
      const response = await api.get<ReportData[]>('/admin/reportes', {
        params: { tipo, desde, hasta },
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener reporte')
    }
  },

  async exportarReporte(tipo: string, formato: string): Promise<Blob> {
    try {
      const response = await api.get(`/admin/reportes/exportar`, {
        params: { tipo, formato },
        responseType: 'blob',
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al exportar reporte')
    }
  },

  // Usuarios registrados (distinto de Customer: aquí no hay compras/pedidos,
  // solo cuenta creada + cuántos catálogos ha descargado).
  async getUsuariosRegistrados(page: number = 1, search?: string): Promise<{ usuarios: AdminUserRow[]; total: number; pagina: number; porPagina: number }> {
    try {
      const response = await api.get('/admin/users', { params: { page, search: search || undefined } })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuarios')
    }
  },

  async exportarUsuariosCsv(): Promise<void> {
    const response = await api.get('/admin/users/export', { responseType: 'blob' })
    triggerCsvDownload(response, 'usuarios.csv')
  },

  async getDescargasCatalogo(filtros: CatalogDownloadsFilters = {}): Promise<{ descargas: CatalogDownloadRow[]; total: number; pagina: number; porPagina: number }> {
    try {
      const response = await api.get('/admin/catalog-downloads', { params: filtros })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener descargas')
    }
  },

  async exportarDescargasCatalogoCsv(filtros: Omit<CatalogDownloadsFilters, 'page'> = {}): Promise<void> {
    const response = await api.get('/admin/catalog-downloads/export', { params: filtros, responseType: 'blob' })
    triggerCsvDownload(response, 'descargas-catalogo.csv')
  },

  async getCrmStats(): Promise<CrmStats> {
    try {
      const response = await api.get('/admin/crm/stats')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas de CRM')
    }
  },

  async exportarContactosCrmCsv(): Promise<void> {
    const response = await api.get('/admin/crm/contacts/export', { responseType: 'blob' })
    triggerCsvDownload(response, 'crm-contactos.csv')
  },

  async getAdminCollections(): Promise<{ collections: AdminCollectionRow[]; total: number }> {
    try {
      const response = await api.get('/admin/collections')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener colecciones')
    }
  },

  async crearCollection(datos: Partial<AdminCollectionRow>): Promise<AdminCollectionRow> {
    try {
      const response = await api.post('/admin/collections', datos)
      return response.data.collection
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear la colección')
    }
  },

  async actualizarCollection(id: number, datos: Partial<AdminCollectionRow>): Promise<AdminCollectionRow> {
    try {
      const response = await api.put(`/admin/collections/${id}`, datos)
      return response.data.collection
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar la colección')
    }
  },

  async eliminarCollection(id: number): Promise<void> {
    try {
      await api.delete(`/admin/collections/${id}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar la colección')
    }
  },

  async exportarCollectionsCsv(): Promise<void> {
    const response = await api.get('/admin/collections/export', { responseType: 'blob' })
    triggerCsvDownload(response, 'collections.csv')
  },
}

function triggerCsvDownload(response: { data: Blob; headers: Record<string, unknown> }, fallbackFilename: string): void {
  const disposition = response.headers['content-disposition'] as string | undefined
  const match = disposition?.match(/filename="?([^"]+)"?/)
  const filename = match?.[1] || fallbackFilename

  const blobUrl = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(blobUrl)
}

export interface AdminUserRow {
  id: number
  nombre: string
  email: string
  telefono: string | null
  empresa: string | null
  role: string
  emailVerificado: boolean
  fechaAlta: string
  descargasCount: number
}

export interface CatalogDownloadRow {
  id: number
  user_id: number | null
  email: string
  nombre_completo: string | null
  catalog_slug: string
  catalog_nombre: string | null
  tipo: 'catalogo' | 'tecnica'
  ip: string | null
  origen: string | null
  device_type: string | null
  browser_name: string | null
  browser_version: string | null
  os_name: string | null
  os_version: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  country: string | null
  city: string | null
  referer: string | null
  user_agent?: string | null
  created_at: string
}

export interface CatalogDownloadsFilters {
  page?: number
  userId?: string
  slug?: string
  dateFrom?: string
  dateTo?: string
  deviceType?: string
  utmSource?: string
  country?: string
}

interface DashboardChart {
  label: string
  datos: number[]
  meses: string[]
}

export interface CrmStats {
  crmHabilitado: boolean
  totalContactos: number
  nuevosEsteMes: number
  porOrigen: Record<string, number>
  topCampanias: Array<{ utm_campaign: string; contactos: number }>
}

export interface AdminCollectionRow {
  id: number
  slug: string
  nombre: string
  descripcion: string | null
  imagen_portada: string | null
  material: string | null
  tipo: string[]
  formatos: string[]
  acabados: string[]
  colores: string[]
  precio_consultable: boolean
  acabado_corte: string
  espesor: number
  estilo: string
  especificaciones_verificadas: boolean
  created_at: string
  updated_at: string
}
