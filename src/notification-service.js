// Notification service for MyLyfe Umbria - Firebase Cloud Messaging

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import app from './firebase-config.js';
import { db } from './firebase-config.js';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { VAPID_PUBLIC_KEY, isVapidConfigured, logVapidStatus } from './fcm-config.js';

class NotificationService {
  constructor() {
    this.messaging = null;
    this.currentToken = null;
    this.isSupported = false;
    this.swRegistration = null;
    // Avvia init e salva la promise per poterla attendere
    this._initPromise = this._init();
  }

  // Inizializzazione completa: checkSupport + auto-registrazione token
  async _init() {
    try {
      const supported = await this.checkSupport();
      if (supported && this.getPermissionStatus() === 'granted') {
        // Permesso già concesso da sessione precedente - registra token automaticamente
        console.log('🔔 Permessi notifiche già concessi, registro token automaticamente...');
        try {
          await this.getAndSaveToken();
          console.log('✅ Token FCM auto-registrato con successo');
        } catch (error) {
          console.error('❌ Errore auto-registrazione token FCM:', error);
        }
      }
    } catch (error) {
      console.error('❌ Errore inizializzazione NotificationService:', error);
    }
  }

  // Attendi che l'inizializzazione sia completata
  async waitForInit() {
    return this._initPromise;
  }

  // Registra il Service Worker FCM
  async registerFCMServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker non supportato');
    }

    try {
      // Prova a rimuovere SW Workbox in conflitto (non blocca se fallisce)
      try {
        const existingRegistrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of existingRegistrations) {
          if (reg.active && !reg.active.scriptURL.includes('firebase-messaging-sw.js')) {
            console.log('🗑️ Rimozione SW in conflitto:', reg.active.scriptURL);
            await reg.unregister();
          }
        }
      } catch (cleanupError) {
        console.warn('⚠️ Cleanup vecchi SW fallito (non bloccante):', cleanupError.message);
      }

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      
      // Attendi che il SW sia attivo con timeout di sicurezza
      if (registration.installing) {
        console.log('⏳ Firebase Messaging SW in fase di installazione...');
        await new Promise((resolve) => {
          const sw = registration.installing;
          const timeout = setTimeout(() => {
            console.warn('⚠️ Timeout attesa attivazione SW, procedo comunque');
            resolve();
          }, 10000); // 10s timeout
          
          sw.addEventListener('statechange', (e) => {
            if (e.target.state === 'activated' || e.target.state === 'redundant') {
              clearTimeout(timeout);
              console.log('✅ Firebase Messaging SW stato:', e.target.state);
              resolve();
            }
          });
        });
      } else if (registration.waiting) {
        console.log('⏳ Firebase Messaging SW in attesa di attivazione...');
        try {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        } catch (e) {
          console.warn('⚠️ Skip waiting fallito:', e.message);
        }
      }
      
      // Attendi sempre che il SW sia ready
      await navigator.serviceWorker.ready;
      
      this.swRegistration = registration;
      console.log('✅ Firebase Messaging Service Worker registrato e attivo');
      return registration;
    } catch (error) {
      console.error('❌ Errore registrazione FCM Service Worker:', error);
      throw error;
    }
  }

  // Verifica se le notifiche push sono supportate
  async checkSupport() {
    this.isSupported = 'Notification' in window && 
                       'serviceWorker' in navigator && 
                       'PushManager' in window;
    
    if (this.isSupported) {
      try {
        // Registra il Service Worker FCM prima di inizializzare messaging
        await this.registerFCMServiceWorker();
        
        this.messaging = getMessaging(app);
        console.log('✅ Firebase Messaging inizializzato');
      } catch (error) {
        console.warn('⚠️ Firebase Messaging non disponibile:', error.message);
        this.isSupported = false;
      }
    } else {
      console.warn('⚠️ Push notifications non supportate in questo browser');
    }
    
    return this.isSupported;
  }

  // Richiedi permessi notifiche
  async requestPermission() {
    // Attendi che l'inizializzazione sia completata
    await this._initPromise;

    // Se l'init automatico è fallito, riprova ora (l'utente ha cliccato Attiva)
    if (!this.isSupported) {
      console.log('🔄 Ritento inizializzazione push notifications...');
      try {
        await this.checkSupport();
      } catch (e) {
        console.warn('⚠️ Retry checkSupport fallito:', e.message);
      }
    }

    // Se ancora non supportato, verifica manuale e prova comunque
    if (!this.isSupported) {
      const checks = {
        notification: 'Notification' in window,
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window
      };
      console.log('📋 Push check details:', checks);
      
      // Se i check base passano, prova comunque (potrebbe essere un problema di cache)
      if (!checks.notification || !checks.serviceWorker || !checks.pushManager) {
        throw new Error(`Push non supportate: Notification=${checks.notification}, SW=${checks.serviceWorker}, Push=${checks.pushManager}`);
      }
      
      console.log('⚠️ isSupported=false ma i check base passano, forzo il tentativo...');
    }

    // Prova la richiesta permesso (anche se isSupported=false ma i check base passano)
    const permission = await Notification.requestPermission();
    
    console.log('📋 Notification.requestPermission() ritornato:', permission);
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted, ottengo token FCM...');
      try {
        const token = await this.getAndSaveToken();
        console.log('✅ Token FCM ottenuto con successo');
        return token;
      } catch (tokenError) {
        console.error('❌ Errore in getAndSaveToken:', tokenError);
        console.error('📋 Token error code:', tokenError.code);
        console.error('📋 Token error message:', tokenError.message);
        throw tokenError;
      }
    } else if (permission === 'denied') {
      console.warn('❌ Notification permission denied');
      throw new Error('Notification permission denied');
    } else {
      console.warn('❌ Notification permission dismissed');
      throw new Error('Notification permission dismissed');
    }
  }

  // Ottieni e salva il token FCM
  async getAndSaveToken() {
    if (!this.messaging) {
      console.warn('⚠️ Messaging non inizializzato, riprovo...');
      // Riprova l'inizializzazione
      await this.checkSupport();
      if (!this.messaging) {
        throw new Error('Messaging not initialized');
      }
    }

    try {
      // Assicurati che il Service Worker sia attivo prima di ottenere il token
      if (!this.swRegistration) {
        console.log('⏳ Attendo registrazione Service Worker...');
        await this.registerFCMServiceWorker();
      }
      
      // Attendi che il SW sia completamente pronto
      const readyRegistration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker pronto, scope:', readyRegistration.scope);
      
      // Verifica che il SW attivo sia quello di Firebase Messaging
      if (readyRegistration.active) {
        console.log('📋 SW attivo:', readyRegistration.active.scriptURL);
      }
      
      // Verifica se la VAPID key è configurata
      if (!isVapidConfigured()) {
        console.warn('⚠️ VAPID key non configurata. Le notifiche push sono disabilitate.');
        console.warn('📖 Configura la VAPID key in src/fcm-config.js');
        console.warn('🔗 Istruzioni: https://console.firebase.google.com/project/mylyfeumbria/settings/cloudmessaging');
        return null;
      }
      
      logVapidStatus();
      
      console.log('🔑 Richiesta token FCM con VAPID key...');
      
      // Ottieni il token usando la registrazione del SW
      let token;
      try {
        token = await getToken(this.messaging, { 
          vapidKey: VAPID_PUBLIC_KEY,
          serviceWorkerRegistration: this.swRegistration 
        });
      } catch (tokenError) {
        // Se fallisce con error code 20 (InvalidStateError), riprova dopo un breve delay
        if (tokenError.code === 20 || tokenError.name === 'InvalidStateError') {
          console.warn('⚠️ InvalidStateError, attendo 2s e riprovo...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Riprova con una nuova registrazione SW
          await this.registerFCMServiceWorker();
          const freshRegistration = await navigator.serviceWorker.ready;
          
          token = await getToken(this.messaging, { 
            vapidKey: VAPID_PUBLIC_KEY,
            serviceWorkerRegistration: freshRegistration 
          });
        } else {
          throw tokenError;
        }
      }
      
      if (token) {
        console.log('✅ FCM Token ottenuto:', token.substring(0, 30) + '...');
        this.currentToken = token;
        
        // Salva il token in Firestore per invii futuri
        await this.saveTokenToDatabase(token);
        
        // Setup listener messaggi foreground
        this.setupForegroundListener();
        
        return token;
      } else {
        console.warn('⚠️ No registration token available');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      console.error('📋 Error code:', error.code);
      console.error('📋 Error message:', error.message);
      throw error;
    }
  }

  // Salva il token nel database
  async saveTokenToDatabase(token) {
    console.log('💾 Salvataggio token in Firestore...');
    try {
      const deviceId = this.getDeviceId();
      console.log('📋 Device ID:', deviceId);
      
      const tokenDoc = doc(db, 'fcmTokens', deviceId);
      
      await setDoc(tokenDoc, {
        token: token,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        deviceId: deviceId,
        userAgent: navigator.userAgent,
        active: true
      }, { merge: true });
      
      console.log('✅ Token salvato in Firestore');
    } catch (error) {
      console.error('❌ Errore salvataggio token:', error);
      console.error('📋 Error code:', error.code);
      console.error('📋 Error message:', error.message);
      // Non rilancia l'errore, il salvataggio non deve bloccare l'attivazione
    }
  }

  // Genera un ID univoco per il device
  getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
    
    return deviceId;
  }

  // Gestisci messaggi in foreground
  setupForegroundListener(callback) {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Mostra notifica personalizzata
      if (payload.notification) {
        this.showNotification(
          payload.notification.title,
          payload.notification.body,
          payload.data
        );
      }
      
      if (callback) {
        callback(payload);
      }
    });
  }

  // Mostra notifica locale
  async showNotification(title, body, data = {}) {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      
      registration.showNotification(title, {
        body: body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        vibrate: [200, 100, 200],
        tag: data.eventId || 'mylyfe-notification',
        data: data,
        actions: [
          {
            action: 'view',
            title: 'Visualizza'
          },
          {
            action: 'close',
            title: 'Chiudi'
          }
        ]
      });
    }
  }

  // Verifica stato permessi
  getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'not-supported';
    }
    return Notification.permission;
  }

  // Disabilita notifiche per questo device
  async disableNotifications() {
    try {
      const deviceId = this.getDeviceId();
      const tokenDoc = doc(db, 'fcmTokens', deviceId);
      
      await updateDoc(tokenDoc, {
        active: false,
        disabledAt: new Date().toISOString()
      });
      
      this.currentToken = null;
      console.log('Notifications disabled for this device');
    } catch (error) {
      console.error('Error disabling notifications:', error);
    }
  }

  // Test notifica
  async testNotification() {
    await this.showNotification(
      'MyLyfe Umbria',
      'Notifiche attive! Ti avviseremo di nuovi eventi.',
      { test: true }
    );
  }
}

export const notificationService = new NotificationService();
