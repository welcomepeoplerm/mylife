// Splash Screen Component
import { i18n } from './i18n.js';
import { uiConfigService } from './ui-config-service.js';

export function createSplashScreen() {
  const splash = document.createElement('div');
  splash.id = 'splash-screen';
  splash.className = 'splash-screen';
  
  // Ottieni configurazione UI
  const config = uiConfigService.getConfig();
  const currentLang = i18n.getCurrentLanguage();
  
  // Ottieni nome app e tagline dalla configurazione
  const appName = config.branding?.appName?.[currentLang] || i18n.t('appName');
  const appTagline = config.branding?.appTagline?.[currentLang] || i18n.t('appTagline');
  
  // Ottieni colori dalla configurazione
  const primaryColor = config.colors?.primary || '#87a34d';
  const lightGreen = config.colors?.lightGreen || '#B8DECA';
  const accent = config.colors?.accent || '#88C39C';
  const secondary = config.colors?.secondary || '#1B6B3A';
  
  // Verifica se c'è un logo personalizzato
  const logoUrl = config.branding?.logoUrl;
  const logoType = config.branding?.logoType;
  
  // Genera HTML del logo
  const logoHTML = (logoType === 'image' && logoUrl) ? `
    <img src="${logoUrl}" alt="Logo" style="width: 200px; height: 200px; object-fit: contain; border-radius: 20px;">
  ` : `
    <img src="/logo.svg" alt="Logo" style="width: 200px; height: 200px; object-fit: contain;">
  `;
  
  splash.innerHTML = `
    <div class="splash-content">
      <div class="splash-logo">
        ${logoHTML}
      </div>
      
      <h1 class="splash-title">${appName}</h1>
      <p class="splash-tagline">${appTagline}</p>
      
      <div class="splash-loader">
        <div class="splash-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
    
    <!-- Elementi decorativi di sfondo -->
    <div class="splash-bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
  `;
  
  return splash;
}

export function showSplashScreen(duration = 5000) {
  return new Promise((resolve) => {
    const splash = createSplashScreen();
    document.body.appendChild(splash);
    
    // Aggiungi classe per animazione di entrata
    setTimeout(() => {
      splash.classList.add('active');
    }, 100);
    
    // Rimuovi dopo il tempo specificato
    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.remove();
        resolve();
      }, 500);
    }, duration);
  });
}

// Funzione per mostrare splash solo al primo caricamento
export async function showInitialSplash() {
  const hasSeenSplash = sessionStorage.getItem('splashShown');
  
  if (!hasSeenSplash) {
    sessionStorage.setItem('splashShown', 'true');
    await showSplashScreen(5000);
  }
}
