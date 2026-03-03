# CHANGELOG - MyLyfe Umbria

## [1.1.0] - 2026-02-11

### 🎉 Nuove Funzionalità

#### Sistema Notifiche Push
- ✅ Implementato sistema completo di notifiche push con Firebase Cloud Messaging (FCM)
- ✅ Invio automatico notifiche quando si crea un nuovo evento dal backoffice admin
- ✅ Gestione permessi notifiche nell'app mobile con banner interattivo
- ✅ Service Worker per gestire notifiche in background
- ✅ Tracking notifiche inviate in collezione `notifications`
- ✅ Tracking token FCM dispositivi in collezione `fcmTokens`

#### Ordinamento Eventi
- ✅ Aggiunto campo `datainserimento` alla collezione `events`
- ✅ Eventi ordinati per default per `datainserimento` (più recenti primi)
- ✅ Pulsante "📅 Ordina per Data Evento" per ordinamento per `dataEvento`
- ✅ Toggle ascendente/discendente cliccando sul pulsante ordinamento
- ✅ Pulsante "🆕 Più Recenti" per tornare all'ordinamento default

#### Sistema Versioning
- ✅ Numero versione visualizzato nell'header dell'app mobile
- ✅ Numero versione visualizzato nella dashboard admin
- ✅ Script batch `increment-version.bat` per incrementare versione
- ✅ Script PowerShell `increment-version.ps1` per logica incremento
- ✅ File `stop-all.bat` per fermare frontend e backend

### 📁 Nuovi File

#### Sistema Notifiche
- `src/notification-service.js` - Servizio principale FCM lato client
- `src/notification-ui.js` - Componenti UI per permessi notifiche
- `src/admin-notification-service.js` - Servizio invio notifiche da admin
- `public/firebase-messaging-sw.js` - Service Worker FCM per background

#### Documentazione
- `PUSH_NOTIFICATIONS_SETUP.md` - Guida completa setup notifiche
- `PUSH_NOTIFICATIONS_QUICKSTART.md` - Quick start in 10 minuti
- `CHANGELOG.md` - Questo file

#### Versioning & Utilities
- `src/version.js` - Modulo gestione versione app
- `increment-version.bat` - Script Windows per incrementare versione
- `increment-version.ps1` - Script PowerShell logica versioning
- `stop-all.bat` - Script per fermare server dev

### 🔧 File Modificati

#### Backend/Admin
- `src/admin-panel.js`:
  - Importato `sendNotificationForNewEvent` da `admin-notification-service`
  - Modificata `saveItem()` per aggiungere campo `datainserimento` agli eventi
  - Aggiunto invio automatico notifica quando si crea nuovo evento
  - Visualizzato numero versione nell'header dashboard

#### Firebase/Database
- `src/firebase-service.js`:
  - Modificata `getEventsData()` per accettare parametri ordinamento
  - Ordinamento parametrizzato per campo e direzione
  - Fallback su `getCollection()` in caso di errore

#### Frontend/UI
- `src/pages.js`:
  - Refactored `renderMyEventsPage()` con gestione stato ordinamento
  - Aggiunto controlli UI per ordinamento eventi
  - Pulsanti per ordinare per data evento o inserimento
  - Indicatori visuali direzione ordinamento (↑/↓)

- `src/components.js`:
  - Importato `getVersion` da modulo versione
  - Aggiunto display versione nel titolo header app

- `src/main.js`:
  - Importati servizi notifiche (`notification-service`, `notification-ui`)
  - Setup listener messaggi in foreground
  - Chiamata `checkAndShowNotificationBanner()` sulla homepage
  - Inizializzazione servizio notifiche all'avvio app

### 📊 Struttura Database

#### Nuove Collezioni Firestore

**fcmTokens** - Token dispositivi per notifiche push
```javascript
{
  token: string,           // Token FCM del dispositivo
  deviceId: string,        // ID univoco dispositivo
  active: boolean,         // Token attivo/disattivo
  createdAt: string,       // Timestamp creazione
  lastUpdated: string,     // Timestamp ultimo aggiornamento
  userAgent: string        // User agent browser
}
```

**notifications** - Storico notifiche inviate
```javascript
{
  title: string,           // Titolo notifica
  body: string,            // Corpo messaggio
  data: object,            // Dati aggiuntivi (eventId, url, etc.)
  status: string,          // pending | sent | failed
  targetCount: number,     // Numero dispositivi target
  sentCount: number,       // Notifiche inviate con successo
  failedCount: number,     // Notifiche fallite
  createdAt: string,       // Timestamp creazione
  processedAt: string      // Timestamp elaborazione
}
```

#### Modifiche Collezioni Esistenti

**events** - Aggiunto campo ordinamento
```javascript
{
  // ... campi esistenti
  datainserimento: string  // ISO 8601 timestamp inserimento evento
}
```

### ⚙️ Configurazione Richiesta

Per abilitare l'invio effettivo delle notifiche push:

1. **VAPID Key** in `src/notification-service.js`
2. **Firebase Config** in `public/firebase-messaging-sw.js`
3. **Firestore Rules** per collezioni `fcmTokens` e `notifications`
4. **Cloud Function** per elaborare e inviare notifiche (vedi docs)
5. **Indici Firestore** per query ordinate su `events`

### 📖 Documentazione

- Setup completo: `PUSH_NOTIFICATIONS_SETUP.md`
- Quick start: `PUSH_NOTIFICATIONS_QUICKSTART.md`
- Esempio Cloud Function incluso nella documentazione

### 🔄 Breaking Changes

Nessuna breaking change. Il sistema è retrocompatibile:
- Eventi esistenti senza `datainserimento` saranno ordinati per `ordine`
- Notifiche funzionano solo dopo configurazione FCM
- UI ordinamento eventi appare solo su `/events`

### 🐛 Bug Fix

- Nessun bug risolto in questa release (nuove feature)

### 📈 Performance

- Query ordinate su `datainserimento` richiedono indice Firestore
- Cache invalidata per eventi dopo creazione/modifica
- Banner notifiche appare dopo 3 secondi per non bloccare UI

### 🔐 Sicurezza

- Token FCM memorizzati in modo sicuro su Firestore
- Solo admin autenticati possono creare notifiche
- Regole Firestore da configurare per limitare accesso

### 🎯 TODO Futuro

- [ ] Dashboard statistiche notifiche in admin panel
- [ ] Notifiche programmate per eventi futuri
- [ ] Segmentazione utenti per notifiche mirate
- [ ] Supporto notifiche multilingua
- [ ] Test unitari per servizi notifiche
- [ ] UI gestione notifiche nell'admin panel

---

## [1.0.1] - 2026-02-11

### 🔧 Patch

- Script `increment-version.bat` creato per gestione versioni
- Script `stop-all.bat` per fermare processi dev

---

## [1.0.0] - 2026-02-11

### 🎉 Release Iniziale

- App PWA MyLyfe Umbria
- Sezioni: My Home, My Journey, My Taste, My Events
- Admin panel con gestione contenuti
- Firebase Authentication e Firestore
- Supporto multilingua (IT, EN, FR, DE, ES)
- UI personalizzabile da admin
- Responsive design mobile-first

---

## Legend

- 🎉 Nuova funzionalità
- 🔧 Modifica/Fix
- 🐛 Bug fix
- 📁 Nuovo file
- 📊 Database
- ⚙️ Configurazione
- 📖 Documentazione
- 🔐 Sicurezza
- 📈 Performance
- 🔄 Breaking change
- ✅ Completato
- 🎯 Pianificato
