import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Home, Search, Heart, Info } from 'lucide-react';

export const BottomNavigation = () => {
  const {
    favorites,
    setSearchOpen,
    setFavoritesOpen,
    favoritesOpen,
    setInfoOpen,
    infoOpen,
  } = useRestaurant();

  const handleHomeClick = () => {
    setSearchOpen(false);
    setFavoritesOpen(false);
    setInfoOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHomeActive = !favoritesOpen && !infoOpen;

  return (
    <nav className="bottom-nav" aria-label="Navegação inferior móvel">
      <button
        type="button"
        className={`nav-item ${isHomeActive ? 'active' : ''}`}
        onClick={handleHomeClick}
      >
        <Home size={20} className="nav-icon" />
        <span>Início</span>
      </button>

      <button
        type="button"
        className="nav-item"
        onClick={() => setSearchOpen(true)}
      >
        <Search size={20} className="nav-icon" />
        <span>Buscar</span>
      </button>

      <button
        type="button"
        className={`nav-item ${favoritesOpen ? 'active' : ''}`}
        onClick={() => {
          setInfoOpen(false);
          setFavoritesOpen(true);
        }}
      >
        <div style={{ position: 'relative' }}>
          <Heart size={20} className="nav-icon" />
          {favorites.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -5,
                right: -8,
                background: 'var(--accent-primary)',
                color: '#000',
                fontSize: '0.62rem',
                fontWeight: 800,
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {favorites.length}
            </span>
          )}
        </div>
        <span>Favoritos</span>
      </button>

      <button
        type="button"
        className={`nav-item ${infoOpen ? 'active' : ''}`}
        onClick={() => {
          setFavoritesOpen(false);
          setInfoOpen(true);
        }}
      >
        <Info size={20} className="nav-icon" />
        <span>Sobre</span>
      </button>
    </nav>
  );
};
