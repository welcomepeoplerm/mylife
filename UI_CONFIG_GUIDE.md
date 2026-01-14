# Guida alla Configurazione UI Dinamica

## Panoramica

Il sistema di configurazione UI permette di personalizzare l'interfaccia dell'applicazione MyLyfe direttamente dal pannello amministrativo. Le modifiche vengono salvate su Firebase e applicate automaticamente all'app.

## Cosa Puoi Personalizzare

### 🎨 Palette Colori
- **Colore Primario** (default: Verde `#6da34d`)
- **Colore Secondario** (default: Viola `#56445d`)
- **Colore Accento** (default: Salvia `#8d9c71`)
- **Colore Teal** (default: `#548687`)
- **Verde Chiaro** (default: `#c5e99b`)
- **Colore Sfondo** (default: `#F5F5F5`)

Tutti i colori vengono applicati anche alla splash screen iniziale, inclusi i gradienti del logo.

### 🏷️ Branding
- **Nome App** (multilingua: IT, EN, FR, DE, ES)
  - Appare nell'header dell'applicazione
  - Appare nella splash screen iniziale
  - Esempio: "MyLyfe" → "My10"
  
- **Slogan/Tagline** (multilingua: IT, EN, FR, DE, ES)
  - Appare sotto il nome nell'header
  - Appare nella splash screen iniziale
  - Esempio: "La tua guida personale in Umbria"

### 🏠 Testi Homepage
- **Sottotitolo Benvenuto** (multilingua)
  - Appare nella homepage sotto il titolo principale
  - Esempio: "Benvenuti • Welcome • Bienvenue • Willkommen • Bienvenido"

### 📄 Footer
- **Copyright** - Nome dell'organizzazione
- **Anno** - Anno corrente

## Come Utilizzare

### 1. Accesso al Pannello Admin
1. Vai su `http://tuo-dominio.com/admin/login`
2. Effettua il login con le credenziali admin
3. Nel pannello admin, clicca sul tab **"🎨 Configurazione UI"**

### 2. Modifica dei Colori
1. Clicca su un color picker per selezionare un nuovo colore
2. Oppure inserisci manualmente il codice esadecimale (es. `#FF5733`)
3. Il campo di testo si sincronizza automaticamente con il color picker

### 3. Modifica del Branding
1. Inserisci il nuovo nome dell'app per ogni lingua
2. Inserisci il nuovo slogan per ogni lingua
3. Se lasci vuoto un campo, verrà usato il valore di default

### 4. Modifica dei Testi
1. Personalizza i testi della homepage per ogni lingua supportata
2. Aggiorna i testi del footer (copyright e anno)

### 5. Anteprima e Salvataggio
- **Anteprima** (`👁️ Anteprima`): Visualizza le modifiche temporaneamente senza salvarle
- **Salva e Applica** (`💾 Salva e Applica`): Salva definitivamente e applica le modifiche all'app
- **Ripristina Default** (`↩️ Ripristina Default`): Torna alle impostazioni originali

## Esempi di Utilizzo

### Esempio 1: Cambiare il Colore Principale
**Scenario**: Vuoi cambiare il colore verde principale in violetto

1. Vai in "Configurazione UI"
2. Clicca sul color picker "Colore Primario"
3. Seleziona un colore violetto (es. `#8B4789`)
4. Clicca "Salva e Applica"
5. L'app verrà ricaricata con il nuovo colore applicato ovunque:
   - Header
   - Bottoni
   - Icone
   - Sfumature
   - Ombre

### Esempio 2: Cambiare il Nome dell'App
**Scenario**: Vuoi rinominare l'app da "MyLyfe" a "My10"

1. Vai in "Configurazione UI"
2. Nella sezione "Branding", trova "Nome App"
3. Modifica tutti i campi lingua:
   - Italiano: `My10`
   - English: `My10`
   - Français: `My10`
   - Deutsch: `My10`
   - Español: `My10`
4. Clicca "Salva e Applica"
5. Il nome apparirà aggiornato nell'header dell'app

### Esempio 3: Personalizzare il Tema Completo
**Scenario**: Vuoi creare un tema personalizzato per un altro hotel

1. Modifica i colori principali per riflettere il brand del nuovo hotel
2. Cambia il nome dell'app con il nome dell'hotel
3. Aggiorna lo slogan con la descrizione appropriata
4. Personalizza i testi della homepage
5. Aggiorna il copyright nel footer
6. Clicca "Salva e Applica"

## Aspetti Tecnici

### Dove Vengono Salvate le Configurazioni
- Le configurazioni sono salvate in Firebase Firestore
- Collezione: `settings`
- Documento: `ui-config`
- Accesso: Lettura pubblica, scrittura solo admin

### Come Funziona l'Applicazione
1. **Caricamento**: Al caricamento dell'app, il servizio `uiConfigService` legge la configurazione da Firebase
2. **Applicazione CSS**: I colori vengono applicati come CSS custom properties (variabili CSS)
3. **Rendering**: I componenti leggono la configurazione e mostrano i valori personalizzati
4. **Aggiornamento**: Quando salvi, la configurazione viene scritta su Firebase e l'app si ricarica

### CSS Custom Properties
Il sistema utilizza le seguenti variabili CSS che puoi anche modificare direttamente nel CSS se necessario:

```css
--primary-color: Colore primario
--secondary-color: Colore secondario
--accent-color: Colore accento
--teal-color: Colore teal
--light-green: Verde chiaro
--bg-color: Colore sfondo
--shadow: Ombra (generata automaticamente dal colore primario)
--shadow-hover: Ombra hover (generata automaticamente)
```

### File Coinvolti
- `src/ui-config-service.js` - Servizio per gestire la configurazione
- `src/admin-panel.js` - Pannello admin con sezione configurazione
- `src/main.js` - Caricamento e applicazione configurazione all'avvio
- `src/splash.js` - Splash screen con branding e colori dinamici
- `src/components.js` - Componenti che usano la configurazione
- `src/pages.js` - Pagine che usano i testi personalizzati
- `src/style.css` - Stili per l'interfaccia di configurazione
- `firestore.rules` - Regole di sicurezza Firebase

### Elementi Personalizzati
Quando modifichi la configurazione, vengono aggiornati:
- ✅ **Splash Screen**: Nome app, tagline e colori del logo
- ✅ **Header**: Nome app e slogan
- ✅ **Homepage**: Testi di benvenuto
- ✅ **Footer**: Copyright e anno
- ✅ **Colori CSS**: Tutte le variabili CSS personalizzate
- ✅ **Gradienti**: Gradienti del logo e degli elementi UI

## Risoluzione Problemi

### La configurazione non si salva
- Verifica di essere loggato come admin
- Controlla la console del browser per errori Firebase
- Verifica che le regole Firestore siano deployate correttamente

### I colori non si applicano
- Assicurati di cliccare "Salva e Applica" e non solo "Anteprima"
- Ricarica la pagina manualmente se necessario
- Verifica che i codici colore siano in formato esadecimale corretto (#RRGGBB)

### I testi non cambiano
- Verifica di aver compilato tutti i campi per tutte le lingue
- Controlla che la lingua corrente nell'app corrisponda a quella modificata
- Ricarica l'app dopo il salvataggio

### Come ripristinare in caso di errori
- Usa il pulsante "Ripristina Default" nella sezione Configurazione UI
- Oppure elimina manualmente il documento `settings/ui-config` da Firebase Console
- L'app creerà automaticamente una nuova configurazione di default

## Best Practices

1. **Testa l'Anteprima**: Prima di salvare, usa sempre la funzione Anteprima
2. **Backup**: Annota i valori attuali prima di modifiche importanti
3. **Consistenza**: Mantieni la palette di colori coerente (contrasto, leggibilità)
4. **Multilingua**: Aggiorna sempre tutte le versioni linguistiche dei testi
5. **Accessibilità**: Verifica che i colori abbiano sufficiente contrasto per la leggibilità

## Sviluppi Futuri

Funzionalità che potrebbero essere aggiunte:
- Upload logo personalizzato
- Personalizzazione font
- Temi pre-configurati
- Import/Export configurazione
- Preview live side-by-side
- Gestione immagini di sfondo header
