import React, { useState, useEffect, useRef } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { copyToClipboard } from '../../utils/formatters';
import { X, Download, Share2, Copy, Check, Sparkles } from 'lucide-react';

export const QRCodeModal = () => {
  const { restaurant, qrCodeOpen, setQrCodeOpen, showToast } = useRestaurant();
  const [selectedTable, setSelectedTable] = useState('Geral');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const menuUrl = `${window.location.origin}/${restaurant.slug}${
    selectedTable !== 'Geral' ? `?mesa=${selectedTable.replace(/\D/g, '')}` : ''
  }`;

  // Draw sleek QR Code on Canvas
  useEffect(() => {
    if (!qrCodeOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 260;
    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Decorative border
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#FFFFFF';
    ctx.strokeRect(0, 0, size, size);

    // Procedural QR Code blocks pattern for crisp appearance
    const gridSize = 25;
    const cellSize = (size - 32) / gridSize;
    const offset = 16;

    ctx.fillStyle = '#090909';

    // Helper for 7x7 corner finder patterns
    const drawFinderPattern = (x, y) => {
      ctx.fillRect(offset + x * cellSize, offset + y * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(offset + (x + 1) * cellSize, offset + (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#090909';
      ctx.fillRect(offset + (x + 2) * cellSize, offset + (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawFinderPattern(0, 0); // Top-left
    drawFinderPattern(gridSize - 7, 0); // Top-right
    drawFinderPattern(0, gridSize - 7); // Bottom-left

    // Deterministic data dots based on restaurant slug and table
    const seed = restaurant.slug.length * 37 + (selectedTable === 'Geral' ? 10 : 88);
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip finder patterns
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= gridSize - 8) ||
          (r >= gridSize - 8 && c < 8) ||
          (r >= 9 && r <= 15 && c >= 9 && c <= 15) // Center logo reserve
        ) {
          continue;
        }

        const pseudoRand = Math.sin(r * 12.9898 + c * 78.233 + seed) * 43758.5453;
        if (pseudoRand - Math.floor(pseudoRand) > 0.52) {
          ctx.beginPath();
          ctx.roundRect(offset + c * cellSize, offset + r * cellSize, cellSize - 1, cellSize - 1, 2);
          ctx.fill();
        }
      }
    }

    // Center Badge: MenuFlow Accent Box with Emoji
    const centerSize = 46;
    const centerPos = (size - centerSize) / 2;
    ctx.fillStyle = '#FF8A1F';
    ctx.beginPath();
    ctx.roundRect(centerPos, centerPos, centerSize, centerSize, 10);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Emoji icon
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(restaurant.logo || '🍕', size / 2, size / 2 + 2);
  }, [qrCodeOpen, selectedTable, restaurant]);

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
    const success = await copyToClipboard(menuUrl);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
