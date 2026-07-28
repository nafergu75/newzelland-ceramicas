const JUST_REGISTERED_KEY = 'justRegistered'

export interface JustRegistered {
  nombre: string
}

// Se marca justo tras un registro exitoso. La primera página que la
// consuma (mi-cuenta o descargas, lo que visite antes) muestra la
// bienvenida; después desaparece, no se repite en visitas posteriores.
export function markJustRegistered(nombre: string): void {
  sessionStorage.setItem(JUST_REGISTERED_KEY, JSON.stringify({ nombre }))
}

export function consumeJustRegistered(): JustRegistered | null {
  const raw = sessionStorage.getItem(JUST_REGISTERED_KEY)
  if (!raw) return null
  sessionStorage.removeItem(JUST_REGISTERED_KEY)
  try {
    return JSON.parse(raw) as JustRegistered
  } catch {
    return null
  }
}
