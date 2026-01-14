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
  const primaryColor = config.colors?.primary || '#6da34d';
  const lightGreen = config.colors?.lightGreen || '#c5e99b';
  const accent = config.colors?.accent || '#8d9c71';
  const secondary = config.colors?.secondary || '#56445d';
  
  splash.innerHTML = `
    <div class="splash-content">
      <div class="splash-logo">
        <svg viewBox="0 0 200 200" class="logo-svg">
          <!-- Logo circolare con stilizzazione montagne e onde -->
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${lightGreen};stop-opacity:1" />
            </linearGradient>
            <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${accent};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${lightGreen};stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <!-- Cerchio esterno -->
          <circle cx="100" cy="100" r="95" fill="url(#logoGradient)" opacity="0.1"/>
          <circle cx="100" cy="100" r="85" fill="white"/>
          
          <!-- Montagne stilizzate -->
          <path d="M 30 130 L 60 80 L 90 130 Z" fill="url(#logoGradient)" opacity="0.7"/>
          <path d="M 70 130 L 100 70 L 130 130 Z" fill="url(#logoGradient)"/>
          <path d="M 110 130 L 140 90 L 170 130 Z" fill="url(#logoGradient)" opacity="0.7"/>
          
          <!-- Sole -->
          <circle cx="150" cy="60" r="18" fill="url(#sunGradient)"/>
          
          <!-- Onde/colline verdi -->
          <path d="M 20 140 Q 50 135 80 140 T 140 140 T 180 140 L 180 160 L 20 160 Z" 
                fill="${lightGreen}" opacity="0.6"/>
          <path d="M 20 150 Q 60 145 100 150 T 180 150 L 180 170 L 20 170 Z" 
                fill="${primaryColor}" opacity="0.4"/>
          
          <!-- Testo circolare (opzionale) -->
          <path id="circlePath" d="M 100,30 A 70,70 0 1,1 99.9,30" fill="none"/>
          <text font-size="14" fill="${secondary}" font-weight="600">
            <textPath href="#circlePath" startOffset="15%">
              ${appName.toUpperCase()}
            </textPath>
          </text>
        </svg>
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
