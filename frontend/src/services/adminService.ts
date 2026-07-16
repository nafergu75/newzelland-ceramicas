import axios from 'axios'
import { AdminStats, Customer, OrderAdmin, Invoice, SupportTicketAdmin, ReportData } from '../types/admin'

const API_BASE = 'http://localhost:3000/api'

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
}

interface DashboardChart {
  label: string
  datos: number[]
  meses: string[]
}
