import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { downloadCatalog, savePendingDownload, consumePendingDownload, FichaTipo } from '../services/catalogService'

// Gestiona el flujo "descargar catálogo": exige sesión, recuerda el intento
// si el usuario no está logueado y, al volver autenticado a la misma
// página, retoma la descarga automáticamente.
export function useCatalogDownload() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const handleDownload = async (slug: string, tipo: FichaTipo, nombre: string) => {
    if (!isAuthenticated) {
      savePendingDownload({ slug, tipo, nombre })
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}&reason=catalog`)
      return
    }

    const key = `${slug}-${tipo}`
    setDownloadError(null)
    setDownloadingKey(key)
    try {
      await downloadCatalog(slug, tipo)
    } catch {
      setDownloadError(`No se pudo descargar "${nombre}". Inténtalo de nuevo.`)
    } finally {
      setDownloadingKey(null)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    const pending = consumePendingDownload()
    if (!pending) return
    handleDownload(pending.slug, pending.tipo, pending.nombre)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  return { handleDownload, downloadingKey, downloadError }
}
