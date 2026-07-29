import type { ColorFoto } from '../types/collections'

interface ColorSelectorProps {
  colores: ColorFoto[]
  selected: ColorFoto | null
  onSelect: (color: ColorFoto | null) => void
}

/**
 * Cada color tiene UNA foto real (no una galería) — así es el dato real
 * extraído de Practika, no se inventa una colección de imágenes por color
 * que no existe. Seleccionar un color cambia la foto principal de la ficha;
 * "ninguno seleccionado" vuelve a la portada de la serie.
 */
export default function ColorSelector({ colores, selected, onSelect }: ColorSelectorProps) {
  if (colores.length === 0) return null

  return (
    <div className="color-selector">
      <h3>Colores disponibles</h3>
      <div className="color-selector-options">
        {colores.map((color) => (
          <button
            key={color.slug}
            type="button"
            className={`color-chip ${selected?.slug === color.slug ? 'is-selected' : ''}`}
            onClick={() => onSelect(selected?.slug === color.slug ? null : color)}
          >
            {color.nombre}
          </button>
        ))}
      </div>
    </div>
  )
}
