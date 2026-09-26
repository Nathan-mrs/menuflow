// Formatting and WhatsApp message helpers for MenuFlow

export const formatPrice = (value) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const createWhatsAppOrderLink = ({
  phone,
  restaurantName,
  product,
  selectedSize,
  selectedAddons = [],
  quantity = 1,
  notes = '',
  tableNumber = null,
  totalPrice,
}) => {
  const cleanPhone = (phone || '5511987654321').replace(/\D/g, '');

  let message = `Olá, *${restaurantName || 'BOLA PIZZA'}*! 👋\n`;
  message += `Gostaria de fazer um pedido pelo *MenuFlow*:\n\n`;

  if (tableNumber) {
    message += `📍 *Consumo no local: Mesa ${tableNumber}*\n\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━━\n`;
  message += `🛒 *${quantity}x ${product.name}*\n`;
  
  if (selectedSize && selectedSize.name) {
    message += `▫️ *Tamanho:* ${selectedSize.name}\n`;
  }

  if (selectedAddons.length > 0) {
    message += `▫️ *Adicionais:*\n`;
    selectedAddons.forEach((addon) => {
      message += `   + ${addon.name} (${formatPrice(addon.price)})\n`;
    });
  }

  if (notes && notes.trim().length > 0) {
    message += `▫️ *Obs:* _"${notes.trim()}"_\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *Valor Total: ${formatPrice(totalPrice)}*\n\n`;
  message += `Por favor, confirmem o recebimento e o tempo estimado! 🙏`;

  const encoded = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
};

export const copyToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      textArea.remove();
      return true;
    } catch {
      textArea.remove();
      return false;
    }
  }
};
