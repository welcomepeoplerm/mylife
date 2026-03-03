// admin-notification-service.js - Send notifications from admin panel

import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { i18n } from './i18n.js';

/**
 * Invia una notifica push a tutti i dispositivi registrati
 * NOTA: Questo crea un documento nella collezione 'notifications' che verrà
 * automaticamente elaborato dalla Cloud Function 'sendNotificationOnCreate'
 * che si occupa dell'invio vero e proprio tramite Firebase Admin SDK
 */
export async function sendNotificationForNewEvent(event) {
  try {
    // Verifica che Firestore sia disponibile
    if (!db) {
      console.warn('⚠️ Firestore non disponibile, notifica non inviata');
      return {
        success: false,
        error: 'Firestore non disponibile'
      };
    }
    
    // Ottieni tutti i token FCM attivi
    const tokensQuery = query(
      collection(db, 'fcmTokens'),
      where('active', '==', true)
    );
    const tokensSnapshot = await getDocs(tokensQuery);
    
    const activeTokensCount = tokensSnapshot.size;
    
    if (activeTokensCount === 0) {
      console.log('⚠️ Nessun dispositivo registrato per le notifiche');
      return {
        success: true,
        sent: 0,
        message: 'Nessun dispositivo registrato'
      };
    }
    
    // Prepara il messaggio della notifica
    const currentLang = 'it'; // Default italiano per le notifiche
    const eventTitle = event.titolo?.[currentLang] || event.titolo?.it || 'Nuovo Evento';
    const eventDescription = event.descrizione?.[currentLang] || event.descrizione?.it || '';
    
    // Formato data evento in italiano
    let eventDateText = '';
    if (event.dataEvento) {
      const date = new Date(event.dataEvento);
      eventDateText = date.toLocaleDateString('it-IT', { 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      });
    }
    
    const notificationData = {
      title: '🎉 Nuovo Evento in Umbria!',
      body: `${eventTitle}${eventDateText ? ` - ${eventDateText}` : ''}`,
      data: {
        eventId: event.id || '',
        eventTitle: eventTitle,
        url: `/#/events/detail/${event.id || ''}`,
        type: 'new-event',
        timestamp: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      status: 'pending',
      targetCount: activeTokensCount,
      sentCount: 0,
      failedCount: 0
    };
    
    // Salva la notifica nel database
    // La Cloud Function 'sendNotificationOnCreate' la elaborerà automaticamente
    const notificationRef = await addDoc(
      collection(db, 'notifications'),
      notificationData
    );
    
    console.log('✅ Notifica creata:', notificationRef.id);
    console.log(`📱 Sarà inviata a ${activeTokensCount} dispositivi dalla Cloud Function`);
    
    return {
      success: true,
      notificationId: notificationRef.id,
      targetCount: activeTokensCount,
      message: `Notifica programmata per ${activeTokensCount} dispositivi`
    };
    
  } catch (error) {
    console.error('❌ Errore creazione notifica:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Invia notifica di test (per verificare il sistema)
 */
export async function sendTestNotification() {
  const testEvent = {
    id: 'test',
    titolo: { it: 'Notifica di Test' },
    descrizione: { it: 'Questa è una notifica di test del sistema' },
    dataEvento: new Date().toISOString().split('T')[0]
  };
  
  return await sendNotificationForNewEvent(testEvent);
}

/**
 * Recupera lo storico delle notifiche inviate
 */
export async function getNotificationHistory(limit = 50) {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications')
    );
    const snapshot = await getDocs(notificationsQuery);
    
    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Ordina per data (più recenti prima)
    notifications.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    return notifications.slice(0, limit);
  } catch (error) {
    console.error('Error fetching notification history:', error);
    return [];
  }
}

/**
 * Ottieni statistiche notifiche
 */
export async function getNotificationStats() {
  try {
    const tokensQuery = query(
      collection(db, 'fcmTokens'),
      where('active', '==', true)
    );
    const tokensSnapshot = await getDocs(tokensQuery);
    
    const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
    
    let totalSent = 0;
    let totalFailed = 0;
    
    notificationsSnapshot.forEach((doc) => {
      const data = doc.data();
      totalSent += data.sentCount || 0;
      totalFailed += data.failedCount || 0;
    });
    
    return {
      activeDevices: tokensSnapshot.size,
      totalNotifications: notificationsSnapshot.size,
      totalSent: totalSent,
      totalFailed: totalFailed,
      successRate: totalSent > 0 ? ((totalSent / (totalSent + totalFailed)) * 100).toFixed(1) : 0
    };
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return {
      activeDevices: 0,
      totalNotifications: 0,
      totalSent: 0,
      totalFailed: 0,
      successRate: 0
    };
  }
}
