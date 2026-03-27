// Componente UI per MyLyfe

import { i18n } from './i18n.js';
import { router } from './router.js';
import { getSectorIcon } from './icons.js';
import { uiConfigService } from './ui-config-service.js';
import { getVersion } from './version.js';
import { showInstallUI, isInstalled } from './pwa-utils.js';

// Crea il menu di navigazione principale - Material 3 card list
export function createMainMenu() {
  const nav = document.createElement('nav');
  nav.className = 'main-menu';
  
  const menuItems = [
    { route: '/home', sector: 'home', title: i18n.t('myHome'), desc: i18n.t('myHomeDesc') },
    { route: '/journey', sector: 'journey', title: i18n.t('myJourney'), desc: i18n.t('myJourneyDesc') },
    { route: '/taste', sector: 'taste', title: i18n.t('myTaste'), desc: i18n.t('myTasteDesc') },
    { route: '/events', sector: 'events', title: i18n.t('myEvents'), desc: i18n.t('myEventsDesc') },
    { route: '/specials', sector: 'specials', title: i18n.t('mySpecials'), desc: i18n.t('mySpecialsDesc') },
    { route: '/assistant', sector: 'contacts', title: 'Contacts', desc: i18n.t('myContactsDesc') }
  ];
  
  nav.innerHTML = `
    <div class="menu-card-list">
      ${menuItems.map(item => `
        <button class="menu-card-item" data-route="${item.route}" data-sector="${item.sector}">
          <div class="menu-card-icon">
            ${getSectorIcon(item.sector)}
          </div>
          <div class="menu-card-text">
            <span class="menu-card-title">${item.title}</span>
            <span class="menu-card-desc">${item.desc}</span>
          </div>
          <div class="menu-card-chevron">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="#88C39C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </button>
      `).join('')}
    </div>
  `;
  
  // Gestisci click sui menu
  nav.querySelectorAll('.menu-card-item').forEach(item => {
    item.addEventListener('click', () => {
      const route = item.dataset.route;
      router.navigate(route);
    });
  });
  
  return nav;
}

// Crea il selettore lingua - Material 3 compact
export function createLanguageSelector() {
  const selector = document.createElement('div');
  selector.className = 'language-selector';
  
  const languages = i18n.getAvailableLanguages();
  const currentLang = i18n.getCurrentLanguage();
  
  selector.innerHTML = `
    <button class="lang-button-m3" id="lang-toggle">
      ${currentLang.toUpperCase()}
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

// Crea header dell'app - Material 3 AppBar
export function createHeader() {
  const header = document.createElement('header');
  header.className = 'app-header';
  
  // Ottieni configurazione UI
  const config = uiConfigService.getConfig();
  const currentLang = i18n.getCurrentLanguage();
  
  // Ottieni nome app dalla configurazione
  const appName = config.branding?.appName?.[currentLang] || i18n.t('appName');
  
  header.innerHTML = `
    <div class="header-content">
      <div class="header-left">
        <button class="back-button" id="back-button" style="display: none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="app-brand" id="app-brand">
          <div class="app-logo-m3" id="app-logo">
            ${config.branding?.logoType === 'image' && config.branding?.logoUrl ? `
              <img src="${config.branding.logoUrl}" alt="Logo" class="logo-img-m3">
            ` : `
            <img src="/logo.svg" alt="Logo" class="logo-img-m3">
            `}
          </div>
          <span class="app-name-m3">${appName}</span>
        </div>
      </div>
      <div class="header-right" id="lang-selector-container" style="display:flex;align-items:center;gap:8px;">
        <button id="install-header-btn" title="Installa app" style="
          display: none;
          width: 40px; height: 40px;
          border-radius: 12px;
          background: #87a34d;
          border: none;
          color: white;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3v13M7 11l5 5 5-5"/>
            <path d="M5 21h14"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  
  // Aggiungi selettore lingua
  const langContainer = header.querySelector('#lang-selector-container');
  langContainer.appendChild(createLanguageSelector());

  // Pulsante installa PWA — visibile solo quando il prompt nativo è disponibile
  const installBtn = header.querySelector('#install-header-btn');
  // Mostra subito se l'evento era già stato catturato prima del modulo
  if (!isInstalled() && window.__deferredPrompt) {
    installBtn.style.display = 'flex';
  }
  installBtn.addEventListener('click', () => showInstallUI());
  window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
    window.__deferredPrompt = null;
  });
  window.addEventListener('beforeinstallprompt', () => {
    if (!isInstalled()) installBtn.style.display = 'flex';
  });

  // Gestisci bottone indietro
  const backButton = header.querySelector('#back-button');
  const appBrand = header.querySelector('#app-brand');
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
      } else if (currentRoute.startsWith('/specials/detail/')) {
        router.navigate('/specials');
      } else {
        router.navigate('/');
      }
    } else {
      // Altrimenti torna alla home
      router.navigate('/');
    }
  });
  
  // Mostra/nascondi bottone indietro e logo in base alla route (il titolo è sempre visibile)
  const appLogo = header.querySelector('#app-logo');
  router.onChange((route) => {
    const isHome = route === '/';
    backButton.style.display = isHome ? 'none' : 'flex';
    appBrand.style.display = 'flex';
    appLogo.style.display = isHome ? 'flex' : 'none';
  });
  
  return header;
}

/**
 * Crea filtro categorie orizzontale a badge per una sezione
 * @param {Array} items - lista elementi con campo categoria
 * @param {HTMLElement} cardsContainer - contenitore delle card da filtrare
 * @param {string} type - tipo sezione (journey|taste|events)
 */
export function createCategoryFilter(items, cardsContainer, type) {
  const wrapper = document.createElement('div');
  wrapper.className = 'category-filter';

  // Raccogli categorie uniche mantenendo l'ordine di apparizione
  const seen = new Set();
  const categories = [];
  items.forEach(item => {
    const cat = i18n.tm(item.categoria);
    if (cat && !seen.has(cat)) { seen.add(cat); categories.push(cat); }
  });

  if (categories.length < 2) return null; // Nessun filtro se una sola categoria

  let active = null; // null = Tutti

  const allBtn = document.createElement('button');
  allBtn.className = 'category-badge category-badge--active';
  allBtn.textContent = i18n.t('all') || 'Tutti';
  wrapper.appendChild(allBtn);

  const catBtns = categories.map(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-badge';
    btn.textContent = cat;
    wrapper.appendChild(btn);
    return { btn, cat };
  });

  const applyFilter = (selected) => {
    active = selected;
    allBtn.className = 'category-badge' + (selected === null ? ' category-badge--active' : '');
    catBtns.forEach(({ btn, cat }) => {
      btn.className = 'category-badge' + (cat === selected ? ' category-badge--active' : '');
    });
    Array.from(cardsContainer.children).forEach(card => {
      const cardCat = card.dataset.category;
      card.style.display = (!selected || cardCat === selected) ? '' : 'none';
    });
  };

  allBtn.addEventListener('click', () => applyFilter(null));
  catBtns.forEach(({ btn, cat }) => btn.addEventListener('click', () => applyFilter(cat)));

  return wrapper;
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
              ${i18n.t('openMap')}
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
            <span>${item.distanza}</span>
            ${item.durata ? `<span>${item.durata}</span>` : ''}
          </div>
        ` : ''}
        <div class="card-actions">
          ${item.mapsUrl ? `
            <a href="${item.mapsUrl}" target="_blank" class="btn btn-primary">
              ${i18n.t('openMap')}
            </a>
          ` : ''}
          ${item.pdfUrl ? `
            <a href="${item.pdfUrl}" target="_blank" class="btn btn-secondary" download>
              Scarica Guida PDF
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
              ${i18n.t('call')}
            </a>
          ` : ''}
          ${item.mapsUrl ? `
            <a href="${item.mapsUrl}" target="_blank" class="btn btn-primary">
              ${i18n.t('openMap')}
            </a>
          ` : ''}
          ${item.pdfUrl ? `
            <a href="${item.pdfUrl}" target="_blank" class="btn btn-secondary" download>
              Scarica Guida PDF
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
        ${eventDate ? `<p class="card-info">${i18n.t('eventDate')}: ${eventDate}</p>` : ''}
        ${eventTime ? `<p class="card-info">${i18n.t('eventTime')}: ${eventTime}</p>` : ''}
        ${item.luogoEvento ? `<p class="card-info">${i18n.t('eventLocation')}: ${item.luogoEvento}</p>` : ''}
        <div class="card-actions">
          ${item.mapsUrl ? `
            <a href="${item.mapsUrl}" target="_blank" class="btn btn-primary">
              ${i18n.t('openMap')}
            </a>
          ` : ''}
          ${item.sitoWeb ? `
            <a href="${item.sitoWeb}" target="_blank" class="btn btn-secondary">
              ${i18n.t('website')}
            </a>
          ` : ''}
        </div>
      </div>
    `;
  } else if (type === 'specials') {
    const validUntil = item.validoFino ? new Date(item.validoFino).toLocaleDateString(i18n.getCurrentLanguage()) : '';
    const prezzoHtml = item.prezzo
      ? (item.prezzoScontato
          ? `<p class="card-info"><span style="text-decoration:line-through;color:#aaa;margin-right:6px">${parseFloat(item.prezzo).toFixed(2)} €</span><span style="color:#87a34d;font-weight:700">${parseFloat(item.prezzoScontato).toFixed(2)} €</span></p>`
          : `<p class="card-info" style="font-weight:600">${parseFloat(item.prezzo).toFixed(2)} €</p>`)
      : '';
    card.innerHTML = `
      ${item.imgUrl ? `<img src="${item.imgUrl}" alt="${i18n.tm(item.titolo)}" class="card-image clickable">` : ''}
      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title clickable">${i18n.tm(item.titolo)}</h3>
          ${i18n.tm(item.categoria) ? `<span class="card-category">${i18n.tm(item.categoria)}</span>` : ''}
        </div>
        <p class="card-description">${i18n.tm(item.descrizione)}</p>
        ${item.sconto ? `<p class="card-info" style="color:#87a34d;font-weight:700">${i18n.t('specialDiscount')}: ${item.sconto}</p>` : (item.scontoPerc ? `<p class="card-info" style="color:#87a34d;font-weight:700">Sconto: ${item.scontoPerc}%</p>` : '')}
        ${prezzoHtml}
        ${validUntil ? `<p class="card-info">${i18n.t('specialValidUntil')}: ${validUntil}</p>` : ''}
        <div class="card-actions">
          ${item.mapsUrl ? `
            <a href="${item.mapsUrl}" target="_blank" class="btn btn-primary">
              ${i18n.t('openMap')}
            </a>
          ` : ''}
          ${item.sitoWeb ? `
            <a href="${item.sitoWeb}" target="_blank" class="btn btn-secondary">
              ${i18n.t('website')}
            </a>
          ` : ''}
        </div>
        ${item.prenotazioneAttiva ? `<div class="booking-btn-wrap booking-btn-card">
          <button class="btn-booking booking-card-btn" data-id="${item.id}">Visualizza l'offerta</button>
        </div>` : ''}
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

  // Booking card button — navigate to detail page
  if (type === 'specials' && item.prenotazioneAttiva) {
    const bookingCardBtn = card.querySelector('.booking-card-btn');
    if (bookingCardBtn) {
      bookingCardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        router.navigate(`/specials/detail/${item.id}`, { item, type });
      });
    }
  }

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
