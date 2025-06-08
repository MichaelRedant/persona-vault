import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const basePath = '/vault/';
// const basePath = '/'; // gebruik deze als je in root publiceert

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    VitePWA({
      injectRegister: 'inline', // ✅ voeg inline inject toe
      registerType: 'autoUpdate', // Altijd auto-updaten → beste UX
      manifest: {
        name: 'Persona Vault',
        short_name: 'Vault',
        start_url: '/vault/', // moet matchen
        scope: '/vault/', // ✅ scope toevoegen
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
        // Optioneel → stel in WAT je cached:
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: 'CacheFirst',
            options: {
              cacheName: 'vault-content-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dagen
              },
            },
          },
        ],
      },
    }),
  ],
});
