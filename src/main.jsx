import React from 'react';
import ReactDOM from 'react-dom/client';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

const App = lazy(() => import('./App.jsx'));
const SharedWorkspace = lazy(() => import('./pages/SharedWorkspace.jsx'));
const Marketplace = lazy(() => import('./pages/Marketplace'));

const routeFallback = (
  <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
    Loading...
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/vault">
      <Suspense fallback={routeFallback}>
        <Routes>
          <Route path="/share/:token" element={<SharedWorkspace />} />
          <Route path="/marketplace" element={<Marketplace token={localStorage.getItem('vault_jwt_token') || ''} />} />
          <Route path="*" element={<App />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);

// Prevent stale custom service workers from older setups interfering in dev.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch(() => {});

    if ('caches' in window) {
      caches.keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => {});
    }
  });
}
