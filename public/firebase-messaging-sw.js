// firebase-messaging-sw.js - Service Worker per Firebase Cloud Messaging
// Posizionare questo file nella root pubblica dell'app

importScripts('https://www.gstatic.com/firebasejs/10.7.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.2/firebase-messaging-compat.js');

// Costanti per caching
const CACHE_NAME = 'mylyfe-v1';
const OFFLINE_URLS = ['/', '/index.html'];

// Configurazione Firebase (usa gli stessi valori di firebase-config.js)
const firebaseConfig = {
  apiKey: "AIzaSyBzZ-lJU61VLOjmTAWMd4xEf6DA3CE08sU",
  authDomain: "mylyfeumbria.firebaseapp.com",
  projectId: "mylyfeumbria",
  storageBucket: "mylyfeumbria.firebasestorage.app",
  messagingSenderId: "626642477198",
  appId: "1:626642477198:web:9b8bb3128ab3741ed129df"
};

// Attiva il nuovo SW solo quando richiesto (evita reload automatici)
self.addEventListener('install', (event) => {
  console.log('Firebase Messaging SW: installing...');
  // NON chiamare skipWaiting() automaticamente per evitare reload infiniti
  // Il SW aspetterà che tutte le schede siano chiuse
  event.waitUntil(Promise.resolve());
});

// Prendi il controllo di tutti i client immediatamente
self.addEventListener('activate', (event) => {
  console.log('Firebase Messaging SW: activating...');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Pulisci vecchie cache
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
    ])
  );
});

// Gestisci messaggio SKIP_WAITING dal client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // Solo ora possiamo fare skipWaiting se richiesto esplicitamente
    self.skipWaiting();
  }
});

// Inizializza Firebase nel service worker
firebase.initializeApp(firebaseConfig);

// Inizializza Firebase Messaging
const messaging = firebase.messaging();

// Gestione notifiche in background
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'MyLyfe Umbria';
  const notificationOptions = {
    body: payload.notification?.body || 'Nuovo aggiornamento disponibile',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    tag: payload.data?.eventId || 'mylyfe-event',
    data: payload.data || {},
    actions: [
      {
        action: 'view',
        title: 'Visualizza'
      },
      {
        action: 'close',
        title: 'Chiudi'
      }
    ],
    requireInteraction: false
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ─── Tracking click notifiche via Firestore REST (no SDK nel SW) ─────────────
function trackNotificationClick(notification, action) {
  const projectId = 'mylyfeumbria';
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/app_stats`;
  const now = new Date().toISOString();
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        eventType:         { stringValue: 'notification_click' },
        source:            { stringValue: 'app' },
        notificationTag:   { stringValue: notification.tag   || '' },
        notificationTitle: { stringValue: notification.title || '' },
        notificationBody:  { stringValue: notification.body  || '' },
        notificationAction:{ stringValue: action             || 'default' },
        notificationData:  { stringValue: JSON.stringify(notification.data || {}) },
        timestamp:         { timestampValue: now }
      }
    })
  }).catch(err => console.warn('[AppStats] Errore tracking click notifica:', err));
}

// Gestione click su notifica
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  console.log('Action:', event.action);
  console.log('Data:', event.notification.data);
  
  event.notification.close();

  // Determina l'URL da aprire
  let urlToOpen = '/events'; // Default: pagina eventi
  
  // Se c'è un eventId nei data, apri i dettagli dell'evento
  if (event.notification.data?.eventId) {
    urlToOpen = `/#/events/detail/${event.notification.data.eventId}`;
  } else if (event.notification.data?.url) {
    urlToOpen = event.notification.data.url;
  }
  
  console.log('Opening URL:', urlToOpen);
  
  // Gestisci sia il click sulla notifica che sui pulsanti azione
  if (event.action === 'close') {
    // Utente ha cliccato "Chiudi" - non fare nulla
    return;
  }
  
  // Per click sulla notifica o pulsante "Visualizza" — registra il click
  event.waitUntil(
    trackNotificationClick(event.notification, event.action)
  );

  // Apri / focalizza la finestra
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Se c'è già una finestra aperta, usa quella
        for (let client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            console.log('Found existing window, focusing and navigating');
            return client.focus().then(() => {
              client.postMessage({
                type: 'NAVIGATE_TO',
                url: urlToOpen
              });
            });
          }
        }
        
        // Altrimenti apri una nuova finestra
        console.log('Opening new window');
        if (clients.openWindow) {
          return clients.openWindow(self.location.origin + urlToOpen);
        }
      })
  );
});

// Gestione chiusura notifica
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});

// ===== PWA: Fetch handler per installabilità e caching base =====

// Fetch handler: network-first con fallback offline
self.addEventListener('fetch', (event) => {
  // Ignora richieste non-GET
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Ignora richieste a domini esterni (Firebase, Google APIs, ecc.)
  if (url.origin !== self.location.origin) return;

  // Non cachare documenti HTML/navigazione per evitare stale app shell e loop post-deploy
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cacha solo asset statici
  const isStaticAsset = ['script', 'style', 'image', 'font', 'manifest'].includes(event.request.destination);
  if (!isStaticAsset) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // NON cachare richieste con parametri di autenticazione o admin
  if (url.pathname.includes('/admin') || 
      url.search.includes('auth') || 
      url.pathname.includes('__/auth/')) {
    // Sempre network-only per le route admin/auth
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Per gli asset statici: network-first con fallback offline
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache la risposta per uso offline SOLO se OK
        if (response.ok && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          }).catch(err => {
            console.log('Cache write error:', err);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback a cache se offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('Serving from cache:', event.request.url);
            return cachedResponse;
          }
          // Per navigazione, ritorna la pagina principale
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

console.log('Firebase Messaging Service Worker loaded (with PWA support)');
