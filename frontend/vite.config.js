import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['app-icon.svg', 'apple-touch-icon.png', 'icons/icon-192.webp', 'icons/icon-512.webp'],
    manifest: {
      name: 'BPHC I-ITSM HelpDesk',
      short_name: 'I-ITSM',
      description: 'Campus IT incident reporting and tracking',
      theme_color: '#0f172a',
      background_color: '#0f172a',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        { src: '/app-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        { src: '/icons/icon-192.webp', sizes: '192x192', type: 'image/webp', purpose: 'any maskable' },
        { src: '/icons/icon-512.webp', sizes: '512x512', type: 'image/webp', purpose: 'any maskable' },
        { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
      ],
    },
    workbox: {
      navigateFallbackDenylist: [/^\/api(?:\/|$)/, /^\/ws-iitsm(?:\/|$)/],
      globPatterns: ['**/*.{js,css,html,svg,png,webp,ico,woff2}'],
    },
  })],
  define: {
    global: 'window', // Fix for SockJS/STOMP in browser
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws-iitsm': {
        target: 'http://localhost:8080',
        ws: true,
      },
    },
  },
});
