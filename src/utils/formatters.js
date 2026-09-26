// Formatting and WhatsApp message helpers for MenuFlow

export const parsePrice = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

export const isValidPrice = (value) => {
  const parsed = parsePrice(value);
  return parsed !== null && parsed > 0;
};

export const formatPrice = (value) => {
  const parsed = parsePrice(value);
  if (parsed === null || parsed <= 0) return 'Preço indisponível';
  return parsed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const cleanWhatsAppPhone = (phone = '') => String(phone).replace(/\D/g, '');

export const createCartWhatsAppOrderLink = ({ phone, restaurantName, items = [], total = 0 }) => {
  const cleanPhone = cleanWhatsAppPhone(phone);
  if (!cleanPhone) return '';
  if (!items.length || !isValidPrice(total)) return '';
  if (items.some((item) => !isValidPrice(item.unitPrice) || !Number.isFinite(item.quantity) || item.quantity <= 0)) return '';

  const lines = [];
  lines.push(`Ola, ${restaurantName || 'Bola Pizza'}!`);
  lines.push('Gostaria de confirmar este pedido:');
  lines.push('');

  items.forEach((item) => {
    const sizeText = item.size?.name ? ` (${item.size.name})` : '';
    lines.push(`${item.quantity}x ${item.product.name}${sizeText} - ${formatPrice(item.unitPrice * item.quantity)}`);
    lines.push(`Preco unitario: ${formatPrice(item.unitPrice)}`);
    if (item.notes) lines.push(`Obs: ${item.notes}`);
  });

  lines.push('');
  lines.push(`Valor estimado: ${formatPrice(total)}`);
  lines.push('Por favor, confirme disponibilidade, endereco, taxa de entrega e forma de pagamento.');

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(lines.join('\n'))}`;
};

export const copyToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }
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
};
