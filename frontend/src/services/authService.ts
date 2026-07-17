import axios from 'axios'
import { User, AuthResponse, RegisterData, LoginData, ResetPasswordData, ForgotPasswordData } from '../types/auth'

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const response = await axios.post(`${API_BASE}/auth/refresh-token`, { refreshToken })
        localStorage.setItem('token', response.data.token)
        originalRequest.headers.Authorization = `Bearer ${response.data.token}`
        return api(originalRequest)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        nombre: data.nombre,
        apellidos: data.apellidos,
        empresa: data.empresa || null,
        email: data.email,
        telefono: data.telefono,
        password: data.password,
        terminos: data.terminos,
        privacidad: data.privacidad,
        newsletter: data.newsletter || false,
      })
      return response.data
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Error al registrar'
      throw new Error(errorMsg)
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email: data.email,
        password: data.password,
      })
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken)
      }
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión')
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    }
  },

  async forgotPassword(data: ForgotPasswordData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/forgot-password', {
        email: data.email,
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar email de recuperación')
    }
  },

  async resetPassword(token: string, data: ResetPasswordData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(`/auth/reset-password/${token}`, {
        password: data.password,
      })
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken)
      }
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al restablecer contraseña')
    }
  },

  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(`/auth/verify-email/${token}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al verificar email')
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<{ user: User }>('/auth/me')
      return response.data.user
    } catch {
      return null
    }
  },

  async refreshToken(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) throw new Error('No refresh token')
      const response = await api.post<{ token: string }>('/auth/refresh-token', { refreshToken })
      localStorage.setItem('token', response.data.token)
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      throw error
    }
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  },
}
