import React, { useEffect, useMemo, useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatPrice, isValidPrice, parsePrice } from '../../utils/formatters';
import { RatingStars } from '../common/RatingStars';
import { X, Plus, Minus, CheckCircle, ShoppingCart, Star } from 'lucide-react';

export const ProductModal = () => {
  const { selectedProduct, setSelectedProduct, addToCart } = useRestaurant();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedSizeId, setSelectedSizeId] = useState('');
  const [sizeError, setSizeError] = useState('');

  const sizes = useMemo(() => selectedProduct?.sizes || [], [selectedProduct]);
  const selectedSize = sizes.find((size) => size.id === selectedSizeId) || null;

  useEffect(() => {
    if (selectedProduct) {
      setQuantity(1);
      setNotes('');
      setSelectedSizeId('');
      setSizeError('');
    }
  }, [selectedProduct?.id]);

  if (!selectedProduct) return null;

  const hasSizes = sizes.length > 0;
  const unitPrice = parsePrice(selectedSize ? selectedSize.price : selectedProduct.price);
  const hasValidPrice = isValidPrice(unitPrice);
  const hasReviews = selectedProduct.reviewsCount > 0 && selectedProduct.rating;
  const totalPrice = hasValidPrice ? unitPrice * quantity : null;

  const handleAdd = () => {
    if (hasSizes && !selectedSize) {
      setSizeError('Escolha um tamanho para continuar.');
      return;
    }
    if (!isValidPrice(selectedSize ? selectedSize.price : selectedProduct.price)) {
      setSizeError('Preco indisponivel para este item. Ajuste o cadastro antes de vender.');
      return;
    }
    addToCart({ product: selectedProduct, size: selectedSize, quantity, notes: notes.trim() });
    setSelectedProduct(null);
  };

  return (
    <div className="modal-backdrop" onClick={() => setSelectedProduct(null)} role="dialog" aria-modal="true">
      <div className="modal-content-sheet animate-slide-up" onClick={(event) => event.stopPropagation()}>
        <div className="modal-scrollable-body">
          <div className="modal-media-header">
            <img src={selectedProduct.image} alt={selectedProduct.name} className="modal-media-img" />
            <div className="modal-media-overlay"></div>
            <div className="modal-top-bar">
              <button type="button" className="modal-close-btn" onClick={() => setSelectedProduct(null)} aria-label="Fechar"><X size={20} /></button>
            </div>
          </div>

          <div className="modal-info-block">
            {selectedProduct.badge && <span className="pizza-badge inline-badge">{selectedProduct.badge}</span>}
            <h2 className="modal-dish-title">{selectedProduct.name}</h2>
            <div className="modal-price-rating-row">
              <span className="modal-price">{formatPrice(unitPrice)}</span>
              {hasReviews ? <div className="modal-rating-badge"><Star size={15} fill="currentColor" /> {Number(selectedProduct.rating).toFixed(1)} ({selectedProduct.reviewsCount})</div> : <span className="empty-review-pill">Ainda sem avaliacoes</span>}
            </div>
            {!hasValidPrice && !hasSizes && <span className="form-error-text">Este produto nao pode ser adicionado enquanto estiver sem preco valido.</span>}
            <p className="modal-dish-desc">{selectedProduct.description}</p>
            {selectedProduct.ingredients?.length > 0 && <div className="ingredients-chips-row">{selectedProduct.ingredients.slice(0, 8).map((ingredient) => <span key={ingredient} className="ingredient-chip">{ingredient}</span>)}</div>}
          </div>

          {hasSizes && (
            <div className="customization-section">
              <span className="customization-title">Escolha o tamanho</span>
              <div className="options-list">
                {sizes.map((size) => {
                  const disabled = !isValidPrice(size.price) || size.isAvailable === false;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      className={`radio-option-card size-option-card ${selectedSizeId === size.id ? 'selected' : ''}`}
                      onClick={() => { if (!disabled) { setSelectedSizeId(size.id); setSizeError(''); } }}
                      disabled={disabled}
                    >
                      <span className="option-name">{size.name}</span>
                      <span className="option-price">{disabled ? 'Preço indisponível' : formatPrice(size.price)}</span>
                    </button>
                  );
                })}
              </div>
              {sizeError && <span className="form-error-text">{sizeError}</span>}
            </div>
          )}

          <div className="customization-section">
            <span className="customization-title">Observacao para a pizzaria</span>
            <textarea className="notes-input-area" placeholder="Ex: sem cebola, cortar em 8 pedacos..." value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={180} />
          </div>

          <section className="modal-reviews-section">
            <div className="reviews-title-row"><div><span className="section-tag">Avaliacoes do produto</span><h3 className="section-title small-title">Compra verificada, quando houver convite</h3></div></div>
            {hasReviews ? (
              <div className="reviews-feed">
                {selectedProduct.reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-item-header"><div className="review-author"><span>{review.author}</span>{review.verified && <span className="verified-tag"><CheckCircle size={12} /> Compra verificada</span>}</div><span className="review-date">{review.date}</span></div>
                    <RatingStars rating={review.rating} size={12} />
                    {review.comment && <p className="review-comment-text">"{review.comment}"</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-reviews-card"><strong>Nenhuma avaliacao publicada ainda.</strong><span>Nesta demonstracao, avaliacoes aparecem apenas depois de convite valido gerado pela pizzaria.</span></div>
            )}
          </section>
        </div>

        <div className="modal-fixed-bottom-bar">
          <div className="quantity-control"><button type="button" className="qty-btn" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></button><span className="qty-value">{quantity}</span><button type="button" className="qty-btn" onClick={() => setQuantity((value) => value + 1)}><Plus size={14} /></button></div>
          <button type="button" className="whatsapp-cta-btn" onClick={handleAdd}><ShoppingCart size={20} /> Adicionar - {formatPrice(totalPrice)}</button>
        </div>
      </div>
    </div>
  );
};
