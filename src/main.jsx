import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CookieProvider } from './context/CookieContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import './styles/main.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <CookieProvider>
          <SiteSettingsProvider>
            <AuthProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </AuthProvider>
          </SiteSettingsProvider>
        </CookieProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
