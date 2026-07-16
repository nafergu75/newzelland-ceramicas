export const validationRules = {
  nombre: {
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-záéíóúñ\s]+$/i,
    messages: {
      required: 'El nombre es obligatorio',
      minLength: 'El nombre debe tener al menos 3 caracteres',
      pattern: 'El nombre solo puede contener letras y espacios',
    },
  },
  apellidos: {
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-záéíóúñ\s]+$/i,
    messages: {
      required: 'Los apellidos son obligatorios',
      minLength: 'Los apellidos deben tener al menos 3 caracteres',
      pattern: 'Los apellidos solo pueden contener letras y espacios',
    },
  },
  empresa: {
    minLength: 3,
    maxLength: 100,
    messages: {
      minLength: 'El nombre de empresa debe tener al menos 3 caracteres',
    },
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
      required: 'El correo es obligatorio',
      pattern: 'Por favor, introduce un correo válido (ej: usuario@dominio.com)',
      duplicate: 'Este correo ya está registrado en nuestro sistema',
    },
  },
  telefono: {
    pattern: /^(\+34|0034|34)?[6789]\d{8}$/,
    messages: {
      required: 'El teléfono es obligatorio',
      pattern: 'Formato no válido. Usa: +34 600 123 456 o 600 123 456',
    },
  },
  password: {
    minLength: 8,
    maxLength: 128,
    messages: {
      required: 'La contraseña es obligatoria',
      minLength: 'La contraseña debe tener al menos 8 caracteres',
      weak: 'Contraseña válida, pero débil. Considera añadir mayúsculas, números o caracteres especiales',
    },
  },
  passwordConfirm: {
    messages: {
      required: 'Confirma tu contraseña',
      match: 'Las contraseñas no coinciden',
    },
  },
  terminos: {
    messages: {
      required: 'Debes aceptar los términos y condiciones',
    },
  },
  privacidad: {
    messages: {
      required: 'Debes aceptar la política de privacidad',
    },
  },
}

export function validateEmail(email: string): boolean {
  return validationRules.email.pattern.test(email)
}

export function validateTelefono(telefono: string): boolean {
  return validationRules.telefono.pattern.test(telefono.replace(/\s/g, ''))
}

export function validatePassword(password: string): {
  isValid: boolean
  strength: 'weak' | 'medium' | 'strong'
  hasUpperCase: boolean
  hasLowerCase: boolean
  hasNumber: boolean
  hasSpecial: boolean
} {
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  const isValid = password.length >= 8

  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  const checklist = [hasUpperCase, hasLowerCase, hasNumber, hasSpecial]
  const count = checklist.filter(Boolean).length

  if (isValid) {
    if (count >= 3) strength = 'strong'
    else if (count >= 2) strength = 'medium'
    else strength = 'weak'
  }

  return {
    isValid,
    strength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecial,
  }
}

export function getPasswordStrengthLabel(strength: 'weak' | 'medium' | 'strong'): string {
  const labels = {
    weak: 'Débil',
    medium: 'Media',
    strong: 'Fuerte',
  }
  return labels[strength]
}

export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  const colors = {
    weak: '#f44336',
    medium: '#ff9800',
    strong: '#4caf50',
  }
  return colors[strength]
}
