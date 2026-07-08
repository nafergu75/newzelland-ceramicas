import { useEffect, useState } from 'react'
import { productsAPI } from '../services/api'
import { useCart } from '../context/CartContext'

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

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
    addItem(product)
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
