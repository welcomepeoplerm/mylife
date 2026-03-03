# Risoluzione del problema di Reload Continuo

## Problema
L'app e il backoffice continuano a ricaricare la pagina in loop infinito, impedendo l'accesso.

## Causa
Il Service Worker utilizzava `skipWaiting()` nell'evento `install`, causando riattivazioni continue e loop di aggiornamento. Inoltre, la cache non gestiva correttamente le route admin/auth, causando problemi di autenticazione persistente.

## Correzioni Applicate

### 1. Service Worker (firebase-messaging-sw.js)
- **Rimosso listener duplicato** per `install` che causava confusione
- **Migliorata gestione attivazione**: Il SW ora fa `skipWaiting()` in modo controllato durante install
- **Pulizia cache**: Durante activate, vengono rimosse le vecchie cache
- **Gestione fetch migliorata**: Le route `/admin` e le richieste di autenticazione NON vengono cachate
- **Cache selettiva**: Solo risposte OK (200) vengono cachate

### 2. PWA Utils (pwa-utils.js)  
- Disabilitata la notifica automatica di aggiornamento
- Rimosso il prompt che causava reload continui

### 3. Admin Auth (admin-login.js)
- **Protezione anti-loop**: Aggiunto contatore di redirect per rilevare loop infiniti
- **Auto-reset**: Se vengono rilevati più di 3 redirect in 5 secondi, forza logout e ritorno alla home
- **Gestione sicura**: Previene loop causati da problemi di autenticazione temporanei

## Come Risolvere sul Browser

### **IMPORTANTE: Devi pulire il Service Worker e la cache dal browser**

#### Chrome/Edge:
1. Apri DevTools (F12)
2. Vai su **Application** > **Service Workers**
3. Clicca su **Unregister** per tutti i Service Workers di `mylyfeumbria`
4. Vai su **Application** > **Storage** > **Clear site data**
5. Seleziona tutto e clicca **Clear data**
6. Chiudi TUTTE le schede dell'app
7. Riapri l'app

#### Firefox:
1. Apri DevTools (F12)
2. Vai su **Application** (o **Storage** nei dev tools)
3. Clicca su **Service Workers** e **Unregister**
4. Vai su **Storage** > **Clear All**
5. Chiudi TUTTE le schede
6. Riapri l'app

#### Safari (iOS):
1. Vai in **Impostazioni** > **Safari**
2. Scorri in basso e tocca **Avanzate**
3. Tocca **Dati dei siti web**
4. Cerca `mylyfeumbria` e **Rimuovi**
5. Torna indietro e tocca **Cancella dati siti web e cronologia**
6. Conferma
7. Riapri Safari e vai sull'app

### Alternativa Rapida (Desktop):
1. Apri l'app in modalità **Incognito/Privata**
2. Se funziona senza problemi, allora la cache era il problema
3. Torna alla modalità normale e cancella cache/SW come sopra

### Da Terminale (per sviluppatori):
```bash
# Riavvia il server di sviluppo
# Ferma tutti i processi attivi
taskkill /F /IM node.exe

# Cancella cache del modulo
npm cache clean --force

# Riavvia
npm run dev
```

## Prevenzione Futura
- Il SW ora ha una gestione controllata degli aggiornamenti
- Le route admin/auth NON vengono mai cachate per evitare problemi di autenticazione
- Gli aggiornamenti avvengono in modo sicuro senza causare reload
- Sistema anti-loop automatico che previene più di 3 redirect in 5 secondi

## Deployment in Produzione
Quando fai il deploy in produzione:

1. **Prima del deploy**: Assicurati che tutti i test locali funzionino
2. **Dopo il deploy**: 
   - Il Service Worker verrà aggiornato automaticamente
   - Non causare reload forzati - il SW si aggiorna in modo sicuro
   - Gli utenti già loggati NON verranno disconnessi
3. **Se si verifica un loop**:
   - Vai su `/clear-cache.html` sul dominio di produzione
   - Oppure segui le istruzioni di pulizia cache qui sotto

## Test
Dopo aver pulito:
1. ✅ L'app si carica normalmente
2. ✅ Non ci sono reload automatici
3. ✅ Si può navigare tra le pagine
4. ✅ Il backoffice è accessibile senza loop
5. ✅ Le notifiche funzionano ancora
6. ✅ L'autenticazione admin persiste anche dopo aggiornamenti SW

## Note
Se il problema persiste dopo aver pulito cache e SW:
- Controlla la Console del browser per errori JavaScript
- Verifica che non ci siano estensioni del browser che interferiscono
- Prova a disabilitare temporaneamente antivirus/firewall
