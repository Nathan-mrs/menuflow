import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { X, MapPin, Clock, Phone, Navigation, CreditCard, ShieldCheck } from 'lucide-react';

const InstagramIcon = ({ size = 18, color = '#E1306C' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const RestaurantInfoModal = () => {
  const { restaurant, infoOpen, setInfoOpen } = useRestaurant();

  if (!infoOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={() => setInfoOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content-sheet animate-slide-up"
        style={{ maxHeight: '88vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-drag-handle"></div>

        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>{restaurant.logo}</span>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800 }}>
                {restaurant.name}
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Informações & Contato
              </span>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setInfoOpen(false)}
            aria-label="Fechar informações"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Tagline Card */}
          <div style={{ background: 'rgba(255, 138, 31, 0.08)', border: '1px solid rgba(255, 138, 31, 0.25)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
            <p style={{ fontSize: '0.88rem', color: '#FFFFFF', fontWeight: 600, lineHeight: 1.4 }}>
              "{restaurant.tagline}"
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {restaurant.slogan}
            </p>
          </div>

          {/* Opening Hours */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={18} color="var(--accent-secondary)" />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Horário de Funcionamento
              </span>
              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {restaurant.openingHours}
              </p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#34D399', fontWeight: 600, marginTop: '2px' }}>
                <span className="status-dot"></span> Aberto hoje para pedidos
              </span>
            </div>
          </div>

          {/* Address */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={18} color="var(--accent-secondary)" />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Endereço
              </span>
              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {restaurant.address}
              </p>
              <a
                href={restaurant.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--accent-secondary)',
                  textDecoration: 'none',
                }}
              >
                <Navigation size={14} />
                <span>Como chegar no Google Maps</span>
              </a>
            </div>
          </div>

          {/* Social & Contact Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <a
              href={`https://instagram.com/${restaurant.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-action"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', textDecoration: 'none' }}
            >
              <InstagramIcon size={18} color="#E1306C" />
              <span>Instagram</span>
            </a>

            <a
              href={`tel:${restaurant.phone.replace(/\D/g, '')}`}
              className="btn-secondary-action"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', textDecoration: 'none' }}
            >
              <Phone size={18} color="var(--accent-secondary)" />
              <span>Ligar</span>
            </a>
          </div>

          {/* Payment Methods */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <CreditCard size={16} color="var(--accent-secondary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Formas de Pagamento Aceitas
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Pix (Chave Automática)', 'Cartão de Crédito', 'Cartão de Débito', 'VR / Alelo / Sodexo', 'Dinheiro com Troco'].map((pay) => (
                <span key={pay} className="ingredient-chip">
                  {pay}
                </span>
              ))}
            </div>
          </div>

          {/* Security / Quality Seal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <ShieldCheck size={20} color="#34D399" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Cardápio oficial operado sob tecnologia <strong style={{ color: '#FFFFFF' }}>MenuFlow</strong>. Avaliações 100% autênticas de clientes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
