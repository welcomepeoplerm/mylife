# MyLyfe Umbria - PWA con Firebase

Applicazione mobile PWA (Progressive Web App) per MyLyfe Umbria sviluppata con Firebase.

## 🚀 Quick Start

### Prerequisiti
- Node.js (versione 16 o superiore)
- npm o yarn
- Account Firebase (gozzolif@gmail.com)
- Progetto Firebase: MyLyfeUmbria

### Installazione

1. **Installare le dipendenze:**
```bash
npm install
```

2. **Configurare Firebase:**
   - Apri il file `src/firebase-config.js`
   - Completa la configurazione con i tuoi dati Firebase:
     - Vai su [Firebase Console](https://console.firebase.google.com/)
     - Seleziona il progetto "MyLyfeUmbria"
     - Vai su Impostazioni > Impostazioni progetto > Le tue app
     - Copia l'`apiKey` e il `measurementId`
   - Sostituisci i valori "YOUR_API_KEY" e "YOUR_MEASUREMENT_ID"

3. **Avviare in modalità sviluppo:**
```bash
npm run dev
```
L'app sarà disponibile su http://localhost:3000

4. **Build per produzione:**
```bash
npm run build
```

5. **Preview build di produzione:**
```bash
npm run preview
```

## 📁 Struttura del Progetto

```
MYLYFEUMBRIA/
├── src/
│   ├── firebase-config.js    # Configurazione Firebase
│   ├── main.js                # Entry point applicazione
│   ├── pwa-utils.js           # Utilities PWA e Service Worker
│   └── style.css              # Stili globali
├── public/
│   └── icons/                 # Icone PWA (da aggiungere)
├── index.html                 # HTML principale
├── manifest.json              # Manifest PWA
├── vite.config.js             # Configurazione Vite
└── package.json               # Dipendenze
```

## 🔧 Configurazione Firebase

### Dati Progetto
- **Account:** gozzolif@gmail.com
- **Progetto:** MyLyfeUmbria
- **App ID:** 1:626642477198:web:9b8bb3128ab3741ed129df
- **Sender ID:** 626642477198

### Servizi Firebase Disponibili
- ✅ Authentication (Firebase Auth)
- ✅ Firestore Database
- ✅ Cloud Storage
- ✅ Analytics

## 📱 PWA Features

L'app include le seguenti funzionalità PWA:
- ✅ Installabile su dispositivi mobili e desktop
- ✅ Funzionamento offline
- ✅ Cache intelligente delle risorse
- ✅ Aggiornamenti automatici
- ✅ Icone e splash screen personalizzabili
- ✅ Notifiche push (da implementare)

## 🎨 Personalizzazione

### Icone PWA
Crea le icone nelle seguenti dimensioni e salvale in `public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

Puoi usare strumenti online come:
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### Colori e Temi
Modifica i colori nel file `src/style.css`:
```css
:root {
  --primary-color: #4285f4;
  --secondary-color: #34a853;
  /* altri colori... */
}
```

## 🔐 Sicurezza Firebase

**IMPORTANTE:** Prima di deployare in produzione:
1. Configura le regole di sicurezza in Firebase Console
2. Limita i domini autorizzati nelle impostazioni progetto
3. Abilita App Check per proteggere le API
4. Non committare credenziali sensibili nel repository

## 📝 Prossimi Passi

1. ✅ Installare dipendenze
2. ✅ Configurare credenziali Firebase
3. ⏳ Creare icone PWA
4. ⏳ Implementare funzionalità specifiche dell'app
5. ⏳ Configurare Firebase Authentication
6. ⏳ Configurare Firestore Database
7. ⏳ Testare su dispositivi mobili
8. ⏳ Deploy su Firebase Hosting

## 🌐 Deploy

Per deployare l'app su Firebase Hosting:

1. Installare Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login a Firebase:
```bash
firebase login
```

3. Inizializzare Firebase Hosting:
```bash
firebase init hosting
```

4. Build e deploy:
```bash
npm run build
firebase deploy
```

## 📚 Risorse

- [Firebase Documentation](https://firebase.google.com/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Vite Documentation](https://vitejs.dev/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)

## 🐛 Troubleshooting

### L'app non si connette a Firebase
- Verifica che le credenziali in `firebase-config.js` siano corrette
- Controlla la console del browser per errori
- Verifica che il progetto Firebase sia attivo

### PWA non funziona offline
- Il Service Worker funziona solo su HTTPS o localhost
- Verifica che il build sia stato eseguito correttamente
- Controlla nella DevTools > Application > Service Workers

### Errori durante npm install
- Elimina `node_modules` e `package-lock.json`
- Esegui `npm install` nuovamente
- Verifica la versione di Node.js (min 16)

## 📞 Supporto

Per domande o problemi:
- Email: gozzolif@gmail.com
- Firebase Console: https://console.firebase.google.com/

---

**Versione:** 1.0.0  
**Ultima modifica:** 10 Gennaio 2026
