import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { request } from '../models/api';
import { loadFavorites, saveFavorites } from '../models/favorites';
const RestaurantContext = createContext(null);
export function RestaurantProvider({ children }) {
  const [restaurant, setRestaurant] = useState(null);
  const [loadingError, setLoadingError] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewModalProduct, setReviewModalProduct] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [favorites, setFavorites] = useState(loadFavorites);
  const [toast, setToast] = useState(null);
  const overlayOpen = Boolean(selectedProduct || reviewModalProduct || searchOpen || infoOpen || qrCodeOpen || favoritesOpen);
  useEffect(() => {
    if (!overlayOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = event => {
      if (event.key !== 'Escape') return;
      setSelectedProduct(null); setReviewModalProduct(null); setSearchOpen(false);
      setInfoOpen(false); setQrCodeOpen(false); setFavoritesOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = original; document.removeEventListener('keydown', onKeyDown); };
  }, [overlayOpen]);
  const refresh = useCallback(async () => {
    const result = await request('/restaurant');
    setRestaurant(result);
    setActiveCategory(previous => previous || result.categories[0]?.id || '');
    return result;
  }, []);
  useEffect(() => {
    request('/restaurant').then(result => { setRestaurant(result); setActiveCategory(result.categories[0]?.id || ''); }).catch(error => setLoadingError(error.message));
  }, []);
  useEffect(() => { saveFavorites(favorites); }, [favorites]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(null), 3200); return () => clearTimeout(timer); }, [toast]);
  const showToast = useCallback((message, type = 'success') => setToast({ id: Date.now(), message, type }), []);
  const mutate = async (path, method, input, message) => {
    try {
      const result = await request(path, { method, body: input });
      setRestaurant(result);
      setSelectedProduct(previous => previous ? result.products.find(product => product.id === previous.id) || null : null);
      showToast(message);
      return true;
    } catch (error) { showToast(error.message, 'error'); return false; }
  };
  const toggleFavorite = id => setFavorites(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]);
  const submitReview = async (id, review) => {
    if (await mutate(`/products/${id}/reviews`, 'POST', review, 'Obrigado pela avaliação!')) setReviewModalProduct(null);
  };
  return <RestaurantContext.Provider value={{
    restaurant, loadingError, refresh, activeCategory, setActiveCategory, selectedProduct, setSelectedProduct, reviewModalProduct, setReviewModalProduct,
    searchOpen, setSearchOpen, infoOpen, setInfoOpen, qrCodeOpen, setQrCodeOpen, favoritesOpen, setFavoritesOpen, favorites, toggleFavorite,
    isFavorite: id => favorites.includes(id), toast, showToast, submitReview,
    addProduct: product => mutate('/products', 'POST', product, 'Produto adicionado!'),
    updateProduct: (id, product) => mutate(`/products/${id}`, 'PATCH', product, 'Produto atualizado!'),
    deleteProduct: id => mutate(`/products/${id}`, 'DELETE', {}, 'Produto removido.'),
    toggleProductStatus: id => mutate(`/products/${id}`, 'PATCH', { status: restaurant.products.find(p => p.id === id)?.status === 'paused' ? 'active' : 'paused' }, 'Status atualizado.'),
    hideReview: (productId, reviewId) => mutate(`/products/${productId}/reviews/${reviewId}`, 'DELETE', {}, 'Avaliação removida.'),
    updateRestaurantSettings: settings => mutate('/restaurant', 'PATCH', settings, 'Configurações salvas!'),
  }}>{children}</RestaurantContext.Provider>;
}
export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('RestaurantProvider não encontrado.');
  return context;
}
