# 🔧 Configurazione Firestore - URGENTE

## ⚠️ Problema Rilevato

Lo script ha rilevato: **PERMISSION DENIED** - Firestore non è ancora configurato o le regole di sicurezza bloccano l'accesso.

---

## 📝 Passi per Configurare Firestore

### 1️⃣ Vai alla Firebase Console

Apri: https://console.firebase.google.com/

### 2️⃣ Seleziona il progetto MyLyfeUmbria

### 3️⃣ Attiva Firestore Database

1. Nel menu laterale sinistro, clicca su **"Build"** > **"Firestore Database"**
2. Se non è ancora attivo, clicca **"Create database"**
3. Scegli la modalità:
   - **Test mode** (consigliato per sviluppo) - permette accesso completo per 30 giorni
   - **Production mode** (richiede configurazione manuale delle regole)
4. Seleziona la **location**: `europe-west1` o `europe-west3` (più vicino all'Italia)
5. Clicca **"Enable"**

### 4️⃣ Configura le Regole di Sicurezza (Modalità Test)

Dopo aver creato il database, vai su:
- **Firestore Database** > **Rules** (tab in alto)

Sostituisci le regole con questo codice:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ATTENZIONE: Queste regole sono per SVILUPPO/TEST
    // Permettono accesso completo a tutti
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Clicca **"Publish"** per salvare.

⚠️ **IMPORTANTE**: Queste regole permettono accesso completo e sono SOLO per sviluppo. Prima del deploy in produzione dovrai configurare regole più sicure.

---

## 🔄 Dopo la Configurazione

Una volta completati i passi sopra, riesegui lo script:

```bash
npm run populate-db
```

Se tutto è configurato correttamente, vedrai:
```
✅ Documento "wifi" creato
✅ Documento "pool" creato
✅ Documento "checkin" creato
...ecc
```

---

## ✅ Verifica Visuale

Dopo aver eseguito lo script con successo:

1. Torna alla Firebase Console > Firestore Database
2. Dovresti vedere 3 collezioni:
   - **home** (3 documenti)
   - **journey** (4 documenti)  
   - **taste** (1 documento)

3. Ricarica l'app: http://localhost:3000/
4. Clicca sui menu My Home, My Journey, My Taste
5. I dati dovrebbero caricarsi correttamente!

---

## 🆘 Se hai problemi

1. **Verifica che Firestore sia attivo** nella Firebase Console
2. **Controlla le regole** - devono permettere `allow read, write: if true;`
3. **Aspetta 1-2 minuti** dopo aver pubblicato le regole (propagazione)
4. **Riprova lo script**: `npm run populate-db`

---

## 📞 Fammi sapere

Una volta configurato Firestore, riesegui lo script e fammi sapere se funziona! 🚀
