/**
 * Cloud Functions for MyLyfe Umbria
 * Gestisce l'invio delle notifiche push FCM
 */

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

// Inizializza Firebase Admin
initializeApp();

/**
 * Trigger quando viene creato un nuovo documento nella collezione 'notifications'
 * Invia notifiche push a tutti i dispositivi registrati
 */
exports.sendNotificationOnCreate = onDocumentCreated('notifications/{notificationId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log('Nessun dato trovato nel documento');
    return null;
  }

  const notification = snapshot.data();
  const notificationId = event.params.notificationId;
  
  console.log('📬 Nuova notifica da processare:', notificationId);
  console.log('📋 Dati notifica:', notification);

  // Verifica che la notifica non sia già stata processata
  if (notification.status === 'sent' || notification.status === 'processing') {
    console.log('⏭️ Notifica già processata, skip');
    return null;
  }

  const db = getFirestore();
  const messaging = getMessaging();

  try {
    // Aggiorna stato a 'processing'
    await snapshot.ref.update({ status: 'processing' });

    // Ottieni tutti i token FCM attivi
    const tokensSnapshot = await db.collection('fcmTokens')
      .where('active', '==', true)
      .get();

    if (tokensSnapshot.empty) {
      console.log('⚠️ Nessun dispositivo registrato');
      await snapshot.ref.update({
        status: 'completed',
        sentCount: 0,
        failedCount: 0,
        processedAt: new Date().toISOString()
      });
      return null;
    }

    const tokens = [];
    tokensSnapshot.forEach(doc => {
      tokens.push(doc.data().token);
    });

    console.log(`📱 Invio notifica a ${tokens.length} dispositivi`);

    // Prepara il messaggio FCM
    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      webpush: {
        notification: {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png'
        },
        fcmOptions: {
          link: notification.data?.url || '/'
        }
      }
    };

    // Invia notifiche in batch (max 500 per chiamata FCM)
    let sentCount = 0;
    let failedCount = 0;

    // Dividi i token in batch di 500
    const batchSize = 500;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batchTokens = tokens.slice(i, i + batchSize);
      
      try {
        const response = await messaging.sendEachForMulticast({
          tokens: batchTokens,
          ...message
        });

        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: ${response.successCount} successi, ${response.failureCount} fallimenti`);
        
        sentCount += response.successCount;
        failedCount += response.failureCount;

        // Gestisci token non validi
        if (response.failureCount > 0) {
          const failedTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const error = resp.error;
              const token = batchTokens[idx];
              
              console.warn(`⚠️ Errore invio a token ${token.substring(0, 20)}...:`, error.code);
              
              // Rimuovi token non validi o scaduti
              if (error.code === 'messaging/invalid-registration-token' ||
                  error.code === 'messaging/registration-token-not-registered') {
                failedTokens.push(token);
              }
            }
          });

          // Rimuovi token falliti dal database
          for (const token of failedTokens) {
            const tokenDocs = await db.collection('fcmTokens')
              .where('token', '==', token)
              .get();
            
            tokenDocs.forEach(async (doc) => {
              await doc.ref.delete();
              console.log(`🗑️ Token rimosso: ${token.substring(0, 20)}...`);
            });
          }
        }
      } catch (error) {
        console.error('❌ Errore invio batch:', error);
        failedCount += batchTokens.length;
      }
    }

    // Aggiorna documento notifica con i risultati
    await snapshot.ref.update({
      status: 'sent',
      sentCount,
      failedCount,
      processedAt: new Date().toISOString()
    });

    console.log(`✅ Notifica completata: ${sentCount} inviati, ${failedCount} falliti`);
    return { success: true, sent: sentCount, failed: failedCount };

  } catch (error) {
    console.error('❌ Errore processing notifica:', error);
    
    // Aggiorna stato a failed
    await snapshot.ref.update({
      status: 'failed',
      error: error.message,
      processedAt: new Date().toISOString()
    });
    
    return { success: false, error: error.message };
  }
});
