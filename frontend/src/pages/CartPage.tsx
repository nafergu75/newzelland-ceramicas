import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkoutAPI } from '../services/api'
import ShippingBreakdown from '../components/ShippingBreakdown'

// Importar la función de cálculo de envío del backend
// En producción, esto vendría del backend al hacer checkout
const calculateShipping = (items: any[]) => {
  const BASE_SHIPPING = 15.0;
  const SURCHARGE_PER_M2 = 3.0;
  const ITEMS_M2_PER_UNIT = 1.2;

  if (!items || items.length === 0) {
    return {
      baseShipping: BASE_SHIPPING,
      distanceSurcharge: 0,
      totalShipping: BASE_SHIPPING,
    };
  }

  const totalM2 = items.reduce((sum, item) => {
    return sum + (item.quantity * ITEMS_M2_PER_UNIT);
  }, 0);

  const distanceSurcharge = Math.round(totalM2 * SURCHARGE_PER_M2 * 100) / 100;

  return {
    baseShipping: BASE_SHIPPING,
    distanceSurcharge,
    totalShipping: BASE_SHIPPING + distanceSurcharge,
  };
};

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [shipping, setShipping] = useState({ baseShipping: 0, distanceSurcharge: 0, totalShipping: 0 })
  const [tax, setTax] = useState(0)
  const [total, setTotal] = useState(0)
  const [nif, setNif] = useState('')
  const [phone, setPhone] = useState('')
  const navigate = useNavigate()

  // Recalcular totales cuando el carrito cambia
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(savedCart)

    // Calcular subtotal
    const newSubtotal = savedCart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    setSubtotal(newSubtotal)

    // Calcular envío (consistente con backend)
    const shippingCalc = calculateShipping(savedCart)
    setShipping(shippingCalc)

    // Calcular impuesto (21% sobre subtotal)
    const taxAmount = Math.round(newSubtotal * 0.21 * 100) / 100
    setTax(taxAmount)

    // Calcular total
    const newTotal = newSubtotal + taxAmount + shippingCalc.totalShipping
    setTotal(newTotal)
  }, [])

  const handleCheckout = async () => {
    if (!nif || !phone) {
      alert('Por favor completa NIF y teléfono')
      return
    }

    try {
      const items = cart.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        vatPercentage: 21,
        totalLine: item.price * item.quantity,
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

      localStorage.removeItem('cart')
      alert(`Pedido creado: ${order.data.id}`)
      navigate('/dashboard')
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Error al crear el pedido')
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Carrito de Compra</h1>

      {cart.length === 0 ? (
        <p style={{ color: '#666', fontSize: '16px' }}>El carrito está vacío</p>
      ) : (
        <>
          {/* Tabla de productos */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Producto</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Cantidad</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Precio</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{item.name}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>€{item.price.toFixed(2)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                    €{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Resumen de precios */}
          <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: '600' }}>€{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
              <span>IVA (21%):</span>
              <span style={{ fontWeight: '600' }}>€{tax.toFixed(2)}</span>
            </div>

            {/* Componente de desglose de envío */}
            <ShippingBreakdown
              baseShipping={shipping.baseShipping}
              distanceSurcharge={shipping.distanceSurcharge}
              totalShipping={shipping.totalShipping}
            />

            {/* Total final */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '20px',
              fontSize: '18px',
              fontWeight: '700',
              color: '#2E7D32',
            }}>
              <span>TOTAL FINAL:</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Formulario de datos */}
          <div style={{ marginTop: '30px', borderTop: '2px solid #ddd', paddingTop: '20px' }}>
            <h3>Datos para el pedido</h3>
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
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              ✓ Confirmar Compra
            </button>
          </div>
        </>
      )}
    </div>
  );
}
