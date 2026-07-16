export interface User {
  id: string
  nombre: string
  apellidos: string
  email: string
  telefono: string
  empresa?: string
  esAdmin?: boolean
  emailVerificado: boolean
  cuentaActiva: boolean
  fechaAlta: string
  ultimaActividad: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

export interface RegisterData {
  nombre: string
  apellidos: string
  empresa?: string
  email: string
  telefono: string
  password: string
  passwordConfirm: string
  terminos: boolean
  privacidad: boolean
  newsletter?: boolean
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  user?: User
  token?: string
  refreshToken?: string
}

export interface ResetPasswordData {
  password: string
  passwordConfirm: string
}

export interface ForgotPasswordData {
  email: string
}
