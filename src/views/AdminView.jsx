import { useEffect, useState } from 'react';
import { useAuth } from '../controllers/AuthController';
import { useRestaurant } from '../controllers/RestaurantController';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Toast } from './components/common/Toast';
export default function AdminView() {
  const auth = useAuth();
  const { refresh } = useRestaurant();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  useEffect(() => { if (auth.session?.authenticated) refresh().catch(() => {}); }, [auth.session?.authenticated, refresh]);
  if (auth.session?.authenticated) return <><AdminDashboard onLogout={auth.logout} /><Toast />{auth.error && <p className="auth-error" role="alert">{auth.error}</p>}</>;
  return <main className="auth-page"><form className="auth-card" onSubmit={event => { event.preventDefault(); auth.login(email, password); }}>
    <span className="section-tag">MenuFlow</span><h1>Acesso do proprietário</h1><p>Entre para gerenciar o cardápio do estabelecimento.</p>
    <label htmlFor="admin-email">E-mail</label><input id="admin-email" className="form-input" type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required />
    <label htmlFor="admin-password">Senha</label><input id="admin-password" className="form-input" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
    {auth.error && <p className="auth-error" role="alert">{auth.error}</p>}
    {auth.session?.configured === false && <p role="status">O acesso do proprietário ainda não foi configurado.</p>}
    <button className="btn-primary-action" disabled={auth.busy || !auth.session?.configured}>{auth.busy ? 'Entrando…' : 'Entrar'}</button>
    <a href="/">Voltar ao cardápio</a>
  </form></main>;
}
