import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useRestaurant } from '../../../controllers/RestaurantController';
import { copyToClipboard } from '../../../utils/formatters';
import { X, Download, Copy, Check, Sparkles } from 'lucide-react';

export const QRCodeModal = () => {
  const { restaurant, qrCodeOpen, setQrCodeOpen, showToast } = useRestaurant();
  const [selectedTable, setSelectedTable] = useState('Geral');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const menuUrl = new URL('/', window.location.origin);
  if (selectedTable !== 'Geral') menuUrl.searchParams.set('mesa', selectedTable === 'Balcão' ? 'balcao' : selectedTable.replace(/\D/g, ''));
  const menuLink = menuUrl.toString();
  const [readyLink, setReadyLink] = useState('');
  const qrReady = readyLink === menuLink;
  useEffect(() => {
    if (!qrCodeOpen || !canvasRef.current) return;
    let active = true;
    QRCode.toCanvas(canvasRef.current, menuLink, { width: 260, margin: 4, errorCorrectionLevel: 'M' })
      .then(() => { if (active) setReadyLink(menuLink); })
      .catch(() => { if (active) showToast('Não foi possível gerar o QR Code.', 'error'); });
    return () => { active = false; };
  }, [qrCodeOpen, menuLink, showToast]);

  if (!qrCodeOpen) return null;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const imageUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `MenuFlow-QRCode-${restaurant.slug}-${selectedTable}.png`;
    link.href = imageUri;
    link.click();
    showToast('Download do QR Code iniciado!');
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(menuLink);
    if (success) {
      setCopied(true);
      showToast('Link do cardápio copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => setQrCodeOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content-sheet animate-slide-up"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-drag-handle"></div>

        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--accent-secondary)" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800 }}>
              QR Code do Cardápio
            </h3>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setQrCodeOpen(false)}
            aria-label="Fechar QR Code"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Seus clientes apontam a câmera do celular para este código na mesa e acessam o cardápio instantaneamente.
          </p>

          {/* Table Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Identificação:</span>
            {['Geral', 'Mesa 01', 'Mesa 02', 'Mesa 03', 'Balcão'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedTable(tab)}
                style={{
                  background: selectedTable === tab ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedTable === tab ? '#000' : 'var(--text-secondary)',
                  border: '1px solid ' + (selectedTable === tab ? 'transparent' : 'rgba(255, 255, 255, 0.1)'),
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* QR Code Presentation Box */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '18px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.8), 0 0 35px rgba(255, 138, 31, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.1rem' }}>{restaurant.logo}</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#090909', fontSize: '0.95rem', letterSpacing: '-0.3px' }}>
                {restaurant.name}
              </span>
            </div>

            <canvas ref={canvasRef} style={{ width: '220px', height: '220px', borderRadius: '12px' }} />

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#090909', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {selectedTable === 'Geral' ? 'Cardápio Digital' : selectedTable.toUpperCase()}
              </span>
              <p style={{ fontSize: '0.65rem', color: '#666666' }}>
                Escaneie com a câmera do celular
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '6px' }}>
            <button
              type="button"
              className="btn-primary-action"
              style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
              onClick={handleDownload}
              disabled={!qrReady}
            >
              <Download size={16} />
              <span>Baixar QR Code (PNG)</span>
            </button>

            <button
              type="button"
              className="btn-secondary-action"
              style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={handleCopyLink}
              title="Copiar URL"
            >
              {copied ? <Check size={16} color="#34D399" /> : <Copy size={16} />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
