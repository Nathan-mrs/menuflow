import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatPrice } from '../../utils/formatters';
import { Search, X, Star, ArrowRight } from 'lucide-react';

export const SearchOverlay = () => {
  const { restaurant, searchOpen, setSearchOpen, setSelectedProduct } = useRestaurant();
  const [query, setQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return restaurant.products.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const descMatch = p.description.toLowerCase().includes(q);
      const catMatch = p.category.toLowerCase().includes(q);
      const ingredientsMatch = p.ingredients?.some((ing) => ing.toLowerCase().includes(q));
      return nameMatch || descMatch || catMatch || ingredientsMatch;
    });
  }, [query, restaurant.products]);

  if (!searchOpen) return null;

  return (
    <div className="search-overlay animate-fade-in" role="dialog" aria-modal="true">
      <div className="search-container">
        {/* Search Bar */}
        <div className="search-input-wrapper">
          <Search size={20} color="var(--accent-secondary)" />
          <input
            type="text"
            className="search-input-field"
            placeholder="Buscar no cardápio (ex: calabresa, trufa, burger)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button
            type="button"
            className="icon-btn"
            style={{ width: '30px', height: '30px' }}
            onClick={() => setSearchOpen(false)}
            aria-label="Fechar busca"
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Filter Suggestions */}
        {!query && (
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Termos mais buscados:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {['Calabresa', 'Catupiry', 'Smash Burger', 'Trufado', 'Bacon', 'Nutella', 'Costela'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'var(--text-secondary)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="search-results-list">
          {query.trim() && filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Nenhum prato encontrado para "{query}"
              </p>
              <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                Tente pesquisar por ingredientes ou nomes de categorias.
              </p>
            </div>
          ) : (
            filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="search-result-item"
                onClick={() => {
                  setSelectedProduct(prod);
                  setSearchOpen(false);
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
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 800 }}>
                      {formatPrice(prod.price)}
                    </span>
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
