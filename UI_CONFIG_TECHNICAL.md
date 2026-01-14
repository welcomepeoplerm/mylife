# Documentazione Tecnica - Sistema di Configurazione UI Dinamica

## Architettura

Il sistema di configurazione UI è composto da tre layer principali:

1. **Service Layer** (`ui-config-service.js`) - Gestisce il caricamento/salvataggio della configurazione
2. **Admin Panel** (`admin-panel.js`) - Interfaccia per modificare la configurazione
3. **Application Layer** (`main.js`, `components.js`, `pages.js`) - Applica la configurazione all'UI

## Struttura Dati

### Documento Firebase: `settings/ui-config`

```javascript
{
  colors: {
    primary: string,        // Hex color code
    secondary: string,
    accent: string,
    teal: string,
    lightGreen: string,
    background: string,
    cardBg: string,
    text: string,
    textLight: string,
    border: string
  },
  
  branding: {
    appName: {
      it: string,
      en: string,
      fr: string,
      de: string,
      es: string
    },
    appTagline: {
      it: string,
      en: string,
      fr: string,
      de: string,
      es: string
    },
    logoType: 'svg' | 'image',
    logoUrl: string | null,
    logoSvg: string | null
  },
  
  homeTexts: {
    welcomeTitle: {
      it: string,
      en: string,
      fr: string,
      de: string,
      es: string
    },
    welcomeSubtitle: {
      it: string,
      en: string,
      fr: string,
      de: string,
      es: string
    }
  },
  
  footer: {
    copyright: string,
    year: string,
    madeWith: {
      it: string,
      en: string,
      fr: string,
      de: string,
      es: string
    },
    for: {
      it: string,
      en: string,
      fr: string,
      de: string,
      es: string
    }
  }
}
```

## API del Servizio

### UIConfigService

#### Metodi Pubblici

```javascript
// Carica la configurazione da Firebase
async loadConfig(): Promise<Config>

// Salva la configurazione su Firebase
async saveConfig(config: Config): Promise<boolean>

// Ottiene la configurazione corrente (in memoria)
getConfig(): Config

// Applica i colori al CSS
applyColors(colors: Colors): void

// Upload logo personalizzato
async uploadLogo(file: File): Promise<string>

// Ottiene un testo tradotto
getText(category: string, key: string, lang: string): string

// Inizializza il servizio (carica e applica)
async initialize(): Promise<Config>
```

#### Utilizzo

```javascript
import { uiConfigService } from './ui-config-service.js';

// Inizializzazione (solitamente in main.js)
const config = await uiConfigService.initialize();

// Ottenere la configurazione corrente
const currentConfig = uiConfigService.getConfig();

// Applicare nuovi colori
uiConfigService.applyColors({
  primary: '#8B4789',
  secondary: '#56445d',
  // ... altri colori
});

// Salvare una nuova configurazione
await uiConfigService.saveConfig(newConfig);
```

## Integrazione nei Componenti

### Header (components.js)

```javascript
export function createHeader() {
  const config = uiConfigService.getConfig();
  const currentLang = i18n.getCurrentLanguage();
  
  const appName = config.branding?.appName?.[currentLang] || i18n.t('appName');
  const appTagline = config.branding?.appTagline?.[currentLang] || i18n.t('appTagline');
  
  // Usa appName e appTagline nel template
}
```

### Homepage (pages.js)

```javascript
export async function renderHomePage() {
  const config = uiConfigService.getConfig();
  const currentLang = i18n.getCurrentLanguage();
  
  const welcomeSubtitle = config.homeTexts?.welcomeSubtitle?.[currentLang] || 'Default text';
  
  // Usa welcomeSubtitle nel template
}
```

### Splash Screen (splash.js)

```javascript
export function createSplashScreen() {
  const config = uiConfigService.getConfig();
  const currentLang = i18n.getCurrentLanguage();
  
  // Ottieni nome app e tagline dalla configurazione
  const appName = config.branding?.appName?.[currentLang] || i18n.t('appName');
  const appTagline = config.branding?.appTagline?.[currentLang] || i18n.t('appTagline');
  
  // Ottieni colori dalla configurazione per logo SVG
  const primaryColor = config.colors?.primary || '#6da34d';
  const lightGreen = config.colors?.lightGreen || '#c5e99b';
  const accent = config.colors?.accent || '#8d9c71';
  
  // Usa valori nel template SVG e testi
}
```

## CSS Custom Properties

### Applicazione Dinamica

Il servizio modifica le variabili CSS al runtime:

```javascript
applyColors(colors) {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', colors.primary);
  root.style.setProperty('--secondary-color', colors.secondary);
  // ... altre proprietà
}
```

### Utilizzo nel CSS

```css
.button {
  background: var(--primary-color);
  color: white;
}

.card {
  background: var(--card-bg);
  box-shadow: var(--shadow);
}
```

## Pannello Admin

### Rendering della Sezione

La funzione `renderUIConfigSection()` in `admin-panel.js` genera il form di configurazione:

```javascript
async function renderUIConfigSection() {
  const config = await uiConfigService.loadConfig();
  
  // Genera form con valori correnti
  // Gestisce input per colori, testi multilingua, ecc.
  
  return container;
}
```

### Salvataggio

```javascript
async function saveUIConfig(form) {
  const formData = new FormData(form);
  
  // Costruisci oggetto config dai dati del form
  const config = {
    colors: { /* ... */ },
    branding: { /* ... */ },
    homeTexts: { /* ... */ },
    footer: { /* ... */ }
  };
  
  await uiConfigService.saveConfig(config);
  uiConfigService.applyColors(config.colors);
  
  // Ricarica per applicare tutte le modifiche
  window.location.reload();
}
```

## Sicurezza Firebase

### Firestore Rules

```javascript
match /settings/{document} {
  allow read: if true;  // Pubblico
  allow write: if isAdmin();  // Solo admin
}

function isAdmin() {
  return request.auth != null && 
         request.auth.token.email.matches('.*@admin\\..*') ||
         exists(/databases/$(database)/documents/admins/$(request.auth.uid));
}
```

### Storage Rules (per futuri upload logo)

```javascript
match /config/{filename} {
  allow read: if true;
  allow write: if request.auth != null && isAdmin();
}
```

## Flow di Esecuzione

### 1. Caricamento Applicazione

```
DOMContentLoaded
  ↓
uiConfigService.initialize()
  ├─ loadConfig() → Firebase
  └─ applyColors()
  ↓
showInitialSplash()
  ├─ createSplashScreen() → usa config (nome, tagline, colori)
  └─ mostra splash per 5 secondi
  ↓
createHeader() → usa config
  ↓
renderHomePage() → usa config
  ↓
App pronta
```

### 2. Modifica Configurazione

```
Admin apre sezione UI Config
  ↓
renderUIConfigSection()
  ├─ loadConfig()
  └─ mostra form
  ↓
Admin modifica valori
  ↓
Click "Anteprima"
  └─ previewUIConfig() → applica temporaneamente
  ↓
Click "Salva e Applica"
  ├─ saveUIConfig()
  ├─ saveConfig() → Firebase
  ├─ applyColors()
  └─ window.location.reload()
  ↓
App ricaricata con nuova config
```

## Estensione del Sistema

### Aggiungere Nuovi Parametri

1. **Aggiorna `defaultConfig` in `ui-config-service.js`**

```javascript
defaultConfig = {
  // ... esistenti
  newSection: {
    newParam: 'default value'
  }
}
```

2. **Aggiungi UI nel pannello admin**

```javascript
async function renderUIConfigSection() {
  // ... esistente
  
  container.innerHTML = `
    <!-- ... esistente -->
    
    <div class="config-section">
      <h4>Nuova Sezione</h4>
      <input type="text" name="new-param" value="${config.newSection.newParam}">
    </div>
  `;
}
```

3. **Gestisci nel salvataggio**

```javascript
async function saveUIConfig(form) {
  const config = {
    // ... esistenti
    newSection: {
      newParam: formData.get('new-param')
    }
  };
}
```

4. **Usa nei componenti**

```javascript
const newParam = uiConfigService.getConfig().newSection?.newParam || 'default';
```

### Aggiungere Upload Logo

Il servizio ha già il metodo `uploadLogo()`. Per integrarlo:

1. **Aggiungi input file nel form admin**
2. **Gestisci upload nel submit**
3. **Salva URL nel config**
4. **Usa URL nell'header**

## Testing

### Test Manuale

1. Apri `/admin/login`
2. Accedi come admin
3. Vai in "Configurazione UI"
4. Modifica ogni sezione
5. Verifica anteprima
6. Salva e verifica applicazione
7. Ricarica e verifica persistenza

### Test Colori

```javascript
// Console del browser
const testColors = {
  primary: '#FF0000',
  secondary: '#00FF00',
  accent: '#0000FF',
  teal: '#FF00FF',
  lightGreen: '#FFFF00',
  background: '#000000',
  cardBg: '#FFFFFF',
  text: '#333333',
  textLight: '#999999',
  border: '#EEEEEE'
};

uiConfigService.applyColors(testColors);
```

### Debug

```javascript
// Visualizza config corrente
console.log(uiConfigService.getConfig());

// Forza ricaricamento
await uiConfigService.loadConfig();

// Test salvataggio
await uiConfigService.saveConfig(uiConfigService.defaultConfig);
```

## Performance

### Ottimizzazioni

1. **Caching**: La configurazione è caricata una volta all'avvio
2. **CSS Variables**: Cambio colori istantaneo senza re-render
3. **Lazy Loading**: Il pannello admin è caricato solo quando necessario

### Considerazioni

- La configurazione è ~2-5KB di dati
- Caricamento iniziale: +50-100ms
- Cambio colori: istantaneo
- Salvataggio: ~200-500ms (Firebase)

## Troubleshooting

### Problema: Configurazione non si carica

**Causa**: Errore Firebase o documento mancante

**Soluzione**:
```javascript
// Crea manualmente documento
await uiConfigService.saveConfig(uiConfigService.defaultConfig);
```

### Problema: Colori non si applicano

**Causa**: Ordine di caricamento o timing

**Soluzione**: Assicurati che `initialize()` sia chiamato prima di `createHeader()`

### Problema: Testi non cambiano

**Causa**: Cache del browser o fallback a i18n

**Soluzione**: Hard refresh (Ctrl+Shift+R) o verifica fallback:
```javascript
const text = config.branding?.appName?.[lang] || i18n.t('appName');
```

## Deployment

### Checklist Deploy

- [ ] Deploy regole Firestore: `firebase deploy --only firestore:rules`
- [ ] Verifica accesso admin configurato
- [ ] Test su produzione
- [ ] Backup configurazione esistente
- [ ] Documenta colori/testi custom per il cliente

### Firebase Deploy

```bash
# Solo regole Firestore
firebase deploy --only firestore:rules

# Solo regole Storage (se necessario)
firebase deploy --only storage:rules

# Deploy completo
firebase deploy
```

## Manutenzione

### Backup Configurazione

```javascript
// Da console Firebase o script
const config = await uiConfigService.loadConfig();
console.log(JSON.stringify(config, null, 2));
// Copia e salva in file
```

### Restore Configurazione

```javascript
// Da script o console admin
const backupConfig = { /* ... */ };
await uiConfigService.saveConfig(backupConfig);
```

### Migration

Se la struttura cambia, crea script di migrazione:

```javascript
async function migrateConfig() {
  const oldConfig = await uiConfigService.loadConfig();
  const newConfig = {
    ...oldConfig,
    newField: 'default value'
  };
  await uiConfigService.saveConfig(newConfig);
}
```
