import React from 'react';
import { useRestaurant } from './context/RestaurantContext';
import { Header } from './components/layout/Header';
import { Hero } from './components/layout/Hero';
import { CategoryNav } from './components/layout/CategoryNav';
import { ProductCard } from './components/product/ProductCard';
import { ProductModal } from './components/product/ProductModal';
import { SearchOverlay } from './components/search/SearchOverlay';
import { RestaurantInfoModal } from './components/info/RestaurantInfoModal';
import { QRCodeModal } from './components/qrcode/QRCodeModal';
import { Toast } from './components/common/Toast';
import { AdminPage } from './components/admin/AdminPage';
import { CartDrawer } from './components/cart/CartDrawer';
import { ReviewInvitePage } from './components/reviews/ReviewInvitePage';
import { formatPrice } from './utils/formatters';
import { ShoppingCart } from 'lucide-react';

function AppContent() {
  const {
    restaurant,
    menuError,
    cartCount,
    cartTotal,
    setCartOpen,
  } = useRestaurant();

  return (
    <div className="app-shell pizza-menu-shell">
      <div className="tenant-bar">
        <div className="tenant-brand-pill">MenuFlow</div>
      </div>

      <Header />
      <Hero />
      {menuError && <div className="demo-notice">{menuError}</div>}
      <CategoryNav />

      <main className="section-container menu-main" id="cardapio-completo">
        <div className="menu-heading">
          <span className="section-tag">Demonstracao</span>
          <h2 className="section-title">Cardapio da Bola Pizza</h2>
          <p className="section-subtitle">Fotos, precos e avaliacoes por produto, sem pedido confirmado fora do WhatsApp.</p>
        </div>

        {restaurant.categories.map((cat) => {
          const categoryProducts = restaurant.products.filter(
            (product) => product.category === cat.id && product.status !== 'paused'
          );
          if (categoryProducts.length === 0) return null;

          return (
            <section key={cat.id} id={`cat-${cat.id}`} className="products-category-group">
              <div className="category-group-header">
                <span className="category-icon">{cat.icon}</span>
                <h3 className="category-group-title">{cat.name}</h3>
              </div>
              <div className="products-grid">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {cartCount > 0 && (
        <button type="button" className="cart-fab" onClick={() => setCartOpen(true)}>
          <ShoppingCart size={18} />
          <span>{cartCount} item{cartCount > 1 ? 's' : ''}</span>
          <strong>{formatPrice(cartTotal)}</strong>
        </button>
      )}

      <ProductModal />
      <CartDrawer />
      <SearchOverlay />
      <RestaurantInfoModal />
      <QRCodeModal />
      <Toast />
    </div>
  );
}

export default function App() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
  if (normalizedPath === '/admin') return <AdminPage />;
  if (normalizedPath.startsWith('/avaliar/')) {
    const token = decodeURIComponent(normalizedPath.replace('/avaliar/', ''));
    return <ReviewInvitePage token={token} />;
  }

  return <AppContent />;
}
