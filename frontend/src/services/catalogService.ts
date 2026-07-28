import axios from 'axios'
import { getAttribution } from '../utils/attribution'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export type FichaTipo = 'catalogo' | 'tecnica'

export interface PendingDownload {
  slug: string
  tipo: FichaTipo
  nombre: string
}

const PENDING_KEY = 'pendingCatalogDownload'

// Descarga el PDF vía el endpoint protegido y lo guarda en el equipo del
// usuario. Se hace con axios (no <a href>) porque hay que mandar el
// Authorization: Bearer <token>, que un enlace normal no puede enviar.
export async function downloadCatalog(slug: string, tipo: FichaTipo): Promise<void> {
  const token = localStorage.getItem('token')

  const attribution = getAttribution()

  const response = await axios.get(`${API_BASE}/catalogs/download`, {
    params: { slug, tipo, origen: window.location.pathname, ...attribution },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    responseType: 'blob',
  })

  const disposition = response.headers['content-disposition'] as string | undefined
  const match = disposition?.match(/filename="?([^"]+)"?/)
  const filename = match?.[1] || `${slug}-${tipo}.pdf`

  const blobUrl = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(blobUrl)
}

export function savePendingDownload(pending: PendingDownload): void {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending))
}

export function consumePendingDownload(): PendingDownload | null {
  const raw = sessionStorage.getItem(PENDING_KEY)
  if (!raw) return null
  sessionStorage.removeItem(PENDING_KEY)
  try {
    return JSON.parse(raw) as PendingDownload
  } catch {
    return null
  }
}
