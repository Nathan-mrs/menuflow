import { useRestaurant } from '../controllers/RestaurantController';
import { Header } from './components/layout/Header';
import { Hero } from './components/layout/Hero';
import { CategoryNav } from './components/layout/CategoryNav';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { ProductCard } from './components/product/ProductCard';
import { ProductModal } from './components/product/ProductModal';
import { ReviewCard } from './components/product/ReviewCard';
import { AddReviewModal } from './components/product/AddReviewModal';
import { SearchOverlay } from './components/search/SearchOverlay';
import { FavoritesDrawer } from './components/favorites/FavoritesDrawer';
import { RestaurantInfoModal } from './components/info/RestaurantInfoModal';
import { QRCodeModal } from './components/qrcode/QRCodeModal';
import { Toast } from './components/common/Toast';
import { formatPrice } from '../utils/formatters';
import { Star, ShieldCheck } from 'lucide-react';

function AppContent() {
  const {
    restaurant,
    setSelectedProduct,
  } = useRestaurant();

  // Featured products for "Favoritos da casa"
  const featuredProducts = restaurant.products.filter((p) => p.status !== 'paused' && (p.featured || p.rating >= 4.8));

  return (
    <div className="app-shell">
      {/* Main Header */}
      <Header />

      {/* Hero Visual Area */}
      <Hero />

      {/* Horizontal Category Nav */}
      <CategoryNav />

      {/* SEÇÃO: FAVORITOS DA CASA (Destaque Horizontal) */}
      <section className="section-container" aria-label="Favoritos da Casa">
        <div className="section-header-row">
          <div>
            <span className="section-tag">Seleção Especial</span>
            <h3 className="section-title">Favoritos da Casa</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Deslize para ver mais →
          </span>
        </div>

        <div className="featured-scroll">
          {featuredProducts.slice(0, 5).map((prod) => (
            <div
              key={prod.id}
              className="featured-card"
              onClick={() => setSelectedProduct(prod)}
              role="button"
              tabIndex={0}
            >
              <div className="featured-media">
                <img src={prod.image} alt={prod.name} className="featured-img" loading="lazy" />
                {prod.badge && (
                  <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                    <span className="badge badge-featured">{prod.badge}</span>
                  </div>
                )}
              </div>
              <div className="featured-body">
                <h4 className="featured-name">{prod.name}</h4>
                <div className="featured-price-row">
                  <span className="price-text">{formatPrice(prod.price)}</span>
                  <div className="rating-pill">
                    <Star size={11} fill="currentColor" />
                    <span>{Number(prod.rating).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO: OS CLIENTES ESTÃO FALANDO (Social Proof) */}
      {restaurant.socialProof && restaurant.socialProof.length > 0 && (
        <section className="section-container" aria-label="Avaliações dos Clientes">
          <div className="section-header-row">
            <div>
              <span className="section-tag" style={{ color: '#34D399' }}>Confiança Comprovada</span>
              <h3 className="section-title">Os clientes estão falando</h3>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: 'var(--star-gold)', fontWeight: 700 }}>
              <Star size={12} fill="currentColor" /> 4.9 Nota Média
            </span>
          </div>

          <div className="social-proof-scroll">
            {restaurant.socialProof.map((sp) => (
              <ReviewCard key={sp.id} review={sp} />
            ))}
          </div>
        </section>
      )}

      {/* SEÇÃO: CARDÁPIO COMPLETO (Por Categoria) */}
      <main className="section-container" style={{ paddingTop: '10px' }} id="cardapio-completo">
        <div style={{ marginBottom: '20px' }}>
          <span className="section-tag">Menu Completo</span>
          <h2 className="section-title" style={{ fontSize: '1.4rem' }}>
            Explore Nosso Cardápio
          </h2>
          <p className="section-subtitle">
            Toque no prato para ver ingredientes, fotos, notas e pedir pelo WhatsApp.
          </p>
        </div>

        {restaurant.categories.map((cat) => {
          const categoryProducts = restaurant.products.filter(
            (p) => p.category === cat.id && p.status !== 'paused'
          );

          if (categoryProducts.length === 0) return null;

          return (
            <div key={cat.id} id={`cat-${cat.id}`} className="products-category-group">
              <div className="category-group-header">
                <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                <h3 className="category-group-title">{cat.name}</h3>
                <span className="category-group-count">({categoryProducts.length})</span>
              </div>

              <div className="products-grid">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer Trust Box */}
        <div
          style={{
            marginTop: '30px',
            marginBottom: '20px',
            textAlign: 'center',
            padding: '24px 16px',
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)', fontWeight: 800, fontSize: '0.95rem' }}>
            <span>⚡ MenuFlow</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            "Escolha com confiança. Peça com vontade."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} color="#34D399" />
            <span>Cardápio digital com pedidos diretos pelo WhatsApp</span>
          </div>
        </div>
      </main>

      {/* Floating Bottom Mobile Navigation */}
      <BottomNavigation />

      {/* Modals & Overlays */}
      <ProductModal />
      <AddReviewModal />
      <SearchOverlay />
      <FavoritesDrawer />
      <RestaurantInfoModal />
      <QRCodeModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
