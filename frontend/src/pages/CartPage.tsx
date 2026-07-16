import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { checkoutAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useCheckoutSummary } from '../hooks/useCheckoutSummary'
import ShippingBreakdown from '../components/ShippingBreakdown'

/**
 * Carrito + desglose en una única pantalla.
 *
 * El desglose NO guarda copia propia del carrito: useCheckoutSummary deriva
 * los totales del estado global en cada render. Cambiar una cantidad o
 * eliminar un artículo recalcula subtotal, IVA, envío base, recargo por
 * distancia y total al instante.
 */
export default function CartPage() {
  const { cart, updateCajas, removeItem, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [postalCode, setPostalCode] = useState('')
  const summary = useCheckoutSummary(postalCode || null)
  const [nif, setNif] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!nif || !phone) {
      alert('Por favor completa NIF y teléfono')
      return
    }

    setSubmitting(true)
    try {
      const items = cart.map((item) => ({
        productId: item.id,
        name: `${item.serieNombre} ${item.formato}`,
        quantity: item.cajas,
        unitPrice: item.precioVentaCaja,
        vatPercentage: 21,
        totalLine: item.precioVentaCaja * item.cajas,
      }))

      const order = await checkoutAPI.createOrder({
        items,
        billingAddress: {
          street: 'Calle Test',
          number: '123',
          postalCode: '46001',
          city: 'Valencia',
          province: 'Valencia',
          country: 'ES',
        },
        shippingAddress: {
          street: 'Calle Test',
          number: '123',
          postalCode: '46001',
          city: 'Valencia',
          province: 'Valencia',
          country: 'ES',
        },
        nif,
        phone,
      })

      clearCart()
      alert(`Pedido creado: ${order.data.id}`)
      navigate('/mi-cuenta')
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Error al crear el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  const qtyButtonStyle: React.CSSProperties = {
    width: '28px',
    height: '28px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: 1,
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Carrito de Compra</h1>

      {cart.length === 0 ? (
        <p style={{ color: '#666', fontSize: '16px' }}>
          El carrito está vacío. <Link to="/collections">Ver colecciones</Link>
        </p>
      ) : (
        <>
          {/* Líneas de carrito: layout responsive con desglose de precios */}
          <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.map((item) => {
              const nombre = `${item.serieNombre} · ${item.formato}`
              const metrosTotales = Math.round(item.cajas * item.metrosPorCaja * 100) / 100
              const precioM2 = Math.round((item.precioVentaCaja / item.metrosPorCaja) * 100) / 100
              const subtotalLinea = item.precioVentaCaja * item.cajas

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#fafafa',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    alignItems: 'start',
                  }}
                >
                  {/* Nombre del producto */}
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{nombre}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      {metrosTotales} m² totales
                    </div>
                  </div>

                  {/* Precio por m² */}
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Precio/m²
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>
                      €{precioM2.toFixed(2)}
                    </div>
                  </div>

                  {/* Precio por caja */}
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Precio/caja
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>
                      €{item.precioVentaCaja.toFixed(2)}
                    </div>
                  </div>

                  {/* Control de cantidad: botones +/− */}
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px', textTransform: 'uppercase' }}>
                      Cajas
                    </div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: 'white',
                      }}
                    >
                      <button
                        onClick={() => updateCajas(item.id, Math.max(1, item.cajas - 1))}
                        style={{
                          ...qtyButtonStyle,
                          border: 'none',
                          borderRadius: '0',
                          flex: '0 0 40px',
                          fontSize: '18px',
                          backgroundColor: '#f5f5f5',
                          cursor: 'pointer',
                          ':hover': { backgroundColor: '#efefef' },
                        }}
                        aria-label={`Reducir cajas de ${nombre}`}
                      >
                        −
                      </button>
                      <div
                        style={{
                          flex: '0 0 50px',
                          textAlign: 'center',
                          fontSize: '16px',
                          fontWeight: '600',
                          borderLeft: '1px solid #ddd',
                          borderRight: '1px solid #ddd',
                        }}
                      >
                        {item.cajas}
                      </div>
                      <button
                        onClick={() => updateCajas(item.id, item.cajas + 1)}
                        style={{
                          ...qtyButtonStyle,
                          border: 'none',
                          borderRadius: '0',
                          flex: '0 0 40px',
                          fontSize: '18px',
                          backgroundColor: '#f5f5f5',
                          cursor: 'pointer',
                          ':hover': { backgroundColor: '#efefef' },
                        }}
                        aria-label={`Aumentar cajas de ${nombre}`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal de la línea */}
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Subtotal
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '18px', color: '#2E7D32' }}>
                      €{subtotalLinea.toFixed(2)}
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', height: '100%' }}>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        background: 'none',
                        border: '1px solid #e0e0e0',
                        cursor: 'pointer',
                        color: '#c62828',
                        fontSize: '14px',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                      }}
                      aria-label={`Eliminar ${nombre}`}
                      title="Eliminar producto"
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Código postal para calcular recargo de transporte */}
          <div style={{ backgroundColor: '#f0f8ff', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1a1a1a' }}>
              Código postal (para calcular envío)
            </label>
            <input
              type="text"
              placeholder="Ej: 28001"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value.slice(0, 5))}
              maxLength={5}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
            {summary.isLongDistance && (
              <p style={{ color: '#d9534f', fontSize: '13px', marginTop: '8px' }}>
                📍 Destino a más de 500 km desde Onda: recargo de <strong>€5,00/m²</strong>
              </p>
            )}
          </div>

          {/* Resumen de precios: derivado SIEMPRE del carrito actual */}
          <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #eee', color: '#666', fontSize: '14px' }}>
              <span>{summary.totalCajas} {summary.totalCajas === 1 ? 'caja' : 'cajas'} · {summary.totalMetros} m² totales</span>
            </div>

            {/* Desglose de precios: neto + IVA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', paddingTop: '12px', borderBottom: '1px solid #eee', color: '#666', fontSize: '14px' }}>
              <span>Subtotal (neto):</span>
              <span>€{summary.itemsNeto.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #eee', color: '#666', fontSize: '14px' }}>
              <span>IVA (21%):</span>
              <span>€{summary.taxAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: '600' }}>€{summary.itemsTotal.toFixed(2)}</span>
            </div>

            {/* Envío */}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', paddingTop: '12px', borderBottom: '1px solid #eee', color: '#666', fontSize: '14px' }}>
              <span>Envío (base):</span>
              <span>€{summary.shippingBase.toFixed(2)}</span>
            </div>

            {/* Recargo condicional */}
            {summary.distanceSurcharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #eee', color: '#d9534f', fontSize: '14px' }}>
                <span>Recargo distancia (+500km):</span>
                <span style={{ fontWeight: '600' }}>€{summary.distanceSurcharge.toFixed(2)}</span>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '20px',
              fontSize: '18px',
              fontWeight: '700',
              color: '#2E7D32',
            }}>
              <span>TOTAL FINAL:</span>
              <span>€{summary.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Formulario de datos */}
          <div style={{ marginTop: '30px', borderTop: '2px solid #ddd', paddingTop: '20px' }}>
            <h3>Datos para el pedido</h3>

            {!isAuthenticated && (
              <p style={{ backgroundColor: '#FFF3CD', padding: '12px', borderRadius: '4px', color: '#856404' }}>
                Necesitas <Link to="/login">iniciar sesión</Link> para confirmar la compra.
              </p>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                NIF / CIF
              </label>
              <input
                type="text"
                placeholder="Ej: 12345678A"
                value={nif}
                onChange={(e) => setNif(e.target.value)}
                style={{
                  display: 'block',
                  marginBottom: '10px',
                  padding: '10px',
                  width: '100%',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Teléfono
              </label>
              <input
                type="tel"
                placeholder="Ej: +34 600 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  display: 'block',
                  padding: '10px',
                  width: '100%',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>

            <button
              onClick={handleCheckout}
              disabled={submitting}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: submitting ? '#9E9E9E' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                width: '100%',
              }}
            >
              {submitting ? 'Procesando…' : '✓ Confirmar Compra'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
