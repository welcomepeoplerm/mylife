// Pannello Admin - MyLyfe
import './admin-fluent.css';
import { i18n } from './i18n.js';
import { authService } from './auth-service.js';
import { router } from './router.js';
import { firebaseService } from './firebase-service.js';
import { uiConfigService } from './ui-config-service.js';
import { getVersion } from './version.js';
import { sendNotificationForNewEvent } from './admin-notification-service.js';
import { getRecentSessions, getStatsKpi, deleteAllStats } from './app-stats-service.js';
import { db, storage } from './firebase-config.js';
import { doc, setDoc, deleteDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Cache per categorie
let categoriesCache = {
  journey: {},
  taste: {},
  events: {}
};

// Ottieni tutte le categorie esistenti per una collezione
async function getExistingCategories(collectionName) {
  // Controlla cache
  if (categoriesCache[collectionName] && Object.keys(categoriesCache[collectionName]).length > 0) {
    return categoriesCache[collectionName];
  }
  
  const categories = {};
  const languages = ['it', 'en', 'fr', 'de', 'es'];
  
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.categoria) {
        languages.forEach(lang => {
          if (data.categoria[lang]) {
            const cat = data.categoria[lang].trim();
            if (cat) {
              if (!categories[lang]) {
                categories[lang] = new Set();
              }
              categories[lang].add(cat);
            }
          }
        });
      }
    });
    
    // Converti Set in Array
    languages.forEach(lang => {
      if (categories[lang]) {
        categories[lang] = Array.from(categories[lang]).sort();
      } else {
        categories[lang] = [];
      }
    });
    
    // Salva in cache
    categoriesCache[collectionName] = categories;
    
  } catch (error) {
    console.error('Errore recupero categorie:', error);
    languages.forEach(lang => {
      categories[lang] = [];
    });
  }
  
  return categories;
}

// Invalida cache categorie
function invalidateCategoriesCache(collectionName) {
  categoriesCache[collectionName] = {};
}

// Elimina una categoria da tutti i documenti
async function deleteCategoryFromAll(collectionName, lang, categoryValue) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const batch = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      // Controlla se questo documento usa la categoria da eliminare
      if (data.categoria && data.categoria[lang] === categoryValue) {
        // Rimuovi solo questa lingua dalla categoria
        const updatedCategoria = { ...data.categoria };
        delete updatedCategoria[lang];
        
        // Se la categoria è vuota in tutte le lingue, rimuovi il campo
        const hasOtherLangs = Object.keys(updatedCategoria).length > 0;
        
        if (hasOtherLangs) {
          batch.push(
            updateDoc(doc(db, collectionName, docSnap.id), {
              [`categoria.${lang}`]: ''
            })
          );
        } else {
          batch.push(
            updateDoc(doc(db, collectionName, docSnap.id), {
              categoria: {}
            })
          );
        }
      }
    });
    
    // Esegui tutti gli aggiornamenti
    await Promise.all(batch);
    
    // Invalida cache
    invalidateCategoriesCache(collectionName);
    
    // Ricarica la pagina admin per mostrare i cambiamenti
    const contentArea = document.querySelector('#admin-content');
    if (contentArea) {
      const activeBtn = document.querySelector('.fl-sidebar-item.active');
      if (activeBtn) {
        const section = activeBtn.dataset.section;
        contentArea.innerHTML = '<div class="fl-loader"><div class="fl-spinner"></div> Caricamento...</div>';
        const sectionContent = await renderAdminSection(section);
        contentArea.innerHTML = '';
        contentArea.appendChild(sectionContent);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Errore eliminazione categoria:', error);
    throw error;
  }
}

// Dashboard Admin (Fluent UI 2 Design)
export async function renderAdminDashboard() {
  const container = document.createElement('div');
  container.className = 'fl-admin-root';

  const user = authService.getCurrentUser();
  const initials = (user.email || 'A').substring(0, 2).toUpperCase();

  const navItems = [
    { section: 'dashboard', icon: '<i class="ph ph-squares-four"></i>', label: 'Dashboard' },
    { section: 'home',      icon: '<i class="ph ph-house"></i>',        label: 'My Home' },
    { section: 'journey',   icon: '<i class="ph ph-map-trifold"></i>',  label: 'My Journey' },
    { section: 'taste',     icon: '<i class="ph ph-fork-knife"></i>',   label: 'My Taste' },
    { section: 'events',    icon: '<i class="ph ph-calendar-dots"></i>',label: 'My Events' },
    { section: 'divider' },
    { section: 'stats',     icon: '<i class="ph ph-chart-bar"></i>',    label: 'Statistiche App' },
    { section: 'ui-config', icon: '<i class="ph ph-sliders"></i>',      label: 'Configurazione UI' },
  ];

  container.innerHTML = `
    <!-- Top bar -->
    <header class="fl-admin-topbar">
      <div class="fl-topbar-brand">
        <div class="fl-topbar-icon"><i class="ph ph-leaf"></i></div>
        <span class="fl-topbar-title">MyLyfe Umbria</span>
        <span class="fl-topbar-version">v${getVersion()}</span>
      </div>
      <div class="fl-topbar-right">
        <button class="fl-button fl-button-sm fl-topbar-logout" id="logout-btn"><i class="ph ph-sign-out"></i> Esci</button>
      </div>
    </header>

    <!-- Shell: sidebar + main -->
    <div class="fl-admin-shell">

      <!-- Sidebar -->
      <nav class="fl-sidebar">
        <div class="fl-sidebar-nav">
          ${navItems.map((item, i) => {
            if (item.section === 'divider') return '<div class="fl-sidebar-divider"></div>';
            const isFirst = item.section === 'dashboard';
            return `<button class="fl-sidebar-item${isFirst ? ' active' : ''}" data-section="${item.section}">
              <span class="fl-sidebar-icon">${item.icon}</span>
              <span>${item.label}</span>
            </button>`;
          }).join('')}
        </div>

        <div class="fl-sidebar-footer">
          <div class="fl-user-avatar">${initials}</div>
          <span class="fl-user-email">${user.email}</span>
        </div>
      </nav>

      <!-- Main content -->
      <div class="fl-admin-main">
        <div id="admin-content" class="fl-admin-content">
          <div class="fl-loader"><div class="fl-spinner"></div> Caricamento...</div>
        </div>
      </div>

    </div>
  `;

  // Logout
  container.querySelector('#logout-btn').addEventListener('click', async () => {
    await authService.logout();
    router.navigate('/admin/login');
  });

  // Navigazione sezioni (Sidebar)
  const sidebarItems = container.querySelectorAll('.fl-sidebar-item');
  const contentArea = container.querySelector('#admin-content');

  sidebarItems.forEach(btn => {
    btn.addEventListener('click', async () => {
      sidebarItems.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const section = btn.dataset.section;
      contentArea.innerHTML = '<div class="fl-loader"><div class="fl-spinner"></div> Caricamento...</div>';

      const sectionContent = await renderAdminSection(section);
      contentArea.innerHTML = '';
      contentArea.appendChild(sectionContent);
    });
  });

  // Carica dashboard iniziale
  const initialSection = await renderAdminSection('dashboard');
  contentArea.innerHTML = '';
  contentArea.appendChild(initialSection);

  return container;
}

// ─────────────────────────────────────────────────────────
// STATISTICHE APP
// ─────────────────────────────────────────────────────────
async function renderStatsSection() {
  const wrap = document.createElement('div');
  wrap.className = 'fl-dashboard';

  // Header sezione
  const hdr = document.createElement('div');
  hdr.className = 'fl-stats-header';
  hdr.innerHTML = `
    <div>
      <h2 class="fl-section-title"><i class="ph ph-chart-bar"></i> Statistiche App</h2>
      <p class="fl-section-subtitle">Solo accessi dall'app &mdash; sessioni backoffice escluse</p>
    </div>
    <div style="display:flex;gap:var(--fl-sp-2)">
      <button class="fl-button fl-button-secondary fl-button-sm" id="stats-refresh-btn">
        <i class="ph ph-arrow-clockwise"></i> Aggiorna
      </button>
      <button class="fl-button fl-button-danger fl-button-sm" id="stats-reset-btn">
        <i class="ph ph-trash"></i> Reset
      </button>
    </div>
  `;
  hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:var(--fl-sp-4)';
  wrap.appendChild(hdr);

  // Refresh handler
  hdr.querySelector('#stats-refresh-btn').addEventListener('click', async () => {
    const adminContent = document.querySelector('#admin-content');
    if (adminContent) {
      adminContent.innerHTML = '<div class="fl-loader"><div class="fl-spinner"></div> Caricamento...</div>';
      const fresh = await renderStatsSection();
      adminContent.innerHTML = '';
      adminContent.appendChild(fresh);
    }
  });

  // Reset handler
  hdr.querySelector('#stats-reset-btn').addEventListener('click', async () => {
    if (!confirm('Eliminare TUTTE le statistiche? L\'operazione non è reversibile.')) return;
    const btn = hdr.querySelector('#stats-reset-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="fl-spinner" style="width:14px;height:14px;border-width:2px"></span> Eliminazione...';
    try {
      await deleteAllStats();
      // Ricarica la sezione
      const adminContent = document.querySelector('#admin-content');
      if (adminContent) {
        adminContent.innerHTML = '<div class="fl-loader"><div class="fl-spinner"></div> Caricamento...</div>';
        const fresh = await renderStatsSection();
        adminContent.innerHTML = '';
        adminContent.appendChild(fresh);
      }
    } catch (err) {
      alert('Errore reset: ' + err.message);
      btn.disabled = false;
      btn.innerHTML = '<i class="ph ph-trash"></i> Reset statistiche';
    }
  });

  // KPI skeleton
  const kpiWrap = document.createElement('div');
  kpiWrap.className = 'fl-kpi-grid fl-stats-kpi';
  const kpiDefs = [
    { key: 'total',               icon: 'ph-activity',         label: 'Sessioni totali',       color: '#6da34d' },
    { key: 'uniqueDevices',       icon: 'ph-devices',          label: 'Dispositivi unici',     color: '#548687' },
    { key: 'firstVisits',         icon: 'ph-user-plus',        label: 'Prime installazioni',   color: '#5b7ec9' },
    { key: 'pwaInstalls',         icon: 'ph-app-window',       label: 'Installazioni PWA',     color: '#c97c3a' },
    { key: 'todaySessions',       icon: 'ph-calendar-check',   label: 'Sessioni oggi',         color: '#9b59b6' },
    { key: 'notificationClicks',  icon: 'ph-bell-ringing',     label: 'Click su notifiche',   color: '#e74c8b' },
  ];
  kpiDefs.forEach(k => {
    const card = document.createElement('div');
    card.className = 'fl-kpi-card fl-kpi-card-loading';
    card.id = `stat-kpi-${k.key}`;
    card.innerHTML = `
      <div class="fl-kpi-card-top">
        <div class="fl-kpi-icon" style="background:${k.color}18"><i class="ph ${k.icon}" style="color:${k.color}"></i></div>
      </div>
      <div class="fl-kpi-value" style="color:${k.color}">–</div>
      <div class="fl-kpi-label">${k.label}</div>
    `;
    kpiWrap.appendChild(card);
  });
  wrap.appendChild(kpiWrap);

  // Distribuzioni (placeholder)
  const distRow = document.createElement('div');
  distRow.className = 'fl-stats-dist-row';
  distRow.innerHTML = `
    <div class="fl-activity-card" id="dist-platform">
      <div class="fl-activity-header"><i class="ph ph-devices"></i> Per piattaforma</div>
      <div class="fl-activity-body"><div class="fl-loader"><div class="fl-spinner"></div></div></div>
    </div>
    <div class="fl-activity-card" id="dist-browser">
      <div class="fl-activity-header"><i class="ph ph-globe"></i> Per browser</div>
      <div class="fl-activity-body"><div class="fl-loader"><div class="fl-spinner"></div></div></div>
    </div>
    <div class="fl-activity-card" id="dist-device">
      <div class="fl-activity-header"><i class="ph ph-device-mobile"></i> Per tipo dispositivo</div>
      <div class="fl-activity-body"><div class="fl-loader"><div class="fl-spinner"></div></div></div>
    </div>
    <div class="fl-activity-card" id="dist-pwa-device">
      <div class="fl-activity-header"><i class="ph ph-app-window"></i> Installazioni PWA per dispositivo</div>
      <div class="fl-activity-body"><div class="fl-loader"><div class="fl-spinner"></div></div></div>
    </div>
    <div class="fl-activity-card" id="dist-notification">
      <div class="fl-activity-header"><i class="ph ph-bell-ringing"></i> Click per notifica</div>
      <div class="fl-activity-body"><div class="fl-loader"><div class="fl-spinner"></div></div></div>
    </div>
  `;
  wrap.appendChild(distRow);

  // Tabella sessioni recenti
  const tableCard = document.createElement('div');
  tableCard.className = 'fl-section';
  tableCard.innerHTML = `
    <div class="fl-section-header">
      <div>
        <h3 class="fl-section-title">Sessioni recenti</h3>
        <p class="fl-section-subtitle">Ultime 200 sessioni registrate</p>
      </div>
    </div>
    <div class="fl-data-grid fl-stats-grid">
      <div class="fl-grid-head fl-stats-grid-head">
        <div class="fl-grid-th">Data / Ora</div>
        <div class="fl-grid-th">Tipo evento</div>
        <div class="fl-grid-th">Piattaforma / Titolo notifica</div>
        <div class="fl-grid-th">Browser / Azione</div>
        <div class="fl-grid-th">Dispositivo</div>
        <div class="fl-grid-th">Modalità</div>
        <div class="fl-grid-th">Lingua</div>
      </div>
      <div class="fl-grid-body" id="stats-table-body">
        <div class="fl-loader" style="margin:2rem auto"><div class="fl-spinner"></div> Caricamento...</div>
      </div>
    </div>
  `;
  wrap.appendChild(tableCard);

  // Carica dati async
  (async () => {
    try {
      const [kpi, sessions] = await Promise.all([getStatsKpi(), getRecentSessions(200)]);

      // Aggiorna KPI cards
      kpiDefs.forEach(k => {
        const card = wrap.querySelector(`#stat-kpi-${k.key}`);
        if (card) {
          card.classList.remove('fl-kpi-card-loading');
          card.querySelector('.fl-kpi-value').textContent = kpi[k.key] ?? 0;
        }
      });

      // Distribuzione helper
      const renderDist = (containerId, data) => {
        const card = wrap.querySelector(`#${containerId} .fl-activity-body`);
        if (!card) return;
        const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
        card.innerHTML = Object.entries(data)
          .sort((a, b) => b[1] - a[1])
          .map(([label, count]) => {
            const pct = Math.round((count / total) * 100);
            return `
              <div class="fl-activity-row">
                <div class="fl-activity-dot"></div>
                <span class="fl-activity-text">${label}</span>
                <span class="fl-stat-bar-wrap">
                  <span class="fl-stat-bar" style="width:${pct}%"></span>
                </span>
                <span class="fl-activity-count">${count} <small>(${pct}%)</small></span>
              </div>`;
          }).join('') || '<p style="padding:1rem;color:var(--fl-fg-3)">Nessun dato</p>';
      };

      renderDist('dist-platform',    kpi.byPlatform);
      renderDist('dist-browser',      kpi.byBrowser);
      renderDist('dist-device',       kpi.byDeviceType);
      renderDist('dist-pwa-device',   kpi.pwaByDeviceType);
      renderDist('dist-notification', kpi.byNotification);

      // Tabella sessioni
      const tbody = wrap.querySelector('#stats-table-body');
      if (sessions.length === 0) {
        tbody.innerHTML = `<div class="fl-empty-state">
          <div class="fl-empty-icon"><i class="ph ph-chart-bar"></i></div>
          <p class="fl-empty-title">Nessuna sessione registrata</p>
          <p class="fl-empty-desc">I dati verranno raccolti non appena gli utenti apriranno l'app.</p>
        </div>`;
      } else {
        const eventBadge = {
          'first_visit':         ['fl-badge-blue',   '<i class="ph ph-user-plus"></i> Prima visita'],
          'session_start':       ['fl-badge-green',  '<i class="ph ph-play"></i> Sessione'],
          'pwa_install':         ['fl-badge-orange', '<i class="ph ph-app-window"></i> Installa PWA'],
          'pwa_first_launch':    ['fl-badge-orange', '<i class="ph ph-app-window"></i> Installa PWA'],
          'notification_click':  ['fl-badge-pink',   '<i class="ph ph-bell-ringing"></i> Click notifica'],
        };
        tbody.innerHTML = sessions.map(s => {
          const ts = s.timestamp?.toDate ? s.timestamp.toDate() : new Date();
          const dateStr = ts.toLocaleDateString('it-IT', { day:'2-digit', month:'short', year:'numeric' });
          const timeStr = ts.toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' });
          const [badgeCls, badgeLbl] = eventBadge[s.eventType] || ['fl-badge-green', s.eventType];

          // Per i click su notifiche mostriamo il titolo della notifica invece dei campi vuoti
          const isNotifClick = s.eventType === 'notification_click';
          const platformCol  = isNotifClick ? '<span style="color:var(--fl-fg-2);font-style:italic">' + (s.notificationTitle || '–') + '</span>' : (s.platform || '–');
          const browserCol   = isNotifClick ? (s.notificationAction === 'default' ? 'Tap notifica' : s.notificationAction || '–') : (s.browser || '–');
          const deviceCol    = isNotifClick ? '–' : (s.deviceType || '–');
          const modeCol      = isNotifClick ? '–' : (s.displayMode || '–');
          const langCol      = isNotifClick ? '–' : (s.language || '–');

          return `
            <div class="fl-grid-row fl-stats-grid-row">
              <div class="fl-grid-td">
                <span class="fl-date-primary">${dateStr}</span>
                <span class="fl-date-secondary">${timeStr}</span>
              </div>
              <div class="fl-grid-td"><span class="fl-badge ${badgeCls}">${badgeLbl}</span></div>
              <div class="fl-grid-td">${platformCol}</div>
              <div class="fl-grid-td">${browserCol}</div>
              <div class="fl-grid-td">${deviceCol}</div>
              <div class="fl-grid-td">${modeCol}</div>
              <div class="fl-grid-td">${langCol}</div>
            </div>`;
        }).join('');
      }
    } catch (err) {
      console.error('[Stats] Errore caricamento statistiche:', err);
      const tbody = wrap.querySelector('#stats-table-body');
      if (tbody) tbody.innerHTML = `<div class="fl-message-bar fl-message-error" style="margin:1rem">Errore caricamento: ${err.message}</div>`;
    }
  })();

  return wrap;
}

// ─────────────────────────────────────────────────────────
// Dashboard con KPI
async function renderDashboard() {
  const dash = document.createElement('div');
  dash.className = 'fl-dashboard';

  const kpiSections = [
    { section: 'home',    icon: '<i class="ph ph-house"></i>',         label: 'My Home',    color: '#6da34d', sub: 'Contenuti homepage', key: 'home' },
    { section: 'journey', icon: '<i class="ph ph-map-trifold"></i>',  label: 'Itinerari',  color: '#548687', sub: 'My Journey',         key: 'journey' },
    { section: 'taste',   icon: '<i class="ph ph-fork-knife"></i>',   label: 'Ristoranti', color: '#c97c3a', sub: 'My Taste',           key: 'taste' },
    { section: 'events',  icon: '<i class="ph ph-calendar-dots"></i>',label: 'Eventi',     color: '#5b7ec9', sub: 'My Events',          key: 'events' },
  ];

  // KPI Grid (skeleton loading)
  const kpiWrap = document.createElement('div');
  kpiWrap.innerHTML = `<div class="fl-kpi-section-title">Riepilogo contenuti</div>`;
  const kpiGrid = document.createElement('div');
  kpiGrid.className = 'fl-kpi-grid';

  kpiSections.forEach(k => {
    const card = document.createElement('div');
    card.className = 'fl-kpi-card fl-kpi-card-loading';
    card.dataset.section = k.section;
    card.innerHTML = `
      <div class="fl-kpi-card-top">
        <div class="fl-kpi-icon">${k.icon}</div>
        <span class="fl-kpi-badge">–</span>
      </div>
      <div class="fl-kpi-value">–</div>
      <div class="fl-kpi-label">${k.label}</div>
      <div class="fl-kpi-sub">${k.sub}</div>
    `;
    kpiGrid.appendChild(card);
  });

  kpiWrap.appendChild(kpiGrid);
  dash.appendChild(kpiWrap);

  // Activity card (placeholder)
  const activityCard = document.createElement('div');
  activityCard.className = 'fl-activity-card';
  activityCard.innerHTML = `
    <div class="fl-activity-header"><i class="ph ph-list-checks"></i> Sezioni piattaforma</div>
    ${kpiSections.map(k => `
      <div class="fl-activity-row" style="cursor:pointer" data-goto="${k.section}">
        <div class="fl-activity-dot" style="background:${k.color}"></div>
        <span class="fl-activity-text"><strong>${k.label}</strong> — ${k.sub}</span>
        <span class="fl-activity-count" data-count="${k.section}">…</span>
      </div>
    `).join('')}
  `;
  dash.appendChild(activityCard);

  // Click su riga activity → naviga alla sezione
  activityCard.querySelectorAll('[data-goto]').forEach(row => {
    row.addEventListener('click', () => {
      const section = row.dataset.goto;
      const btn = document.querySelector(`.fl-sidebar-item[data-section="${section}"]`);
      if (btn) btn.click();
    });
  });

  // Click su kpi card → naviga alla sezione
  kpiGrid.querySelectorAll('.fl-kpi-card').forEach(card => {
    card.addEventListener('click', () => {
      const section = card.dataset.section;
      const btn = document.querySelector(`.fl-sidebar-item[data-section="${section}"]`);
      if (btn) btn.click();
    });
  });

  // Carica i conteggi async
  (async () => {
    const counts = {};
    await Promise.allSettled(kpiSections.map(async k => {
      try {
        const snap = await getDocs(collection(db, k.key));
        counts[k.key] = snap.size;
      } catch { counts[k.key] = 0; }
    }));

    kpiSections.forEach(k => {
      const count = counts[k.key] ?? 0;
      const card = kpiGrid.querySelector(`[data-section="${k.section}"]`);
      if (card) {
        card.classList.remove('fl-kpi-card-loading');
        card.querySelector('.fl-kpi-value').textContent = count;
        card.querySelector('.fl-kpi-badge').textContent = count + ' elementi';
      }
      const actRow = activityCard.querySelector(`[data-count="${k.section}"]`);
      if (actRow) actRow.textContent = count;
    });
  })();

  return dash;
}

// Render sezione admin
async function renderAdminSection(section) {
  const container = document.createElement('div');
  container.className = 'fl-section';

  // Dashboard
  if (section === 'dashboard') {
    return await renderDashboard();
  }

  // Statistiche App
  if (section === 'stats') {
    return await renderStatsSection();
  }

  // Sezione speciale per configurazione UI
  if (section === 'ui-config') {
    return await renderUIConfigSection();
  }

  // Carica dati
  let data = [];
  let collectionName = section;

  try {
    if (section === 'home') {
      data = await firebaseService.getHomeData();
    } else if (section === 'journey') {
      data = await firebaseService.getJourneyData();
    } else if (section === 'taste') {
      data = await firebaseService.getTasteData();
    } else if (section === 'events') {
      console.log('📅 Caricamento eventi per admin panel...');
      data = await firebaseService.getEventsData();
      console.log(`📊 Caricati ${data.length} eventi:`, data);
    }
  } catch (error) {
    console.error('❌ Errore caricamento dati:', error);
    const errorMsg = document.createElement('div');
    errorMsg.className = 'fl-message-bar fl-message-error';
    errorMsg.style.cssText = 'margin: 1.5rem;';
    errorMsg.innerHTML = `<strong>Errore caricamento dati:</strong> ${error.message}`;
    container.appendChild(errorMsg);
  }

  // Header sezione
  const header = document.createElement('div');
  header.className = 'fl-section-header';
  header.innerHTML = `
    <div>
      <h3 class="fl-section-title">${getSectionTitle(section)}</h3>
      <p class="fl-section-subtitle">${data.length} element${data.length === 1 ? 'o' : 'i'}</p>
    </div>
    <button class="fl-button fl-button-primary" data-action="add" data-collection="${collectionName}">
      <i class="ph ph-plus"></i> Aggiungi
    </button>
  `;
  container.appendChild(header);
  
  // Data grid
  const grid = document.createElement('div');
  grid.className = 'fl-data-grid fl-grid-cols-list';

  // Grid header row
  const gridHead = document.createElement('div');
  gridHead.className = 'fl-grid-head';
  gridHead.innerHTML = `
    <div class="fl-grid-th"></div>
    <div class="fl-grid-th">Titolo</div>
    <div class="fl-grid-th">Descrizione / Categoria</div>
    <div class="fl-grid-th" style="text-align:right">Azioni</div>
  `;
  grid.appendChild(gridHead);

  const gridBody = document.createElement('div');
  gridBody.className = 'fl-grid-body';

  if (data.length === 0) {
    gridBody.innerHTML = `
      <div class="fl-empty-state">
        <div class="fl-empty-icon"><i class="ph ph-tray"></i></div>
        <p class="fl-empty-title">Nessun elemento</p>
        <p class="fl-empty-desc">Aggiungi il primo elemento cliccando il pulsante in alto a destra.</p>
      </div>`;
  } else {
    data.forEach(item => {
      gridBody.appendChild(createAdminItem(item, collectionName));
    });
  }

  grid.appendChild(gridBody);
  container.appendChild(grid);

  // Gestisci click aggiungi
  header.querySelector('[data-action="add"]').addEventListener('click', (e) => {
    const coll = e.currentTarget.dataset.collection;
    showEditModal(null, coll);
  });

  return container;
}

// Crea riga nella data grid admin
function createAdminItem(item, collection) {
  const row = document.createElement('div');
  row.className = 'fl-grid-row';

  const title = i18n.tm(item.titolo) || item.id;
  const desc = i18n.tm(item.descrizione) || i18n.tm(item.categoria) || '';
  const descTruncated = desc.substring(0, 80) + (desc.length > 80 ? '…' : '');
  const initials = title.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  row.innerHTML = `
    <div class="fl-grid-td">
      <div class="fl-item-avatar">${initials}</div>
    </div>
    <div class="fl-grid-td fl-td-title">${title}</div>
    <div class="fl-grid-td fl-td-secondary">${descTruncated}</div>
    <div class="fl-grid-td">
      <div class="fl-grid-actions">
        <button class="fl-icon-button" data-action="edit" title="Modifica"><i class="ph ph-pencil-simple"></i></button>
        <button class="fl-icon-button fl-icon-button-danger" data-action="delete" title="Elimina"><i class="ph ph-trash"></i></button>
      </div>
    </div>
  `;
  
  // Gestisci modifica
  row.querySelector('[data-action="edit"]').addEventListener('click', () => {
    showEditModal(item, collection);
  });

  // Gestisci eliminazione
  row.querySelector('[data-action="delete"]').addEventListener('click', async () => {
    if (confirm(`Eliminare "${title}"?`)) {
      await deleteItem(item.id, collection);
    }
  });

  return row;
}

// Mostra dialog di modifica (Fluent UI Dialog)
function showEditModal(item, collection) {
  const isNew = !item;
  const modal = document.createElement('div');
  modal.className = 'fl-dialog-overlay';

  modal.innerHTML = `
    <div class="fl-dialog" role="dialog" aria-modal="true">
      <div class="fl-dialog-header">
        <div class="fl-dialog-title-wrap">
          <h3 class="fl-dialog-title">
            ${isNew ? '<i class="ph ph-plus"></i> Aggiungi' : '<i class="ph ph-pencil-simple"></i> Modifica'} ${getSectionTitle(collection)}
          </h3>
          <p class="fl-dialog-subtitle">
            ${isNew ? 'Compila i campi per creare un nuovo elemento' : `Modifica elemento: ${item.id}`}
          </p>
        </div>
        <button class="fl-dialog-close" aria-label="Chiudi">✕</button>
      </div>

      <form id="edit-form">
        <div class="fl-dialog-body">
          ${createFormFields(item, collection)}
        </div>
        <div class="fl-dialog-footer">
          <button type="button" class="fl-button fl-button-secondary" data-action="cancel">Annulla</button>
          <button type="submit" class="fl-button fl-button-primary">
            ${isNew ? 'Crea elemento' : 'Salva modifiche'}
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);

  // Gestisci chiusura
  const closeModal = () => modal.remove();
  modal.querySelector('.fl-dialog-close').addEventListener('click', closeModal);
  modal.querySelector('[data-action="cancel"]').addEventListener('click', closeModal);
  
  // Chiudi modal solo se si clicca sul backdrop e non si sta selezionando testo
  let isSelecting = false;
  modal.addEventListener('mousedown', (e) => {
    if (e.target === modal) {
      isSelecting = false;
    }
  });
  modal.addEventListener('mousemove', (e) => {
    if (window.getSelection().toString().length > 0) {
      isSelecting = true;
    }
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal && !isSelecting) {
      closeModal();
    }
    isSelecting = false;
  });
  
  // Gestisci submit
  const form = modal.querySelector('#edit-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Salva contenuto degli editor HTML multilingua nei campi hidden
    const editors = form.querySelectorAll('.html-editor-content[data-field="notes"]');
    editors.forEach(editor => {
      const lang = editor.dataset.lang;
      const hiddenField = form.querySelector(`.notes-hidden-${lang}`);
      if (hiddenField) {
        hiddenField.value = editor.innerHTML;
      }
    });
    
    const formData = new FormData(form);
    await saveItem(formData, item, collection);
    
    // Invalida cache categorie se journey o taste o events
    if (collection === 'journey' || collection === 'taste' || collection === 'events') {
      invalidateCategoriesCache(collection);
    }
    
    closeModal();
  });
  
  // Inizializza editor HTML e autocomplete dopo che il modal è nel DOM
  setTimeout(async () => {
    initHTMLEditor(modal);
    await initCategoryAutocomplete(modal, collection);
  }, 0);
}

// Inizializza autocomplete categorie
async function initCategoryAutocomplete(modal, collection) {
  const autocompleteInputs = modal.querySelectorAll('.autocomplete-input');
  
  if (autocompleteInputs.length === 0) return;
  
  // Carica categorie esistenti
  const categories = await getExistingCategories(collection);
  
  autocompleteInputs.forEach(input => {
    const wrapper = input.closest('.fl-autocomplete-wrap');
    const dropdown = wrapper.querySelector('.autocomplete-dropdown');
    const lang = input.dataset.lang;
    const langCategories = categories[lang] || [];
    
    let selectedIndex = -1;
    
    // Mostra dropdown al focus
    input.addEventListener('focus', () => {
      if (langCategories.length > 0) {
        showDropdown(input, dropdown, langCategories, '');
      }
    });
    
    // Filtra mentre si digita
    input.addEventListener('input', () => {
      const value = input.value.toLowerCase().trim();
      const filtered = langCategories.filter(cat => 
        cat.toLowerCase().includes(value)
      );
      
      selectedIndex = -1;
      showDropdown(input, dropdown, filtered, value);
    });
    
    // Gestisci navigazione con tastiera
    input.addEventListener('keydown', (e) => {
      const items = dropdown.querySelectorAll('.fl-autocomplete-item');
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelection(items, selectedIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelection(items, selectedIndex);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        items[selectedIndex].click();
      } else if (e.key === 'Escape') {
        dropdown.style.display = 'none';
      }
    });
    
    // Nascondi dropdown quando si clicca fuori
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  });
}

// Mostra dropdown autocomplete (Fluent UI style)
function showDropdown(input, dropdown, items, searchTerm) {
  if (items.length === 0) {
    dropdown.style.display = 'none';
    return;
  }
  
  const collection = input.dataset.collection;
  const lang = input.dataset.lang;
  
  dropdown.innerHTML = '';
  
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'fl-autocomplete-item';

    // Contenitore per testo
    const textSpan = document.createElement('span');
    
    // Evidenzia il testo cercato
    if (searchTerm) {
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      textSpan.innerHTML = item.replace(regex, '<strong>$1</strong>');
    } else {
      textSpan.textContent = item;
    }
    
    // Pulsante elimina
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'fl-autocomplete-del';
    deleteBtn.innerHTML = '✕';
    deleteBtn.title = 'Elimina questa categoria';
    deleteBtn.type = 'button';
    
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      
      if (confirm(`Sei sicuro di voler eliminare la categoria "${item}"?\nQuesta azione rimuoverà la categoria da tutti gli elementi che la utilizzano.`)) {
        try {
          await deleteCategoryFromAll(collection, lang, item);
          
          // Rimuovi dalla UI
          div.remove();
          
          // Se non ci sono più item, nascondi dropdown
          if (dropdown.children.length === 0) {
            dropdown.style.display = 'none';
          }
          
          // Aggiorna il modal corrente
          const modal = input.closest('.fl-dialog-overlay');
          if (modal) {
            // Refresh del form per ricaricare le categorie
            invalidateCategoriesCache(collection);
          }
        } catch (error) {
          console.error('Errore eliminazione categoria:', error);
          alert('Errore durante l\'eliminazione della categoria');
        }
      }
    });
    
    // Click sul testo seleziona la categoria
    textSpan.addEventListener('click', () => {
      input.value = item;
      dropdown.style.display = 'none';
      input.focus();
    });
    
    div.appendChild(textSpan);
    div.appendChild(deleteBtn);
    dropdown.appendChild(div);
  });
  
  dropdown.style.display = 'block';
}

// Aggiorna selezione nella dropdown
function updateSelection(items, selectedIndex) {
  items.forEach((item, index) => {
    if (index === selectedIndex) {
      item.classList.add('selected');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('selected');
    }
  });
}

// Inizializza editor HTML (aggiornato per Fluent classes)
function initHTMLEditor(modal) {
  const toolbar = modal.querySelector('.fl-html-toolbar');
  const editors = modal.querySelectorAll('.html-editor-content');

  if (!toolbar || editors.length === 0) return;

  let currentEditor = null;

  editors.forEach(editor => {
    editor.addEventListener('focus', () => { currentEditor = editor; });
  });

  toolbar.querySelectorAll('.fl-toolbar-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const command = btn.dataset.command;
      if (!currentEditor) currentEditor = editors[0];
      currentEditor.focus();
      if (command === 'createLink') {
        const url = prompt('Inserisci URL:');
        if (url) document.execCommand(command, false, url);
      } else {
        document.execCommand(command, false, null);
      }
    });
  });

  editors.forEach(editor => {
    editor.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    });
  });
}

// Crea campi del form (Fluent UI)
function createFormFields(item, collection) {
  const languages = ['it', 'en', 'fr', 'de', 'es'];

  const field = (label, inputHtml, hintHtml = '') => `
    <div class="fl-form-group">
      <label class="fl-label">${label}</label>
      ${inputHtml}
      ${hintHtml ? `<p class="fl-hint">${hintHtml}</p>` : ''}
    </div>`;

  const multiLangField = (label, name, type = 'input', hint = '', required = 'it', extraAttrs = (l) => '') => {
    let html = `<div class="fl-form-group">
      <label class="fl-label">${label}</label>
      <div class="fl-multilang-group">`;
    languages.forEach(lang => {
      const isRequired = lang === required;
      const value = item?.[name]?.[lang] || '';
      const badge = `<span class="fl-lang-badge${isRequired ? ' fl-lang-required' : ''}">${lang}</span>`;
      if (type === 'textarea') {
        html += `<div class="fl-lang-row">${badge}<textarea
          class="fl-textarea"
          name="${name}_${lang}"
          placeholder="${lang.toUpperCase()}"
          rows="2"
          ${isRequired ? 'required' : ''}
          ${extraAttrs(lang)}
        >${value}</textarea></div>`;
      } else {
        html += `<div class="fl-lang-row">${badge}<input
          class="fl-input"
          type="text"
          name="${name}_${lang}"
          placeholder="${lang.toUpperCase()}"
          value="${value}"
          ${isRequired ? 'required' : ''}
          ${extraAttrs(lang)}
        ></div>`;
      }
    });
    html += `</div>${hint ? `<p class="fl-hint">${hint}</p>` : ''}</div>`;
    return html;
  };

  let fields = `
    <div class="fl-form-section">
      <p class="fl-form-section-title">Identificativo</p>
      ${field('ID Documento', `<input class="fl-input${item ? ' fl-input' : ''}" type="text" name="id" value="${item?.id || ''}" required ${item ? 'readonly' : ''}>`,
        'Identificativo univoco (es: wifi, orvieto, lapalomba)')}
    </div>

    <div class="fl-form-section">
      <p class="fl-form-section-title">Contenuto multilingua</p>
      ${multiLangField('Titolo', 'titolo', 'input', '')}
      ${multiLangField('Descrizione', 'descrizione', 'textarea', '')}
    </div>
  `;

  // Categoria con autocomplete
  if (collection === 'journey' || collection === 'taste' || collection === 'events') {
    let catHtml = `<div class="fl-form-group">
      <label class="fl-label">Categoria</label>
      <p class="fl-hint" style="margin-bottom:6px">Seleziona da categorie esistenti o digita una nuova</p>
      <div class="fl-multilang-group">`;
    languages.forEach(lang => {
      const value = item?.categoria?.[lang] || '';
      catHtml += `<div class="fl-lang-row">
        <span class="fl-lang-badge${lang === 'it' ? ' fl-lang-required' : ''}">${lang}</span>
        <div class="fl-autocomplete-wrap" data-lang="${lang}" data-field="categoria" style="flex:1">
          <input class="fl-input autocomplete-input" type="text"
            name="categoria_${lang}"
            placeholder="${lang.toUpperCase()}"
            value="${value}"
            autocomplete="off"
            data-collection="${collection}"
            data-lang="${lang}"
            ${lang === 'it' ? 'required' : ''}
          >
          <div class="fl-autocomplete-dropdown autocomplete-dropdown" style="display:none;"></div>
        </div>
      </div>`;
    });
    catHtml += '</div></div>';
    fields += `<div class="fl-form-section"><p class="fl-form-section-title">Categoria</p>${catHtml}</div>`;
  }

  // Campi specifici

  if (collection === 'home') {
    fields += `<div class="fl-form-section"><p class="fl-form-section-title">Dettagli</p>
      <div class="fl-form-group">
        <label class="fl-label">Immagine</label>
        ${item?.imgUrl ? `<div class="fl-image-preview" style="margin-bottom:8px"><img class="fl-preview-thumb" src="${item.imgUrl}" alt="Immagine"></div>` : ''}
        <label class="fl-file-label"><input class="fl-file-input" type="file" name="image" accept="image/*" id="image-upload">📎 Scegli immagine</label>
        <p class="fl-hint">JPG, PNG, max 5MB — opzionale</p>
      </div>
      ${field('Icona', `<input class="fl-input" type="text" name="icona" value="${item?.icona || ''}" placeholder="wifi, pool, key">`,
        'Usata solo se non c\'è un\'immagine')}
      ${field('Link Google Maps', `<input class="fl-input" type="url" name="mapsUrl" value="${item?.mapsUrl || ''}" placeholder="https://maps.google.com/?q=...">`)}</div>`;
  }

  if (collection === 'journey') {
    fields += `<div class="fl-form-section"><p class="fl-form-section-title">Dettagli itinerario</p>
      <div class="fl-form-group">
        <label class="fl-label">Immagine</label>
        ${item?.imgUrl ? `<div class="fl-image-preview" style="margin-bottom:8px"><img class="fl-preview-thumb" src="${item.imgUrl}" alt="Immagine"></div>` : ''}
        <label class="fl-file-label"><input class="fl-file-input" type="file" name="image" accept="image/*" id="image-upload">📎 Scegli immagine</label>
        <p class="fl-hint">JPG, PNG, max 5MB</p>
      </div>
      <div class="fl-form-row">
        ${field('Distanza', `<input class="fl-input" type="text" name="distanza" value="${item?.distanza || ''}" placeholder="25 km">`)}
        ${field('Durata', `<input class="fl-input" type="text" name="durata" value="${item?.durata || ''}" placeholder="30 min">`)}
      </div>
      ${field('Link Google Maps', `<input class="fl-input" type="url" name="mapsUrl" value="${item?.mapsUrl || ''}" placeholder="https://maps.google.com/?q=...">`)}
      <label class="fl-checkbox-wrap">
        <input class="fl-checkbox" type="checkbox" name="featured" ${item?.featured ? 'checked' : ''}>
        <span class="fl-checkbox-label">In evidenza</span>
      </label></div>`;
  }

  if (collection === 'taste') {
    fields += `<div class="fl-form-section"><p class="fl-form-section-title">Dettagli ristorante</p>
      <div class="fl-form-group">
        <label class="fl-label">Immagine</label>
        ${item?.imgUrl ? `<div class="fl-image-preview" style="margin-bottom:8px"><img class="fl-preview-thumb" src="${item.imgUrl}" alt="Immagine"></div>` : ''}
        <label class="fl-file-label"><input class="fl-file-input" type="file" name="image" accept="image/*" id="image-upload">📎 Scegli immagine</label>
        <p class="fl-hint">JPG, PNG, max 5MB</p>
      </div>
      ${multiLangField('Tipo Cucina', 'tipoCucina')}
      ${field('Telefono', `<input class="fl-input" type="tel" name="telefono" value="${item?.telefono || ''}" placeholder="+39 ...">`)}
      ${field('Link Google Maps', `<input class="fl-input" type="url" name="mapsUrl" value="${item?.mapsUrl || ''}" placeholder="https://maps.google.com/?q=...">`)}
      ${multiLangField('Prezzo Medio', 'prezzoMedio', 'input', '', 'none')}
      <label class="fl-checkbox-wrap">
        <input class="fl-checkbox" type="checkbox" name="featured" ${item?.featured ? 'checked' : ''}>
        <span class="fl-checkbox-label">In evidenza</span>
      </label></div>`;
  }

  if (collection === 'events') {
    fields += `<div class="fl-form-section"><p class="fl-form-section-title">Dettagli evento</p>
      <div class="fl-form-group">
        <label class="fl-label">Immagine</label>
        ${item?.imgUrl ? `<div class="fl-image-preview" style="margin-bottom:8px"><img class="fl-preview-thumb" src="${item.imgUrl}" alt="Immagine"></div>` : ''}
        <label class="fl-file-label"><input class="fl-file-input" type="file" name="image" accept="image/*" id="image-upload">📎 Scegli immagine</label>
        <p class="fl-hint">JPG, PNG, max 5MB</p>
      </div>
      <div class="fl-form-row">
        ${field('Data Evento <span style="color:var(--fl-error)">*</span>',
          `<input class="fl-input" type="date" name="dataEvento" value="${item?.dataEvento || ''}" required>`)}
        ${field('Ora Evento',
          `<input class="fl-input" type="time" name="oraEvento" value="${item?.oraEvento || ''}">`)}
      </div>
      ${field('Luogo', `<input class="fl-input" type="text" name="luogoEvento" value="${item?.luogoEvento || ''}" placeholder="Perugia, Piazza IV Novembre">`)}
      ${field('Link Google Maps', `<input class="fl-input" type="url" name="mapsUrl" value="${item?.mapsUrl || ''}" placeholder="https://maps.google.com/?q=...">`)}
      ${field('Sito Web', `<input class="fl-input" type="url" name="sitoWeb" value="${item?.sitoWeb || ''}" placeholder="https://...">`)}
      <label class="fl-checkbox-wrap">
        <input class="fl-checkbox" type="checkbox" name="featured" ${item?.featured ? 'checked' : ''}>
        <span class="fl-checkbox-label">In evidenza</span>
      </label></div>`;
  }

  // Note HTML multilingua
  fields += `<div class="fl-form-section">
    <p class="fl-form-section-title">Note / Dettagli multilingua</p>
    <div class="fl-form-group">
      <label class="fl-label">Testo formattato</label>
      <div class="fl-html-toolbar html-editor-toolbar">
        <button type="button" class="fl-toolbar-btn toolbar-btn" data-command="bold"><strong>B</strong></button>
        <button type="button" class="fl-toolbar-btn toolbar-btn" data-command="italic"><em>I</em></button>
        <button type="button" class="fl-toolbar-btn toolbar-btn" data-command="insertUnorderedList">• Lista</button>
        <button type="button" class="fl-toolbar-btn toolbar-btn" data-command="insertOrderedList">1. Lista</button>
        <button type="button" class="fl-toolbar-btn toolbar-btn" data-command="createLink">🔗 Link</button>
      </div>
      <div class="fl-multilang-group" style="margin-top:0">
        ${languages.map(lang => `
          <div class="fl-lang-row" style="align-items:flex-start">
            <span class="fl-lang-badge" style="margin-top:6px">${lang}</span>
            <div style="flex:1">
              <div class="fl-html-editor html-editor-content"
                contenteditable="true"
                data-lang="${lang}"
                data-field="notes"
              >${item?.notes?.[lang] || ''}</div>
              <input type="hidden" name="notes_${lang}" class="notes-hidden-${lang}">
            </div>
          </div>`).join('')}
      </div>
      <p class="fl-hint">Formatta testo e aggiungi link per ogni lingua</p>
    </div>
  </div>`;

  // PDF
  fields += `<div class="fl-form-section">
    <p class="fl-form-section-title">Risorse</p>
    <div class="fl-form-group">
      <label class="fl-label">Guida PDF</label>
      ${item?.pdfUrl ? `<p style="margin-bottom:8px;font-size:13px">📄 <a href="${item.pdfUrl}" target="_blank" style="color:var(--fl-brand)">Guida corrente</a></p>` : ''}
      <label class="fl-file-label"><input class="fl-file-input" type="file" name="pdf" accept=".pdf,application/pdf" id="pdf-upload">📎 Scegli PDF</label>
      <p class="fl-hint">Max 10MB — opzionale</p>
    </div>
    ${field('Ordine', `<input class="fl-input" type="number" name="ordine" value="${item?.ordine || 1}" min="1" style="width:100px">`)}
  </div>`;

  return fields;
}

// Salva item
async function saveItem(formData, existingItem, collection) {
  const languages = ['it', 'en', 'fr', 'de', 'es'];
  const id = formData.get('id');
  
  // Costruisci oggetto dati
  const data = {
    ordine: parseInt(formData.get('ordine')) || 1
  };
  
  // Gestione upload immagine
  const imageFile = formData.get('image');
  if (imageFile && imageFile.size > 0) {
    try {
      // Validazione dimensione
      if (imageFile.size > 5 * 1024 * 1024) {
        alert('L\'immagine è troppo grande. Massimo 5MB.');
        return;
      }
      
      // Upload su Firebase Storage
      const timestamp = Date.now();
      const extension = imageFile.name.split('.').pop();
      const fileName = `${collection}/${id}_${timestamp}.${extension}`;
      const storageRef = ref(storage, fileName);
      
      console.log('📤 Caricamento immagine:', fileName);
      await uploadBytes(storageRef, imageFile);
      
      // Ottieni URL download
      const downloadURL = await getDownloadURL(storageRef);
      data.imgUrl = downloadURL;
      console.log('✅ Immagine caricata:', downloadURL);
    } catch (error) {
      console.error('❌ Errore upload immagine:', error);
      alert('Errore caricamento immagine: ' + error.message);
      return;
    }
  } else if (existingItem?.imgUrl) {
    // Mantieni immagine esistente
    data.imgUrl = existingItem.imgUrl;
  }
  
  // Gestione upload PDF
  const pdfFile = formData.get('pdf');
  if (pdfFile && pdfFile.size > 0) {
    try {
      // Validazione dimensione
      if (pdfFile.size > 10 * 1024 * 1024) {
        alert('Il PDF è troppo grande. Massimo 10MB.');
        return;
      }
      
      // Validazione tipo
      if (pdfFile.type !== 'application/pdf') {
        alert('Solo file PDF sono accettati.');
        return;
      }
      
      // Upload su Firebase Storage
      const timestamp = Date.now();
      const fileName = `${collection}/pdf_${id}_${timestamp}.pdf`;
      const storageRef = ref(storage, fileName);
      
      console.log('📤 Caricamento PDF:', fileName);
      await uploadBytes(storageRef, pdfFile);
      
      // Ottieni URL download
      const downloadURL = await getDownloadURL(storageRef);
      data.pdfUrl = downloadURL;
      console.log('✅ PDF caricato:', downloadURL);
    } catch (error) {
      console.error('❌ Errore upload PDF:', error);
      alert('Errore caricamento PDF: ' + error.message);
      return;
    }
  } else if (existingItem?.pdfUrl) {
    // Mantieni PDF esistente
    data.pdfUrl = existingItem.pdfUrl;
  }
  
  // Campo note HTML multilingua
  const notesObj = {};
  let hasNotes = false;
  languages.forEach(lang => {
    const value = formData.get(`notes_${lang}`);
    if (value) {
      notesObj[lang] = value;
      hasNotes = true;
    }
  });
  if (hasNotes) {
    data.notes = notesObj;
  }
  
  // Campi multilingua
  const multiLangFields = ['titolo', 'descrizione', 'categoria', 'tipoCucina', 'prezzoMedio'];
  multiLangFields.forEach(field => {
    const obj = {};
    let hasValue = false;
    languages.forEach(lang => {
      const value = formData.get(`${field}_${lang}`);
      if (value) {
        obj[lang] = value;
        hasValue = true;
      }
    });
    if (hasValue) {
      data[field] = obj;
    }
  });
  
  // Altri campi
  ['icona', 'distanza', 'durata', 'mapsUrl', 'telefono', 'dataEvento', 'oraEvento', 'luogoEvento', 'sitoWeb'].forEach(field => {
    const value = formData.get(field);
    if (value) data[field] = value;
  });
  
  // Aggiungi datainserimento per eventi (se nuovo o non esiste già)
  if (collection === 'events') {
    if (!existingItem || !existingItem.datainserimento) {
      data.datainserimento = new Date().toISOString();
    } else {
      // Mantieni la data di inserimento originale
      data.datainserimento = existingItem.datainserimento;
    }
  }
  
  // Checkbox
  data.featured = formData.get('featured') === 'on';
  if (collection === 'taste') {
    data.prenotazioneConsigliata = formData.get('prenotazioneConsigliata') === 'on';
  }
  
  try {
    // Determina se è un nuovo elemento
    const isNewItem = !existingItem;
    
    await setDoc(doc(db, collection, id), data);
    console.log('✅ Item salvato:', id);
    
    // Invia notifica push se è un nuovo evento
    if (collection === 'events' && isNewItem) {
      console.log('📱 Tentativo invio notifica push per nuovo evento...');
      try {
        const notificationResult = await sendNotificationForNewEvent({
          id: id,
          ...data
        });
        
        if (notificationResult.success) {
          console.log('✅ Notifica programmata:', notificationResult.message);
          alert(`Salvato con successo!\n\n📱 ${notificationResult.message}`);
        } else {
          console.warn('⚠️ Notifica non inviata:', notificationResult.error);
          alert(`Salvato con successo!\n\n⚠️ Notifica non inviata: ${notificationResult.error || 'Configura FCM per abilitare le notifiche'}`);
        }
      } catch (notifError) {
        console.error('❌ Errore sistema notifiche:', notifError);
        alert(`Salvato con successo!\n\n⚠️ Sistema notifiche non disponibile (${notifError.message})`);
      }
    } else {
      alert('Salvato con successo!');
    }
    
    // Ricarica solo il dashboard admin senza reload completo
    const adminContent = document.querySelector('#admin-content');
    if (adminContent) {
      adminContent.innerHTML = '<div class="fl-loader"><div class="fl-spinner"></div> Caricamento...</div>';
      const sectionContent = await renderAdminSection(collection);
      adminContent.innerHTML = '';
      adminContent.appendChild(sectionContent);
    }
  } catch (error) {
    console.error('❌ Errore salvataggio:', error);
    alert('Errore durante il salvataggio: ' + error.message);
  }
}

// Elimina item
async function deleteItem(id, collection) {
  try {
    await deleteDoc(doc(db, collection, id));
    console.log('✅ Item eliminato:', id);
    alert('Eliminato con successo!');
    // Ricarica solo il dashboard admin senza reload completo
    const adminContent = document.querySelector('#admin-content');
    if (adminContent) {
      adminContent.innerHTML = '<div class="fl-loader"><div class="fl-spinner"></div> Caricamento...</div>';
      const sectionContent = await renderAdminSection(collection);
      adminContent.innerHTML = '';
      adminContent.appendChild(sectionContent);
    }
  } catch (error) {
    console.error('❌ Errore eliminazione:', error);
    alert('Errore durante l\'eliminazione: ' + error.message);
  }
}

// Ottieni titolo sezione
function getSectionTitle(section) {
  const titles = {
    home: 'My Home',
    journey: 'My Journey',
    taste: 'My Taste',
    events: 'My Events',
    stats: 'Statistiche App',
    'ui-config': 'Configurazione UI'
  };
  return titles[section] || section;
}

// ========== SEZIONE CONFIGURAZIONE UI ==========

async function renderUIConfigSection() {
  const container = document.createElement('div');
  container.className = 'fl-section';

  // Carica configurazione corrente
  const config = await uiConfigService.loadConfig();

  const colorSwatches = [
    { label: 'Colore Primario (Verde)',  name: 'color-primary',      val: config.colors.primary },
    { label: 'Colore Secondario (Viola)',name: 'color-secondary',     val: config.colors.secondary },
    { label: 'Colore Accento (Salvia)',  name: 'color-accent',        val: config.colors.accent },
    { label: 'Colore Teal',             name: 'color-teal',          val: config.colors.teal },
    { label: 'Verde Chiaro',            name: 'color-light-green',   val: config.colors.lightGreen },
    { label: 'Sfondo',                  name: 'color-background',    val: config.colors.background },
  ];

  const langs = [
    { code: 'it', label: 'Italiano' }, { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' }, { code: 'de', label: 'Deutsch' },
    { code: 'es', label: 'Español'  },
  ];

  const multiLang = (baseName, values) => langs.map(l => `
    <div class="fl-lang-row">
      <span class="fl-lang-badge${l.code === 'it' ? ' fl-lang-required' : ''}">${l.code}</span>
      <input class="fl-input" type="text" name="${baseName}-${l.code}" placeholder="${l.label}" value="${values?.[l.code] || ''}">
    </div>`).join('');

  container.innerHTML = `
    <div class="fl-section-header">
      <div>
        <h3 class="fl-section-title">Configurazione UI</h3>
        <p class="fl-section-subtitle">Personalizza colori, branding e testi dell'interfaccia</p>
      </div>
    </div>

    <form id="ui-config-form">
      <!-- PALETTE COLORI -->
      <div class="fl-config-section">
        <h4>🎨 Palette Colori</h4>
        <p class="fl-config-section-desc">Modifica i colori principali dell'interfaccia</p>
        <div class="fl-config-grid" style="margin-top:12px">
          ${colorSwatches.map(s => `
            <div class="fl-color-swatch">
              <input class="fl-color-preview" type="color" name="${s.name}" value="${s.val}">
              <div class="fl-color-inputs">
                <span class="fl-color-name">${s.label}</span>
                <input class="fl-color-hex" type="text" name="${s.name}-text" value="${s.val}" pattern="^#[0-9A-Fa-f]{6}$">
              </div>
            </div>`).join('')}
        </div>
      </div>

      <!-- BRANDING -->
      <div class="fl-config-section">
        <h4>🏷️ Branding</h4>
        <p class="fl-config-section-desc">Nome dell'app, logo e immagini</p>

        <div class="fl-form-group" style="margin-top:12px">
          <label class="fl-label">Nome App</label>
          <div class="fl-multilang-group">${multiLang('app-name', config.branding.appName)}</div>
        </div>

        <div class="fl-form-group">
          <label class="fl-label">Slogan / Tagline</label>
          <div class="fl-multilang-group">${multiLang('app-tagline', config.branding.appTagline)}</div>
        </div>

        <div class="fl-form-group">
          <label class="fl-label">Logo App</label>
          <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
            <div style="display:flex;gap:8px;align-items:center">
              <input type="file" id="logo-upload" accept="image/*" class="fl-file-input">
              <button type="button" class="fl-button fl-button-secondary fl-button-sm" id="logo-upload-btn">📤 Carica Logo</button>
              ${config.branding.logoUrl ? `<button type="button" class="fl-button fl-button-danger fl-button-sm" id="remove-logo-btn">✕ Rimuovi</button>` : ''}
            </div>
            ${config.branding.logoUrl
              ? `<img src="${config.branding.logoUrl}" style="height:56px;border-radius:8px;border:1px solid var(--fl-stroke-1);background:#fff;padding:6px">`
              : `<p class="fl-hint" style="margin:0">Nessun logo — verrà usato il logo SVG di default.</p>`}
          </div>
        </div>

        <div class="fl-form-group">
          <label class="fl-label">Sfondo Header</label>
          <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
            <div style="display:flex;gap:8px;align-items:center">
              <input type="file" id="header-bg-upload" accept="image/*" class="fl-file-input">
              <button type="button" class="fl-button fl-button-secondary fl-button-sm" id="header-bg-upload-btn">📤 Carica Sfondo</button>
              ${config.branding.headerBackgroundUrl ? `<button type="button" class="fl-button fl-button-danger fl-button-sm" id="remove-header-bg-btn">✕ Rimuovi</button>` : ''}
            </div>
            ${config.branding.headerBackgroundUrl
              ? `<img src="${config.branding.headerBackgroundUrl}" style="height:56px;border-radius:8px;border:1px solid var(--fl-stroke-1)">`
              : `<p class="fl-hint" style="margin:0">Nessuno sfondo — verrà usato il gradiente di default.</p>`}
          </div>
        </div>
      </div>

      <!-- TESTI HOMEPAGE -->
      <div class="fl-config-section">
        <h4>🏠 Testi Homepage</h4>
        <p class="fl-config-section-desc">Testi visibili nella homepage</p>
        <div class="fl-form-group" style="margin-top:12px">
          <label class="fl-label">Sottotitolo Benvenuto</label>
          <div class="fl-multilang-group">${multiLang('welcome-subtitle', config.homeTexts.welcomeSubtitle)}</div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="fl-config-section">
        <h4>📄 Footer</h4>
        <p class="fl-config-section-desc">Testi del piè di pagina</p>
        <div class="fl-form-row" style="margin-top:12px">
          <div class="fl-form-group">
            <label class="fl-label">Copyright</label>
            <input class="fl-input" type="text" name="footer-copyright" placeholder="Nome copyright" value="${config.footer.copyright}">
          </div>
          <div class="fl-form-group">
            <label class="fl-label">Anno</label>
            <input class="fl-input" type="text" name="footer-year" placeholder="2024" value="${config.footer.year}" style="max-width:120px">
          </div>
        </div>
      </div>

      <!-- CONTATTI -->
      <div class="fl-config-section">
        <h4>📞 Contatti</h4>
        <p class="fl-config-section-desc">Numero di telefono ed email per MyContacts</p>
        <div class="fl-form-row" style="margin-top:12px">
          <div class="fl-form-group">
            <label class="fl-label">Telefono</label>
            <input class="fl-input" type="tel" name="contacts-phone" placeholder="+39 391 755 7924" value="${config.contacts?.phone || '+393917557924'}">
            <p class="fl-hint">Usato per chiamate e WhatsApp. Es: +39xxxxxxxxxx</p>
          </div>
          <div class="fl-form-group">
            <label class="fl-label">Email</label>
            <input class="fl-input" type="email" name="contacts-email" placeholder="info@example.com" value="${config.contacts?.email || ''}">
          </div>
        </div>
      </div>

      <!-- AZIONI -->
      <div class="fl-config-actions">
        <button type="button" class="fl-button fl-button-subtle" id="reset-config-btn">↩️ Ripristina Default</button>
        <button type="button" class="fl-button fl-button-secondary" id="preview-config-btn">👁️ Anteprima</button>
        <button type="submit" class="fl-button fl-button-primary">💾 Salva e Applica</button>
      </div>
    </form>
  `;
  
  // Sincronizza color picker con hex input
  container.querySelectorAll('.fl-color-swatch').forEach(swatch => {
    const colorInput = swatch.querySelector('input[type="color"]');
    const textInput = swatch.querySelector('.fl-color-hex');
    if (!colorInput || !textInput) return;
    colorInput.addEventListener('input', () => { textInput.value = colorInput.value; });
    textInput.addEventListener('input', () => { if (textInput.checkValidity()) colorInput.value = textInput.value; });
  });
  
  // Gestisci upload logo
  const logoUploadBtn = container.querySelector('#logo-upload-btn');
  const logoUploadInput = container.querySelector('#logo-upload');
  if (logoUploadBtn && logoUploadInput) {
    logoUploadBtn.addEventListener('click', () => {
      logoUploadInput.click();
    });
    
    logoUploadInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          logoUploadBtn.disabled = true;
          logoUploadBtn.innerHTML = '<span class="fl-spinner" style="width:14px;height:14px;border-width:2px"></span> Caricamento...';
          
          const downloadURL = await uiConfigService.uploadLogo(file);
          
          // Aggiorna configurazione
          const currentConfig = uiConfigService.getConfig();
          currentConfig.branding.logoUrl = downloadURL;
          currentConfig.branding.logoType = 'image';
          await uiConfigService.saveConfig(currentConfig);
          
          alert('✅ Logo caricato! Ricaricare la sezione per vedere le modifiche.');
          renderSection('ui-config');
        } catch (error) {
          alert('❌ Errore nel caricamento del logo: ' + error.message);
        } finally {
          logoUploadBtn.disabled = false;
          logoUploadBtn.textContent = '📤 Carica Logo';
        }
      }
    });
  }
  
  // Gestisci rimozione logo
  const removeLogoBtn = container.querySelector('#remove-logo-btn');
  if (removeLogoBtn) {
    removeLogoBtn.addEventListener('click', async () => {
      if (confirm('Vuoi rimuovere il logo personalizzato?')) {
        const currentConfig = uiConfigService.getConfig();
        currentConfig.branding.logoUrl = null;
        currentConfig.branding.logoType = 'svg';
        await uiConfigService.saveConfig(currentConfig);
        alert('✅ Logo rimosso!');
        renderSection('ui-config');
      }
    });
  }
  
  // Gestisci upload sfondo header
  const headerBgUploadBtn = container.querySelector('#header-bg-upload-btn');
  const headerBgUploadInput = container.querySelector('#header-bg-upload');
  if (headerBgUploadBtn && headerBgUploadInput) {
    headerBgUploadBtn.addEventListener('click', () => {
      headerBgUploadInput.click();
    });
    
    headerBgUploadInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          headerBgUploadBtn.disabled = true;
          headerBgUploadBtn.innerHTML = '<span class="fl-spinner" style="width:14px;height:14px;border-width:2px"></span> Caricamento...';
          
          const downloadURL = await uiConfigService.uploadHeaderBackground(file);
          
          // Aggiorna configurazione
          const currentConfig = uiConfigService.getConfig();
          currentConfig.branding.headerBackgroundUrl = downloadURL;
          await uiConfigService.saveConfig(currentConfig);
          
          alert('✅ Sfondo header caricato! Ricaricare la sezione per vedere le modifiche.');
          renderSection('ui-config');
        } catch (error) {
          alert('❌ Errore nel caricamento dello sfondo: ' + error.message);
        } finally {
          headerBgUploadBtn.disabled = false;
          headerBgUploadBtn.textContent = '📤 Carica Sfondo';
        }
      }
    });
  }
  
  // Gestisci rimozione sfondo header
  const removeHeaderBgBtn = container.querySelector('#remove-header-bg-btn');
  if (removeHeaderBgBtn) {
    removeHeaderBgBtn.addEventListener('click', async () => {
      if (confirm('Vuoi rimuovere lo sfondo personalizzato della testata?')) {
        const currentConfig = uiConfigService.getConfig();
        currentConfig.branding.headerBackgroundUrl = null;
        await uiConfigService.saveConfig(currentConfig);
        alert('✅ Sfondo rimosso!');
        renderSection('ui-config');
      }
    });
  }
  
  // Gestisci submit form
  const form = container.querySelector('#ui-config-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveUIConfig(form);
  });
  
  // Gestisci anteprima
  container.querySelector('#preview-config-btn').addEventListener('click', () => {
    previewUIConfig(form);
  });
  
  // Gestisci reset
  container.querySelector('#reset-config-btn').addEventListener('click', async () => {
    if (confirm('Sei sicuro di voler ripristinare le impostazioni di default?')) {
      await resetUIConfig();
    }
  });
  
  return container;
}

// Salva configurazione UI
async function saveUIConfig(form) {
  const formData = new FormData(form);
  
  // Ottieni configurazione corrente per preservare le immagini
  const currentConfig = uiConfigService.getConfig();
  
  const config = {
    colors: {
      primary: formData.get('color-primary-text'),
      secondary: formData.get('color-secondary-text'),
      accent: formData.get('color-accent-text'),
      teal: formData.get('color-teal-text'),
      lightGreen: formData.get('color-light-green-text'),
      background: formData.get('color-background-text'),
      cardBg: '#ffffff',
      text: '#2c3e50',
      textLight: '#7f8c8d',
      border: '#e8e8e8'
    },
    branding: {
      appName: {
        it: formData.get('app-name-it'),
        en: formData.get('app-name-en'),
        fr: formData.get('app-name-fr'),
        de: formData.get('app-name-de'),
        es: formData.get('app-name-es')
      },
      appTagline: {
        it: formData.get('app-tagline-it'),
        en: formData.get('app-tagline-en'),
        fr: formData.get('app-tagline-fr'),
        de: formData.get('app-tagline-de'),
        es: formData.get('app-tagline-es')
      },
      // Preserva le immagini dalla configurazione corrente
      logoType: currentConfig.branding?.logoType || 'svg',
      logoUrl: currentConfig.branding?.logoUrl || null,
      logoSvg: currentConfig.branding?.logoSvg || null,
      headerBackgroundUrl: currentConfig.branding?.headerBackgroundUrl || null
    },
    homeTexts: {
      welcomeTitle: {
        it: 'Benvenuti',
        en: 'Welcome',
        fr: 'Bienvenue',
        de: 'Willkommen',
        es: 'Bienvenido'
      },
      welcomeSubtitle: {
        it: formData.get('welcome-subtitle-it'),
        en: formData.get('welcome-subtitle-en'),
        fr: formData.get('welcome-subtitle-fr'),
        de: formData.get('welcome-subtitle-de'),
        es: formData.get('welcome-subtitle-es')
      }
    },
    footer: {
      copyright: formData.get('footer-copyright'),
      year: formData.get('footer-year'),
      madeWith: {
        it: '',
        en: 'Made with',
        fr: 'Réalisé avec',
        de: 'Erstellt mit',
        es: 'Hecho con'
      },
      for: {
        it: '',
        en: 'for',
        fr: 'pour',
        de: 'für',
        es: 'para'
      }
    },
    contacts: {
      phone: formData.get('contacts-phone'),
      email: formData.get('contacts-email')
    }
  };
  
  try {
    await uiConfigService.saveConfig(config);
    
    // Applica immediatamente i colori
    uiConfigService.applyColors(config.colors);
    
    // Ricarica la pagina per applicare tutte le modifiche
    alert('✅ Configurazione salvata! La pagina verrà ricaricata per applicare le modifiche.');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error('❌ Errore salvataggio configurazione:', error);
    alert('Errore nel salvataggio: ' + error.message);
  }
}

// Anteprima configurazione UI
function previewUIConfig(form) {
  const formData = new FormData(form);
  
  const tempColors = {
    primary: formData.get('color-primary-text'),
    secondary: formData.get('color-secondary-text'),
    accent: formData.get('color-accent-text'),
    teal: formData.get('color-teal-text'),
    lightGreen: formData.get('color-light-green-text'),
    background: formData.get('color-background-text'),
    cardBg: '#ffffff',
    text: '#2c3e50',
    textLight: '#7f8c8d',
    border: '#e8e8e8'
  };
  
  // Applica temporaneamente i colori
  uiConfigService.applyColors(tempColors);
  
  alert('👁️ Anteprima applicata! Questa è temporanea. Clicca "Salva e Applica" per rendere permanente.');
}

// Ripristina configurazione default
async function resetUIConfig() {
  try {
    const defaultConfig = uiConfigService.defaultConfig;
    await uiConfigService.saveConfig(defaultConfig);
    
    alert('✅ Configurazione ripristinata! La pagina verrà ricaricata.');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error('❌ Errore ripristino configurazione:', error);
    alert('Errore nel ripristino: ' + error.message);
  }
}
