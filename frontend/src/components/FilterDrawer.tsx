import { ReactNode, useEffect } from 'react'
import { X } from '@phosphor-icons/react'

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

/** Envoltorio genérico para mostrar contenido (los filtros) como panel
 *  deslizante en móvil. Solo se usa por debajo del breakpoint de escritorio
 *  (ver .filter-drawer-overlay { display: none } a partir de 1024px en CSS). */
export default function FilterDrawer({ isOpen, onClose, children }: FilterDrawerProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  return (
    <div className={`filter-drawer-overlay ${isOpen ? 'is-open' : ''}`} onClick={onClose}>
      <div
        className="filter-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros"
      >
        <div className="filter-drawer-header">
          <h2>Filtros</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar filtros">
            <X size={20} />
          </button>
        </div>
        <div className="filter-drawer-body">{children}</div>
      </div>
    </div>
  )
}
