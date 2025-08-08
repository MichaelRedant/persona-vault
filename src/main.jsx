import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import SharedWorkspace from './pages/SharedWorkspace.jsx';
import Marketplace from './pages/Marketplace';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/vault">
      <Routes>
        <Route path="/share/:token" element={<SharedWorkspace />} />
        <Route path="/marketplace" element={<Marketplace token={localStorage.getItem('vault_jwt_token') || ''} />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch((err) => console.error('Service worker registration failed:', err));
  });
}
