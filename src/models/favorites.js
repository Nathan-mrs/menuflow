const key = 'menuflow_favorites';
export function loadFavorites() {
  try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value.filter(id => typeof id === 'string') : []; }
  catch { return []; }
}
export function saveFavorites(value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Keep in-memory favorites when storage is unavailable. */ }
}
