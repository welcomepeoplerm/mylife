# 🔔 Attivazione Notifiche Push - Guida Rapida

## ⚠️ Problema Attuale
Le notifiche push NON sono attive perché la **VAPID key non è configurata**.

Messaggio visualizzato:
```
⚠️ Nessun dispositivo registrato per le notifiche
```

## ✅ Soluzione in 5 Minuti

### Passo 1: Ottieni la VAPID Key da Firebase

1. Apri il browser e vai su: https://console.firebase.google.com/
2. Seleziona il progetto **"mylyfeumbria"**
3. Clicca sull'**icona ingranaggio ⚙️** (in alto a sinistra) → **"Project Settings"**
4. Vai nella tab **"Cloud Messaging"**
5. Scorri in basso fino alla sezione **"Web Push certificates"**
6. Se non c'è nessun certificato:
   - Clicca sul pulsante **"Generate key pair"**
   - Aspetta qualche secondo
7. Vedrai una chiave che inizia con qualcosa tipo `BNxX...` (è lunga circa 80-90 caratteri)
8. Clicca sul pulsante **copia** 📋 accanto alla chiave

### Passo 2: Configura la VAPID Key nel Codice

1. Apri il file: `src/fcm-config.js`
2. Trova questa riga:
   ```javascript
   export const VAPID_PUBLIC_KEY = 'VAPID_KEY_NOT_CONFIGURED';
   ```
3. Sostituisci `'VAPID_KEY_NOT_CONFIGURED'` con la chiave che hai copiato:
   ```javascript
   export const VAPID_PUBLIC_KEY = 'BNxX...LA_TUA_CHIAVE_QUI...';
   ```
4. Salva il file

### Passo 3: Testa le Notifiche

1. **Riavvia il server di sviluppo**:
   ```bash
   # Ferma il server (Ctrl+C)
   # Riavvialo
   npm run dev
   ```

2. **Apri l'app sul tuo smartphone**:
   - Vai su `http://IL_TUO_IP:3000` (sostituisci con l'IP del tuo computer)
   - Oppure fai il deploy e apri l'app su `https://mylyfeumbria.web.app`

3. **Accetta i permessi**:
   - Dopo 3 secondi apparirà un banner verde in basso
   - Clicca su **"Attiva"**
   - Il browser chiederà il permesso → clicca **"Consenti"**
   - Vedrai una notifica di test

4. **Crea un evento dall'admin**:
   - Vai su `/admin`
   - Crea un nuovo evento
   - Dovresti vedere: `📱 Notifica programmata per 1 dispositivi`
   - Lo smartphone riceverà la notifica! 🎉

## 🔍 Verifica che Funzioni

### Console Browser (F12)
Dovresti vedere questi messaggi:
```
✅ VAPID key configurata correttamente
✅ Firebase Messaging inizializzato
Notification permission granted
FCM Token: dxxx...
Token saved to database
```

### Firestore Database
Controlla su Firebase Console → Firestore:
- Collezione `fcmTokens` → dovrebbe avere almeno 1 documento con il token del tuo dispositivo
- Collezione `notifications` → ogni volta che crei un evento, appare un nuovo documento

## ❌ Problemi Comuni

### "Failed to register service worker"
- Le notifiche funzionano solo su **HTTPS** o **localhost**
- Se testi da smartphone, usa `ngrok` o fai il deploy su Firebase Hosting

### "Notification permission denied"
- Hai cliccato "Blocca" per errore
- Vai nelle impostazioni del browser → Notifiche → Trova il tuo sito → Cambia permesso

### "VAPID key invalid"
- La chiave deve essere quella esatta da Firebase Console
- Non deve avere spazi prima o dopo
- Non deve avere virgolette doppie dentro

### Banner notifiche non appare
- Aspetta 3 secondi dopo il caricamento della homepage
- Se hai già cliccato "Non ora", aspetta 7 giorni o cancella `localStorage`

## 📱 Deploy su Produzione

Una volta che funziona in locale, fai il deploy:

```bash
npm run build
firebase deploy --only hosting
```

Apri l'app da smartphone su `https://mylyfeumbria.web.app` e le notifiche funzioneranno!

## 🆘 Ancora Problemi?

Controlla il file completo: `PUSH_NOTIFICATIONS_SETUP.md` per:
- Configurazione Cloud Functions (per invio effettivo notifiche)
- Troubleshooting avanzato
- Configurazione avanzata

## 📊 Stato Attuale

- ✅ Sistema notifiche implementato
- ✅ Regole Firestore configurate
- ⚠️ **VAPID key da configurare** ← SEI QUI
- ⏳ Cloud Function da implementare (opzionale, per ora)

**Prossimo passo**: Configura la VAPID key seguendo il Passo 1 e 2 sopra! 🚀
