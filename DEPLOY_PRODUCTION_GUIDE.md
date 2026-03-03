# Guida Deploy in Produzione - MyLyfe Umbria

## 🚀 Procedura Deploy

### Pre-Requisiti
- [ ] Tutti i test locali funzionano correttamente
- [ ] Build locale completata con successo (`npm run build`)
- [ ] Nessun errore in console durante i test
- [ ] Service Worker funziona correttamente in locale

### Passo 1: Build Produzione
```powershell
# Assicurati di essere nella directory del progetto
cd C:\PROGETTI\MYLYFEUMBRIA

# Pulisci cache npm (opzionale, ma consigliato)
npm cache clean --force

# Installa/aggiorna dipendenze
npm install

# Build per produzione
npm run build
```

### Passo 2: Deploy su Firebase
```powershell
# Deploy completo (hosting + functions)
npm run deploy

# OPPURE deploy solo hosting (più veloce)
firebase deploy --only hosting

# OPPURE deploy solo functions
firebase deploy --only functions
```

### Passo 3: Verifica Deploy

1. **Apri l'app in produzione** (es. https://mylyfeumbria.web.app)
2. **NON fare login immediatamente** - prima verifica:
   - ✅ La homepage si carica correttamente
   - ✅ Non ci sono reload automatici
   - ✅ La navigazione tra le pagine funziona
3. **Apri DevTools** (F12):
   - Vai su **Console** - non devono esserci errori critici
   - Vai su **Application > Service Workers** - verifica che sia registrato
   - Vai su **Network** - controlla che non ci siano errori 404/500

### Passo 4: Test Admin Dashboard

1. Vai su `/admin/login` o `/#/admin/login`
2. Effettua login con credenziali admin
3. **IMPORTANTE**: Osserva se la pagina si ricarica continuamente
   - ✅ **OK**: La dashboard si carica correttamente
   - ❌ **PROBLEMA**: Loop di ricaricamento

## 🔧 Risoluzione Problemi Post-Deploy

### Problema: Dashboard Admin in Loop

Se dopo il deploy la dashboard admin si ricarica continuamente:

#### Soluzione 1: Pulizia Cache Utente
1. Vai su `https://tuodominio.web.app/clear-cache.html`
2. Clicca su "Pulisci Tutto"
3. Chiudi TUTTE le schede dell'app
4. Riapri l'app

#### Soluzione 2: Pulizia Manuale (Chrome/Edge)
1. Apri DevTools (F12)
2. **Application > Service Workers > Unregister** (tutti)
3. **Application > Storage > Clear site data**
4. Chiudi TUTTE le schede
5. Riapri l'app

#### Soluzione 3: Modalità Incognito (Test Rapido)
1. Apri finestra incognito/privata
2. Vai sull'app
3. Se funziona → il problema è la cache
4. Segui Soluzione 1 o 2 nella finestra normale

### Problema: Service Worker Non Si Aggiorna

Se gli utenti vedono ancora la vecchia versione:

```javascript
// In console del browser (F12):
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => {
    reg.unregister();
    console.log('SW unregistered');
  });
  location.reload();
});
```

### Problema: Errori Firebase

Se vedi errori di Firebase in console:

1. **Verifica configurazione**:
   - `src/firebase-config.js` ha le credenziali corrette
   - Le regole Firestore sono aggiornate
   - Le regole Storage sono aggiornate

2. **Verifica permessi**:
   ```powershell
   # Rideployer le regole
   firebase deploy --only firestore:rules
   firebase deploy --only storage
   ```

## 📋 Checklist Post-Deploy

Dopo ogni deploy, verifica:

- [ ] Homepage carica correttamente
- [ ] Tutte le sezioni navigabili (Home, Journey, Taste, Events, Assistant)
- [ ] Login admin funziona
- [ ] Dashboard admin accessibile (NO loop)
- [ ] Creazione/modifica contenuti funziona
- [ ] Notifiche push funzionano (se configurate)
- [ ] App installabile come PWA
- [ ] Service Worker registrato correttamente
- [ ] Nessun errore critico in console

## 🔐 Gestione Utenti Admin

### Aggiungere un nuovo admin:

1. Vai su Firebase Console
2. **Authentication > Users**
3. Aggiungi nuovo utente con email/password
4. Vai su `src/auth-service.js`
5. Aggiungi l'email nell'array `adminEmails`:

```javascript
const adminEmails = [
  'gozzolif@gmail.com',
  'nuovo.admin@example.com', // <-- Aggiungi qui
];
```

6. Rideployare: `npm run deploy`

## 📱 Test su Dispositivi Mobili

Dopo il deploy, testa su:

- [ ] Chrome Android
- [ ] Safari iOS
- [ ] Firefox Mobile

Verifica:
- Installazione PWA funziona
- Notifiche funzionano (se configurate)
- Layout responsive corretto
- Performance accettabili

## 🚨 Rollback Emergenza

Se il deploy causa problemi critici:

```powershell
# Vedi le versioni precedenti
firebase hosting:list

# Rollback all'ultima versione funzionante
firebase hosting:rollback
```

## 📊 Monitoring Post-Deploy

Monitora per le prime ore:

1. **Firebase Console > Hosting**: Verifica traffico
2. **Firebase Console > Authentication**: Controlla login funzionano
3. **Firebase Console > Firestore**: Monitora letture/scritture
4. **Browser DevTools**: Controlla errori JavaScript

## ⚡ Tips & Best Practices

1. **Fai deploy nei momenti di basso traffico** (es. notte/primo mattino)
2. **Testa sempre in locale prima** del deploy
3. **Incrementa la versione** in `package.json` e `src/version.js`
4. **Documenta i cambiamenti** in `CHANGELOG.md`
5. **Fai backup del database** Firestore prima di cambiamenti importanti
6. **Comunica agli utenti** se ci saranno interruzioni

## 📞 Supporto

Se i problemi persistono:

1. Controlla `RISOLUZIONE_RELOAD_LOOP.md`
2. Verifica logs Firebase: `firebase functions:log`
3. Controlla issues su GitHub (se configurato)

---

**Ultima revisione**: 2 Marzo 2026
**Versione guida**: 1.0
