import { useMemo, useState, MouseEvent } from 'react'
import { Minus, Plus, ShoppingCartSimple, Check } from '@phosphor-icons/react'
import type { Serie } from '../data/catalog'
import type { Collection } from '../types/collections'
import { getFormatosConTarifa, desglosarPreciosConIVA, TarifaProducto } from '../data/tarifa'
import { useCart } from '../context/CartContext'
import FormatSelectorModal from './FormatSelectorModal'
import '../styles/components.css'

const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

interface AddToCartBoxProps {
  serie: Serie | Collection
  /** Versión reducida para tarjetas de catálogo: solo botón + precio, sin selector de formato. */
  compact?: boolean
}

/**
 * Único punto de venta por cajas del catálogo. Usado tanto en la ficha de
 * producto (CollectionsPage detalle) como en las tarjetas de listado
 * (SeriesCard, en Catálogo/Colecciones/Home) para que la lógica de compra
 * (cajas, metros_por_caja, precio) nunca diverja entre vistas.
 */
export default function AddToCartBox({ serie, compact = false }: AddToCartBoxProps) {
  const { addBoxes } = useCart()
  const formatosConTarifa = useMemo(
    () => getFormatosConTarifa(serie.nombre, serie.formatos),
    [serie.nombre, serie.formatos]
  )
  const [formatoIndex, setFormatoIndex] = useState(0)
  const [cajas, setCajas] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // Sin precio de tarifa para ninguno de los formatos: no hay venta directa, solo consulta.
  if (formatosConTarifa.length === 0) {
    return compact ? (
      <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
        Precio a consultar
      </span>
    ) : (
      <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
        Precio a consultar: solicita presupuesto para esta serie.
      </p>
    )
  }

  const seleccionado = formatosConTarifa[formatoIndex]
  const metrosTotales = Math.round(seleccionado.metros_por_caja * cajas * 100) / 100
  const precioTotal = Math.round(seleccionado.precio_venta_caja * cajas * 100) / 100

  const handleAddFormato = (formato: TarifaProducto, cantidadCajas: number) => {
    const { precioNeto } = desglosarPreciosConIVA(formato.precio_venta_caja)
    const precioNetoM2 = desglosarPreciosConIVA(formato.precio_venta_m2).precioNeto

    addBoxes(
      {
        id: formato.id,
        serieId: serie.id,
        serieNombre: serie.nombre,
        formato: formato.formato,
        metrosPorCaja: formato.metros_por_caja,
        precioVentaCaja: precioNeto,                              // Precio NETO
        precioVentaCajaBruto: formato.precio_venta_caja,          // Precio BRUTO (para mostrar)
        precioVentaM2: precioNetoM2,                              // Precio/m² NETO
      },
      cantidadCajas
    )
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1600)
  }

  const handleAdd = () => handleAddFormato(seleccionado, cajas)

  if (compact) {
    // Con un único formato se añade directamente (comportamiento de siempre).
    // Con varios, el quick-add no tiene sitio para un selector inline —
    // antes añadía el primer formato sin preguntar, ahora abre el modal.
    const handleQuickAddClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (formatosConTarifa.length > 1) {
        setModalOpen(true)
      } else {
        handleAddFormato(seleccionado, 1)
      }
    }

    return (
      <>
        <button
          type="button"
          className="quick-add-btn"
          onClick={handleQuickAddClick}
          aria-label={
            formatosConTarifa.length > 1
              ? `Elegir formato de ${serie.nombre} y añadir al carrito`
              : `Añadir una caja de ${serie.nombre} ${seleccionado.formato} al carrito`
          }
          title={formatosConTarifa.length > 1 ? 'Elegir formato' : 'Añadir 1 caja al carrito'}
        >
          {justAdded ? <Check size={18} weight="bold" /> : <ShoppingCartSimple size={18} weight="regular" />}
          <span className="quick-add-text">
            <span className="quick-add-label">
              {justAdded ? 'Añadido' : formatosConTarifa.length > 1 ? 'Elegir formato' : 'Añadir caja'}
            </span>
            <span className="quick-add-price">
              {formatosConTarifa.length > 1
                ? `Desde ${currency.format(Math.min(...formatosConTarifa.map((f) => f.precio_venta_caja)))} / caja`
                : `${currency.format(seleccionado.precio_venta_caja)} / caja`}
            </span>
          </span>
        </button>

        {formatosConTarifa.length > 1 && (
          <FormatSelectorModal
            isOpen={modalOpen}
            serieNombre={serie.nombre}
            formatos={formatosConTarifa}
            onClose={() => setModalOpen(false)}
            onConfirm={(formato) => {
              handleAddFormato(formato, 1)
              setModalOpen(false)
            }}
          />
        )}
      </>
    )
  }

  return (
    <div className="add-to-cart-box">
      {formatosConTarifa.length > 1 && (
        <label className="add-to-cart-field">
          <span>Formato</span>
          <select
            value={formatoIndex}
            onChange={(e) => setFormatoIndex(Number(e.target.value))}
          >
            {formatosConTarifa.map((f, i) => (
              <option key={f.id} value={i}>
                {f.formato} cm
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="qty-stepper">
        <button
          type="button"
          onClick={() => setCajas((c) => Math.max(1, c - 1))}
          aria-label="Quitar una caja"
        >
          <Minus size={14} weight="bold" />
        </button>
        <span>{cajas} {cajas === 1 ? 'caja' : 'cajas'}</span>
        <button type="button" onClick={() => setCajas((c) => c + 1)} aria-label="Añadir una caja">
          <Plus size={14} weight="bold" />
        </button>
      </div>

      <p className="add-to-cart-preview">
        {metrosTotales} m² · {currency.format(precioTotal)}
      </p>

      <button type="button" className="btn-primary" onClick={handleAdd}>
        {justAdded ? <Check size={16} weight="bold" /> : <ShoppingCartSimple size={16} weight="regular" />}
        {justAdded ? 'Añadido' : 'Añadir al carrito'}
      </button>
    </div>
  )
}
