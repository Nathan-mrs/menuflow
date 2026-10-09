import { useState } from 'react';
import { useRestaurant } from '../../../controllers/RestaurantController';
import { formatPrice, createWhatsAppOrderLink } from '../../../utils/formatters';
import { Badge } from '../common/Badge';
import { RatingStars } from '../common/RatingStars';
import { X, Heart, Star, CheckCircle, Plus, Minus, MessageCircle, MessageSquarePlus } from 'lucide-react';

const ProductDetails = () => {
  const {
    restaurant,
    selectedProduct,
    setSelectedProduct,
    toggleFavorite,
    isFavorite,
    setReviewModalProduct,
  } = useRestaurant();



  const favorited = isFavorite(selectedProduct.id);

  // Customization state
  const defaultSize =
    selectedProduct.sizes && selectedProduct.sizes.length > 0
      ? selectedProduct.sizes.find((s) => s.default) || selectedProduct.sizes[0]
      : null;

  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Calculate dynamic total price
  const basePrice = selectedProduct.price;
  const sizeOffset = selectedSize ? selectedSize.priceOffset || 0 : 0;
  const addonsTotal = selectedAddons.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const unitPrice = basePrice + sizeOffset + addonsTotal;
  const totalPrice = unitPrice * quantity;

  // Toggle addons
  const handleAddonToggle = (addon) => {
    const exists = selectedAddons.some((a) => a.id === addon.id);
    if (exists) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  // WhatsApp order link
  const whatsAppLink = createWhatsAppOrderLink({
    phone: restaurant.whatsapp || restaurant.phone,
    restaurantName: restaurant.name,
    product: selectedProduct,
    selectedSize,
    selectedAddons,
    quantity,
    notes,
    totalPrice,
    tableNumber: new URLSearchParams(window.location.search).get('mesa'),
  });

  // Calculate rating distribution percentages
  const dist = selectedProduct.ratingsDistribution || { 5: 100, 4: 10, 3: 2, 2: 1, 1: 0 };
  const totalReviewsInDist = Object.values(dist).reduce((acc, val) => acc + val, 0) || 1;

  return (
    <div
      className="modal-backdrop"
      onClick={() => setSelectedProduct(null)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
    >
      <div
        className="modal-content-sheet animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-drag-handle"></div>

        <div className="modal-scrollable-body">
          {/* Media Header */}
          <div className="modal-media-header">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="modal-media-img"
            />
            <div className="modal-media-overlay"></div>

            <div className="modal-top-bar">
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedProduct(null)}
                aria-label="Fechar detalhes do produto"
              >
                <X size={20} />
              </button>

              <button
                type="button"
                className={`favorite-btn ${favorited ? 'favorited' : ''}`}
                onClick={() => toggleFavorite(selectedProduct.id)}
                aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Product Info Block */}
          <div className="modal-info-block">
            {selectedProduct.badge && (
              <div>
                <Badge text={selectedProduct.badge} type="featured" />
              </div>
            )}

            <h2 id="modal-product-title" className="modal-dish-title">
              {selectedProduct.name}
            </h2>

            <div className="modal-price-rating-row">
              <span className="modal-price">{formatPrice(unitPrice)}</span>
              <div className="modal-rating-badge">
                <Star size={15} fill="currentColor" />
                <span>{Number(selectedProduct.rating).toFixed(1)}</span>
                <span style={{ opacity: 0.65, fontSize: '0.78rem' }}>
                  ({selectedProduct.reviewsCount} avaliações)
                </span>
              </div>
            </div>

            <p className="modal-dish-desc">{selectedProduct.description}</p>

            {/* Ingredients Chips */}
            {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
              <div style={{ marginTop: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Ingredientes & Preparo:
                </span>
                <div className="ingredients-chips-row">
                  {selectedProduct.ingredients.map((ing, idx) => (
                    <span key={idx} className="ingredient-chip">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customization: Sizes */}
          {selectedProduct.sizes && selectedProduct.sizes.length > 1 && (
            <div className="customization-section">
              <div className="customization-title-row">
                <span className="customization-title">Escolha o tamanho:</span>
                <span className="customization-badge">Obrigatório</span>
              </div>
              <div className="options-list">
                {selectedProduct.sizes.map((sizeOption, idx) => {
                  const isSelected = selectedSize?.name === sizeOption.name;
                  return (
                    <div
                      key={idx}
                      className={`radio-option-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(sizeOption)}
                    >
                      <div className="option-left">
                        <div className="custom-radio">
                          {isSelected && <div className="custom-radio-inner"></div>}
                        </div>
                        <span className="option-name">{sizeOption.name}</span>
                      </div>
                      <span className="option-price">
                        {sizeOption.priceOffset === 0
                          ? 'Incluso'
                          : `+ ${formatPrice(sizeOption.priceOffset)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customization: Addons */}
          {selectedProduct.addons && selectedProduct.addons.length > 0 && (
            <div className="customization-section">
              <div className="customization-title-row">
                <span className="customization-title">Adicionais & Turbinar:</span>
                <span className="customization-badge">Opcional</span>
              </div>
              <div className="options-list">
                {selectedProduct.addons.map((addon) => {
                  const isSelected = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      className={`checkbox-option-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleAddonToggle(addon)}
                    >
                      <div className="option-left">
                        <div className="custom-checkbox">
                          {isSelected && '✓'}
                        </div>
                        <span className="option-name">{addon.name}</span>
                      </div>
                      <span className="option-price">+ {formatPrice(addon.price)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Notes */}
          <div className="customization-section">
            <span className="customization-title" style={{ display: 'block', marginBottom: '8px' }}>
              Alguma observação especial?
            </span>
            <textarea
              className="notes-input-area"
              placeholder="Ex: sem cebola, ponto da carne bem passado, molho à parte..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
            ></textarea>
          </div>

          {/* REVIEWS SECTION */}
          <div className="modal-reviews-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Avaliações Reais
                </span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800 }}>
                  Quem já pediu, avaliou.
                </h3>
              </div>
            </div>

            {/* Score & Distribution Breakdown */}
            <div className="reviews-summary-card">
              <div className="score-big-box">
                <span className="score-number">{Number(selectedProduct.rating).toFixed(1)}</span>
                <div className="score-stars-row">
                  <RatingStars rating={selectedProduct.rating} size={13} />
                </div>
                <span className="score-total-count">{selectedProduct.reviewsCount} notas</span>
              </div>

              <div className="bars-breakdown">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = dist[stars] || 0;
                  const pct = Math.round((count / totalReviewsInDist) * 100);
                  return (
                    <div key={stars} className="bar-row">
                      <span style={{ width: '14px', textAlign: 'right' }}>{stars}★</span>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span style={{ width: '28px', textAlign: 'right', fontSize: '0.68rem' }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Review Trigger */}
            <button
              type="button"
              className="add-review-trigger-btn"
              onClick={() => setReviewModalProduct(selectedProduct)}
            >
              <MessageSquarePlus size={16} />
              <span>Avaliar este prato</span>
            </button>

            {/* Reviews Feed */}
            <div className="reviews-feed">
              {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                selectedProduct.reviews.map((rev) => (
                  <div key={rev.id} className="review-item">
                    <div className="review-item-header">
                      <div className="review-author">
                        <span>{rev.author}</span>
                        {rev.verified && (
                          <span className="verified-tag">
                            <CheckCircle size={12} />
                            Verificado
                          </span>
                        )}
                      </div>
                      <span className="review-date">{rev.date}</span>
                    </div>

                    <div style={{ marginBottom: '6px' }}>
                      <RatingStars rating={rev.rating} size={11} />
                    </div>

                    <p className="review-comment-text">"{rev.comment}"</p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Seja o primeiro a avaliar este prato!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Action Bottom Bar */}
        <div className="modal-fixed-bottom-bar">
          <div className="quantity-control">
            <button
              type="button"
              className="qty-btn"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Diminuir quantidade"
            >
              <Minus size={14} />
            </button>
            <span className="qty-value">{quantity}</span>
            <button
              type="button"
              className="qty-btn"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Aumentar quantidade"
            >
              <Plus size={14} />
            </button>
          </div>

          <a
            href={whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-cta-btn"
            id="btn-pedir-whatsapp"
          >
            <MessageCircle size={20} />
            <span className="order-button-label">Pedir pelo WhatsApp<strong>{formatPrice(totalPrice)}</strong></span>
          </a>
        </div>
      </div>
    </div>
  );
};

export const ProductModal = () => {
  const { selectedProduct } = useRestaurant();
  return selectedProduct ? <ProductDetails key={selectedProduct.id} /> : null;
};
