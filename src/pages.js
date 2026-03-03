// Pagine dell'app MyLyfe

import { i18n } from './i18n.js';
import { createCard, createLoader, createError, createMainMenu, createContainer } from './components.js';
import { firebaseService } from './firebase-service.js';
import { getSectorIcon } from './icons.js';
import { uiConfigService } from './ui-config-service.js';

// Homepage con menu principale
export async function renderHomePage() {
  const container = createContainer();
  
  // Ottieni configurazione UI
  const config = uiConfigService.getConfig();
  const currentLang = i18n.getCurrentLanguage();
  
  // Ottieni tagline dalla configurazione
  const appTagline = config.branding?.appTagline?.[currentLang] || i18n.t('appTagline');
  const welcomeSubtitle = config.homeTexts?.welcomeSubtitle?.[currentLang] || 'Benvenuti • Welcome • Bienvenue • Willkommen • Bienvenido';
  
  container.innerHTML = `
    <div class="welcome-section">
      <h2>${appTagline}</h2>
      <p>${welcomeSubtitle}</p>
    </div>
  `;
  
  container.appendChild(createMainMenu());
  
  return container;
}

// Pagina My Home
export async function renderMyHomePage() {
  const container = createContainer();
  
  // Mostra loader
  const loader = createLoader();
  container.appendChild(loader);
  
  try {
    // Carica dati da Firebase
    const homeData = await firebaseService.getHomeData();
    
    // Rimuovi loader
    loader.remove();
    
    if (homeData.length === 0) {
      // Mostra dati di esempio se il database è vuoto
      container.innerHTML = `
        <div class="page-header">
          <div class="page-icon-wrapper">${getSectorIcon('home')}</div>
          <h2>${i18n.t('myHome')}</h2>
          <p>${i18n.t('myHomeDesc')}</p>
        </div>
        <div class="info-message">
          <p>ℹ️ I dati verranno caricati dal database Firebase.</p>
          <p>Per ora puoi vedere questa pagina di esempio.</p>
        </div>
      `;
      
      // Dati di esempio
      const exampleData = [
        {
          id: 'wifi',
          icona: 'wifi',
          titolo: { it: 'Wi-Fi', en: 'Wi-Fi', fr: 'Wi-Fi', de: 'WLAN', es: 'Wi-Fi' },
          descrizione: { 
            it: 'Nome rete: LyfeUmbriaGuest\nPassword: Lyfe2025',
            en: 'Network: LyfeUmbriaGuest\nPassword: Lyfe2025',
            fr: 'Réseau: LyfeUmbriaGuest\nMot de passe: Lyfe2025',
            de: 'Netzwerk: LyfeUmbriaGuest\nPasswort: Lyfe2025',
            es: 'Red: LyfeUmbriaGuest\nContraseña: Lyfe2025'
          }
        },
        {
          id: 'pool',
          icona: 'pool',
          titolo: { it: 'Piscina', en: 'Swimming Pool', fr: 'Piscine', de: 'Schwimmbad', es: 'Piscina' },
          descrizione: { 
            it: 'Aperta dalle 08:00 alle 20:00.\nSi prega di usare la doccia prima di entrare.',
            en: 'Open from 08:00 to 20:00.\nPlease use the shower before entering.',
            fr: 'Ouvert de 08h00 à 20h00.\nVeuillez utiliser la douche avant d\'entrer.',
            de: 'Geöffnet von 08:00 bis 20:00 Uhr.\nBitte duschen Sie vor dem Betreten.',
            es: 'Abierto de 08:00 a 20:00.\nPor favor, use la ducha antes de entrar.'
          }
        },
        {
          id: 'checkin',
          icona: 'key',
          titolo: { it: 'Check-in & Check-out', en: 'Check-in & Check-out', fr: 'Arrivée & Départ', de: 'Ankunft & Abreise', es: 'Entrada y Salida' },
          descrizione: { 
            it: 'Check-in: dalle 15:00 alle 19:00\nCheck-out: entro le 10:00\nLasciare le chiavi nella cassetta.',
            en: 'Check-in: from 3:00 PM to 7:00 PM\nCheck-out: by 10:00 AM\nLeave keys in the box.',
            fr: 'Arrivée: de 15h00 à 19h00\nDépart: avant 10h00\nLaisser les clés dans la boîte.',
            de: 'Ankunft: von 15:00 bis 19:00 Uhr\nAbreise: bis 10:00 Uhr\nSchlüssel in der Box lassen.',
            es: 'Entrada: de 15:00 a 19:00\nSalida: antes de las 10:00\nDeja las llaves en la caja.'
          }
        }
      ];
      
      homeData.push(...exampleData);
    }
    
    // Crea header pagina
    const header = document.createElement('div');
    header.className = 'page-header';
    header.innerHTML = `
      <div class="page-icon-wrapper">${getSectorIcon('home')}</div>
      <h2>${i18n.t('myHome')}</h2>
      <p>${i18n.t('myHomeDesc')}</p>
    `;
    container.appendChild(header);
    
    // Crea cards per ogni elemento
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container';
    
    homeData.forEach(item => {
      cardsContainer.appendChild(createCard(item, 'home'));
    });
    
    container.appendChild(cardsContainer);
    
  } catch (error) {
    loader.remove();
    container.appendChild(createError(error.message));
  }
  
  return container;
}

// Pagina My Journey
export async function renderMyJourneyPage() {
  const container = createContainer();
  
  const loader = createLoader();
  container.appendChild(loader);
  
  try {
    const journeyData = await firebaseService.getJourneyData();
    
    loader.remove();
    
    if (journeyData.length === 0) {
      // Dati di esempio
      container.innerHTML = `
        <div class="page-header">
          <div class="page-icon-wrapper">${getSectorIcon('journey')}</div>
          <h2>${i18n.t('myJourney')}</h2>
          <p>${i18n.t('myJourneyDesc')}</p>
        </div>
        <div class="info-message">
          <p>ℹ️ I luoghi da visitare verranno caricati dal database.</p>
        </div>
      `;
      
      const exampleData = [
        {
          id: 'orvieto',
          titolo: { it: 'Duomo di Orvieto', en: 'Orvieto Cathedral', fr: 'Cathédrale d\'Orvieto', de: 'Dom von Orvieto', es: 'Catedral de Orvieto' },
          categoria: { it: 'Arte e Cultura', en: 'Art & Culture', fr: 'Art et Culture', de: 'Kunst und Kultur', es: 'Arte y Cultura' },
          descrizione: { 
            it: 'Uno dei capolavori dell\'architettura gotica italiana.',
            en: 'One of the masterpieces of Italian Gothic architecture.',
            fr: 'L\'un des chefs-d\'œuvre de l\'architecture gothique italienne.',
            de: 'Eines der Meisterwerke der italienischen Gotik.',
            es: 'Una de las obras maestras de la arquitectura gótica italiana.'
          },
          distanza: '25 km',
          durata: '30 min',
          mapsUrl: 'https://maps.google.com/?q=Duomo+di+Orvieto',
          featured: true
        },
        {
          id: 'civita',
          titolo: { it: 'Civita di Bagnoregio', en: 'Civita di Bagnoregio', fr: 'Civita di Bagnoregio', de: 'Civita di Bagnoregio', es: 'Civita di Bagnoregio' },
          categoria: { it: 'Borgo Storico', en: 'Historic Village', fr: 'Village Historique', de: 'Historisches Dorf', es: 'Pueblo Histórico' },
          descrizione: { 
            it: 'La "città che muore", borgo medievale arroccato su uno sperone di tufo.',
            en: 'The "dying city", a medieval village perched on a tuff spur.',
            fr: 'La "ville qui meurt", village médiéval perché sur un éperon de tuf.',
            de: 'Die "sterbende Stadt", ein mittelalterliches Dorf auf einem Tuffsteinsporn.',
            es: 'La "ciudad que muere", pueblo medieval encaramado en un espolón de toba.'
          },
          distanza: '15 km',
          durata: '20 min',
          mapsUrl: 'https://maps.google.com/?q=Civita+di+Bagnoregio',
          featured: true
        }
      ];
      
      journeyData.push(...exampleData);
    }
    
    const header = document.createElement('div');
    header.className = 'page-header';
    header.innerHTML = `
      <div class="page-icon-wrapper">${getSectorIcon('journey')}</div>
      <h2>${i18n.t('myJourney')}</h2>
      <p>${i18n.t('myJourneyDesc')}</p>
    `;
    container.appendChild(header);
    
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container';
    
    journeyData.forEach(item => {
      cardsContainer.appendChild(createCard(item, 'journey'));
    });
    
    container.appendChild(cardsContainer);
    
  } catch (error) {
    loader.remove();
    container.appendChild(createError(error.message));
  }
  
  return container;
}

// Pagina My Taste
export async function renderMyTastePage() {
  const container = createContainer();
  
  const loader = createLoader();
  container.appendChild(loader);
  
  try {
    const tasteData = await firebaseService.getTasteData();
    
    loader.remove();
    
    if (tasteData.length === 0) {
      container.innerHTML = `
        <div class="page-header">
          <div class="page-icon-wrapper">${getSectorIcon('taste')}</div>
          <h2>${i18n.t('myTaste')}</h2>
          <p>${i18n.t('myTasteDesc')}</p>
        </div>
        <div class="info-message">
          <p>ℹ️ I ristoranti consigliati verranno caricati dal database.</p>
        </div>
      `;
      
      const exampleData = [
        {
          id: 'lapalomba',
          titolo: { it: 'La Palomba', en: 'La Palomba', fr: 'La Palomba', de: 'La Palomba', es: 'La Palomba' },
          categoria: { it: 'Ristorante', en: 'Restaurant', fr: 'Restaurant', de: 'Restaurant', es: 'Restaurante' },
          tipoCucina: { it: 'Cucina Umbra Tradizionale', en: 'Traditional Umbrian Cuisine', fr: 'Cuisine Ombrienne', de: 'Umbrische Küche', es: 'Cocina Umbria' },
          descrizione: { 
            it: 'Ottimo per il tartufo e la pasta fatta in casa.',
            en: 'Excellent for truffles and homemade pasta.',
            fr: 'Excellent pour les truffes et les pâtes maison.',
            de: 'Ausgezeichnet für Trüffel und hausgemachte Pasta.',
            es: 'Excelente para trufas y pasta casera.'
          },
          telefono: '+39 0763 343395',
          prezzoMedio: { it: '€€ (30-50€)', en: '€€ (30-50€)', fr: '€€ (30-50€)', de: '€€ (30-50€)', es: '€€ (30-50€)' },
          mapsUrl: 'https://maps.google.com/?q=La+Palomba+Orvieto',
          featured: true
        }
      ];
      
      tasteData.push(...exampleData);
    }
    
    const header = document.createElement('div');
    header.className = 'page-header';
    header.innerHTML = `
      <div class="page-icon-wrapper">${getSectorIcon('taste')}</div>
      <h2>${i18n.t('myTaste')}</h2>
      <p>${i18n.t('myTasteDesc')}</p>
    `;
    container.appendChild(header);
    
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container';
    
    tasteData.forEach(item => {
      cardsContainer.appendChild(createCard(item, 'taste'));
    });
    
    container.appendChild(cardsContainer);
    
  } catch (error) {
    loader.remove();
    container.appendChild(createError(error.message));
  }
  
  return container;
}

// Pagina My Events
export async function renderMyEventsPage() {
  const container = createContainer();
  
  const loader = createLoader();
  container.appendChild(loader);
  
  // Stato ordinamento (default per datainserimento desc)
  let currentSort = { field: 'datainserimento', direction: 'desc' };
  
  const loadEvents = async () => {
    try {
      const eventsData = await firebaseService.getEventsData(currentSort.field, currentSort.direction);
      
      loader.remove();
      
      if (eventsData.length === 0) {
        container.innerHTML = `
          <div class="page-header">
            <div class="page-icon-wrapper">${getSectorIcon('events')}</div>
            <h2>${i18n.t('myEvents')}</h2>
            <p>${i18n.t('myEventsDesc')}</p>
          </div>
          <div class="info-message">
            <p>ℹ️ Gli eventi verranno caricati dal database.</p>
          </div>
        `;
        
        const exampleData = [
          {
            id: 'eurochocolate',
            titolo: { it: 'Eurochocolate', en: 'Eurochocolate', fr: 'Eurochocolate', de: 'Eurochocolate', es: 'Eurochocolate' },
            categoria: { it: 'Festival', en: 'Festival', fr: 'Festival', de: 'Festival', es: 'Festival' },
            descrizione: { 
              it: 'Il più importante festival del cioccolato in Europa.',
              en: 'The most important chocolate festival in Europe.',
              fr: 'Le plus important festival du chocolat en Europe.',
              de: 'Das wichtigste Schokoladenfestival in Europa.',
              es: 'El festival de chocolate más importante de Europa.'
            },
            dataEvento: '2026-10-15',
            oraEvento: '10:00',
            luogoEvento: 'Perugia',
            mapsUrl: 'https://maps.google.com/?q=Perugia',
            featured: true
          }
        ];
        
        eventsData.push(...exampleData);
      }
      
      // Pulisci e ricostruisci
      container.innerHTML = '';
      
      const header = document.createElement('div');
      header.className = 'page-header';
      header.innerHTML = `
        <div class="page-icon-wrapper">${getSectorIcon('events')}</div>
        <h2>${i18n.t('myEvents')}</h2>
        <p>${i18n.t('myEventsDesc')}</p>
      `;
      container.appendChild(header);
      
      // Aggiungi controlli ordinamento
      const sortControls = document.createElement('div');
      sortControls.className = 'sort-controls';
      sortControls.style.cssText = 'display: flex; gap: 0.5rem; margin: 1rem 0; flex-wrap: wrap; justify-content: center;';
      
      const sortByDateBtn = document.createElement('button');
      sortByDateBtn.className = 'btn btn-secondary';
      sortByDateBtn.style.cssText = 'font-size: 0.9rem; padding: 0.5rem 1rem;';
      sortByDateBtn.innerHTML = `📅 Ordina per Data Evento ${currentSort.field === 'dataEvento' ? (currentSort.direction === 'asc' ? '↑' : '↓') : ''}`;
      sortByDateBtn.addEventListener('click', () => {
        if (currentSort.field === 'dataEvento') {
          // Toggle direzione
          currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
          // Passa a dataEvento ascendente
          currentSort.field = 'dataEvento';
          currentSort.direction = 'asc';
        }
        container.innerHTML = '';
        container.appendChild(loader);
        loadEvents();
      });
      
      const sortByInsertBtn = document.createElement('button');
      sortByInsertBtn.className = 'btn btn-secondary';
      sortByInsertBtn.style.cssText = 'font-size: 0.9rem; padding: 0.5rem 1rem;';
      sortByInsertBtn.innerHTML = `🆕 Più Recenti`;
      sortByInsertBtn.addEventListener('click', () => {
        currentSort.field = 'datainserimento';
        currentSort.direction = 'desc';
        container.innerHTML = '';
        container.appendChild(loader);
        loadEvents();
      });
      
      sortControls.appendChild(sortByDateBtn);
      sortControls.appendChild(sortByInsertBtn);
      container.appendChild(sortControls);
      
      const cardsContainer = document.createElement('div');
      cardsContainer.className = 'cards-container';
      
      eventsData.forEach(item => {
        cardsContainer.appendChild(createCard(item, 'events'));
      });
      
      container.appendChild(cardsContainer);
      
    } catch (error) {
      loader.remove();
      container.appendChild(createError(error.message));
    }
  };
  
  await loadEvents();
  
  return container;
}

// Pagina MyContacts
export async function renderMyAssistantPage() {
  const container = createContainer();
  
  // Ottieni configurazione contatti
  const config = uiConfigService.getConfig();
  const phone = config.contacts?.phone || '+393917557924';
  const email = config.contacts?.email || 'gozzolif@gmail.com';
  
  container.innerHTML = `
    <div class="page-header">
      <div class="page-icon-wrapper">${getSectorIcon('contacts')}</div>
      <h2>MyContacts</h2>
      <p>Contatti rapidi per MyLyfe Umbria</p>
    </div>
    
    <div class="assistant-container">
      <div class="chat-placeholder">
        <h3>${i18n.t('chatWithUs')}</h3>
        <p>${i18n.t('assistantIntro')}</p>
        <p>${i18n.t('assistantWelcome')}</p>
        <div class="contact-info">
          <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">
            <svg viewBox="0 0 24 24" width="20" height="20" style="margin-right: 8px;">
              <path fill="currentColor" d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.32a8.188 8.188 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27-.25-.14-1.47-.74-1.69-.82-.23-.08-.37-.12-.56.12-.16.25-.64.81-.78.97-.15.17-.29.19-.53.07-.26-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.12-.24-.01-.39.11-.5.11-.11.27-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.11-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43-.14 0-.3-.01-.47-.01z"/>
            </svg>
            Chatta su WhatsApp
          </a>
          <a href="tel:${phone}" class="btn btn-secondary">
            ${getSectorIcon('phone')}
            Chiamaci
          </a>
          <a href="mailto:${email}" class="btn btn-secondary">
            ${getSectorIcon('email')}
            Email
          </a>
        </div>
      </div>
    </div>
  `;
  
  return container;
}

// Pagina dettaglio My Home
export async function renderHomeDetailPage(params) {
  const container = createContainer();
  const itemId = params.id;
  
  // Mostra loader
  container.appendChild(createLoader());
  
  try {
    const homeData = await firebaseService.getHomeData();
    const item = homeData.find(d => d.id === itemId);
    
    if (!item) {
      container.innerHTML = '<div class="error-message">Elemento non trovato</div>';
      return container;
    }
    
    container.innerHTML = `
      ${item.imgUrl ? `<img src="${item.imgUrl}" alt="${i18n.tm(item.titolo)}" class="detail-page-image">` : `<div class="detail-page-icon">${getIconFromComponents(item.icona || 'info')}</div>`}
      <div class="detail-page-content">
        <h2 class="detail-page-title">${i18n.tm(item.titolo)}</h2>
        <p class="detail-page-description">${i18n.tm(item.descrizione)}</p>
        ${item.notes ? `
          <div class="detail-section">
            <h3>📋 Dettagli e Informazioni</h3>
            <div class="detail-notes">${i18n.tm(item.notes)}</div>
          </div>
        ` : ''}
        <div class="detail-page-actions">
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
          ${item.downloadUrl ? `
            <a href="${item.downloadUrl}" class="btn btn-secondary" download>
              📄 ${i18n.tm(item.downloadLabel) || i18n.t('download')}
            </a>
          ` : ''}
        </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = '';
    container.appendChild(createError());
  }
  
  return container;
}

// Pagina dettaglio My Journey
export async function renderJourneyDetailPage(params) {
  const container = createContainer();
  const itemId = params.id;
  
  // Mostra loader
  container.appendChild(createLoader());
  
  try {
    const journeyData = await firebaseService.getJourneyData();
    const item = journeyData.find(d => d.id === itemId);
    
    if (!item) {
      container.innerHTML = '<div class="error-message">Elemento non trovato</div>';
      return container;
    }
    
    container.innerHTML = `
      ${item.imgUrl ? `<img src="${item.imgUrl}" alt="${i18n.tm(item.titolo)}" class="detail-page-image">` : ''}
      <div class="detail-page-content">
        <div class="detail-page-header">
          <h2 class="detail-page-title">${i18n.tm(item.titolo)}</h2>
          ${item.categoria ? `<span class="detail-category">${i18n.tm(item.categoria)}</span>` : ''}
        </div>
        <p class="detail-page-description">${i18n.tm(item.descrizione)}</p>
        ${item.distanza || item.durata ? `
          <div class="detail-info-row">
            ${item.distanza ? `<span class="detail-info-item">📍 ${item.distanza}</span>` : ''}
            ${item.durata ? `<span class="detail-info-item">⏱️ ${item.durata}</span>` : ''}
          </div>
        ` : ''}
        ${item.notes ? `
          <div class="detail-section">
            <h3>📋 Informazioni Turistiche</h3>
            <div class="detail-notes">${i18n.tm(item.notes)}</div>
          </div>
        ` : ''}
        <div class="detail-page-actions">
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
  } catch (error) {
    container.innerHTML = '';
    container.appendChild(createError());
  }
  
  return container;
}

// Pagina dettaglio My Taste
export async function renderTasteDetailPage(params) {
  const container = createContainer();
  const itemId = params.id;
  
  // Mostra loader
  container.appendChild(createLoader());
  
  try {
    const tasteData = await firebaseService.getTasteData();
    const item = tasteData.find(d => d.id === itemId);
    
    if (!item) {
      container.innerHTML = '<div class="error-message">Elemento non trovato</div>';
      return container;
    }
    
    container.innerHTML = `
      ${item.imgUrl ? `<img src="${item.imgUrl}" alt="${i18n.tm(item.titolo)}" class="detail-page-image">` : ''}
      <div class="detail-page-content">
        <div class="detail-page-header">
          <h2 class="detail-page-title">${i18n.tm(item.titolo)}</h2>
          ${item.categoria ? `<span class="detail-category">${i18n.tm(item.categoria)}</span>` : ''}
        </div>
        ${item.tipoCucina ? `<p class="detail-cuisine">🍴 ${i18n.tm(item.tipoCucina)}</p>` : ''}
        <p class="detail-page-description">${i18n.tm(item.descrizione)}</p>
        ${item.prezzoMedio ? `<p class="detail-price">💰 ${i18n.tm(item.prezzoMedio)}</p>` : ''}
        ${item.notes ? `
          <div class="detail-section">
            <h3>📋 Informazioni e Suggerimenti</h3>
            <div class="detail-notes">${i18n.tm(item.notes)}</div>
          </div>
        ` : ''}
        <div class="detail-page-actions">
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
  } catch (error) {
    container.innerHTML = '';
    container.appendChild(createError());
  }
  
  return container;
}

// Pagina dettaglio My Events
export async function renderEventsDetailPage(params) {
  const container = createContainer();
  const itemId = params.id;
  
  // Mostra loader
  container.appendChild(createLoader());
  
  try {
    const eventsData = await firebaseService.getEventsData();
    const item = eventsData.find(d => d.id === itemId);
    
    if (!item) {
      container.innerHTML = '<div class="error-message">Evento non trovato</div>';
      return container;
    }
    
    // Formatta data e ora
    const eventDate = item.dataEvento ? new Date(item.dataEvento).toLocaleDateString(i18n.getCurrentLanguage(), { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : '';
    const eventTime = item.oraEvento || '';
    
    container.innerHTML = `
      ${item.imgUrl ? `<img src="${item.imgUrl}" alt="${i18n.tm(item.titolo)}" class="detail-page-image">` : ''}
      <div class="detail-page-content">
        <div class="detail-page-header">
          <h2 class="detail-page-title">${i18n.tm(item.titolo)}</h2>
          ${item.categoria ? `<span class="detail-category">${i18n.tm(item.categoria)}</span>` : ''}
        </div>
        <p class="detail-page-description">${i18n.tm(item.descrizione)}</p>
        <div class="detail-info-row">
          ${eventDate ? `<span class="detail-info-item">📅 ${eventDate}</span>` : ''}
          ${eventTime ? `<span class="detail-info-item">🕐 ${eventTime}</span>` : ''}
          ${item.luogoEvento ? `<span class="detail-info-item">📍 ${item.luogoEvento}</span>` : ''}
        </div>
        ${item.notes ? `
          <div class="detail-section">
            <h3>📋 Informazioni Aggiuntive</h3>
            <div class="detail-notes">${i18n.tm(item.notes)}</div>
          </div>
        ` : ''}
        <div class="detail-page-actions">
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
          ${item.pdfUrl ? `
            <a href="${item.pdfUrl}" target="_blank" class="btn btn-secondary" download>
              📄 Scarica Programma
            </a>
          ` : ''}
        </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = '';
    container.appendChild(createError());
  }
  
  return container;
}

// Funzione helper per ottenere icona
function getIconFromComponents(iconName) {
  const icons = {
    wifi: '📶',
    pool: '🏊',
    key: '🔑',
    info: 'ℹ️',
    home: '🏠'
  };
  return icons[iconName] || icons.info;
}
