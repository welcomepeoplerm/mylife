// Main application entry point - My Lyfe Umbria
import './firebase-config.js';
import { registerSW } from './pwa-utils.js';
import { i18n } from './i18n.js';
import { router } from './router.js';
import { createHeader } from './components.js';
import { showInitialSplash } from './splash.js';
import { uiConfigService } from './ui-config-service.js';
import { 
  renderHomePage, 
  renderMyHomePage, 
  renderMyJourneyPage, 
  renderMyTastePage, 
  renderMyAssistantPage,
  renderHomeDetailPage,
  renderJourneyDetailPage,
  renderTasteDetailPage
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
  
  // Registra Service Worker per PWA
  const swRegistration = await registerSW();
  if (swRegistration) {
    console.log('✅ Service Worker registrato - PWA attiva');
  }
});

// Gestione errori globali
window.addEventListener('error', (e) => {
  console.error('Errore globale:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Promise rejection non gestita:', e.reason);
});
