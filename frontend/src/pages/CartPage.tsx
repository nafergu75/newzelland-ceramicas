import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { checkoutAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useCheckoutSummary } from '../hooks/useCheckoutSummary'
import { getSerieById } from '../data/catalog'

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
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '0',
    fontSize: '18px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px' }}>Carrito de Compra</h1>

        {cart.length === 0 ? (
          <p style={{ color: '#666', fontSize: '16px' }}>
            El carrito está vacío. <Link to="/collections">Ver colecciones</Link>
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
            {/* COLUMNA IZQUIERDA: Productos con fotos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map((item) => {
                const serie = getSerieById(item.serieId)
                const metrosTotales = Math.round(item.cajas * item.metrosPorCaja * 100) / 100
                const precioM2 = Math.round((item.precioVentaCaja / item.metrosPorCaja) * 100) / 100
                const subtotalLinea = item.precioVentaCaja * item.cajas

                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      gap: '16px',
                    }}
                  >
                    {/* Foto del producto */}
                    {serie && (
                      <img
                        src={serie.imagen}
                        alt={item.serieNombre}
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          flexShrink: 0,
                        }}
                      />
                    )}

                    {/* Descripción del producto */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      {/* Nombre y detalles */}
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>
                          {item.serieNombre}
                        </h3>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                          Formato: <strong>{item.formato}</strong>
                        </p>
                        {serie && (
                          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#666', maxWidth: '400px', lineHeight: '1.4' }}>
                            {serie.descripcion}
                          </p>
                        )}
                        <p style={{ margin: '0', fontSize: '13px', color: '#999' }}>
                          {metrosTotales} m² totales
                        </p>
                      </div>

                      {/* Controles de cantidad y precio */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                        {/* Control de cantidad */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                          <button
                            onClick={() => updateCajas(item.id, Math.max(1, item.cajas - 1))}
                            style={qtyButtonStyle}
                            aria-label={`Reducir`}
                          >
                            −
                          </button>
                          <div
                            style={{
                              width: '50px',
                              textAlign: 'center',
                              fontSize: '16px',
                              fontWeight: '600',
                              borderLeft: '1px solid #ddd',
                              borderRight: '1px solid #ddd',
                              borderTop: '1px solid #ddd',
                              borderBottom: '1px solid #ddd',
                              padding: '6px 0',
                            }}
                          >
                            {item.cajas}
                          </div>
                          <button
                            onClick={() => updateCajas(item.id, item.cajas + 1)}
                            style={qtyButtonStyle}
                            aria-label={`Aumentar`}
                          >
                            +
                          </button>
                          <span style={{ marginLeft: '12px', fontSize: '13px', color: '#666' }}>cajas</span>
                        </div>

                        {/* Subtotal */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '2px' }}>
                            Subtotal
                          </div>
                          <div style={{ fontWeight: '700', fontSize: '18px', color: '#2E7D32' }}>
                            €{subtotalLinea.toFixed(2)}
                          </div>
                        </div>

                        {/* Botón eliminar */}
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            background: 'none',
                            border: '1px solid #e0e0e0',
                            cursor: 'pointer',
                            color: '#c62828',
                            fontSize: '14px',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            transition: 'all 0.2s',
                          }}
                          title="Eliminar producto"
                        >
                          🗑
                        </button>
                      </div>

                      {/* Precios por unidad */}
                      <div style={{ display: 'flex', gap: '24px', marginTop: '12px', fontSize: '12px', color: '#666' }}>
                        <div>
                          <span style={{ color: '#999' }}>Precio/m²:</span> <strong>€{precioM2.toFixed(2)}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#999' }}>Precio/caja:</span> <strong>€{item.precioVentaCaja.toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* COLUMNA DERECHA: Resumen de compra */}
            <div style={{ position: 'sticky', top: '20px' }}>
              {/* Código postal */}
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #ddd' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                  Código postal
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
                  <p style={{ fontSize: '12px', color: '#d9534f', marginTop: '8px', margin: '8px 0 0 0' }}>
                    📍 +500km: recargo €5/m²
                  </p>
                )}
              </div>

              {/* Resumen de precios */}
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
                  {summary.totalCajas} caja{summary.totalCajas !== 1 ? 's' : ''} • {summary.totalMetros} m²
                </div>

                {/* Desglose */}
                <div style={{ fontSize: '13px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#666' }}>
                    <span>Subtotal (neto):</span>
                    <span>€{summary.itemsNeto.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#666' }}>
                    <span>IVA (21%):</span>
                    <span>€{summary.taxAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #eee', fontWeight: '600' }}>
                    <span>Subtotal:</span>
                    <span>€{summary.itemsTotal.toFixed(2)}</span>
                  </div>

                  {/* Envío */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#666' }}>
                    <span>Envío:</span>
                    <span>€{summary.shippingBase.toFixed(2)}</span>
                  </div>
                  {summary.distanceSurcharge > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #eee', color: '#d9534f', fontWeight: '600' }}>
                      <span>Recargo distancia:</span>
                      <span>€{summary.distanceSurcharge.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Total final */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', fontSize: '18px', fontWeight: '700', color: '#2E7D32' }}>
                  <span>TOTAL:</span>
                  <span>€{summary.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Datos para el pedido */}
              <div style={{ marginTop: '16px' }}>
                {!isAuthenticated && (
                  <p style={{ backgroundColor: '#FFF3CD', padding: '12px', borderRadius: '4px', color: '#856404', fontSize: '13px', marginBottom: '12px' }}>
                    <Link to="/login" style={{ fontWeight: '600', color: '#856404', textDecoration: 'underline' }}>Inicia sesión</Link> para comprar
                  </p>
                )}

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>
                    NIF / CIF
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 12345678A"
                    value={nif}
                    onChange={(e) => setNif(e.target.value)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej: +34 600 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={submitting}
                  style={{
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: submitting ? '#9E9E9E' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    width: '100%',
                  }}
                >
                  {submitting ? 'Procesando…' : '✓ Comprar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
