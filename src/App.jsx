import { lazy, Suspense } from 'react';
import { useRestaurant } from './controllers/RestaurantController';
import MenuView from './views/MenuView';
const AdminView = lazy(() => import('./views/AdminView'));
export default function App() {
  const { restaurant, loadingError } = useRestaurant();
  if (loadingError) return <main className="auth-page"><p role="alert">{loadingError}</p><button className="btn-primary-action" onClick={() => window.location.reload()}>Tentar novamente</button></main>;
  if (!restaurant) return <main className="auth-page" role="status">Carregando cardápio…</main>;
  const admin = window.location.pathname.replace(/\/+$/, '') === '/admin';
  if (!admin && window.location.pathname !== '/') return <main className="auth-page"><h1>Página não encontrada</h1><a href="/">Ver cardápio</a></main>;
  return admin ? <Suspense fallback={<p role="status">Carregando…</p>}><AdminView /></Suspense> : <MenuView />;
}
