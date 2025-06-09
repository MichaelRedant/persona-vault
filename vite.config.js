import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const basePath = '/vault/'; // ← update dit als je in root zou willen publiceren

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    VitePWA({
      injectRegister: 'inline',         // Snelle initiatie, minder netwerk calls
      registerType: 'autoUpdate',       // Automatisch nieuwe versies activeren
      manifest: {
        name: 'Persona Vault',
        short_name: 'Vault',
        start_url: '/vault/',
        scope: '/vault/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        description: 'Persona & Prompt Vault App',
        icons: [
          {
            src: './logo-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: './logo-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          // ⚠️ HTML navigaties → NetworkFirst → altijd laatste index.html
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'vault-html-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 1 dag
              },
            },
          },
          // JS/CSS → CacheFirst → hashed & veilig
          {
            urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
            handler: 'CacheFirst',
            options: {
              cacheName: 'vault-static-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dagen
              },
            },
          },
          // Afbeeldingen → CacheFirst
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'vault-image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dagen
              },
            },
          },
        ],
      },
    }),
  ],
});
