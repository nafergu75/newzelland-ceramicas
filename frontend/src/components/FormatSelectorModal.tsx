import { useEffect, useState } from 'react'
import { X } from '@phosphor-icons/react'
import type { TarifaProducto } from '../data/tarifa'
import '../styles/components.css'

const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

interface FormatSelectorModalProps {
  isOpen: boolean
  serieNombre: string
  formatos: TarifaProducto[]
  onClose: () => void
  onConfirm: (formato: TarifaProducto) => void
}

/**
 * Se muestra antes de añadir al carrito cuando una serie tiene más de un
 * formato con tarifa disponible y el punto de entrada es el "quick add" de
 * la tarjeta de catálogo (SeriesCard/AddToCartBox en modo compact), que no
 * tiene sitio para un <select> inline como sí lo tiene la ficha de detalle.
 */
export default function FormatSelectorModal({
  isOpen,
  serieNombre,
  formatos,
  onClose,
  onConfirm,
}: FormatSelectorModalProps) {
  const [seleccionado, setSeleccionado] = useState<TarifaProducto | null>(null)

  // Reinicia la selección cada vez que se abre, para no arrastrar la
  // elección de una serie anterior si el usuario abre el modal de otra.
  useEffect(() => {
    if (isOpen) setSeleccionado(null)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="format-modal-overlay" onClick={onClose}>
      <div
        className="format-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="format-modal-title"
      >
        <div className="format-modal-header">
          <h3 id="format-modal-title">Elige el formato de {serieNombre}</h3>
          <button type="button" className="format-modal-close" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="format-modal-options">
          {formatos.map((formato) => (
            <label
              key={formato.id}
              className={`format-option ${seleccionado?.id === formato.id ? 'is-selected' : ''}`}
            >
              <input
                type="radio"
                name="formato-modal"
                value={formato.id}
                checked={seleccionado?.id === formato.id}
                onChange={() => setSeleccionado(formato)}
              />
              <div className="format-option-info">
                <p className="format-option-nombre">{formato.formato} cm</p>
                <p className="format-option-meta">{formato.metros_por_caja} m² por caja</p>
              </div>
              <p className="format-option-precio">{currency.format(formato.precio_venta_caja)} / caja</p>
            </label>
          ))}
        </div>

        <div className="format-modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!seleccionado}
            onClick={() => seleccionado && onConfirm(seleccionado)}
          >
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  )
}
