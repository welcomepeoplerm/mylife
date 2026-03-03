// Firebase Cloud Messaging Server Configuration
// Questa chiave server è necessaria per inviare notifiche push

/**
 * COME OTTENERE LA SERVER KEY:
 * 1. Vai su https://console.firebase.google.com/project/mylyfeumbria/settings/cloudmessaging
 * 2. Nella sezione "Cloud Messaging API (Legacy)" 
 * 3. Copia la "Server key"
 * 4. Incollala qui sotto sostituendo il placeholder
 * 
 * IMPORTANTE: Questa chiave è sensibile e NON deve essere committata in Git!
 * In produzione, usa variabili d'ambiente o Cloud Functions.
 */

// Server Key per FCM (Legacy API)
export const FCM_SERVER_KEY = 'YOUR_SERVER_KEY_HERE';

// Endpoint FCM
export const FCM_ENDPOINT = 'https://fcm.googleapis.com/fcm/send';

/**
 * Verifica se la server key è configurata
 */
export function isServerKeyConfigured() {
  return FCM_SERVER_KEY !== 'YOUR_SERVER_KEY_HERE' && FCM_SERVER_KEY.length > 0;
}

/**
 * Log dello stato della configurazione
 */
export function logServerKeyStatus() {
  if (isServerKeyConfigured()) {
    console.log('✅ FCM Server Key configurata');
  } else {
    console.warn('⚠️ FCM Server Key NON configurata');
    console.warn('📖 Segui le istruzioni in src/fcm-server-config.js');
  }
}
