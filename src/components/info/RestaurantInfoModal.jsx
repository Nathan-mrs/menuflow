import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { X, MapPin, Clock, Phone, Navigation, CreditCard, ShieldCheck } from 'lucide-react';

const InstagramIcon = ({ size = 18, color = '#E1306C' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const RestaurantInfoModal = () => {
  const { restaurant, infoOpen, setInfoOpen } = useRestaurant();
  if (!infoOpen) return null;

  const hasMapsUrl = Boolean(restaurant.mapsUrl);
  const hasInstagram = Boolean(restaurant.instagram);
  const hasPhone = Boolean(restaurant.phone);

  return (
    <section className="menu-panel-backdrop info-panel" role="region" aria-label="Informações da pizzaria">
      <div className="menu-panel-sheet animate-slide-up info-panel-sheet">
        <div className="modal-drag-handle"></div>
        <div className="info-modal-header">
          <div className="info-brand-row"><div><h3>{restaurant.name}</h3><small>Informações e contato</small></div></div>
          <button type="button" className="icon-btn" onClick={() => setInfoOpen(false)} aria-label="Fechar informações"><X size={18} /></button>
        </div>

        <div className="info-modal-body">
          <div className="info-highlight-card"><p>{restaurant.tagline}</p><span>{restaurant.conceptNotice || restaurant.slogan}</span></div>
          <div className="info-row-card"><div className="info-icon-box"><Clock size={18} color="var(--accent-secondary)" /></div><div><small>Horário de funcionamento informado</small><strong>{restaurant.openingHours || 'Horário não informado'}</strong><span><span className="status-dot"></span>{restaurant.statusText || 'Consulte disponibilidade'}</span></div></div>
          <div className="info-row-card"><div className="info-icon-box"><MapPin size={18} color="var(--accent-secondary)" /></div><div><small>Endereço informado</small><strong>{restaurant.address || 'Endereço não informado'}</strong>{restaurant.mapsNote && <span>{restaurant.mapsNote}</span>}{hasMapsUrl && <a href={restaurant.mapsUrl} target="_blank" rel="noopener noreferrer" className="maps-link-btn"><Navigation size={14} /> Ver rota no Google Maps</a>}</div></div>
          <div className="info-actions-grid">
            {hasInstagram && <a href={`https://instagram.com/${restaurant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="btn-secondary-action"><InstagramIcon size={18} color="#E1306C" /> Instagram</a>}
            {hasPhone && <a href={`tel:${restaurant.phone.replace(/\D/g, '')}`} className="btn-secondary-action"><Phone size={18} color="var(--accent-secondary)" /> Ligar</a>}
          </div>
          <div className="payment-card"><div><CreditCard size={16} color="var(--accent-secondary)" /><strong>Pedido e pagamento</strong></div><span>Taxa de entrega, total final e forma de pagamento devem ser confirmados diretamente com a pizzaria no WhatsApp.</span></div>
          <div className="info-footer-note"><ShieldCheck size={20} color="#34D399" /><span>Proposta conceitual MenuFlow. Não é um site oficial da {restaurant.name}. Avaliações só devem aparecer quando houver convites verificados após compras reais.</span></div>
        </div>
      </div>
    </section>
  );
};
