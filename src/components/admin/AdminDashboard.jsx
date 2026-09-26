import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatPrice } from '../../utils/formatters';
import {
  X,
  TrendingUp,
  ShoppingBag,
  Star,
  Users,
  Layers,
  Settings,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  ExternalLink,
  Edit2,
  Save,
  Flame,
} from 'lucide-react';

export const AdminDashboard = () => {
  const {
    restaurant,
    adminOpen,
    setAdminOpen,
    addProduct,
    deleteProduct,
    toggleProductStatus,
    hideReview,
    updateRestaurantSettings,
    showToast,
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [newProductModalOpen, setNewProductModalOpen] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    name: restaurant.name,
    tagline: restaurant.tagline,
    phone: restaurant.phone,
    whatsapp: restaurant.whatsapp,
    instagram: restaurant.instagram,
    address: restaurant.address,
    openingHours: restaurant.openingHours,
    deliveryTime: restaurant.deliveryTime,
  });

  // New product form state
  const [newProd, setNewProd] = useState({
    name: '',
    category: restaurant.categories[0]?.id || 'pizzas',
    price: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    badge: '🔥 Novidade',
    ingredients: '',
  });

  if (!adminOpen) return null;

  // Flatten all reviews for moderation
  const allReviews = restaurant.products.flatMap((p) =>
    (p.reviews || []).map((r) => ({
      ...r,
      productId: p.id,
      productName: p.name,
    }))
  );

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateRestaurantSettings(settingsForm);
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) {
      alert('Nome e preço são obrigatórios!');
      return;
    }

    addProduct({
      name: newProd.name.trim(),
      category: newProd.category,
      price: parseFloat(newProd.price.replace(',', '.')) || 0,
      description: newProd.description.trim(),
      image: newProd.image.trim(),
      badge: newProd.badge.trim() || null,
      ingredients: newProd.ingredients
        ? newProd.ingredients.split(',').map((s) => s.trim())
        : [],
      sizes: [{ name: 'Padrão', priceOffset: 0, default: true }],
      addons: [],
      status: 'active',
    });

    setNewProductModalOpen(false);
    setNewProd({
      name: '',
      category: restaurant.categories[0]?.id || 'pizzas',
      price: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      badge: '🔥 Novidade',
      ingredients: '',
    });
  };

  return (
    <div className="admin-fullscreen animate-fade-in" role="dialog" aria-modal="true">
      {/* Top Header */}
      <header className="admin-header-bar">
        <div className="admin-brand">
          <span style={{ fontSize: '1.4rem' }}>{restaurant.logo}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800 }}>
                {restaurant.name}
              </h2>
              <span className="admin-badge-saas">SaaS Partner</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Painel de Gestão MenuFlow
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="admin-close-action-btn"
            onClick={() => setAdminOpen(false)}
          >
            <ExternalLink size={14} />
            <span>Ver Cardápio Público</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="admin-body-container">
        {/* Welcome Banner */}
        <div className="admin-welcome-card">
          <div>
            <h1 className="admin-welcome-title">Olá, {restaurant.name} 👋</h1>
            <p className="admin-welcome-sub">
              Seu cardápio digital inteligente gerando pedidos com confiança através de avaliações reais.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary-action"
            onClick={() => setNewProductModalOpen(true)}
          >
            <Plus size={16} />
            <span>Novo Produto</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="admin-metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span>Pedidos este mês</span>
              <ShoppingBag size={16} color="var(--accent-secondary)" />
            </div>
            <span className="metric-value">342</span>
            <div className="metric-trend">
              <TrendingUp size={13} />
              <span>+18.4% vs mês anterior</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span>Avaliações coletadas</span>
              <Users size={16} color="#34D399" />
            </div>
            <span className="metric-value">{restaurant.reviewsCount}</span>
            <div className="metric-trend" style={{ color: '#34D399' }}>
              <CheckCircle size={13} />
              <span>98% clientes recomendam</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span>Nota Média da Casa</span>
              <Star size={16} color="var(--star-gold)" />
            </div>
            <span className="metric-value" style={{ color: 'var(--star-gold)' }}>
              {restaurant.rating} ⭐
            </span>
            <div className="metric-trend" style={{ color: 'var(--text-muted)' }}>
              <span>Baseada em avaliações verificadas</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span>Produtos no Menu</span>
              <Layers size={16} color="var(--accent-secondary)" />
            </div>
            <span className="metric-value">{restaurant.products.length}</span>
            <div className="metric-trend" style={{ color: 'var(--accent-secondary)' }}>
              <span>{restaurant.categories.length} categorias ativas</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs-nav">
          {[
            { id: 'dashboard', label: '📊 Visão Geral' },
            { id: 'products', label: `🍕 Produtos (${restaurant.products.length})` },
            { id: 'categories', label: `📑 Categorias (${restaurant.categories.length})` },
            { id: 'reviews', label: `⭐ Moderação de Avaliações (${allReviews.length})` },
            { id: 'settings', label: '⚙️ Configurações da Loja' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: DASHBOARD / VISÃO GERAL */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="admin-card-surface" style={{ padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px' }}>
                🔥 Produtos Mais Pedidos na Semana
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                {restaurant.products.slice(0, 3).map((p, idx) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-secondary)', width: '24px' }}>
                      #{idx + 1}
                    </span>
                    <img src={p.image} alt={p.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>{p.name}</h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {formatPrice(p.price)} • {p.reviewsCount} pedidos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips Box */}
            <div style={{ background: 'rgba(255, 138, 31, 0.06)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)', fontWeight: 700, fontSize: '0.9rem' }}>
                <Flame size={18} />
                <span>Dica de Conversão MenuFlow</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#D1D5DB', marginTop: '6px', lineHeight: 1.5 }}>
                Pratos com pelo menos <strong>3 comentários com foto ou texto detalhado</strong> recebem até <strong>42% mais pedidos</strong> pelo WhatsApp do que itens sem avaliação. Mantenha os destaques sempre atualizados!
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUTOS */}
        {activeTab === 'products' && (
          <div className="admin-card-surface">
            <div className="admin-table-header-bar">
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800 }}>
                  Gerenciador de Cardápio
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Edite preços, pause itens ou adicione novos lançamentos
                </span>
              </div>
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => setNewProductModalOpen(true)}
              >
                <Plus size={16} />
                <span>Novo Prato</span>
              </button>
            </div>

            <div className="table-responsive-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Avaliação</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurant.products.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={item.image} alt={item.name} className="table-product-thumb" />
                          <div>
                            <span style={{ fontWeight: 700, display: 'block' }}>{item.name}</span>
                            {item.badge && (
                              <span style={{ fontSize: '0.68rem', color: 'var(--accent-secondary)' }}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize' }}>{item.category}</span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{formatPrice(item.price)}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--star-gold)', fontWeight: 700 }}>
                          <Star size={12} fill="currentColor" /> {Number(item.rating).toFixed(1)}
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 400 }}>
                            ({item.reviewsCount})
                          </span>
                        </span>
                      </td>
                      <td>
                        <span className={item.status === 'paused' ? 'status-badge-paused' : 'status-badge-active'}>
                          {item.status === 'paused' ? 'Pausado' : 'Ativo'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn-secondary-action"
                            onClick={() => toggleProductStatus(item.id)}
                            title={item.status === 'paused' ? 'Ativar item' : 'Pausar item'}
                          >
                            {item.status === 'paused' ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button
                            type="button"
                            className="btn-danger-action"
                            onClick={() => {
                              if (confirm(`Remover "${item.name}" do cardápio?`)) {
                                deleteProduct(item.id);
                              }
                            }}
                            title="Excluir item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIAS */}
        {activeTab === 'categories' && (
          <div className="admin-card-surface" style={{ padding: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
              Categorias do Cardápio
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {restaurant.categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.3rem' }}>{cat.icon}</span>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cat.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.description}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '4px' }}>
                    Posição #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AVALIAÇÕES */}
        {activeTab === 'reviews' && (
          <div className="admin-card-surface">
            <div className="admin-table-header-bar">
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800 }}>
                  Central de Moderação de Avaliações
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Acompanhe em tempo real os feedbacks dos clientes que pediram
                </span>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Prato Avaliado</th>
                    <th>Nota</th>
                    <th>Comentário</th>
                    <th>Data</th>
                    <th style={{ textAlign: 'right' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {allReviews.map((rev) => (
                    <tr key={rev.id}>
                      <td style={{ fontWeight: 700 }}>{rev.author}</td>
                      <td style={{ color: 'var(--accent-secondary)' }}>{rev.productName}</td>
                      <td>
                        <span style={{ color: 'var(--star-gold)', fontWeight: 800 }}>
                          {rev.rating} ★
                        </span>
                      </td>
                      <td style={{ maxWidth: '320px', fontSize: '0.82rem', color: '#CCCCCC' }}>
                        "{rev.comment}"
                      </td>
                      <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{rev.date}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-danger-action"
                          onClick={() => hideReview(rev.productId, rev.id)}
                          title="Ocultar avaliação"
                        >
                          <EyeOff size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: CONFIGURAÇÕES */}
        {activeTab === 'settings' && (
          <div className="admin-card-surface">
            <div className="admin-table-header-bar">
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800 }}>
                  Dados do Estabelecimento
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Atualize endereço, horários e números para onde o WhatsApp redireciona
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="admin-form-grid">
              <div className="form-group">
                <label className="form-label">Nome da Empresa:</label>
                <input
                  type="text"
                  className="form-input"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Slogan / Subtítulo:</label>
                <input
                  type="text"
                  className="form-input"
                  value={settingsForm.tagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp para Receber Pedidos (com DDI):</label>
                <input
                  type="text"
                  className="form-input"
                  value={settingsForm.whatsapp}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                  placeholder="5511999999999"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Instagram (@usuario):</label>
                <input
                  type="text"
                  className="form-input"
                  value={settingsForm.instagram}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Endereço Completo:</label>
                <input
                  type="text"
                  className="form-input"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Horário de Funcionamento:</label>
                <input
                  type="text"
                  className="form-input"
                  value={settingsForm.openingHours}
                  onChange={(e) => setSettingsForm({ ...settingsForm, openingHours: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tempo Médio de Preparo / Entrega:</label>
                <input
                  type="text"
                  className="form-input"
                  value={settingsForm.deliveryTime}
                  onChange={(e) => setSettingsForm({ ...settingsForm, deliveryTime: e.target.value })}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" className="btn-primary-action" style={{ padding: '10px 24px' }}>
                  <Save size={16} />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* NOVO PRODUTO MODAL */}
      {newProductModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setNewProductModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-content-sheet animate-slide-up"
            style={{ maxHeight: '88vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800 }}>
                Cadastrar Novo Produto
              </h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setNewProductModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
              <div className="form-group">
                <label className="form-label">Nome do Prato / Produto:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Pizza Trufada de Cogumelos"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Categoria:</label>
                  <select
                    className="form-input"
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    style={{ background: '#1c1c1c' }}
                  >
                    {restaurant.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Preço (R$):</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: 48,90"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Badge de Destaque (opcional):</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: 🔥 Mais pedido, ⭐ Novidade"
                  value={newProd.badge}
                  onChange={(e) => setNewProd({ ...newProd, badge: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL da Imagem:</label>
                <input
                  type="text"
                  className="form-input"
                  value={newProd.image}
                  onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição Apetitiva:</label>
                <textarea
                  className="notes-input-area"
                  placeholder="Descreva os sabores, molhos e o que torna este prato único..."
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Ingredientes (separados por vírgula):</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Molho pelati, Queijo fior di latte, Manjericão"
                  value={newProd.ingredients}
                  onChange={(e) => setNewProd({ ...newProd, ingredients: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn-primary-action"
                style={{ justifyContent: 'center', padding: '14px', marginTop: '6px' }}
              >
                <Plus size={16} />
                <span>Salvar e Adicionar ao Cardápio</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
