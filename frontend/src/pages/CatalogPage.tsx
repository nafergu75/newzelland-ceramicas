import { useEffect, useState } from 'react'
import { productsAPI } from '../services/api'

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productsAPI.getProducts()
        setProducts(response.data.products)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const addToCart = (product: any) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === product.id)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    alert('Agregado al carrito')
  }

  if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>

  return (
    <div style={{ padding: '20px' }}>
      <h1>Catálogo de Productos</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p><strong>Formato:</strong> {product.format}</p>
            <p><strong>m² por caja:</strong> {product.m2_per_box}</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>€{product.price.toFixed(2)}</p>
            <button onClick={() => addToCart(product)}>Agregar al carrito</button>
          </div>
        ))}
      </div>
    </div>
  )
}
