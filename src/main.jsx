import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RestaurantProvider } from './controllers/RestaurantController';
import './views/styles/variables.css';
import './views/styles/global.css';
import './views/styles/components.css';
import './views/styles/admin.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RestaurantProvider>
      <App />
    </RestaurantProvider>
  </StrictMode>
);
