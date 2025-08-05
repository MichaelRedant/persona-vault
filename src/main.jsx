import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import SharedWorkspace from './pages/SharedWorkspace.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/vault">
      <Routes>
        <Route path="/share/:token" element={<SharedWorkspace />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
