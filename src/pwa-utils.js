// Utilities per la gestione PWA

/**
 * Registra il Service Worker per abilitare le funzionalità PWA
 */
export async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registrato con successo:', registration.scope);
      
      // Gestisce gli aggiornamenti del Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('Nuovo Service Worker in installazione...');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('Nuovo contenuto disponibile! Aggiorna la pagina.');
            // Qui puoi mostrare un messaggio all'utente per ricaricare
            showUpdateNotification();
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.log('Registrazione Service Worker fallita:', error);
      return null;
    }
  }
  return null;
}

/**
 * Mostra notifica di aggiornamento disponibile
 */
function showUpdateNotification() {
  // Implementazione semplice - può essere personalizzata
  if (confirm('Nuova versione disponibile! Vuoi ricaricare?')) {
    window.location.reload();
  }
}

/**
 * Controlla se l'app è installata (standalone mode)
 */
export function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

/**
 * Rileva se il dispositivo è iOS
 */
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

/**
 * Rileva se il dispositivo è Android
 */
function isAndroid() {
  return /Android/.test(navigator.userAgent);
}

/**
 * Mostra istruzioni per iOS
 */
function showIOSInstructions() {
  const banner = document.createElement('div');
  banner.id = 'ios-install-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #6da34d, #c5e99b);
    color: white;
    padding: 1rem;
    z-index: 1000;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.2);
    animation: slideUp 0.3s ease-out;
    max-height: 90vh;
    overflow-y: auto;
  `;
  
  banner.innerHTML = `
    <div style="max-width: 600px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
        <strong style="font-size: 1.1rem;">📱 Installa MyLyfe</strong>
        <button id="ios-dismiss-btn" style="
          background: transparent;
          color: white;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        ">✕</button>
      </div>
      <p style="margin: 0 0 1rem 0; font-size: 0.9rem; opacity: 0.95;">
        Per installare l'app, segui questi passaggi:
      </p>
      <ol style="margin: 0; padding-left: 1.2rem; font-size: 0.95rem; line-height: 1.8;">
        <li>Tocca il pulsante <strong>Condividi</strong> di Safari nella barra in basso 
          <span style="display: inline-block; background: rgba(255,255,255,0.3); border-radius: 4px; padding: 4px 8px; margin: 0 4px;">
            <svg width="14" height="18" viewBox="0 0 14 18" fill="white" style="vertical-align: middle;">
              <path d="M7 0L3 4h2.5v6h3V4H11L7 0zM0 16v2h14v-2H0z"/>
            </svg>
          </span>
        </li>
        <li>Scorri verso il basso e tocca <strong>"Aggiungi a Home"</strong> 
          <span style="display: inline-block; background: rgba(255,255,255,0.3); border-radius: 4px; padding: 2px 6px; margin: 0 4px;">+</span>
        </li>
        <li>Conferma toccando <strong>"Aggiungi"</strong></li>
      </ol>
      <p style="margin: 1rem 0 0 0; font-size: 0.85rem; opacity: 0.9;">
        💡 L'icona apparirà nella tua schermata Home
      </p>
    </div>
  `;
  
  // Aggiungi animazione CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(banner);
  
  // Gestisci chiusura banner
  document.getElementById('ios-dismiss-btn').addEventListener('click', () => {
    banner.remove();
    localStorage.setItem('ios-install-dismissed', Date.now());
  });
  
  console.log('Istruzioni installazione iOS mostrate');
}

/**
 * Gestisce l'evento beforeinstallprompt per installazione PWA
 */
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('PWA può essere installata');
  // Mostra bottone di installazione personalizzato
  showInstallButton();
});

// Mostra istruzioni iOS se applicabile
if (isIOS() && !isInstalled()) {
  // Non mostrare se già dismissato nelle ultime 24 ore
  const lastDismissed = localStorage.getItem('ios-install-dismissed');
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  
  if (!lastDismissed || parseInt(lastDismissed) < oneDayAgo) {
    // Mostra dopo un breve delay per non interferire con il caricamento
    setTimeout(showIOSInstructions, 2000);
  }
}

// Mostra banner Android immediatamente alla prima visita
if (isAndroid() && !isInstalled()) {
  const androidBannerShown = sessionStorage.getItem('android-banner-shown');
  
  if (!androidBannerShown) {
    // Mostra banner dopo un breve delay
    setTimeout(() => {
      // Se non c'è ancora il prompt nativo, mostra il banner manualmente
      if (!deferredPrompt) {
        showInstallButton();
      }
      sessionStorage.setItem('android-banner-shown', 'true');
    }, 1500);
  }
}

function showInstallButton() {
  // Evita di mostrare più banner contemporaneamente
  if (document.getElementById('install-banner')) {
    return;
  }
  
  // Crea banner di installazione
  const banner = document.createElement('div');
  banner.id = 'install-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #6da34d, #c5e99b);
    color: white;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1000;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.2);
    animation: slideUp 0.3s ease-out;
  `;
  
  banner.innerHTML = `
    <div style="flex: 1;">
      <strong>📱 Installa MyLyfe</strong>
      <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; opacity: 0.95;">Accedi velocemente dall'icona sul tuo dispositivo</p>
    </div>
    <div style="display: flex; gap: 0.5rem;">
      <button id="install-btn" style="
        background: white;
        color: #6da34d;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      ">Installa</button>
      <button id="dismiss-btn" style="
        background: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid white;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        cursor: pointer;
      ">✕</button>
    </div>
  `;
  
  // Aggiungi animazione CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(banner);
  
  // Gestisci click installazione
  document.getElementById('install-btn').addEventListener('click', async () => {
    const installed = await installPWA();
    if (installed) {
      banner.remove();
    }
  });
  
  // Gestisci chiusura banner
  document.getElementById('dismiss-btn').addEventListener('click', () => {
    banner.remove();
  });
  
  console.log('Banner installazione PWA mostrato');
}

/**
 * Trigger installazione PWA
 */
export async function installPWA() {
  if (!deferredPrompt) {
    console.log('Prompt di installazione non disponibile');
    return false;
  }
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`Installazione PWA: ${outcome}`);
  deferredPrompt = null;
  
  return outcome === 'accepted';
}

// Evento dopo l'installazione
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA installata con successo!');
  deferredPrompt = null;
});
