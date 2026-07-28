const ATTRIBUTION_KEY = 'attribution'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

export interface Attribution {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  referer?: string
}

// Se llama una vez al arrancar la app. Solo escribe si la URL actual trae
// UTMs (no pisa una atribución ya guardada de un aterrizaje anterior con
// una página interna sin UTMs). Queda en localStorage para sobrevivir a
// toda la visita, incluida una descarga varias páginas después.
export function captureAttribution(): void {
  const params = new URLSearchParams(window.location.search)
  const hasUtm = UTM_KEYS.some((key) => params.has(key))
  if (!hasUtm) return

  const attribution: Attribution = {}
  UTM_KEYS.forEach((key) => {
    const value = params.get(key)
    if (value) attribution[key] = value
  })

  if (document.referrer && !document.referrer.includes(window.location.host)) {
    attribution.referer = document.referrer
  }

  localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution))
}

export function getAttribution(): Attribution {
  const raw = localStorage.getItem(ATTRIBUTION_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Attribution
  } catch {
    return {}
  }
}
