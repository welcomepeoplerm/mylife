# Sistema Notifiche Push - MyLyfe Umbria

Questo documento spiega come configurare e utilizzare il sistema di notifiche push implementato nell'app MyLyfe Umbria.

## 📋 Panoramica

Il sistema implementato permette di:
- ✅ Inviare notifiche push quando viene creato un nuovo evento dal backoffice admin
- ✅ Gestire i permessi notifiche nell'app mobile
- ✅ Ordinare gli eventi per data di inserimento (default) o per data evento
- ✅ Tracciare le notifiche inviate in una collezione dedicata

## 🏗️ Architettura

### Componenti Implementati

1. **notification-service.js** - Servizio principale per FCM sul client
2. **notification-ui.js** - Componenti UI per richiedere permessi
3. **admin-notification-service.js** - Servizio per inviare notifiche dall'admin
4. **firebase-messaging-sw.js** - Service Worker per notifiche in background
5. **Campo datainserimento** - Aggiunto automaticamente agli eventi

### Collezioni Firestore

#### `fcmTokens`
Memorizza i token FCM dei dispositivi registrati:
```javascript
{
  token: "fcm-token-string",
  deviceId: "device_unique_id",
  active: true,
  createdAt: "2026-02-11T...",
  lastUpdated: "2026-02-11T...",
  userAgent: "Mozilla/5.0..."
}
```

#### `notifications`
Traccia le notifiche inviate:
```javascript
{
  title: "🎉 Nuovo Evento in Umbria!",
  body: "Nome Evento - 15 marzo 2026",
  data: {
    eventId: "event-id",
    url: "/events/detail/event-id",
    type: "new-event"
  },
  status: "pending", // pending, sent, failed
  targetCount: 10,
  sentCount: 8,
  failedCount: 2,
  createdAt: "2026-02-11T..."
}
```

#### `events` (campo aggiunto)
Nuovo campo `datainserimento`:
```javascript
{
  // ... altri campi esistenti
  datainserimento: "2026-02-11T10:30:00.000Z", // ISO 8601 timestamp
  dataEvento: "2026-03-15" // Data dell'evento (esistente)
}
```

## ⚙️ Configurazione Firebase

### 1. Abilita Firebase Cloud Messaging

1. Vai alla [Firebase Console](https://console.firebase.google.com/)
2. Seleziona il tuo progetto
3. Vai su **Project Settings** (⚙️) → **Cloud Messaging**
4. Copia la **VAPID Key** (chiave pubblica)

### 2. Aggiorna i File di Configurazione

#### `src/notification-service.js`
Sostituisci la VAPID key placeholder (riga ~48):
```javascript
const vapidKey = 'YOUR_VAPID_PUBLIC_KEY_HERE'; // Sostituisci con la tua chiave
```

Con la tua chiave reale:
```javascript
const vapidKey = 'BNxX...'; // La tua VAPID key da Firebase Console
```

#### `public/firebase-messaging-sw.js`
Aggiorna la configurazione Firebase (righe 7-13):
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Con i valori reali dal tuo progetto Firebase (copia da `src/firebase-config.js`).

### 3. Configura Cloud Functions (Richiesto per Invio Effettivo)

Il sistema attuale **crea documenti nella collezione `notifications`**, ma per inviare effettivamente le notifiche push è necessario implementare una **Firebase Cloud Function**.

#### Installa Firebase CLI
```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

#### Crea la Cloud Function

File: `functions/index.js`
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Trigger quando viene creata una nuova notifica
exports.sendPushNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    
    if (notification.status !== 'pending') {
      return null;
    }
    
    try {
      // Recupera tutti i token FCM attivi
      const tokensSnapshot = await admin.firestore()
        .collection('fcmTokens')
        .where('active', '==', true)
        .get();
      
      const tokens = [];
      tokensSnapshot.forEach(doc => {
        tokens.push(doc.data().token);
      });
      
      if (tokens.length === 0) {
        await snap.ref.update({
          status: 'completed',
          sentCount: 0,
          message: 'No active tokens found'
        });
        return null;
      }
      
      // Prepara messaggio FCM
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {},
        tokens: tokens
      };
      
      // Invia notifiche
      const response = await admin.messaging().sendMulticast(message);
      
      console.log('Successfully sent:', response.successCount);
      console.log('Failed:', response.failureCount);
      
      // Aggiorna documento notifica
      await snap.ref.update({
        status: 'sent',
        sentCount: response.successCount,
        failedCount: response.failureCount,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Disabilita token non validi
      if (response.failureCount > 0) {
        const failedTokens = response.responses
          .map((resp, idx) => !resp.success ? tokens[idx] : null)
          .filter(token => token !== null);
        
        // Aggiorna token falliti
        const batch = admin.firestore().batch();
        for (const token of failedTokens) {
          const tokenDocs = await admin.firestore()
            .collection('fcmTokens')
            .where('token', '==', token)
            .get();
          
          tokenDocs.forEach(doc => {
            batch.update(doc.ref, { active: false });
          });
        }
        await batch.commit();
      }
      
      return null;
      
    } catch (error) {
      console.error('Error sending notification:', error);
      await snap.ref.update({
        status: 'failed',
        error: error.message
      });
      return null;
    }
  });
```

#### Deploy Cloud Function
```bash
firebase deploy --only functions
```

### 4. Regole Firestore

Aggiungi le regole per le nuove collezioni in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // FCM Tokens - solo app può scrivere
    match /fcmTokens/{tokenId} {
      allow read: if request.auth != null; // Solo admin
      allow write: if true; // L'app può registrare token
    }
    
    // Notifications - solo admin può leggere/scrivere
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null;
    }
    
    // Eventi - aggiungi indice per ordinamento
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // ... altre regole esistenti
  }
}
```

### 5. Indici Firestore

Crea gli indici necessari per le query su eventi:

1. Vai su **Firestore Database** → **Indexes**
2. Crea indice composito:
   - Collection: `events`
   - Fields: `datainserimento` (Descending)
   - Query scope: Collection

3. Crea indice composito:
   - Collection: `events`
   - Fields: `dataEvento` (Descending)
   - Query scope: Collection

In alternativa, gli indici verranno suggeriti automaticamente da Firestore quando esegui le query.

## 🚀 Utilizzo

### Per gli Utenti dell'App Mobile

1. **Attivazione Notifiche**
   - Al primo accesso apparirà un banner per attivare le notifiche
   - Clicca su "Attiva" per concedere i permessi
   - Una notifica di test confermerà l'attivazione

2. **Visualizzazione Eventi**
   - Gli eventi sono ordinati per "Più Recenti" (datainserimento)
   - Usa il pulsante "📅 Ordina per Data Evento" per ordinare per dataEvento
   - Clicca di nuovo per invertire l'ordinamento (↑/↓)

### Per gli Amministratori

1. **Creazione Nuovo Evento**
   - Accedi al pannello admin (`/admin`)
   - Vai su "My Events"
   - Clicca "➕ Aggiungi Nuovo"
   - Compila il form e salva

2. **Invio Automatico Notifica**
   - Quando salvi un **nuovo** evento, viene automaticamente creata una notifica
   - La notifica viene salvata nella collezione `notifications`
   - La Cloud Function la elabora e invia le push a tutti i dispositivi registrati
   - Riceverai un messaggio di conferma con il numero di dispositivi target

3. **Modifica Evento Esistente**
   - Le notifiche NON vengono inviate quando modifichi un evento esistente
   - Solo i nuovi eventi generano notifiche

## 🧪 Testing

### Test Locale (senza Cloud Functions)

```bash
# Avvia il dev server
npm run dev

# Apri l'app nel browser
# Accetta i permessi notifiche quando richiesto
# Vai su /admin e crea un nuovo evento
# Controlla la console per verificare la creazione del documento notifications
```

### Test con Cloud Functions

```bash
# Deploy functions
firebase deploy --only functions

# Crea un nuovo evento dall'admin
# Controlla i log delle functions
firebase functions:log

# Verifica la ricezione su dispositivo mobile
```

## 📱 Manifest PWA

Assicurati che `manifest.json` includa:
```json
{
  "gcm_sender_id": "103953800507"
}
```

Questo è un valore standard per Firebase Cloud Messaging.

## 🔧 Troubleshooting

### Le notifiche non arrivano

1. **Verifica VAPID key** in `notification-service.js`
2. **Verifica configurazione** in `firebase-messaging-sw.js`
3. **Controlla Cloud Function** deployment: `firebase functions:log`
4. **Verifica permessi browser**: deve essere "granted"
5. **Controlla collezione fcmTokens**: devono esserci token attivi

### Service Worker non si registra

1. Verifica che il file sia in `/public/firebase-messaging-sw.js`
2. Il SW funziona solo su HTTPS (o localhost)
3. Controlla la console del browser per errori

### Gli eventi non si ordinano

1. Verifica che gli eventi abbiano il campo `datainserimento`
2. Controlla gli indici Firestore
3. Guarda la console per errori di query

## 📊 Statistiche

Per vedere le statistiche delle notifiche, usa:

```javascript
import { getNotificationStats } from './admin-notification-service.js';

const stats = await getNotificationStats();
console.log(stats);
// {
//   activeDevices: 15,
//   totalNotifications: 42,
//   totalSent: 580,
//   totalFailed: 12,
//   successRate: 98.0
// }
```

## 🔄 Prossimi Passi

- [ ] Implementare dashboard statistiche notifiche nell'admin panel
- [ ] Aggiungere possibilità di inviare notifiche personalizzate
- [ ] Schedulare notifiche per eventi futuri
- [ ] Segmentazione utenti per notifiche mirate
- [ ] Notifiche multilingua

## 📝 Note Importanti

- **Privacy**: I token FCM sono anonimi e non identificano gli utenti
- **GDPR**: Chiedi sempre il consenso prima di inviare notifiche
- **Limiti**: Firebase ha limiti di quota per le notifiche (controlla i pricing)
- **Delivery**: Le notifiche possono avere ritardi, non sono istantanee al 100%

## 🆘 Supporto

Per problemi o domande:
- Controlla i log della console browser (F12)
- Controlla i log Firebase Functions: `firebase functions:log`
- Verifica lo stato del Service Worker: chrome://serviceworker-internals/
