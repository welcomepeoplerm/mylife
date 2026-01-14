# 🔐 Setup Utente Admin - MyLyfe

## Prerequisiti

Per accedere al pannello admin, devi prima creare un utente nella Firebase Console.

---

## 📝 Passi per Creare l'Utente Admin

### 1️⃣ Vai alla Firebase Console

Apri: https://console.firebase.google.com/

### 2️⃣ Seleziona il progetto MyLyfeUmbria

### 3️⃣ Attiva Firebase Authentication

1. Nel menu laterale, clicca su **"Build"** > **"Authentication"**
2. Clicca **"Get started"** (se non è già attivo)
3. Nella tab **"Sign-in method"**, abilita:
   - **Email/Password** → Clicca, abilita, e salva

### 4️⃣ Crea l'Utente Admin

1. Vai nella tab **"Users"**
2. Clicca **"Add user"**
3. Inserisci:
   - **Email:** `gozzolif@gmail.com` (o la tua email)
   - **Password:** Scegli una password sicura (almeno 6 caratteri)
4. Clicca **"Add user"**

---

## 🚀 Accesso al Pannello Admin

Dopo aver creato l'utente, puoi accedere:

1. **Vai a:** http://localhost:3000/#/admin/login
2. **Inserisci le credenziali:**
   - Email: gozzolif@gmail.com
   - Password: quella che hai impostato
3. **Clicca "Accedi"**

Se tutto è configurato correttamente, verrai reindirizzato al pannello admin! 🎛️

---

## 📌 Note Importanti

### Email Autorizzate

Solo le email nella lista autorizzata possono accedere al pannello admin.

Attualmente autorizzate:
- ✅ `gozzolif@gmail.com`

Per aggiungere altri admin, modifica il file `src/auth-service.js`:

```javascript
const adminEmails = [
  'gozzolif@gmail.com',
  'altro.admin@example.com',  // Aggiungi qui
];
```

### Password Dimenticata

Se dimentichi la password:
1. Vai su Firebase Console > Authentication > Users
2. Trova l'utente
3. Clicca sui tre puntini > "Reset password"
4. Invia email di reset o imposta nuova password

---

## ✅ Verifica

Una volta loggato, nel pannello admin puoi:

- ✏️ **Modificare** contenuti esistenti (My Home, My Journey, My Taste)
- ➕ **Aggiungere** nuovi luoghi, ristoranti, info
- 🗑️ **Eliminare** contenuti
- 🌍 **Gestire traduzioni** in tutte le 5 lingue

---

## 🔒 Sicurezza

### Regole Firestore per Produzione

Prima del deploy in produzione, aggiorna le regole Firestore per proteggere le scritture:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tutti possono leggere (app pubblica)
    match /{document=**} {
      allow read: if true;
    }
    
    // Solo admin autenticati possono scrivere
    match /home/{document} {
      allow write: if request.auth != null && 
                     request.auth.token.email in [
                       'gozzolif@gmail.com'
                     ];
    }
    
    match /journey/{document} {
      allow write: if request.auth != null && 
                     request.auth.token.email in [
                       'gozzolif@gmail.com'
                     ];
    }
    
    match /taste/{document} {
      allow write: if request.auth != null && 
                     request.auth.token.email in [
                       'gozzolif@gmail.com'
                     ];
    }
  }
}
```

---

## 🆘 Troubleshooting

### Non riesco ad accedere

1. **Verifica che Authentication sia abilitato** nella Firebase Console
2. **Controlla che l'utente sia stato creato** (Authentication > Users)
3. **Verifica l'email** - deve essere esattamente `gozzolif@gmail.com`
4. **Prova a resettare la password** dalla console

### Errore "Non sei autorizzato"

- L'email non è nella lista degli admin autorizzati
- Verifica `src/auth-service.js` e aggiungi la tua email

### Non vedo il pannello admin

- Assicurati di andare su: http://localhost:3000/#/admin/login
- Non su `/admin` senza prima fare login

---

**Tutto pronto!** Una volta creato l'utente, potrai gestire completamente i contenuti dell'app! 🚀
