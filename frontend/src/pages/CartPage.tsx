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
  const summary = useCheckoutSummary()
  const { isAuthenticated } = useAuth()
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
          {/* Tabla de productos con edición de cantidades */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Producto</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Cajas</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Metros</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Precio/caja</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '12px' }}></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => {
                const nombre = `${item.serieNombre} · ${item.formato}`
                const metros = Math.round(item.cajas * item.metrosPorCaja * 100) / 100
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{nombre}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => updateCajas(item.id, item.cajas - 1)}
                          style={qtyButtonStyle}
                          aria-label={`Reducir cajas de ${nombre}`}
                        >
                          −
                        </button>
                        <span style={{ minWidth: '24px', display: 'inline-block' }}>{item.cajas}</span>
                        <button
                          onClick={() => updateCajas(item.id, item.cajas + 1)}
                          style={qtyButtonStyle}
                          aria-label={`Aumentar cajas de ${nombre}`}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{metros} m²</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>€{item.precioVentaCaja.toFixed(2)}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                      €{(item.precioVentaCaja * item.cajas).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828', fontSize: '16px' }}
                        aria-label={`Eliminar ${nombre}`}
                        title="Eliminar"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Resumen de precios: derivado SIEMPRE del carrito actual */}
          <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #eee', color: '#666', fontSize: '14px' }}>
              <span>{summary.totalCajas} {summary.totalCajas === 1 ? 'caja' : 'cajas'} · {summary.totalMetros} m² totales</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', paddingTop: '12px', borderBottom: '1px solid #eee' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: '600' }}>€{summary.itemsTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
              <span>IVA (21%):</span>
              <span style={{ fontWeight: '600' }}>€{summary.taxAmount.toFixed(2)}</span>
            </div>

            <ShippingBreakdown
              baseShipping={summary.shippingBase}
              distanceSurcharge={summary.distanceSurcharge}
              totalShipping={summary.shippingTotal}
            />

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
