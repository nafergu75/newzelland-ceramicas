import { useParams, Link } from 'react-router-dom'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import ProductCard from '../components/ProductCard'
import { collections } from '../data/collections'
import { allProducts } from '../data/products'
import { useCart } from '../context/CartContext'

export default function CollectionsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { addItem } = useCart()

  const collectionList = slug
    ? collections.filter(c => c.slug === slug)
    : collections

  const productsToShow = slug
    ? allProducts.filter(p => p.collection === slug)
    : allProducts

  const addToCart = (product: any) => {
    addItem(product)
    alert('Producto agregado al carrito')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        {slug ? (
          <>
            {collectionList.length > 0 && (
              <HeroSection
                title={collectionList[0].name}
                subtitle={collectionList[0].description}
                backgroundColor={collectionList[0].image}
              />
            )}
          </>
        ) : (
          <HeroSection
            title="Nuestras Colecciones"
            subtitle="Explora nuestras 5 colecciones de cerámica premium"
          />
        )}

        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            {!slug && (
              <div className="grid grid-cols-1 grid-cols-2">
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    to={`/collections/${collection.slug}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        background: collection.image,
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--spacing-2xl)',
                        color: 'white',
                        textAlign: 'center',
                        minHeight: '250px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      className="hover-lift"
                    >
                      <h3 style={{ color: 'white', marginBottom: 'var(--spacing-md)' }}>
                        {collection.name}
                      </h3>
                      <p style={{ color: 'rgba(255,255,255,0.9)' }}>
                        {collection.productCount} productos
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {slug && productsToShow.length > 0 && (
              <>
                <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                  <Link to="/collections" style={{ color: 'var(--color-accent)' }}>
                    ← Volver a Colecciones
                  </Link>
                </div>
                <div className="grid grid-cols-1 grid-cols-3">
                  {productsToShow.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
