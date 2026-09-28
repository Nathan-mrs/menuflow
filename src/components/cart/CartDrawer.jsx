import React, { useMemo, useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { createCartWhatsAppOrderLink, formatPrice } from '../../utils/formatters';
import { getRestaurantOpenStatus } from '../../utils/openingHours';
import { Minus, Plus, Send, Trash2, X } from 'lucide-react';

const emptyAddress = { street: '', number: '', neighborhood: '', reference: '' };

const CartItemDetails = ({ item }) => {
  const config = item.configuration || {};
  return (
    <>
      {item.size?.name && <span>Tamanho: {item.size.name}</span>}
      {config.mode === 'half' && config.flavors?.length === 2 && <span>Sabores: 1/2 {config.flavors[0].name} + 1/2 {config.flavors[1].name}</span>}
      {config.mode !== 'half' && config.flavors?.[0]?.name && <span>Sabor: {config.flavors[0].name}</span>}
      {config.border?.name && <span>Borda: {config.border.name}{config.border.priceDelta > 0 ? ` (+ ${formatPrice(config.border.priceDelta)})` : ''}</span>}
      {config.borderChoice === 'none' && <span>Borda: sem borda</span>}
      <span>{formatPrice(item.unitPrice)} cada</span>
      <span>Subtotal: {formatPrice(item.unitPrice * item.quantity)}</span>
      {item.notes && <small>Obs: {item.notes}</small>}
    </>
  );
};

export const CartDrawer = () => {
  const { restaurant, cartItems, cartOpen, setCartOpen, updateCartItem, clearCart, cartTotal } = useRestaurant();
  const [fulfillmentType, setFulfillmentType] = useState('');
  const [address, setAddress] = useState(emptyAddress);
  const [formError, setFormError] = useState('');

  const openStatus = useMemo(() => getRestaurantOpenStatus(restaurant), [restaurant]);
  if (!cartOpen) return null;

  const deliverySelected = fulfillmentType === 'delivery';
  const pickupSelected = fulfillmentType === 'pickup';
  const addressIsValid = !deliverySelected || (address.street.trim() && address.number.trim() && address.neighborhood.trim());
  const fulfillment = deliverySelected
    ? {
      type: 'delivery',
      street: address.street.trim(),
      number: address.number.trim(),
      neighborhood: address.neighborhood.trim(),
      reference: address.reference.trim(),
    }
    : pickupSelected
      ? { type: 'pickup', restaurantAddress: restaurant.address }
      : null;

  const whatsappLink = fulfillment && openStatus.isOpen
    ? createCartWhatsAppOrderLink({ phone: restaurant.whatsapp, restaurantName: restaurant.name, items: cartItems, total: cartTotal, fulfillment })
    : '';
  const canCheckout = Boolean(whatsappLink && cartItems.length > 0 && fulfillmentType && addressIsValid && openStatus.isOpen);

  const handleCheckoutClick = (event) => {
    if (canCheckout) return;
    event.preventDefault();
    if (!openStatus.isOpen) setFormError('A pizzaria está fechada agora. O WhatsApp fica disponível somente durante o horário informado.');
    else if (!fulfillmentType) setFormError('Escolha Entrega ou Retirada no local para continuar.');
    else if (!addressIsValid) setFormError('Informe rua, número e bairro para entrega.');
    else setFormError('Confira os dados do pedido antes de abrir o WhatsApp.');
  };

  return (
    <div className="cart-backdrop" onClick={() => setCartOpen(false)}>
      <aside className="cart-drawer animate-slide-up" onClick={(event) => event.stopPropagation()} aria-label="Carrinho">
        <div className="cart-header"><div><span className="section-tag">Pedido pelo WhatsApp</span><h2>Seu carrinho</h2></div><button type="button" className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Fechar carrinho"><X size={18} /></button></div>

        {cartItems.length === 0 ? (
          <div className="empty-reviews-card"><strong>Carrinho vazio.</strong><span>Escolha um item para montar a mensagem do WhatsApp.</span></div>
        ) : (
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <img src={item.product.image} alt="" />
                <div className="cart-item-info"><strong>{item.product.name}</strong><CartItemDetails item={item} /></div>
                <div className="cart-item-actions"><button type="button" onClick={() => updateCartItem(item.id, item.quantity - 1)}><Minus size={13} /></button><span>{item.quantity}</span><button type="button" onClick={() => updateCartItem(item.id, item.quantity + 1)}><Plus size={13} /></button></div>
              </div>
            ))}
          </div>
        )}

        <div className="cart-footer">
          <div className="cart-total-row"><span>Subtotal dos produtos</span><strong>{formatPrice(cartTotal)}</strong></div>
          {restaurant.pricingNotice && <p>{restaurant.pricingNotice}</p>}
          <div className="fulfillment-section">
            <span className="fulfillment-title">Como deseja receber?</span>
            <div className="fulfillment-options">
              <button type="button" className={`radio-option-card fulfillment-option ${deliverySelected ? 'selected' : ''}`} onClick={() => { setFulfillmentType('delivery'); setFormError(''); }}>Entrega</button>
              <button type="button" className={`radio-option-card fulfillment-option ${pickupSelected ? 'selected' : ''}`} onClick={() => { setFulfillmentType('pickup'); setFormError(''); }}>Retirada no local</button>
            </div>
            {deliverySelected && (
              <div className="delivery-address-grid">
                <input className="form-input" placeholder="Rua" value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })} />
                <input className="form-input" placeholder="Número" value={address.number} onChange={(event) => setAddress({ ...address, number: event.target.value })} />
                <input className="form-input" placeholder="Bairro" value={address.neighborhood} onChange={(event) => setAddress({ ...address, neighborhood: event.target.value })} />
                <input className="form-input" placeholder="Referência (opcional)" value={address.reference} onChange={(event) => setAddress({ ...address, reference: event.target.value })} />
                <small>Taxa e total final a confirmar pela pizzaria no WhatsApp.</small>
              </div>
            )}
            {pickupSelected && <p>Retirada no local: {restaurant.address}. O pedido será confirmado na conversa.</p>}
          </div>
          <p>{openStatus.isOpen ? 'O pedido só será confirmado na conversa com a pizzaria.' : `${openStatus.label}. O envio para WhatsApp fica bloqueado fora do horário informado.`}</p>
          {restaurant.whatsappPendingNote && <p>{restaurant.whatsappPendingNote}</p>}
          {formError && <span className="form-error-text">{formError}</span>}
          <a className={`whatsapp-cta-btn ${canCheckout ? '' : 'disabled'}`} href={canCheckout ? whatsappLink : '#'} target="_blank" rel="noopener noreferrer" onClick={handleCheckoutClick}><Send size={18} /> Finalizar no WhatsApp</a>
          {cartItems.length > 0 && <button className="clear-cart-btn" type="button" onClick={clearCart}><Trash2 size={14} /> Limpar carrinho</button>}
        </div>
      </aside>
    </div>
  );
};
