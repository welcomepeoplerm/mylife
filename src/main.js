// Main application entry point - My Lyfe Umbria
import './firebase-config.js';
import { i18n } from './i18n.js';
import { router } from './router.js';
import { createHeader } from './components.js';
import { showInitialSplash } from './splash.js';
import { uiConfigService } from './ui-config-service.js';
import { notificationService } from './notification-service.js';
import { checkAndShowNotificationBanner } from './notification-ui.js';
import './pwa-utils.js'; // Registra beforeinstallprompt per prompt installazione PWA
import { 
  renderHomePage, 
  renderMyHomePage, 
  renderMyJourneyPage, 
  renderMyTastePage, 
  renderMyEventsPage,
  renderMyAssistantPage,
  renderHomeDetailPage,
  renderJourneyDetailPage,
  renderTasteDetailPage,
  renderEventsDetailPage
} from './pages.js';

// Inizializza l'applicazione
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 My Lyfe Umbria - Applicazione avviata');
  
  // Carica configurazione UI PRIMA della splash screen
  console.log('🎨 Caricamento configurazione UI...');
  const uiConfig = await uiConfigService.initialize();
  console.log('✅ Configurazione UI caricata');
  
  // Mostra splash screen con configurazione applicata
  await showInitialSplash();
  
  const app = document.getElementById('app');
  
  // Crea struttura app
  app.innerHTML = '';
  
  // Aggiungi header
  app.appendChild(createHeader());
  
  // Container per il contenuto delle pagine
  const mainContent = document.createElement('main');
  mainContent.id = 'main-content';
  mainContent.className = 'main-content';
  app.appendChild(mainContent);
  
  // Footer con configurazione dinamica
  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  const currentLang = i18n.getCurrentLanguage();
  const madeWith = uiConfig.footer.madeWith[currentLang] || '';
  const forText = uiConfig.footer.for[currentLang] || '';
  footer.innerHTML = `
    <p>${madeWith} ${madeWith ? '❤️' : ''} ${forText} ${forText ? '🌄' : ''}</p>
    <p>&copy; ${uiConfig.footer.year} ${uiConfig.footer.copyright}</p>
  `;
  app.appendChild(footer);
  
  // Import moduli admin
  const { renderLoginPage, requireAuth } = await import('./admin-login.js');
  const { renderAdminDashboard } = await import('./admin-panel.js');
  
  // Registra le routes pubbliche
  router.register('/', async () => {
    const page = await renderHomePage();
    mainContent.innerHTML = '';
    mainContent.appendChild(page);
    
    // Mostra banner notifiche solo sulla homepage
    checkAndShowNotificationBanner();
  });
  
  router.register('/home', async () => {
    const page = await renderMyHomePage();
    mainContent.innerHTML = '';
    mainContent.appendChild(page);
  });
  
  router.register('/journey', async () => {
    const page = await renderMyJourneyPage();
    mainContent.innerHTML = '';
    mainContent.appendChild(page);
  });
  
  router.register('/taste', async () => {
    const page = await renderMyTastePage();
    mainContent.innerHTML = '';
    mainContent.appendChild(page);
  });
  
  router.register('/events', async () => {
    const page = await renderMyEventsPage();
    mainContent.innerHTML = '';
    mainContent.appendChild(page);
  });
  
  router.register('/assistant', async () => {
    const page = await renderMyAssistantPage();
    mainContent.innerHTML = '';
    mainContent.appendChild(page);
  });
  
  // Registra le routes per i dettagli
  router.register('/home/detail/:id', async (params) => {
    const page = await renderHomeDetailPage(params);
    mainContent.innerHTML = '';
    mainContent.appendChild(page);
  });
  
  router.register('/journey/detail/:id', async (params) => {
    const page = await renderJourneyDetailPage(params);
    mainContent.innerHTML = '';
    mainContent.appendChild(page);
  });
  
  router.register('/taste/detail/:id', async (params) => {
    const page = await renderTasteDetailPage(params);
    mainContent.innerHTML = '';
    mainContent.appendChild(page);
  });
  
  router.register('/events/detail/:id', async (params) => {
    const page = await renderEventsDetailPage(params);
    mainContent.innerHTML = '';
    mainContent.appendChild(page);
  });
  
  // Route admin - Login
  router.register('/admin/login', async () => {
    app.style.display = 'flex';
    app.style.alignItems = 'center';
    app.style.justifyContent = 'center';
    app.style.minHeight = '100vh';
    app.innerHTML = '';
    const page = await renderLoginPage();
    app.appendChild(page);
  });
  
  // Route admin - Dashboard (protetta)
  router.register('/admin', async () => {
    const isAuth = await requireAuth();
    if (!isAuth) return;
    
    app.style = '';
    app.innerHTML = '';
    const page = await renderAdminDashboard();
    app.appendChild(page);
  });
  
  // Avvia dalla route corrente o homepage
  const initialRoute = window.location.hash.slice(1) || '/';
  router.navigate(initialRoute);
  
  // Verifica Firebase
  try {
    const { default: app } = await import('./firebase-config.js');
    if (app) {
      console.log('✅ Firebase connesso');
    }
  } catch (error) {
    console.error('❌ Errore Firebase:', error);
  }
  
  // Service Worker gestito da notification-service.js (firebase-messaging-sw.js)
  // Non registriamo sw.js separatamente per evitare conflitti
  // const swRegistration = await registerSW();
  // if (swRegistration) {
  //   console.log('✅ Service Worker registrato - PWA attiva');
  // }
  
  // Inizializza servizio notifiche (opzionale, non blocca l'app se fallisce)
  try {
    // Attendi che l'inizializzazione del servizio notifiche sia completata
    // (il costruttore ha già avviato _init() che fa checkSupport + auto-registrazione token)
    await notificationService.waitForInit();
    
    console.log('✅ Notifiche push inizializzate');
  } catch (error) {
    console.warn('⚠️ Notifiche push non disponibili:', error.message);
    // L'app continua a funzionare normalmente senza notifiche
  }
  
  // Ascolta messaggi dal Service Worker (es: navigazione da notifica)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('📨 Messaggio dal Service Worker:', event.data);
      
      if (event.data.type === 'NAVIGATE_TO' && event.data.url) {
        console.log('🔀 Navigazione richiesta a:', event.data.url);
        
        // Rimuovi il prefisso origin se presente
        let url = event.data.url.replace(window.location.origin, '');
        
        // Rimuovi il prefisso /# se presente (per hash routing)
        if (url.startsWith('/#')) {
          url = url.substring(2);
        } else if (url.startsWith('#')) {
          url = url.substring(1);
        } else if (!url.startsWith('/')) {
          url = '/' + url;
        }
        
        console.log('🔀 Navigazione a:', url);
        router.navigate(url);
      }
    });
  }
});

// Gestione errori globali
window.addEventListener('error', (e) => {
  console.error('Errore globale:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Promise rejection non gestita:', e.reason);
});
