# Quick Start - Notifiche Push MyLyfe Umbria

## ✅ Cosa è stato implementato

1. **Sistema notifiche push completo** con Firebase Cloud Messaging (FCM)
2. **Campo `datainserimento`** negli eventi per tracciare quando sono stati creati
3. **Ordinamento eventi** per datainserimento (default) o dataEvento (asc/desc)
4. **UI controlli ordinamento** nella pagina MyEvents
5. **Banner permessi notifiche** per gli utenti mobili
6. **Invio automatico notifiche** quando l'admin crea un nuovo evento
7. **Collezioni Firestore** per token FCM e storico notifiche

## 🚀 Setup Rapido (10 minuti)

### 1. Configura Firebase Cloud Messaging

```bash
# Vai su Firebase Console → Project Settings → Cloud Messaging
# Copia la VAPID Public Key
```

### 2. Aggiorna i File

**`src/notification-service.js` (riga ~48):**
```javascript
const vapidKey = 'BNxX...TUA_CHIAVE_QUI';
```

**`public/firebase-messaging-sw.js` (righe 7-13):**
```javascript
const firebaseConfig = {
  apiKey: "DA_FIREBASE_CONSOLE",
  authDomain: "TUO_PROGETTO.firebaseapp.com",
  projectId: "TUO_PROGETTO",
  storageBucket: "TUO_PROGETTO.appspot.com",
  messagingSenderId: "TUO_SENDER_ID",
  appId: "TUO_APP_ID"
};
```

### 3. Aggiorna Regole Firestore

Aggiungi a `firestore.rules`:
```javascript
match /fcmTokens/{tokenId} {
  allow read: if request.auth != null;
  allow write: if true;
}

match /notifications/{notificationId} {
  allow read, write: if request.auth != null;
}
```

Deploy:
```bash
firebase deploy --only firestore:rules
```

### 4. Installa e Deploy Cloud Function

**Crea `functions/index.js`** (vedi PUSH_NOTIFICATIONS_SETUP.md per il codice completo)

```bash
cd functions
npm install firebase-functions firebase-admin
cd ..
firebase deploy --only functions
```

### 5. Testa l'App

```bash
npm run dev
```

1. Apri `http://localhost:5173`
2. Accetta i permessi notifiche quando richiesto
3. Vai su `/admin`, crea un nuovo evento
4. Verifica la ricezione della notifica push!

## 📁 File Creati/Modificati

### Nuovi File
- `src/notification-service.js` - Servizio FCM client
- `src/notification-ui.js` - UI permessi notifiche
- `src/admin-notification-service.js` - Logica invio dall'admin
- `public/firebase-messaging-sw.js` - Service Worker FCM
- `PUSH_NOTIFICATIONS_SETUP.md` - Documentazione completa
- `PUSH_NOTIFICATIONS_QUICKSTART.md` - Questa guida

### File Modificati
- `src/admin-panel.js` - Aggiunto campo datainserimento, invio notifiche
- `src/firebase-service.js` - Ordinamento eventi parametrizzato
- `src/pages.js` - UI controlli ordinamento in MyEvents
- `src/main.js` - Integrazione servizio notifiche
- `src/version.js` - Versione app ora visualizzata

## 🎯 Come Funziona

### Flusso Notifiche

```
Admin crea evento → saveItem() → sendNotificationForNewEvent()
                                          ↓
                     Documento creato in collezione 'notifications'
                                          ↓
                        Cloud Function attivata (onCreate)
                                          ↓
                    Recupera token FCM attivi da 'fcmTokens'
                                          ↓
                      Invia push con admin.messaging()
                                          ↓
                        Utente riceve notifica push!
```

### Ordinamento Eventi

- **Default**: Per `datainserimento` decrescente (più recenti primi)
- **Alternativo**: Per `dataEvento` ascendente/discendente (click su pulsante)
- Pulsante "🆕 Più Recenti" torna all'ordinamento default

## 🧪 Test Rapido

1. **Test Permessi**:
   - Carica app → Banner appare dopo 3 secondi
   - Click "Attiva" → Notifica di test appare

2. **Test Ordinamento**:
   - Vai su `/events`
   - Click "📅 Ordina per Data Evento"
   - Verifica ordine cambiato
   - Click di nuovo per invertire (↑/↓)

3. **Test Notifica da Admin**:
   - Login `/admin`
   - Crea nuovo evento in "My Events"
   - Verifica alert con conteggio dispositivi
   - Controlla collezione `notifications` in Firestore

## ⚠️ Note Importanti

- **HTTPS richiesto** per le notifiche push (o localhost)
- **Permessi browser** devono essere "granted"
- **Cloud Function necessaria** per invio effettivo notifiche
- **Service Worker** deve essere registrato correttamente

## 📊 Verifica Setup

Controlla questi punti:

- [ ] VAPID key configurata in `notification-service.js`
- [ ] Config Firebase in `firebase-messaging-sw.js`
- [ ] Regole Firestore aggiornate
- [ ] Cloud Function deployata
- [ ] Service Worker registrato (console: "Service Worker registrato")
- [ ] Notifiche inizializzate (console: "Notifiche push inizializzate")

## 🐛 Problemi Comuni

| Problema | Soluzione |
|----------|-----------|
| Banner non appare | Verifica che permission != 'granted' e banner non sia dismissed |
| Notifica non arriva | Controlla Cloud Function logs: `firebase functions:log` |
| Errore VAPID key | Sostituisci placeholder con chiave vera da Firebase Console |
| SW non registrato | Verifica path è `/public/firebase-messaging-sw.js` |
| Query eventi fallisce | Crea indici Firestore (link appare nella console) |

## 📖 Documentazione Completa

Per dettagli completi, architettura e advanced features:
→ Vedi **PUSH_NOTIFICATIONS_SETUP.md**

## 🎉 Fatto!

Se hai seguito tutti i passi, il sistema è pronto. Crea un evento dall'admin e verifica che la notifica arrivi sul dispositivo mobile!
