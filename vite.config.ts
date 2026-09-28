import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(({ command }) => {
  return {
    plugins: [
      {
        name: 'guard-ws-send',
        configureServer(server) {
          if (!server.ws) {
            server.ws = {
              send: () => {},
              on: () => {},
              off: () => {},
              close: () => {},
              clients: new Set(),
            } as any;
          }
        },
      },
      react(),
      tailwindcss(),
      ...(command === 'build'
        ? [
            VitePWA({
              registerType: 'autoUpdate',
              includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'erp-app-icon.jpg'],
              manifest: {
                id: '/',
                name: 'Enterprise ERP & Inventory',
                short_name: 'ERP Inventory',
                description: 'Enterprise ERP and inventory management web app with Supabase and ETB accounting.',
                theme_color: '#0f172a',
                background_color: '#f8fafc',
                display: 'standalone',
                start_url: '/',
                scope: '/',
                icons: [
                  {
                    src: '/erp-app-icon.jpg',
                    sizes: '512x512',
                    type: 'image/jpeg',
                    purpose: 'any',
                  },
                  {
                    src: '/pwa-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any',
                  },
                  {
                    src: '/pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any',
                  },
                  {
                    src: '/pwa-maskable-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'maskable',
                  },
                ],
              },
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
