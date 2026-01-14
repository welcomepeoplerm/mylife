# MyLyfe Umbria - Istruzioni di Setup e Sviluppo

## 📋 Indice
1. [Setup Iniziale](#setup-iniziale)
2. [Configurazione Firebase](#configurazione-firebase)
3. [Sviluppo](#sviluppo)
4. [Funzionalità da Implementare](#funzionalità-da-implementare)
5. [Deploy](#deploy)

---

## 🎯 Setup Iniziale

### Passo 1: Installare le Dipendenze
```bash
cd c:\PROGETTI\MYLYFEUMBRIA
npm install
```

Questo comando installerà:
- **Firebase SDK** (v10.7.2) - per backend e database
- **Vite** (v5.0.10) - build tool veloce
- **Vite PWA Plugin** (v0.17.4) - per funzionalità PWA
- **Workbox** (v7.0.0) - per gestione cache e offline

### Passo 2: Verificare l'Installazione
```bash
npm run dev
```
Apri http://localhost:3000 nel browser

---

## 🔥 Configurazione Firebase

### Completare le Credenziali Firebase

1. **Accedi alla Firebase Console:**
   - Vai su https://console.firebase.google.com/
   - Accedi con gozzolif@gmail.com
   - Seleziona il progetto "MyLyfeUmbria"

2. **Ottenere le Credenziali:**
   - Clicca sull'icona dell'ingranaggio ⚙️ (Impostazioni progetto)
   - Scorri fino a "Le tue app"
   - Dovresti vedere l'app web con ID: `1:626642477198:web:9b8bb3128ab3741ed129df`
   - Clicca su "Configurazione SDK" o "Config"
   - Copia i valori di `apiKey` e `measurementId`

3. **Aggiornare firebase-config.js:**
   Apri `src/firebase-config.js` e sostituisci:
   ```javascript
   apiKey: "YOUR_API_KEY", // <-- Inserisci qui la tua API key
   measurementId: "YOUR_MEASUREMENT_ID" // <-- Inserisci qui (opzionale)
   ```

### Abilitare Servizi Firebase

Nella Firebase Console, abilita i seguenti servizi:

#### 1. **Authentication**
   - Vai su Build > Authentication
   - Clicca "Get started"
   - Abilita i provider di accesso desiderati:
     - ✅ Email/Password
     - ✅ Google
     - Altri se necessario

#### 2. **Firestore Database**
   - Vai su Build > Firestore Database
   - Clicca "Create database"
   - Scegli la modalità (consigliato: test mode per sviluppo)
   - Seleziona la region (consigliato: europe-west1 per l'Italia)

#### 3. **Cloud Storage**
   - Vai su Build > Storage
   - Clicca "Get started"
   - Accetta le regole di sicurezza predefinite (modificabili dopo)

#### 4. **Analytics** (opzionale)
   - Dovrebbe essere già abilitato
   - Vai su Analytics > Dashboard per verificare

---

## 💻 Sviluppo

### Comandi Disponibili

```bash
# Avviare server di sviluppo
npm run dev

# Creare build di produzione
npm run build

# Visualizzare preview build
npm run preview
```

### Struttura File da Conoscere

#### `src/firebase-config.js`
Configurazione Firebase - servizi disponibili:
- `auth` - Autenticazione utenti
- `db` - Database Firestore
- `storage` - Storage per file/immagini
- `analytics` - Google Analytics

#### `src/main.js`
Entry point dell'applicazione - qui inizializza:
- Firebase
- Service Worker per PWA
- Logica principale dell'app

#### `src/pwa-utils.js`
Utilities per PWA:
- Registrazione Service Worker
- Gestione installazione app
- Gestione aggiornamenti

#### `index.html`
HTML principale - struttura base dell'app

#### `manifest.json`
Configurazione PWA - nome, icone, colori

---

## 🎨 Creare le Icone PWA

Le icone PWA sono necessarie per l'installazione dell'app su mobile.

### Opzione 1: Generatore Online (Consigliato)
1. Crea un'icona quadrata 512x512 px (può essere il logo dell'app)
2. Vai su https://www.pwabuilder.com/imageGenerator
3. Carica la tua icona
4. Scarica il pacchetto icone generato
5. Estrai i file nella cartella `public/icons/`

### Opzione 2: Manuale
Crea manualmente le icone nelle seguenti dimensioni:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

Salvale in `public/icons/icon-[dimensione].png`

---

## 🚀 Funzionalità da Implementare

Questa sezione verrà aggiornata con le specifiche funzionalità richieste.

### Template per Nuove Funzionalità

Quando aggiungi una funzionalità:

1. **Creare un nuovo file** in `src/features/nome-feature.js`
2. **Importarlo** in `src/main.js`
3. **Aggiungere l'UI** necessaria in `index.html` o creare nuove pagine
4. **Aggiornare gli stili** in `src/style.css`

Esempio struttura:
```javascript
// src/features/esempio.js
import { db } from '../firebase-config';

export async function miaFunzione() {
  // Implementazione
}
```

---

## 📱 Test su Dispositivi Mobili

### Testare su Rete Locale

1. Avvia il server di sviluppo:
```bash
npm run dev
```

2. Trova l'indirizzo IP del tuo PC:
```bash
ipconfig
```
Cerca "IPv4 Address" (es: 192.168.1.100)

3. Sul dispositivo mobile:
   - Connettiti alla stessa rete WiFi
   - Apri il browser e vai su: `http://[tuo-ip]:3000`
   - Esempio: `http://192.168.1.100:3000`

### Testare PWA

1. Dopo aver aperto l'app su mobile, nel browser:
   - Chrome Android: Menu > "Installa app"
   - Safari iOS: Condividi > "Aggiungi a Home"

---

## 🌐 Deploy su Firebase Hosting

### Setup Firebase Hosting

1. **Installare Firebase CLI:**
```bash
npm install -g firebase-tools
```

2. **Login a Firebase:**
```bash
firebase login
```

3. **Inizializzare Hosting:**
```bash
firebase init hosting
```
   - Seleziona il progetto "MyLyfeUmbria"
   - Public directory: `dist` (NON public)
   - Single-page app: `Yes`
   - GitHub deploys: `No` (per ora)

### Deploy

```bash
# Build dell'app
npm run build

# Deploy su Firebase
firebase deploy --only hosting
```

L'app sarà disponibile su: `https://mylyfeumbria.web.app`

---

## 🔐 Sicurezza e Best Practices

### Regole Firestore (Esempio per Sviluppo)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Consenti lettura/scrittura solo agli utenti autenticati
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Regole Storage (Esempio per Sviluppo)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**IMPORTANTE:** Queste sono regole di sviluppo. Per produzione, implementare regole più restrittive.

---

## 📝 Checklist Pre-Deploy

- [ ] Firebase configurato con credenziali corrette
- [ ] Icone PWA create e salvate in `public/icons/`
- [ ] Test su almeno un dispositivo mobile
- [ ] Regole di sicurezza Firebase configurate
- [ ] Build di produzione testata localmente (`npm run build && npm run preview`)
- [ ] Analytics configurato (opzionale)
- [ ] Domini autorizzati configurati in Firebase Console

---

## 🐛 Risoluzione Problemi Comuni

### Errore: "Firebase: Error (auth/unauthorized-domain)"
- Vai su Firebase Console > Authentication > Settings > Authorized domains
- Aggiungi il dominio della tua app (localhost è già autorizzato)

### Service Worker non si aggiorna
- Apri DevTools (F12)
- Application > Service Workers
- Clicca "Unregister" e ricarica la pagina

### Build fallisce
```bash
# Pulisci e reinstalla
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📞 Contatti e Supporto

- **Email:** gozzolif@gmail.com
- **Firebase Console:** https://console.firebase.google.com/
- **Progetto:** MyLyfeUmbria

---

## 📚 Risorse Utili

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guida](https://firebase.google.com/docs/firestore)
- [Firebase Auth Guida](https://firebase.google.com/docs/auth)
- [PWA Guida](https://web.dev/progressive-web-apps/)
- [Vite Guida](https://vitejs.dev/guide/)

---

**Prossimi Passi:**
1. ✅ Setup completato
2. ⏳ Configurare Firebase con credenziali
3. ⏳ Creare icone PWA
4. ⏳ Definire funzionalità specifiche dell'app
5. ⏳ Sviluppare features
6. ⏳ Testare
7. ⏳ Deploy

---

**Ultima modifica:** 10 Gennaio 2026
