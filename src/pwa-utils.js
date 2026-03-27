// Utilities per la gestione PWA

/**
 * Registra il Service Worker per abilitare le funzionalità PWA
 * Usa firebase-messaging-sw.js che gestisce sia push che caching
 */
export async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      // Usa il SW già registrato da notification-service.js (firebase-messaging-sw.js)
      // Se non è ancora registrato, registralo qui
      const existingRegistrations = await navigator.serviceWorker.getRegistrations();
      const fcmSW = existingRegistrations.find(reg => 
        reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
      );
      
      if (fcmSW) {
        console.log('Service Worker PWA già registrato (firebase-messaging-sw.js):', fcmSW.scope);
        return fcmSW;
      }
      
      // Fallback: registra firebase-messaging-sw.js
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker PWA registrato:', registration.scope);
      
      // Gestisce gli aggiornamenti del Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('Nuovo Service Worker in installazione...');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('Nuovo contenuto disponibile! Aggiorna la pagina.');
            // NON mostrare notifica automaticamente per evitare reload continui
            // showUpdateNotification();
            console.log('Per aggiornare, chiudi tutte le schede e riaprile');
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
    background: linear-gradient(135deg, #87a34d, #B8DECA);
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
        <strong style="font-size: 1.1rem;">Installa MyLyfe</strong>
        <button id="ios-dismiss-btn" style="
          background: transparent;
          color: white;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        ">&times;</button>
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
let deferredPrompt = window.__deferredPrompt || null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  window.__deferredPrompt = e;
  console.log('PWA installabile: beforeinstallprompt catturato');
  // Mostra dialog solo quando il prompt nativo è disponibile
  if (isInstalled()) return;
  const lastDismissed = localStorage.getItem('install-dialog-dismissed');
  const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
  if (lastDismissed && parseInt(lastDismissed) > threeDaysAgo) return;
  const doShow = () => setTimeout(showInstallDialog, 1200);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doShow);
  } else {
    doShow();
  }
});

// Se l'evento è già stato catturato prima del modulo, mostra il dialog
if (deferredPrompt && !isInstalled()) {
  const lastDismissed = localStorage.getItem('install-dialog-dismissed');
  const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
  if (!lastDismissed || parseInt(lastDismissed) < threeDaysAgo) {
    const doShow = () => setTimeout(showInstallDialog, 1200);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', doShow);
    } else {
      doShow();
    }
  }
}

// Mostra istruzioni iOS se applicabile
if (isIOS() && !isInstalled()) {
  const lastDismissed = localStorage.getItem('ios-install-dismissed');
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  if (!lastDismissed || parseInt(lastDismissed) < oneDayAgo) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(showIOSInstructions, 2000));
    } else {
      setTimeout(showIOSInstructions, 2000);
    }
  }
}

function showInstallDialog() {
  if (document.getElementById('install-dialog') || isInstalled()) return;

  const overlay = document.createElement('div');
  overlay.id = 'install-dialog';
  overlay.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.55);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  `;

  overlay.innerHTML = `
    <div style="
      background: white;
      border-radius: 20px;
      padding: 2rem 1.5rem;
      max-width: 340px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    ">
      <img src="/piccolopng.png" alt="Logo" style="width:80px;height:80px;object-fit:contain;margin-bottom:1rem;" onerror="this.style.display='none'">
      <h2 style="margin:0 0 0.5rem;font-size:1.2rem;color:#222;">Installa MyLyfe</h2>
      <p style="margin:0 0 1.5rem;font-size:0.9rem;color:#555;line-height:1.5;">
        Aggiungi l'app alla schermata Home per un accesso rapido, anche senza connessione.
      </p>
      <button id="pwa-install-ok" style="
        width: 100%;
        background: #87a34d;
        color: white;
        border: none;
        padding: 0.9rem;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        margin-bottom: 0.75rem;
      ">Installa ora</button>
      <button id="pwa-install-dismiss" style="
        width: 100%;
        background: none;
        color: #888;
        border: none;
        padding: 0.6rem;
        font-size: 0.9rem;
        cursor: pointer;
      ">Non ora</button>
    </div>
  `;

  if (!document.getElementById('pwa-slide-style')) {
    const s = document.createElement('style');
    s.id = 'pwa-slide-style';
    s.textContent = '@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}';
    document.head.appendChild(s);
  }

  document.body.appendChild(overlay);

  document.getElementById('pwa-install-ok').addEventListener('click', async () => {
    overlay.remove();
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Installazione PWA:', outcome);
        if (outcome === 'accepted') localStorage.removeItem('install-dialog-dismissed');
        deferredPrompt = null;
      } catch (err) {
        console.log('Errore prompt, mostro istruzioni manuali:', err);
        deferredPrompt = null;
        showAndroidManualInstructions();
      }
    } else {
      showAndroidManualInstructions();
    }
  });

  document.getElementById('pwa-install-dismiss').addEventListener('click', () => {
    overlay.remove();
    localStorage.setItem('install-dialog-dismissed', Date.now());
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      localStorage.setItem('install-dialog-dismissed', Date.now());
    }
  });
}

function showInstallBanner() {
  showInstallDialog();
}

function showAndroidManualInstructions() {
  if (document.getElementById('install-manual-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'install-manual-modal';
  modal.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 10000;
    display: flex; align-items: flex-end;
  `;
  modal.innerHTML = `
    <div style="background:white;width:100%;border-radius:20px 20px 0 0;padding:1.5rem;max-height:80vh;overflow-y:auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
        <strong style="font-size:1.1rem;color:#333;">Installa MyLyfe su Android</strong>
        <button id="modal-close-btn" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:#666;">&times;</button>
      </div>
      <p style="color:#555;font-size:0.95rem;margin-bottom:1rem;">Segui questi passi in Chrome:</p>
      <ol style="color:#333;font-size:0.95rem;line-height:2;padding-left:1.2rem;">
        <li>Tocca i <strong>tre punti</strong> in alto a destra <span style="background:#eee;border-radius:4px;padding:2px 8px;font-size:0.85rem;">&#8942;</span></li>
        <li>Tocca <strong>"Aggiungi a schermata Home"</strong></li>
        <li>Conferma con <strong>"Aggiungi"</strong></li>
      </ol>
      <p style="color:#888;font-size:0.8rem;margin-top:1rem;">In alternativa: Menu &#8942; &rarr; <strong>Installa app</strong></p>
      <button id="modal-ok-btn" style="width:100%;margin-top:1rem;background:#87a34d;color:white;border:none;padding:0.9rem;border-radius:10px;font-weight:700;font-size:1rem;cursor:pointer;">Capito</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('modal-close-btn').addEventListener('click', () => modal.remove());
  document.getElementById('modal-ok-btn').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

/**
 * Trigger installazione PWA
 */
export async function installPWA() {
  if (!deferredPrompt) {
    if (isIOS()) {
      showIOSInstructions();
    } else {
      showAndroidManualInstructions();
    }
    return false;
  }

  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Installazione PWA: ${outcome}`);
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (err) {
    console.log('Errore prompt installazione:', err);
    deferredPrompt = null;
    showAndroidManualInstructions();
    return false;
  }
}

// Evento dopo l'installazione
window.addEventListener('appinstalled', () => {
  console.log('PWA installata con successo!');
  deferredPrompt = null;
  const installHeaderBtn = document.getElementById('install-header-btn');
  if (installHeaderBtn) installHeaderBtn.style.display = 'none';
  document.getElementById('install-dialog')?.remove();
});

/**
 * Mostra UI di installazione su richiesta (pulsante header)
 */
export function showInstallUI() {
  if (isIOS()) {
    showIOSInstructions();
  } else if (deferredPrompt) {
    // Prompt nativo disponibile: mostra dialogo custom → poi prompt Chrome nativo
    showInstallDialog();
  } else {
    // Nessun prompt nativo: va direttamente alle istruzioni manuali
    showAndroidManualInstructions();
  }
}

export function canShowInstall() {
  return !isInstalled() && (!!deferredPrompt || isIOS());
}
