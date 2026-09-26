import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatPrice } from '../../utils/formatters';
import { X, Heart, Star, ArrowRight, Trash2 } from 'lucide-react';

export const FavoritesDrawer = () => {
  const {
    restaurant,
    favorites,
    toggleFavorite,
    favoritesOpen,
    setFavoritesOpen,
    setSelectedProduct,
  } = useRestaurant();

  if (!favoritesOpen) return null;

  const favoritedProducts = restaurant.products.filter((p) => favorites.includes(p.id));

  return (
    <div
      className="modal-backdrop"
      onClick={() => setFavoritesOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content-sheet animate-slide-up"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-drag-handle"></div>

        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={20} fill="#EF4444" color="#EF4444" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800 }}>
              Meus Favoritos ({favoritedProducts.length})
            </h3>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setFavoritesOpen(false)}
            aria-label="Fechar favoritos"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {favoritedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🍕❤️</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Nenhum favorito ainda
              </h4>
              <p style={{ fontSize: '0.82rem', marginTop: '6px', maxWidth: '280px', margin: '6px auto 16px auto' }}>
                Clique no ícone de coração nos pratos que você mais gosta para salvá-los aqui e pedir com facilidade!
              </p>
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => setFavoritesOpen(false)}
              >
                Explorar Cardápio
              </button>
            </div>
          ) : (
            favoritedProducts.map((prod) => (
              <div
                key={prod.id}
                className="search-result-item"
                onClick={() => {
                  setSelectedProduct(prod);
                  setFavoritesOpen(false);
                }}
              >
                <img src={prod.image} alt={prod.name} className="search-result-thumb" />
                <div className="search-result-info">
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {prod.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--star-gold)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <Star size={11} fill="currentColor" /> {Number(prod.rating).toFixed(1)}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 800 }}>
                      {formatPrice(prod.price)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    padding: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(prod.id);
                  }}
                  title="Remover dos favoritos"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
