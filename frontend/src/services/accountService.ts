import axios from 'axios'
import {
  AccountSummary,
  Pedido,
  Envio,
  Ticket,
  ConversacionTicket,
  DatosPersonales,
} from '../types/account'

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

export const accountService = {
  async getAccountSummary(): Promise<AccountSummary> {
    try {
      const response = await api.get<AccountSummary>('/account/summary')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener resumen de cuenta')
    }
  },

  async getPedidos(page: number = 1, filtros?: any): Promise<{ pedidos: Pedido[]; total: number; paginas: number }> {
    try {
      const response = await api.get('/account/pedidos', {
        params: { page, ...filtros },
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener pedidos')
    }
  },

  async getPedidoDetalle(id: string): Promise<Pedido> {
    try {
      const response = await api.get<Pedido>(`/account/pedidos/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener detalle de pedido')
    }
  },

  async getEnvios(): Promise<Envio[]> {
    try {
      const response = await api.get<Envio[]>('/account/envios')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener envíos')
    }
  },

  async getEnvioDetalle(id: string): Promise<Envio> {
    try {
      const response = await api.get<Envio>(`/account/envios/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener detalle de envío')
    }
  },

  async getTickets(filtros?: any): Promise<Ticket[]> {
    try {
      const response = await api.get<Ticket[]>('/account/tickets', {
        params: filtros,
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener tickets')
    }
  },

  async crearTicket(asunto: string, descripcion: string, categoria: string): Promise<Ticket> {
    try {
      const response = await api.post<Ticket>('/account/tickets', {
        asunto,
        descripcion,
        categoria,
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear ticket')
    }
  },

  async getConversacionTicket(ticketId: string): Promise<ConversacionTicket> {
    try {
      const response = await api.get<ConversacionTicket>(`/account/tickets/${ticketId}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener conversación')
    }
  },

  async responderTicket(ticketId: string, mensaje: string): Promise<void> {
    try {
      await api.post(`/account/tickets/${ticketId}/mensajes`, { mensaje })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al responder ticket')
    }
  },

  async getDatosPersonales(): Promise<DatosPersonales> {
    try {
      const response = await api.get<DatosPersonales>('/account/perfil')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener datos personales')
    }
  },

  async actualizarDatosPersonales(datos: DatosPersonales): Promise<DatosPersonales> {
    try {
      const response = await api.patch<DatosPersonales>('/account/perfil', datos)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar datos personales')
    }
  },

  async cambiarContraseña(contraseñaActual: string, contraseñaNueva: string): Promise<void> {
    try {
      await api.post('/account/cambiar-contrasena', {
        contraseñaActual,
        contraseñaNueva,
      })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cambiar contraseña')
    }
  },

  async descargarDatos(): Promise<Blob> {
    try {
      const response = await api.get('/account/descargar-datos', {
        responseType: 'blob',
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al descargar datos')
    }
  },

  async eliminarCuenta(contraseña: string): Promise<void> {
    try {
      await api.delete('/account', {
        data: { contraseña },
      })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar cuenta')
    }
  },
}
