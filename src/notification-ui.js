// notification-ui.js - UI Components for notification permissions

import { notificationService } from './notification-service.js';
import { i18n } from './i18n.js';

// Mostra un banner per richiedere i permessi notifiche
export function showNotificationPermissionBanner() {
  console.log('🔔 showNotificationPermissionBanner() chiamata');
  
  // Verifica se i permessi sono già stati concessi o negati
  const permission = notificationService.getPermissionStatus();
  console.log('📋 Stato permessi notifiche:', permission);
  
  if (permission === 'granted' || permission === 'denied' || permission === 'not-supported') {
    console.log('⏭️ Banner non mostrato - permessi già gestiti o non supportati');
    return; // Non mostrare il banner
  }
  
  // Verifica se l'utente ha già visto e chiuso il banner
  const bannerDismissed = localStorage.getItem('notificationBannerDismissed');
  console.log('💾 Banner dismissed in localStorage:', bannerDismissed);
  
  if (bannerDismissed === 'true') {
    console.log('⏭️ Banner non mostrato - utente ha già cliccato "Non Ora"');
    return;
  }
  
  console.log('Creazione banner notifiche...');
  
  const banner = document.createElement('div');
  banner.className = 'notification-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #87a34d 0%, #B8DECA 100%);
    color: white;
    padding: 1rem;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    animation: slideUp 0.3s ease-out;
  `;
  
  banner.innerHTML = `
    <div style="flex: 1;">
      <div style="font-weight: bold; margin-bottom: 0.25rem;">🔔 Resta Aggiornato</div>
      <div style="font-size: 0.9rem; opacity: 0.9;">Attiva le notifiche per ricevere aggiornamenti su nuovi eventi</div>
    </div>
    <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
      <button id="enable-notifications-btn" style="
        background: white;
        color: #87a34d;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
        font-size: 0.9rem;
      ">Attiva</button>
      <button id="dismiss-banner-btn" style="
        background: rgba(255,255,255,0.2);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
      ">Non Ora</button>
    </div>
  `;
  
  // Aggiungi stile animation
  if (!document.getElementById('notification-banner-style')) {
    const style = document.createElement('style');
    style.id = 'notification-banner-style';
    style.textContent = `
      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      @keyframes slideDown {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(banner);
  
  // Gestisci click su Attiva
  banner.querySelector('#enable-notifications-btn').addEventListener('click', async () => {
    try {
      // Attendi che il servizio notifiche sia completamente inizializzato
      await notificationService.waitForInit();
      
      // Prova direttamente la richiesta (il browser gestisce lo stato reale)
      await notificationService.requestPermission();
      
      // Mostra notifica di test
      await notificationService.testNotification();
      
      // Rimuovi banner
      banner.style.animation = 'slideDown 0.3s ease-out';
      setTimeout(() => banner.remove(), 300);
      
      // Salva preferenza
      localStorage.setItem('notificationBannerDismissed', 'true');
      
      // Mostra messaggio di conferma
      showNotificationToast('Notifiche attivate!', 'success');
    } catch (error) {
      console.error('❌ Error enabling notifications:', error);
      console.error('📋 Error code:', error.code);
      console.error('📋 Error message:', error.message);
      console.error('📋 Error name:', error.name);
      console.error('📋 Error type:', typeof error);
      
      // Messaggio user-friendly in base al tipo di errore
      let userMessage = 'Impossibile attivare le notifiche';
      
      if (error.code === 'messaging/permission-blocked' || error.message?.includes('denied')) {
        userMessage = 'Permesso bloccato! Vai in Impostazioni → Siti → Notifiche';
      } else if (error.message?.includes('not supported')) {
        userMessage = 'Notifiche non supportate su questo browser';
      } else if (error.code === 'messaging/token-subscribe-failed') {
        userMessage = 'Errore di connessione. Riprova tra qualche secondo';
      } else if (error.code === 20 || error.code === '20') {
        // Error code 20 è spesso InvalidStateError del Service Worker
        userMessage = 'Ricarica la pagina e riprova';
      } else if (error.code && error.message) {
        // Mostra error code e messaggio per debug
        userMessage = `${error.code}: ${error.message.substring(0, 60)}`;
      } else if (error.code) {
        // Mostra error code Firebase per debug
        userMessage = `Errore ${error.code}. Ricarica e riprova`;
      } else if (error.message) {
        userMessage = error.message.substring(0, 80); // Max 80 caratteri
      }
      
      showNotificationToast(`❌ ${userMessage}`, 'error');
    }
  });
  
  // Gestisci click su Non Ora
  banner.querySelector('#dismiss-banner-btn').addEventListener('click', () => {
    banner.style.animation = 'slideDown 0.3s ease-out';
    setTimeout(() => banner.remove(), 300);
    
    // Salva preferenza (ma richiedi di nuovo dopo 7 giorni)
    localStorage.setItem('notificationBannerDismissed', 'true');
    localStorage.setItem('notificationBannerDismissedAt', Date.now().toString());
    
    // Ri-mostra dopo 7 giorni
    setTimeout(() => {
      localStorage.removeItem('notificationBannerDismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  });
}

// Mostra un toast di notifica
export function showNotificationToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'notification-toast';
  
  const bgColors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b'
  };
  
  // Durata maggiore per warning/error (più tempo per leggere)
  const duration = (type === 'warning' || type === 'error') ? 6000 : 3000;
  const animationDuration = duration / 1000;
  
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: ${bgColors[type] || bgColors.info};
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: fadeInOut ${animationDuration}s ease-in-out;
    font-weight: 500;
    max-width: 90%;
    font-size: 0.9rem;
    line-height: 1.4;
    text-align: center;
  `;
  
  toast.textContent = message;
  
  // Aggiungi animazione se non esiste
  if (!document.getElementById('toast-animation-style')) {
    const style = document.createElement('style');
    style.id = 'toast-animation-style';
    style.textContent = `
      @keyframes fadeInOut {
        0%, 100% {
          opacity: 0;
          transform: translateX(-50%) translateY(-10px);
        }
        10%, 90% {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  // Rimuovi dopo la durata specificata
  setTimeout(() => toast.remove(), duration);
}

// Verifica periodicamente se mostrare il banner (ogni volta che l'utente torna sulla home)
export function checkAndShowNotificationBanner() {
  console.log('🏠 checkAndShowNotificationBanner() chiamata dalla homepage');
  
  // Verifica se è passato tempo sufficiente dall'ultimo dismiss
  const dismissedAt = localStorage.getItem('notificationBannerDismissedAt');
  if (dismissedAt) {
    const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
    console.log(`📅 Banner dismissato ${daysSinceDismissed.toFixed(1)} giorni fa`);
    if (daysSinceDismissed > 7) {
      localStorage.removeItem('notificationBannerDismissed');
      localStorage.removeItem('notificationBannerDismissedAt');
      console.log('🔄 Reset dismissal - sono passati più di 7 giorni');
    }
  }
  
  // Mostra banner dopo 3 secondi (per non disturbare immediatamente)
  console.log('⏱️ Banner programmato tra 3 secondi...');
  setTimeout(() => {
    console.log('⏰ Timeout scaduto - mostro banner ora');
    showNotificationPermissionBanner();
  }, 3000);
}

// Aggiungi pulsante gestione notifiche nelle impostazioni
export function createNotificationSettingsButton() {
  const button = document.createElement('div');
  button.className = 'notification-settings-item';
  button.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    margin: 1rem 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: transform 0.2s;
  `;
  
  const permission = notificationService.getPermissionStatus();
  const isEnabled = permission === 'granted';
  const isSupported = permission !== 'not-supported';
  
  button.innerHTML = `
    <div>
      <div style="font-weight: bold; margin-bottom: 0.25rem;">🔔 Notifiche Push</div>
      <div style="font-size: 0.85rem; color: #64748b;">
        ${isSupported 
          ? (isEnabled ? 'Attive - Riceverai aggiornamenti su nuovi eventi' : 'Disattivate - Clicca per attivare')
          : 'Non supportate su questo browser'}
      </div>
    </div>
    ${isSupported ? `
      <div style="
        width: 50px;
        height: 26px;
        background: ${isEnabled ? '#10b981' : '#cbd5e1'};
        border-radius: 13px;
        position: relative;
        transition: background 0.3s;
      ">
        <div style="
          width: 22px;
          height: 22px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: ${isEnabled ? '26px' : '2px'};
          transition: left 0.3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        "></div>
      </div>
    ` : ''}
  `;
  
  if (isSupported && !isEnabled) {
    button.addEventListener('click', async () => {
      try {
        await notificationService.requestPermission();
        await notificationService.testNotification();
        showNotificationToast('Notifiche attivate!', 'success');
        
        // Ricarica il pulsante
        button.replaceWith(createNotificationSettingsButton());
      } catch (error) {
        console.error('Error enabling notifications:', error);
        showNotificationToast('❌ Impossibile attivare le notifiche', 'error');
      }
    });
    
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.02)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });
  }
  
  return button;
}
