import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Search, QrCode, Info, Star, Clock } from 'lucide-react';

export const Header = () => {
  const { restaurant, setSearchOpen, setInfoOpen, setQrCodeOpen } = useRestaurant();

  return (
    <header className="main-header">
      <div className="brand-info">
        <div className="brand-row">
          <span style={{ fontSize: '1.25rem' }}>{restaurant.logo || '🍕'}</span>
          <h1 className="brand-title">{restaurant.name}</h1>
        </div>
        <div className="brand-meta">
          <span className="badge badge-status">
            <span className="status-dot"></span>
            {restaurant.statusText || 'Aberto agora'}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={11} color="var(--accent-secondary)" />
            {restaurant.deliveryTime}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--star-gold)', fontWeight: 700 }}>
            <Star size={11} fill="currentColor" />
            {restaurant.rating}
          </span>
        </div>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={() => setSearchOpen(true)}
          aria-label="Buscar produtos no cardápio"
          title="Buscar no cardápio"
        >
          <Search size={18} />
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={() => setQrCodeOpen(true)}
          aria-label="Ver QR Code do Cardápio"
          title="QR Code da Mesa"
        >
          <QrCode size={18} />
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={() => setInfoOpen(true)}
          aria-label="Informações do Restaurante"
          title="Horários e Localização"
        >
          <Info size={18} />
        </button>
      </div>
    </header>
  );
};
