import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';

export const Hero = () => {
  const { restaurant } = useRestaurant();

  return (
    <section className="hero-section pizza-hero proposal-hero" aria-label="Destaque da proposta">
      <div className="hero-media-wrapper">
        <img src={restaurant.coverImage} alt={restaurant.name} className="hero-img" loading="eager" />
        <div className="hero-overlay"></div>
      </div>
      <div className="hero-content proposal-hero-content">
        <span className="proposal-kicker">✦ Feito com carinho em São Bernardo</span>
        <h2 className="proposal-headline">O sabor que<br /><span>dá vontade.</span></h2>
        <p className="proposal-tagline">Sua noite merece uma Antari's.</p>
      </div>
    </section>
  );
};
