import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      // selfDestroying genera un sw.js che si auto-distrugge,
      // eliminando il vecchio SW Workbox dai dispositivi che lo avevano installato.
      // IMPORTANTE: injectRegister: null evita che vite-plugin-pwa inietti
      // automaticamente <script src="/registerSW.js"> in index.html, il che
      // causerebbe un loop infinito: sw.js si attiva → client.navigate() → reload → loop.
      // La registrazione dell'unico SW (firebase-messaging-sw.js) è gestita
      // manualmente da notification-service.js.
      selfDestroying: true,
      injectRegister: null,
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: false // Usiamo il manifest.json in public/ (già linkato in index.html)
    })
  ],
  server: {
    port: 3000,
    open: true
  }
});
