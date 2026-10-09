import React from 'react';
import { useRestaurant } from '../../../controllers/RestaurantController';
import { Flame, Sparkles, Award } from 'lucide-react';

export const Hero = () => {
  const { restaurant } = useRestaurant();

  return (
    <section className="hero-section" aria-label="Destaque principal">
      <div className="hero-media-wrapper">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="hero-img"
          loading="eager"
        />
        <div className="hero-overlay"></div>
      </div>

      <div className="hero-content">
        <span className="hero-subtitle">
          {restaurant.heroSubtitle || 'Cardápio Digital Premium'}
        </span>
        <h2 className="hero-title">
          {restaurant.slogan || 'Escolha com confiança. Peça com vontade.'}
        </h2>

        <div className="hero-badges-row">
          <div className="hero-chip">
            <Flame size={12} color="var(--accent-secondary)" />
            <span>Fermentação Natural</span>
          </div>
          <div className="hero-chip">
            <Award size={12} color="#34D399" />
            <span>Ingredientes Nobres</span>
          </div>
          <div className="hero-chip">
            <Sparkles size={12} color="var(--star-gold)" />
            <span>4.9 / 5.0 estrelas</span>
          </div>
        </div>
      </div>
    </section>
  );
};
