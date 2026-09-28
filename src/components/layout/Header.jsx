import React, { useMemo } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Search, QrCode, Info, Star, Clock } from 'lucide-react';
import { getRestaurantOpenStatus } from '../../utils/openingHours';

export const Header = () => {
  const { restaurant, setSearchOpen, setInfoOpen, setQrCodeOpen } = useRestaurant();
  const hasRating = restaurant.reviewsCount > 0 && restaurant.rating > 0;
  const openStatus = useMemo(() => getRestaurantOpenStatus(restaurant), [restaurant]);

  return (
    <header className="main-header pizza-header">
      <div className="brand-info">
        <div className="brand-row">
          <h1 className="brand-title">{restaurant.name || 'Pizzaria'}</h1>
        </div>
        <div className="brand-meta">
          <span className={`badge badge-status ${openStatus.isOpen ? 'open' : 'closed'}`}><span className="status-dot"></span>{openStatus.label}</span>
          {restaurant.deliveryTime && <span><Clock size={11} color="var(--accent-secondary)" /> {restaurant.deliveryTime}</span>}
          {hasRating && <span className="brand-rating"><Star size={11} fill="currentColor" /> {Number(restaurant.rating).toFixed(1)}</span>}
        </div>
      </div>

      <div className="header-actions" aria-label="Ações do cardápio">
        <button type="button" className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Buscar produtos"><Search size={18} /></button>
        <button type="button" className="icon-btn" onClick={() => setQrCodeOpen(true)} aria-label="Ver QR Code"><QrCode size={18} /></button>
        <button type="button" className="icon-btn" onClick={() => setInfoOpen(true)} aria-label="Informações da pizzaria"><Info size={18} /></button>
      </div>
    </header>
  );
};
