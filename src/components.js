// Componente UI per MyLyfe

import { i18n } from './i18n.js';
import { router } from './router.js';
import { getSectorIcon } from './icons.js';
import { uiConfigService } from './ui-config-service.js';
import { getVersion } from './version.js';

// Crea il menu di navigazione principale
export function createMainMenu() {
  const nav = document.createElement('nav');
  nav.className = 'main-menu';
  nav.innerHTML = `
    <div class="menu-grid">
      <button class="menu-item" data-route="/home" data-sector="home">
        <div class="menu-icon-wrapper">
          ${getSectorIcon('home')}
        </div>
        <span class="menu-title">${i18n.t('myHome')}</span>
        <span class="menu-desc">${i18n.t('myHomeDesc')}</span>
      </button>
      
      <button class="menu-item" data-route="/journey" data-sector="journey">
        <div class="menu-icon-wrapper">
          ${getSectorIcon('journey')}
        </div>
        <span class="menu-title">${i18n.t('myJourney')}</span>
        <span class="menu-desc">${i18n.t('myJourneyDesc')}</span>
      </button>
      
      <button class="menu-item" data-route="/taste" data-sector="taste">
        <div class="menu-icon-wrapper">
          ${getSectorIcon('taste')}
        </div>
        <span class="menu-title">${i18n.t('myTaste')}</span>
        <span class="menu-desc">${i18n.t('myTasteDesc')}</span>
      </button>
      
      <button class="menu-item" data-route="/events" data-sector="events">
        <div class="menu-icon-wrapper">
          ${getSectorIcon('events')}
        </div>
        <span class="menu-title">${i18n.t('myEvents')}</span>
        <span class="menu-desc">${i18n.t('myEventsDesc')}</span>
      </button>
      
      <button class="menu-item" data-route="/assistant" data-sector="contacts">
        <div class="menu-icon-wrapper">
          ${getSectorIcon('contacts')}
        </div>
        <span class="menu-title">MyContacts</span>
        <span class="menu-desc">${i18n.t('myContactsDesc')}</span>
      </button>
    </div>
  `;
  
  // Gestisci click sui menu
  nav.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const route = item.dataset.route;
      router.navigate(route);
    });
  });
  
  return nav;
}

// Crea il selettore lingua
export function createLanguageSelector() {
  const selector = document.createElement('div');
  selector.className = 'language-selector';
  
  const languages = i18n.getAvailableLanguages();
  const currentLang = i18n.getCurrentLanguage();
  
  selector.innerHTML = `
    <button class="lang-button" id="lang-toggle">
      ${languages.find(l => l.code === currentLang)?.flag} ${currentLang.toUpperCase()}
    </button>
    <div class="lang-dropdown" id="lang-dropdown">
      ${languages.map(lang => `
        <button class="lang-option ${lang.code === currentLang ? 'active' : ''}" 
                data-lang="${lang.code}">
          ${lang.flag} ${lang.name}
        </button>
      `).join('')}
    </div>
  `;
  
  // Toggle dropdown
  const toggle = selector.querySelector('#lang-toggle');
  const dropdown = selector.querySelector('#lang-dropdown');
  
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });
  
  // Chiudi dropdown quando si clicca fuori
  document.addEventListener('click', () => {
    dropdown.classList.remove('show');
  });
  
  // Gestisci cambio lingua
  selector.querySelectorAll('.lang-option').forEach(option => {
    option.addEventListener('click', () => {
      const lang = option.dataset.lang;
      i18n.setLanguage(lang);
      window.location.reload(); // Ricarica per applicare le traduzioni
    });
  });
  
  return selector;
}

// Crea header dell'app
export function createHeader() {
  const header = document.createElement('header');
  header.className = 'app-header';
  
  // Ottieni configurazione UI
  const config = uiConfigService.getConfig();
  const currentLang = i18n.getCurrentLanguage();
  
  // Ottieni nome app e tagline dalla configurazione
  const appName = config.branding?.appName?.[currentLang] || i18n.t('appName');
  const appTagline = config.branding?.appTagline?.[currentLang] || i18n.t('appTagline');
  
  // Verifica se c'è un'immagine di sfondo personalizzata
  const headerBgUrl = config.branding?.headerBackgroundUrl;
  const headerBgStyle = headerBgUrl 
    ? `background: url('${headerBgUrl}') center/cover no-repeat;` 
    : '';
  
  header.innerHTML = `
    <div class="header-content">
      <div class="header-left">
        <button class="back-button" id="back-button" style="display: none;">
          ← ${i18n.t('back')}
        </button>
      </div>
      <div class="header-center has-bg" style="${headerBgStyle}">
        <div class="title-row" style="display: flex; align-items: center; justify-content: center; gap: 15px;">
          <div class="app-logo">
            ${config.branding.logoType === 'image' && config.branding.logoUrl ? `
              <img src="${config.branding.logoUrl}" alt="Logo" style="width: 80px; height: 80px; object-fit: contain; border-radius: 8px;">
            ` : `
            <svg viewBox="0 0 200 200" class="logo-svg" style="width: 80px; height: 80px;">
              <defs>
                <linearGradient id="logoGradientHeader" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="95" fill="rgba(255,255,255,0.2)"/>
              <circle cx="100" cy="100" r="85" fill="rgba(255,255,255,0.1)"/>
              <path d="M 30 130 L 60 80 L 90 130 Z" fill="white" opacity="0.9"/>
              <path d="M 70 130 L 100 70 L 130 130 Z" fill="white"/>
              <path d="M 110 130 L 140 90 L 170 130 Z" fill="white" opacity="0.9"/>
              <circle cx="150" cy="60" r="18" fill="#ffd700"/>
              <path d="M 20 140 Q 50 135 80 140 T 140 140 T 180 140 L 180 160 L 20 160 Z" fill="white" opacity="0.6"/>
            </svg>
            `}
          </div>
          <div class="title-text">
            <h1 class="app-title">${appName} <span style="font-size: 0.5em; opacity: 0.7;">v${getVersion()}</span></h1>
            <p class="app-tagline">${appTagline}</p>
          </div>
        </div>
      </div>
      <div class="header-right" id="lang-selector-container">
      </div>
    </div>
  `;
  
  // Aggiungi selettore lingua
  const langContainer = header.querySelector('#lang-selector-container');
  langContainer.appendChild(createLanguageSelector());
  
  // Gestisci bottone indietro
  const backButton = header.querySelector('#back-button');
  backButton.addEventListener('click', () => {
    const currentRoute = router.getCurrentRoute();
    
    // Se siamo in una pagina di dettaglio, torna alla lista della sezione
    if (currentRoute.includes('/detail/')) {
      if (currentRoute.startsWith('/home/detail/')) {
        router.navigate('/home');
      } else if (currentRoute.startsWith('/journey/detail/')) {
        router.navigate('/journey');
      } else if (currentRoute.startsWith('/taste/detail/')) {
        router.navigate('/taste');
      } else if (currentRoute.startsWith('/events/detail/')) {
        router.navigate('/events');
      } else {
        router.navigate('/');
      }
    } else {
      // Altrimenti torna alla home
      router.navigate('/');
    }
  });
  
  // Mostra/nascondi bottone indietro in base alla route
  router.onChange((route) => {
    backButton.style.display = route === '/' ? 'none' : 'inline-block';
  });
  
  return header;
}

// Crea card per elementi (My Home, My Journey, My Taste)
export function createCard(item, type = 'default') {
  const card = document.createElement('div');
  card.className = 'content-card';
  
  if (type === 'home') {
    card.innerHTML = `
      ${item.imgUrl ? `<img src="${item.imgUrl}" alt="${i18n.tm(item.titolo)}" class="card-image clickable">` : `<div class="card-icon">${getIcon(item.icona || 'info')}</div>`}
      <div class="card-content">
        <h3 class="card-title clickable">${i18n.tm(item.titolo)}</h3>
        <p class="card-description">${i18n.tm(item.descrizione)}</p>
        <div class="card-actions">
          ${item.mapsUrl ? `
            <a href="${item.mapsUrl}" target="_blank" class="btn btn-primary">
              🗺️ ${i18n.t('openMap')}
            </a>
          ` : ''}
          ${item.downloadUrl ? `
            <a href="${item.downloadUrl}" class="card-link" download>
              📄 ${i18n.tm(item.downloadLabel) || i18n.t('download')}
            </a>
          ` : ''}
        </div>
      </div>
    `;
  } else if (type === 'journey') {
    card.innerHTML = `
      ${item.imgUrl ? `<img src="${item.imgUrl}" alt="${i18n.tm(item.titolo)}" class="card-image clickable">` : ''}
      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title clickable">${i18n.tm(item.titolo)}</h3>
          <span class="card-category">${i18n.tm(item.categoria)}</span>
        </div>
        <p class="card-description">${i18n.tm(item.descrizione)}</p>
        ${item.distanza ? `
          <div class="card-info">
            <span>📍 ${item.distanza}</span>
            ${item.durata ? `<span>⏱️ ${item.durata}</span>` : ''}
          </div>
        ` : ''}
        <div class="card-actions">
          ${item.mapsUrl ? `
            <a href="${item.mapsUrl}" target="_blank" class="btn btn-primary">
              🗺️ ${i18n.t('openMap')}
            </a>
          ` : ''}
          ${item.pdfUrl ? `
            <a href="${item.pdfUrl}" target="_blank" class="btn btn-secondary" download>
              📄 Scarica Guida PDF
            </a>
          ` : ''}
        </div>
      </div>
    `;
  } else if (type === 'taste') {
    card.innerHTML = `
      ${item.imgUrl ? `<img src="${item.imgUrl}" alt="${i18n.tm(item.titolo)}" class="card-image clickable">` : ''}
      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title clickable">${i18n.tm(item.titolo)}</h3>
          <span class="card-category">${i18n.tm(item.categoria)}</span>
        </div>
        ${item.tipoCucina ? `<p class="card-cuisine">${i18n.tm(item.tipoCucina)}</p>` : ''}
        <p class="card-description">${i18n.tm(item.descrizione)}</p>
        ${item.prezzoMedio ? `<p class="card-price">${i18n.tm(item.prezzoMedio)}</p>` : ''}
        <div class="card-actions">
          ${item.telefono ? `
            <a href="tel:${item.telefono}" class="btn btn-secondary">
              📞 ${i18n.t('call')}
            </a>
          ` : ''}
          ${item.mapsUrl ? `
            <a href="${item.mapsUrl}" target="_blank" class="btn btn-primary">
              🗺️ ${i18n.t('openMap')}
            </a>
          ` : ''}
          ${item.pdfUrl ? `
            <a href="${item.pdfUrl}" target="_blank" class="btn btn-secondary" download>
              📄 Scarica Guida PDF
            </a>
          ` : ''}
        </div>
      </div>
    `;
  } else if (type === 'events') {
    // Formatta data e ora
    const eventDate = item.dataEvento ? new Date(item.dataEvento).toLocaleDateString(i18n.getCurrentLanguage()) : '';
    const eventTime = item.oraEvento || '';
    
    card.innerHTML = `
      ${item.imgUrl ? `<img src="${item.imgUrl}" alt="${i18n.tm(item.titolo)}" class="card-image clickable">` : ''}
      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title clickable">${i18n.tm(item.titolo)}</h3>
          <span class="card-category">${i18n.tm(item.categoria)}</span>
        </div>
        <p class="card-description">${i18n.tm(item.descrizione)}</p>
        ${eventDate ? `<p class="card-info">📅 ${i18n.t('eventDate')}: ${eventDate}</p>` : ''}
        ${eventTime ? `<p class="card-info">🕐 ${i18n.t('eventTime')}: ${eventTime}</p>` : ''}
        ${item.luogoEvento ? `<p class="card-info">📍 ${i18n.t('eventLocation')}: ${item.luogoEvento}</p>` : ''}
        <div class="card-actions">
          ${item.mapsUrl ? `
            <a href="${item.mapsUrl}" target="_blank" class="btn btn-primary">
              🗺️ ${i18n.t('openMap')}
            </a>
          ` : ''}
          ${item.sitoWeb ? `
            <a href="${item.sitoWeb}" target="_blank" class="btn btn-secondary">
              🌐 ${i18n.t('website')}
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  // Aggiungi click handler per navigare al dettaglio
  const clickableElements = card.querySelectorAll('.clickable');
  clickableElements.forEach(el => {
    el.addEventListener('click', () => {
      router.navigate(`/${type}/detail/${item.id}`, { item, type });
    });
  });
  
  return card;
}

// Ottieni icona emoji o SVG in base al nome
function getIcon(iconName) {
  // Mappa nomi delle icone
  const iconMap = {
    wifi: 'wifi',
    pool: 'pool',
    key: 'home',
    info: 'home',
    home: 'home',
    phone: 'assistant',
    email: 'assistant',
    clock: 'home',
    star: 'journey',
    map: 'journey',
    restaurant: 'restaurant',
    wine: 'taste',
    monument: 'monument',
    nature: 'nature'
  };
  
  const svgIcon = iconMap[iconName];
  if (svgIcon && getSectorIcon(svgIcon)) {
    return `<div class="icon-wrapper" style="width: 60px; height: 60px;">${getSectorIcon(svgIcon)}</div>`;
  }
  
  // Fallback alle emoji
  const icons = {
    wifi: '📶',
    pool: '🏊',
    key: '🔑',
    info: 'ℹ️',
    home: '🏠',
    phone: '📞',
    email: '📧',
    clock: '⏰',
    star: '⭐',
    map: '🗺️',
    restaurant: '🍽️',
    wine: '🍷'
  };
  return icons[iconName] || icons.info;
}

// Crea loading spinner
export function createLoader() {
  const loader = document.createElement('div');
  loader.className = 'loader';
  loader.innerHTML = `
    <div class="spinner"></div>
    <p>${i18n.t('loading')}</p>
  `;
  return loader;
}

// Crea messaggio di errore
export function createError(message) {
  const error = document.createElement('div');
  error.className = 'error-message';
  error.innerHTML = `
    <div class="error-icon">⚠️</div>
    <p>${message || i18n.t('errorLoading')}</p>
    <button class="btn btn-primary" onclick="window.location.reload()">
      ${i18n.t('retry')}
    </button>
  `;
  return error;
}

// Crea container vuoto per contenuto
export function createContainer() {
  const container = document.createElement('div');
  container.className = 'page-container';
  return container;
}
