# 🔥 CONFIGURAZIONE FIREBASE - PASSI DA COMPLETARE

## ⚠️ IMPORTANTE: Completare questa configurazione prima di avviare l'app

### Passo 1: Ottenere l'API Key

1. Vai su: https://console.firebase.google.com/
2. Accedi con: **gozzolif@gmail.com**
3. Seleziona il progetto: **MyLyfeUmbria**
4. Clicca sull'ingranaggio ⚙️ in alto a sinistra > **Impostazioni progetto**
5. Scorri fino alla sezione **"Le tue app"**
6. Trova l'app web con ID: `1:626642477198:web:9b8bb3128ab3741ed129df`
7. Nella sezione "Configurazione SDK", copia il valore di **`apiKey`**

### Passo 2: Aggiornare il file di configurazione

Apri il file: **`src/firebase-config.js`**

Cerca questa riga:
```javascript
apiKey: "YOUR_API_KEY", // Da completare
```

Sostituiscila con:
```javascript
apiKey: "LA_TUA_API_KEY_COPIATA", // La tua API key
```

### Passo 3: (Opzionale) Measurement ID per Analytics

Se vuoi abilitare Google Analytics:
1. Nella stessa pagina, copia anche il **`measurementId`**
2. Nel file `src/firebase-config.js`, sostituisci:
```javascript
measurementId: "YOUR_MEASUREMENT_ID" // Da completare (opzionale)
```

Con:
```javascript
measurementId: "IL_TUO_MEASUREMENT_ID" // Il tuo measurement ID
```

---

## ✅ Dati già configurati

- ✅ **App ID:** 1:626642477198:web:9b8bb3128ab3741ed129df
- ✅ **Sender ID:** 626642477198
- ✅ **Project ID:** mylyfeumbria
- ✅ **Auth Domain:** mylyfeumbria.firebaseapp.com
- ✅ **Storage Bucket:** mylyfeumbria.appspot.com

---

## 🚀 Dopo aver configurato

Esegui:
```bash
npm run dev
```

L'app si aprirà su http://localhost:3000 e vedrai lo stato della connessione Firebase.

---

## 🔐 Sicurezza

**NOTA IMPORTANTE:** L'API key può essere esposta nel codice client, ma devi:
1. Configurare le **regole di sicurezza** in Firebase Console
2. Abilitare **App Check** per proteggere le API
3. Limitare i **domini autorizzati** nelle impostazioni Firebase

---

## 📞 Hai bisogno di aiuto?

Se hai difficoltà a trovare l'API key:
1. Firebase Console > Impostazioni progetto (ingranaggio)
2. Scorri fino a "Le tue app"
3. Dovresti vedere la tua app web elencata
4. Clicca sul pulsante "Configurazione" o guarda il codice snippet

L'API key inizia solitamente con: `AIza...`
