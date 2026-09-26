import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { RatingStars } from '../common/RatingStars';
import { X, Sparkles, Send } from 'lucide-react';

export const AddReviewModal = () => {
  const { reviewModalProduct, setReviewModalProduct, submitReview } = useRestaurant();

  if (!reviewModalProduct) return null;

  const [rating, setRating] = useState(5);
  const [author, setAuthor] = useState('');
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const quickTags = [
    'Massa perfeita',
    'Muito recheio',
    'Chegou quentinho',
    'Super crocante',
    'Molho saboroso',
    'Recomendo muito!',
  ];

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Por favor, escreva uma frase sobre sua experiência!');
      return;
    }

    submitReview(reviewModalProduct.id, {
      author: author.trim() || 'Cliente Gourmet',
      rating,
      comment: comment.trim(),
      tags: selectedTags,
    });
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => setReviewModalProduct(null)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content-sheet animate-slide-up"
        style={{ maxHeight: '82vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-drag-handle"></div>

        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--accent-secondary)" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800 }}>
              Avaliar prato
            </h3>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setReviewModalProduct(null)}
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Item Selecionado
            </span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {reviewModalProduct.name}
            </h4>
          </div>

          {/* Interactive Stars Rating */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Como estava sua experiência?
            </span>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RatingStars
                rating={rating}
                size={28}
                interactive={true}
                onRate={(newRating) => setRating(newRating)}
              />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--star-gold)', fontWeight: 700, marginTop: '6px', display: 'block' }}>
              {rating === 5 && 'Excepcional! 🤩'}
              {rating === 4 && 'Muito bom! 😊'}
              {rating === 3 && 'Bom 🙂'}
              {rating === 2 && 'Poderia melhorar 😐'}
              {rating === 1 && 'Ruim 🙁'}
            </span>
          </div>

          {/* Quick Tags */}
          <div>
            <span className="form-label" style={{ display: 'block', marginBottom: '8px' }}>
              Destaques rápidos:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {quickTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    style={{
                      background: isSelected ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.05)',
                      color: isSelected ? '#000' : 'var(--text-secondary)',
                      border: '1px solid ' + (isSelected ? 'transparent' : 'rgba(255,255,255,0.1)'),
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name input */}
          <div className="form-group">
            <label className="form-label">Seu nome ou apelido (opcional):</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Carlos M."
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={40}
            />
          </div>

          {/* Comment input */}
          <div className="form-group">
            <label className="form-label">O que você achou? (conte para outros clientes):</label>
            <textarea
              className="notes-input-area"
              style={{ height: '90px' }}
              placeholder="Ex: Pizza muito bem recheada. A massa é incrivelmente leve e crocante..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              maxLength={300}
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn-primary-action"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.92rem', marginTop: '6px' }}
          >
            <Send size={16} />
            <span>Enviar avaliação</span>
          </button>
        </form>
      </div>
    </div>
  );
};
