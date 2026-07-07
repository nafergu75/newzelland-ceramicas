import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkoutAPI } from '../services/api'

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [nif, setNif] = useState('')
  const [phone, setPhone] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(savedCart)
    const newTotal = savedCart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Carrito</h1>
      {cart.length === 0 ? (
        <p>El carrito está vacío</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #ccc' }}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>€{item.price.toFixed(2)}</td>
                  <td>€{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 style={{ marginTop: '20px' }}>Total: €{total.toFixed(2)}</h3>
          <div style={{ marginTop: '20px' }}>
            <input type="text" placeholder="NIF" value={nif} onChange={(e) => setNif(e.target.value)} style={{ display: 'block', marginBottom: '10px', padding: '10px', width: '100%' }} />
            <input type="text" placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ display: 'block', marginBottom: '10px', padding: '10px', width: '100%' }} />
            <button onClick={handleCheckout} style={{ padding: '10px 20px', fontSize: '16px' }}>Confirmar Compra</button>
          </div>
        </>
      )}
    </div>
  )
}
