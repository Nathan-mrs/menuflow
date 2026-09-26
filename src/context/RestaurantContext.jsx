import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEMO_RESTAURANT } from '../data/demoRestaurant';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { loadPublicRestaurant } from '../services/menuRepository';
import { isValidPrice, parsePrice } from '../utils/formatters';

const RestaurantContext = createContext();

export const RestaurantProvider = ({ children }) => {
  const [remoteRestaurant, setRemoteRestaurant] = useState(null);
  const [menuLoading, setMenuLoading] = useState(isSupabaseConfigured);
  const [menuError, setMenuError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('pizzas');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const fallbackRestaurant = useMemo(() => DEMO_RESTAURANT, []);
  const restaurant = remoteRestaurant || fallbackRestaurant;

  const refreshPublicMenu = async () => {
    if (!isSupabaseConfigured) {
      setMenuLoading(false);
      return;
    }

    setMenuLoading(true);
    setMenuError(null);
    try {
      const loadedRestaurant = await loadPublicRestaurant();
      if (loadedRestaurant) setRemoteRestaurant(loadedRestaurant);
    } catch (error) {
      console.error('Supabase public menu load error:', error);
      setMenuError('Cardapio demonstrativo carregado. A consulta ao Supabase falhou; verifique se as migracoes foram aplicadas.');
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    refreshPublicMenu();
  }, []);

  useEffect(() => {
    if (restaurant.categories?.length) setActiveCategory(restaurant.categories[0].id);
  }, [restaurant.id]);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const addToCart = ({ product, quantity = 1, notes = '', size = null }) => {
    if (product.sizes?.length && !size) {
      setSelectedProduct(product);
      showToast('Escolha o tamanho antes de adicionar.', 'warning');
      return;
    }

    const unitPrice = parsePrice(size ? size.price : product.price);
    if (!isValidPrice(unitPrice)) {
      setSelectedProduct(product);
      showToast('Preco indisponivel para este item. Ajuste o cadastro antes de vender.', 'error');
      return;
    }

    setCartItems((current) => {
      const existingIndex = current.findIndex(
        (item) => item.product.id === product.id && item.notes === notes && (item.size?.id || '') === (size?.id || '')
      );
      if (existingIndex >= 0) {
        return current.map((item, index) =>
          index === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...current, { id: `${product.id}-${size?.id || 'single'}-${Date.now()}`, product, size, quantity, notes, unitPrice }];
    });
    setCartOpen(true);
    showToast('Item adicionado ao carrinho');
  };

  const updateCartItem = (itemId, quantity) => {
    if (quantity <= 0) {
      setCartItems((current) => current.filter((item) => item.id !== itemId));
      return;
    }
    setCartItems((current) => current.map((item) => (item.id === itemId ? { ...item, quantity } : item)));
  };

  const clearCart = () => setCartItems([]);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <RestaurantContext.Provider
      value={{
        restaurant,
        menuLoading,
        menuError,
        refreshPublicMenu,
        activeCategory,
        setActiveCategory,
        selectedProduct,
        setSelectedProduct,
        searchOpen,
        setSearchOpen,
        infoOpen,
        setInfoOpen,
        qrCodeOpen,
        setQrCodeOpen,
        toast,
        showToast,
        cartItems,
        cartOpen,
        setCartOpen,
        addToCart,
        updateCartItem,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('useRestaurant must be used within a RestaurantProvider');
  return context;
};
