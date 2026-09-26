import React, { createContext, useContext, useState, useEffect } from 'react';
import { RESTAURANTS_DATA } from '../data/restaurants';
import confetti from 'canvas-confetti';

const RestaurantContext = createContext();

export const RestaurantProvider = ({ children }) => {
  // Multi-tenant state (URL slug or selected demo tenant)
  const [tenantsData, setTenantsData] = useState(() => {
    const saved = localStorage.getItem('menuflow_tenants');
    return saved ? JSON.parse(saved) : RESTAURANTS_DATA;
  });

  const [currentTenantId, setCurrentTenantId] = useState('bola-pizza');
  const restaurant = tenantsData[currentTenantId] || tenantsData['bola-pizza'];

  // Global UI states
  const [activeCategory, setActiveCategory] = useState(restaurant.categories[0]?.id || 'pizzas');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewModalProduct, setReviewModalProduct] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(`menuflow_favs_${currentTenantId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('menuflow_tenants', JSON.stringify(tenantsData));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [tenantsData]);

  useEffect(() => {
    try {
      localStorage.setItem(`menuflow_favs_${currentTenantId}`, JSON.stringify(favorites));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [favorites, currentTenantId]);

  // Sync category if tenant changes
  useEffect(() => {
    if (restaurant.categories && restaurant.categories.length > 0) {
      setActiveCategory(restaurant.categories[0].id);
    }
  }, [currentTenantId]);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const toggleFavorite = (productId) => {
    const exists = favorites.includes(productId);
    let updated;
    if (exists) {
      updated = favorites.filter((id) => id !== productId);
      showToast('Item removido dos favoritos');
    } else {
      updated = [...favorites, productId];
      showToast('Adicionado aos seus favoritos! ❤️');
    }
    setFavorites(updated);
  };

  const isFavorite = (productId) => favorites.includes(productId);

  // Submit Review Flow with Confetti
  const submitReview = (productId, { author, rating, comment, tags }) => {
    setTenantsData((prev) => {
      const updatedTenant = { ...prev[currentTenantId] };
      const updatedProducts = updatedTenant.products.map((prod) => {
        if (prod.id === productId) {
          const newReview = {
            id: `r-${Date.now()}`,
            author: author.trim() || 'Cliente Verificado',
            rating: Number(rating) || 5,
            comment: comment.trim(),
            date: 'Agora mesmo',
            verified: true,
            tags: tags || [],
          };

          const newReviews = [newReview, ...(prod.reviews || [])];
          const newCount = (prod.reviewsCount || 0) + 1;
          
          // Update distribution
          const dist = { ...(prod.ratingsDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }) };
          dist[rating] = (dist[rating] || 0) + 1;

          // Calculate new average
          const totalPoints = newReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
          const newAvg = Number((totalPoints / newReviews.length).toFixed(1));

          return {
            ...prod,
            rating: newAvg,
            reviewsCount: newCount,
            ratingsDistribution: dist,
            reviews: newReviews,
          };
        }
        return prod;
      });

      updatedTenant.products = updatedProducts;
      return {
        ...prev,
        [currentTenantId]: updatedTenant,
      };
    });

    // Also update currently open selectedProduct if it's the one being reviewed
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct((prev) => {
        const newReview = {
          id: `r-${Date.now()}`,
          author: author.trim() || 'Cliente Verificado',
          rating: Number(rating) || 5,
          comment: comment.trim(),
          date: 'Agora mesmo',
          verified: true,
          tags: tags || [],
        };
        const newReviews = [newReview, ...(prev.reviews || [])];
        const newCount = (prev.reviewsCount || 0) + 1;
        const dist = { ...(prev.ratingsDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }) };
        dist[rating] = (dist[rating] || 0) + 1;
        const totalPoints = newReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
        return {
          ...prev,
          rating: Number((totalPoints / newReviews.length).toFixed(1)),
          reviewsCount: newCount,
          ratingsDistribution: dist,
          reviews: newReviews,
        };
      });
    }

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF8A1F', '#FFB347', '#FFFFFF', '#4CAF50'],
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }

    showToast('Obrigado por compartilhar sua experiência! ❤️');
    setReviewModalProduct(null);
  };

  // Admin capabilities
  const addProduct = (newProduct) => {
    setTenantsData((prev) => {
      const updatedTenant = { ...prev[currentTenantId] };
      const productWithId = {
        ...newProduct,
        id: `prod-${Date.now()}`,
        rating: 5.0,
        reviewsCount: 1,
        ratingsDistribution: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
        reviews: [
          {
            id: `r-init-${Date.now()}`,
            author: 'MenuFlow Curadoria',
            rating: 5,
            comment: 'Lançamento exclusivo do cardápio!',
            date: 'Hoje',
            verified: true,
          },
        ],
      };
      updatedTenant.products = [productWithId, ...updatedTenant.products];
      return { ...prev, [currentTenantId]: updatedTenant };
    });
    showToast('Produto adicionado ao cardápio!');
  };

  const updateProduct = (productId, updatedFields) => {
    setTenantsData((prev) => {
      const updatedTenant = { ...prev[currentTenantId] };
      updatedTenant.products = updatedTenant.products.map((p) =>
        p.id === productId ? { ...p, ...updatedFields } : p
      );
      return { ...prev, [currentTenantId]: updatedTenant };
    });
    showToast('Produto atualizado com sucesso!');
  };

  const deleteProduct = (productId) => {
    setTenantsData((prev) => {
      const updatedTenant = { ...prev[currentTenantId] };
      updatedTenant.products = updatedTenant.products.filter((p) => p.id !== productId);
      return { ...prev, [currentTenantId]: updatedTenant };
    });
    showToast('Produto removido do cardápio.');
  };

  const toggleProductStatus = (productId) => {
    setTenantsData((prev) => {
      const updatedTenant = { ...prev[currentTenantId] };
      updatedTenant.products = updatedTenant.products.map((p) => {
        if (p.id === productId) {
          const newStatus = p.status === 'paused' ? 'active' : 'paused';
          showToast(`Produto ${newStatus === 'active' ? 'ativado' : 'pausado'}`);
          return { ...p, status: newStatus };
        }
        return p;
      });
      return { ...prev, [currentTenantId]: updatedTenant };
    });
  };

  const hideReview = (productId, reviewId) => {
    setTenantsData((prev) => {
      const updatedTenant = { ...prev[currentTenantId] };
      updatedTenant.products = updatedTenant.products.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            reviews: p.reviews.filter((r) => r.id !== reviewId),
          };
        }
        return p;
      });
      return { ...prev, [currentTenantId]: updatedTenant };
    });
    showToast('Avaliação moderada com sucesso.');
  };

  const updateRestaurantSettings = (newSettings) => {
    setTenantsData((prev) => {
      return {
        ...prev,
        [currentTenantId]: {
          ...prev[currentTenantId],
          ...newSettings,
        },
      };
    });
    showToast('Configurações do restaurante salvas!');
  };

  return (
    <RestaurantContext.Provider
      value={{
        currentTenantId,
        setCurrentTenantId,
        tenantsData,
        restaurant,
        activeCategory,
        setActiveCategory,
        selectedProduct,
        setSelectedProduct,
        reviewModalProduct,
        setReviewModalProduct,
        searchOpen,
        setSearchOpen,
        infoOpen,
        setInfoOpen,
        qrCodeOpen,
        setQrCodeOpen,
        adminOpen,
        setAdminOpen,
        favoritesOpen,
        setFavoritesOpen,
        favorites,
        toggleFavorite,
        isFavorite,
        toast,
        showToast,
        submitReview,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
        hideReview,
        updateRestaurantSettings,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
