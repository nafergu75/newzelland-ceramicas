export interface User {
  id: string
  nombre: string
  apellidos: string
  email: string
  telefono: string
  empresa?: string
  esAdmin?: boolean
  // Rol real devuelto por /api/auth/me y /api/auth/login ('customer' | 'admin').
  // Los demás campos de esta interfaz son aspiracionales y no coinciden con
  // la forma real de la respuesta del backend; role sí se usa tal cual.
  role?: string
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
  // `nombre` es el nombre completo: se simplificó el formulario para bajar
  // la fricción de registro (apellidos/teléfono/empresa ya no son obligatorios).
  nombre: string
  apellidos?: string
  empresa?: string
  email: string
  telefono?: string
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
