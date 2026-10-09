import React from 'react';
import { useRestaurant } from '../../../controllers/RestaurantController';
import { formatPrice } from '../../../utils/formatters';
import { Badge } from '../common/Badge';
import { Star, Heart, ArrowRight } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const { setSelectedProduct, toggleFavorite, isFavorite } = useRestaurant();
  const favorited = isFavorite(product.id);

  return (
    <article
      className="product-card"
      onClick={() => setSelectedProduct(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setSelectedProduct(product);
        }
      }}
      aria-label={`Ver detalhes de ${product.name}`}
    >
      <div className="product-card-media">
        <img
          src={product.image}
          alt={product.name}
          className="product-card-img"
          loading="lazy"
        />

        {product.badge && (
          <div className="product-floating-badge">
            <Badge text={product.badge} type="featured" />
          </div>
        )}

        <button
          type="button"
          className={`favorite-btn ${favorited ? 'favorited' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart size={16} fill={favorited ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="product-card-body">
        <div className="product-header-row">
          <h3 className="product-title">{product.name}</h3>
        </div>

        <p className="product-desc">{product.description}</p>

        <div className="product-meta-row">
          <div className="rating-pill">
            <Star size={11} fill="currentColor" />
            <span>{Number(product.rating).toFixed(1)}</span>
            <span style={{ opacity: 0.75, fontWeight: 500 }}>({product.reviewsCount})</span>
          </div>

          {product.servings && (
            <>
              <span style={{ opacity: 0.3 }}>•</span>
              <span>{product.servings}</span>
            </>
          )}
        </div>

        <div className="product-footer-row">
          <span className="price-text">{formatPrice(product.price)}</span>
          <span className="view-btn">
            <span>Ver produto</span>
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </article>
  );
};
