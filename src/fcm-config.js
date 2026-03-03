// fcm-config.js - Firebase Cloud Messaging Configuration
// Configura qui la tua VAPID key per abilitare le notifiche push

/**
 * COME OTTENERE LA VAPID KEY:
 * 
 * 1. Vai su https://console.firebase.google.com/
 * 2. Seleziona il progetto "mylyfeumbria"
 * 3. Vai su "Project Settings" (icona ingranaggio ⚙️ in alto a sinistra)
 * 4. Vai nella tab "Cloud Messaging"
 * 5. Scorri fino a "Web Push certificates"
 * 6. Se non c'è nessun certificato, clicca "Generate key pair"
 * 7. Copia la "Key pair" (inizia con qualcosa come "BNxX...") 
 * 8. Incollala qui sotto sostituendo il valore placeholder
 */

// ⚠️ IMPORTANTE: Sostituisci questo valore con la tua VAPID key reale
export const VAPID_PUBLIC_KEY = 'BHGsFndzSdnbYyWQpDsWqKgQQuaKMtrUi54J2sCf9AY2papPvzXV_qB5ScMtXoH-N21_-kM6paQOBsXv3OBlyas';

// Verifica se la chiave è configurata
export const isVapidConfigured = () => {
  return VAPID_PUBLIC_KEY !== 'VAPID_KEY_NOT_CONFIGURED' && VAPID_PUBLIC_KEY.length > 50;
};

// Log helper per debug
export const logVapidStatus = () => {
  if (isVapidConfigured()) {
    console.log('✅ VAPID key configurata correttamente');
  } else {
    console.warn('⚠️ VAPID key NON configurata');
    console.warn('📖 Segui le istruzioni in src/fcm-config.js per configurarla');
  }
};
