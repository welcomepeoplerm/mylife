import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      // selfDestroying genera un sw.js che si auto-distrugge,
      // eliminando il vecchio SW Workbox dai dispositivi che lo avevano installato.
      // Usiamo firebase-messaging-sw.js come unico Service Worker.
      selfDestroying: true,
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: false // Usiamo il manifest.json in public/ (già linkato in index.html)
    })
  ],
  server: {
    port: 3000,
    open: true
  }
});
