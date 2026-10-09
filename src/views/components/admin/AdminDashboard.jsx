import { useState } from 'react';
import { useRestaurant } from '../../../controllers/RestaurantController';
import { formatPrice } from '../../../utils/formatters';

const emptyProduct = category => ({ name: '', category, price: '', description: '', image: '', badge: '', ingredients: '' });
export function AdminDashboard({ onLogout }) {
  const { restaurant, addProduct, updateProduct, deleteProduct, toggleProductStatus, hideReview, updateRestaurantSettings } = useRestaurant();
  const [tab, setTab] = useState('products');
  const [editing, setEditing] = useState(null);
  const [product, setProduct] = useState(null);
  const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState(() => Object.fromEntries(['name', 'tagline', 'phone', 'whatsapp', 'instagram', 'address', 'openingHours', 'deliveryTime'].map(key => [key, restaurant[key] || ''])));
  const reviews = restaurant.products.flatMap(p => p.reviews.map(review => ({ ...review, productId: p.id, productName: p.name })));
  const action = async callback => { setBusy(true); try { return await callback(); } finally { setBusy(false); } };
  const openProduct = item => {
    setEditing(item?.id || null);
    setProduct(item ? { ...item, ingredients: item.ingredients.join(', ') } : emptyProduct(restaurant.categories[0]?.id));
  };
  const saveProduct = async event => {
    event.preventDefault();
    const input = { ...product, price: Number(product.price), ingredients: product.ingredients.split(',').map(value => value.trim()).filter(Boolean) };
    const success = await action(() => editing ? updateProduct(editing, input) : addProduct(input));
    if (success) setProduct(null);
  };
  return <div className="admin-fullscreen">
    <header className="admin-header-bar">
      <div className="admin-brand"><span>{restaurant.logo}</span><div><h1 className="admin-title">{restaurant.name}</h1><p>Painel do proprietário</p></div></div>
      <div className="admin-header-actions"><a className="admin-close-action-btn" href="/">Ver cardápio</a><button className="admin-close-action-btn" onClick={() => action(onLogout)} disabled={busy}>Sair</button></div>
    </header>
    <main className="admin-body-container">
      <div className="admin-welcome-card"><div><h2>Gerencie seu cardápio</h2><p>Atualize produtos, acompanhe avaliações e edite os dados da loja.</p></div><button className="btn-primary-action" onClick={() => openProduct()}>Novo produto</button></div>
      <div className="admin-metrics-grid">
        {[['Produtos', restaurant.products.length], ['Ativos', restaurant.products.filter(p => p.status !== 'paused').length], ['Categorias', restaurant.categories.length], ['Comentários cadastrados', reviews.length]].map(([label, value]) => <div className="metric-card" key={label}><span>{label}</span><strong className="metric-value">{value}</strong></div>)}
      </div>
      <nav className="admin-tabs-nav" aria-label="Seções administrativas">{[['products', 'Produtos'], ['categories', 'Categorias'], ['reviews', 'Avaliações'], ['settings', 'Configurações']].map(([id, label]) => <button className={`admin-tab-btn ${tab === id ? 'active' : ''}`} aria-current={tab === id ? 'page' : undefined} key={id} onClick={() => setTab(id)}>{label}</button>)}</nav>
      {tab === 'products' && <section className="admin-card-surface"><div className="table-responsive-wrapper"><table className="admin-table"><caption className="sr-only">Produtos do cardápio</caption><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead><tbody>
        {restaurant.products.map(item => <tr key={item.id}><td><div className="admin-product-name">{item.image && <img className="table-product-thumb" src={item.image} alt="" />}<strong>{item.name}</strong></div></td><td>{restaurant.categories.find(c => c.id === item.category)?.name}</td><td>{formatPrice(item.price)}</td><td>{item.status === 'paused' ? 'Pausado' : 'Ativo'}</td><td><div className="admin-row-actions">
          <button className="btn-secondary-action" onClick={() => openProduct(item)} disabled={busy}>Editar</button>
          <button className="btn-secondary-action" onClick={() => action(() => toggleProductStatus(item.id))} disabled={busy}>{item.status === 'paused' ? 'Ativar' : 'Pausar'}</button>
          <button className="btn-danger-action" onClick={() => { if (window.confirm(`Excluir ${item.name}?`)) action(() => deleteProduct(item.id)); }} disabled={busy}>Excluir</button>
        </div></td></tr>)}
      </tbody></table></div></section>}
      {tab === 'categories' && <section className="admin-card-surface admin-section"><h2>Categorias do cardápio</h2><div className="admin-category-list">{restaurant.categories.map(category => <div className="admin-category-item" key={category.id}><h3>{category.icon} {category.name}</h3><p>{category.description}</p><span>{restaurant.products.filter(p => p.category === category.id).length} produtos</span></div>)}</div></section>}
      {tab === 'reviews' && <section className="admin-card-surface admin-section"><h2>Avaliações dos clientes</h2>{reviews.length === 0 && <p>Nenhuma avaliação cadastrada.</p>}<div className="admin-review-list">{reviews.map(review => <article className="admin-review" key={review.id}><div><h3>{review.productName}</h3><p>{review.author} · {review.rating} ★ · {review.date}</p><p>{review.comment}</p></div><button className="btn-danger-action" disabled={busy} onClick={() => { if (window.confirm('Remover esta avaliação?')) action(() => hideReview(review.productId, review.id)); }}>Remover</button></article>)}</div></section>}
      {tab === 'settings' && <section className="admin-card-surface admin-section"><h2>Dados do estabelecimento</h2><form className="admin-form-grid" onSubmit={event => { event.preventDefault(); action(() => updateRestaurantSettings(settings)); }}>
        {Object.entries({ name: 'Nome', tagline: 'Subtítulo', phone: 'Telefone', whatsapp: 'WhatsApp (DDI e números)', instagram: 'Instagram', address: 'Endereço', openingHours: 'Horário de funcionamento', deliveryTime: 'Prazo de entrega' }).map(([key, label]) => <div className="form-group" key={key}><label className="form-label" htmlFor={`setting-${key}`}>{label}</label><input className="form-input" id={`setting-${key}`} value={settings[key]} onChange={event => setSettings({ ...settings, [key]: event.target.value })} required={key === 'name' || key === 'whatsapp'} /></div>)}
        <button className="btn-primary-action" disabled={busy}>{busy ? 'Salvando…' : 'Salvar configurações'}</button>
      </form></section>}
    </main>
    {product && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="product-form-title"><section className="modal-content-sheet admin-product-modal"><div className="admin-form-heading"><h2 id="product-form-title">{editing ? 'Editar produto' : 'Novo produto'}</h2><button className="btn-secondary-action" onClick={() => setProduct(null)} disabled={busy}>Fechar</button></div><form className="admin-product-form" onSubmit={saveProduct}>
      {Object.entries({ name: 'Nome', price: 'Preço (R$)', image: 'URL da imagem', badge: 'Etiqueta (opcional)', ingredients: 'Ingredientes separados por vírgula' }).map(([key, label]) => <div className="form-group" key={key}><label className="form-label" htmlFor={`product-${key}`}>{label}</label><input id={`product-${key}`} className="form-input" type={key === 'price' ? 'number' : key === 'image' ? 'url' : 'text'} min={key === 'price' ? '0.01' : undefined} step={key === 'price' ? '0.01' : undefined} required={['name', 'price'].includes(key)} value={product[key]} onChange={event => setProduct({ ...product, [key]: event.target.value })} /></div>)}
      <div className="form-group"><label className="form-label" htmlFor="product-category">Categoria</label><select className="form-input" id="product-category" value={product.category} onChange={event => setProduct({ ...product, category: event.target.value })}>{restaurant.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="form-group"><label className="form-label" htmlFor="product-description">Descrição</label><textarea id="product-description" className="form-input" rows={4} value={product.description} onChange={event => setProduct({ ...product, description: event.target.value })} /></div>
      <button className="btn-primary-action" disabled={busy}>{busy ? 'Salvando…' : 'Salvar produto'}</button>
    </form></section></div>}
  </div>;
}
