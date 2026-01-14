// Pannello Admin - MyLyfe

import { i18n } from './i18n.js';
import { authService } from './auth-service.js';
import { router } from './router.js';
import { firebaseService } from './firebase-service.js';
import { uiConfigService } from './ui-config-service.js';
import { db, storage } from './firebase-config.js';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Dashboard Admin
export async function renderAdminDashboard() {
  const container = document.createElement('div');
  container.className = 'admin-container';
  
  const user = authService.getCurrentUser();
  
  container.innerHTML = `
    <div class="admin-header">
      <div>
        <h2>🎛️ Pannello Amministrativo</h2>
        <p>Benvenuto, ${user.email}</p>
      </div>
      <button class="btn btn-secondary" id="logout-btn">
        Logout
      </button>
    </div>
    
    <div class="admin-nav">
      <button class="admin-nav-btn active" data-section="home">
        🏠 My Home
      </button>
      <button class="admin-nav-btn" data-section="journey">
        🗺️ My Journey
      </button>
      <button class="admin-nav-btn" data-section="taste">
        🍷 My Taste
      </button>
      <button class="admin-nav-btn" data-section="ui-config">
        🎨 Configurazione UI
      </button>
    </div>
    
    <div id="admin-content" class="admin-content">
      <!-- Contenuto dinamico -->
    </div>
  `;
  
  // Gestisci logout
  container.querySelector('#logout-btn').addEventListener('click', async () => {
    await authService.logout();
    router.navigate('/admin/login');
  });
  
  // Gestisci navigazione sezioni
  const navButtons = container.querySelectorAll('.admin-nav-btn');
  const contentArea = container.querySelector('#admin-content');
  
  navButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      // Aggiorna stato attivo
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Carica sezione
      const section = btn.dataset.section;
      contentArea.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
      
      const sectionContent = await renderAdminSection(section);
      contentArea.innerHTML = '';
      contentArea.appendChild(sectionContent);
    });
  });
  
  // Carica sezione iniziale
  const initialSection = await renderAdminSection('home');
  contentArea.appendChild(initialSection);
  
  return container;
}

// Render sezione admin
async function renderAdminSection(section) {
  const container = document.createElement('div');
  container.className = 'admin-section';
  
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
    }
  } catch (error) {
    console.error('Errore caricamento dati:', error);
  }
  
  // Header sezione
  const header = document.createElement('div');
  header.className = 'admin-section-header';
  header.innerHTML = `
    <h3>${getSectionTitle(section)}</h3>
    <button class="btn btn-primary" data-action="add" data-collection="${collectionName}">
      ➕ Aggiungi Nuovo
    </button>
  `;
  container.appendChild(header);
  
  // Lista items
  const list = document.createElement('div');
  list.className = 'admin-items-list';
  
  if (data.length === 0) {
    list.innerHTML = '<p class="empty-message">Nessun elemento presente</p>';
  } else {
    data.forEach(item => {
      list.appendChild(createAdminItem(item, collectionName));
    });
  }
  
  container.appendChild(list);
  
  // Gestisci click aggiungi
  header.querySelector('[data-action="add"]').addEventListener('click', (e) => {
    const collection = e.target.dataset.collection;
    showEditModal(null, collection);
  });
  
  return container;
}

// Crea item nella lista admin
function createAdminItem(item, collection) {
  const div = document.createElement('div');
  div.className = 'admin-item';
  
  const title = i18n.tm(item.titolo) || item.id;
  const desc = i18n.tm(item.descrizione) || i18n.tm(item.categoria) || '';
  
  div.innerHTML = `
    <div class="admin-item-content">
      <h4>${title}</h4>
      <p>${desc.substring(0, 100)}${desc.length > 100 ? '...' : ''}</p>
      <span class="admin-item-id">ID: ${item.id}</span>
    </div>
    <div class="admin-item-actions">
      <button class="btn btn-sm btn-secondary" data-action="edit">
        ✏️ Modifica
      </button>
      <button class="btn btn-sm btn-danger" data-action="delete">
        🗑️ Elimina
      </button>
    </div>
  `;
  
  // Gestisci modifica
  div.querySelector('[data-action="edit"]').addEventListener('click', () => {
    showEditModal(item, collection);
  });
  
  // Gestisci eliminazione
  div.querySelector('[data-action="delete"]').addEventListener('click', async () => {
    if (confirm(`Sei sicuro di voler eliminare "${title}"?`)) {
      await deleteItem(item.id, collection);
    }
  });
  
  return div;
}

// Mostra modal di modifica
function showEditModal(item, collection) {
  const isNew = !item;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${isNew ? '➕ Aggiungi' : '✏️ Modifica'} ${getSectionTitle(collection)}</h3>
        <button class="modal-close">✕</button>
      </div>
      
      <form id="edit-form" class="admin-form">
        ${createFormFields(item, collection)}
        
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel">
            Annulla
          </button>
          <button type="submit" class="btn btn-primary">
            ${isNew ? 'Crea' : 'Salva'}
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Gestisci chiusura
  const closeModal = () => modal.remove();
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.querySelector('[data-action="cancel"]').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
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
    closeModal();
  });
  
  // Inizializza editor HTML dopo che il modal è nel DOM
  setTimeout(() => {
    initHTMLEditor(modal);
  }, 0);
}

// Inizializza editor HTML
function initHTMLEditor(modal) {
  const toolbar = modal.querySelector('.html-editor-toolbar');
  const editors = modal.querySelectorAll('.html-editor-content');
  
  if (!toolbar || editors.length === 0) return;
  
  let currentEditor = null;
  
  // Focus tracking per sapere quale editor è attivo
  editors.forEach(editor => {
    editor.addEventListener('focus', () => {
      currentEditor = editor;
    });
  });
  
  // Gestisci pulsanti toolbar
  toolbar.querySelectorAll('.toolbar-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const command = btn.dataset.command;
      
      if (!currentEditor) {
        currentEditor = editors[0];
      }
      
      currentEditor.focus();
      
      if (command === 'createLink') {
        const url = prompt('Inserisci URL:');
        if (url) {
          document.execCommand(command, false, url);
        }
      } else {
        document.execCommand(command, false, null);
      }
    });
  });
  
  // Previeni paste di HTML non sicuro per tutti gli editor
  editors.forEach(editor => {
    editor.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    });
  });
}

// Crea campi del form
function createFormFields(item, collection) {
  let fields = `
    <div class="form-group">
      <label>ID Documento</label>
      <input type="text" name="id" value="${item?.id || ''}" required ${item ? 'readonly' : ''}>
      <small>Identificativo univoco (es: wifi, orvieto, lapalomba)</small>
    </div>
  `;
  
  // Campi comuni
  const languages = ['it', 'en', 'fr', 'de', 'es'];
  
  // Titolo multilingua
  fields += '<div class="form-group-multi"><label>Titolo</label>';
  languages.forEach(lang => {
    const value = item?.titolo?.[lang] || '';
    fields += `
      <input 
        type="text" 
        name="titolo_${lang}" 
        placeholder="${lang.toUpperCase()}" 
        value="${value}"
        required
      >
    `;
  });
  fields += '</div>';
  
  // Descrizione multilingua
  fields += '<div class="form-group-multi"><label>Descrizione</label>';
  languages.forEach(lang => {
    const value = item?.descrizione?.[lang] || '';
    fields += `
      <textarea 
        name="descrizione_${lang}" 
        placeholder="${lang.toUpperCase()}" 
        rows="3"
        required
      >${value}</textarea>
    `;
  });
  fields += '</div>';
  
  // Campi specifici per collezione
  if (collection === 'home') {
    fields += `
      <div class="form-group">
        <label>Immagine</label>
        ${item?.imgUrl ? `
          <div class="current-image">
            <img src="${item.imgUrl}" alt="Immagine attuale" style="max-width: 200px; border-radius: 8px; margin-bottom: 0.5rem;">
            <p style="font-size: 0.9rem; color: #7f8c8d;">Immagine corrente</p>
          </div>
        ` : ''}
        <input type="file" name="image" accept="image/*" id="image-upload">
        <small>Carica un'immagine (JPG, PNG, max 5MB) - opzionale</small>
      </div>
      <div class="form-group">
        <label>Icona</label>
        <input type="text" name="icona" value="${item?.icona || ''}" placeholder="wifi, pool, key">
        <small>Icona emoji/SVG - usata solo se non c'è un'immagine</small>
      </div>
      <div class="form-group">
        <label>Link Google Maps</label>
        <input type="url" name="mapsUrl" value="${item?.mapsUrl || ''}" placeholder="https://maps.google.com/?q=...">
      </div>
    `;
  }
  
  if (collection === 'journey' || collection === 'taste') {
    // Categoria multilingua
    fields += '<div class="form-group-multi"><label>Categoria</label>';
    languages.forEach(lang => {
      const value = item?.categoria?.[lang] || '';
      fields += `
        <input 
          type="text" 
          name="categoria_${lang}" 
          placeholder="${lang.toUpperCase()}" 
          value="${value}"
        >
      `;
    });
    fields += '</div>';
  }
  
  if (collection === 'journey') {
    fields += `
      <div class="form-group">
        <label>Immagine del Luogo</label>
        ${item?.imgUrl ? `
          <div class="current-image">
            <img src="${item.imgUrl}" alt="Immagine attuale" style="max-width: 200px; border-radius: 8px; margin-bottom: 0.5rem;">
            <p style="font-size: 0.9rem; color: #7f8c8d;">Immagine corrente</p>
          </div>
        ` : ''}
        <input type="file" name="image" accept="image/*" id="image-upload">
        <small>Carica una nuova immagine (JPG, PNG, max 5MB)</small>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Distanza</label>
          <input type="text" name="distanza" value="${item?.distanza || ''}" placeholder="25 km">
        </div>
        <div class="form-group">
          <label>Durata</label>
          <input type="text" name="durata" value="${item?.durata || ''}" placeholder="30 min">
        </div>
      </div>
      <div class="form-group">
        <label>Link Google Maps</label>
        <input type="url" name="mapsUrl" value="${item?.mapsUrl || ''}" placeholder="https://maps.google.com/?q=...">
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" name="featured" ${item?.featured ? 'checked' : ''}>
          In evidenza
        </label>
      </div>
    `;
  }
  
  if (collection === 'taste') {
    fields += `
      <div class="form-group">
        <label>Immagine del Ristorante</label>
        ${item?.imgUrl ? `
          <div class="current-image">
            <img src="${item.imgUrl}" alt="Immagine attuale" style="max-width: 200px; border-radius: 8px; margin-bottom: 0.5rem;">
            <p style="font-size: 0.9rem; color: #7f8c8d;">Immagine corrente</p>
          </div>
        ` : ''}
        <input type="file" name="image" accept="image/*" id="image-upload">
        <small>Carica una nuova immagine (JPG, PNG, max 5MB)</small>
      </div>
    `;
    
    fields += '<div class="form-group-multi"><label>Tipo Cucina</label>';
    languages.forEach(lang => {
      const value = item?.tipoCucina?.[lang] || '';
      fields += `
        <input 
          type="text" 
          name="tipoCucina_${lang}" 
          placeholder="${lang.toUpperCase()}" 
          value="${value}"
        >
      `;
    });
    fields += '</div>';
    
    fields += `
      <div class="form-group">
        <label>Telefono</label>
        <input type="tel" name="telefono" value="${item?.telefono || ''}" placeholder="+39 ...">
      </div>
      <div class="form-group">
        <label>Link Google Maps</label>
        <input type="url" name="mapsUrl" value="${item?.mapsUrl || ''}" placeholder="https://maps.google.com/?q=...">
      </div>
    `;
    
    fields += '<div class="form-group-multi"><label>Prezzo Medio</label>';
    languages.forEach(lang => {
      const value = item?.prezzoMedio?.[lang] || '';
      fields += `
        <input 
          type="text" 
          name="prezzoMedio_${lang}" 
          placeholder="${lang.toUpperCase()}" 
          value="${value}"
        >
      `;
    });
    fields += '</div>';
    
    fields += `
      <div class="form-group">
        <label>
          <input type="checkbox" name="featured" ${item?.featured ? 'checked' : ''}>
          In evidenza
        </label>
      </div>
    `;
  }
  
  // Campo Note con editor HTML multilingua (comune a tutte le sezioni)
  fields += '<div class="form-group-multi"><label>Note / Dettagli (Multilingua)</label>';
  fields += '<div class="html-editor-toolbar">';
  fields += '<button type="button" class="toolbar-btn" data-command="bold" title="Grassetto"><strong>B</strong></button>';
  fields += '<button type="button" class="toolbar-btn" data-command="italic" title="Corsivo"><em>I</em></button>';
  fields += '<button type="button" class="toolbar-btn" data-command="insertUnorderedList" title="Elenco puntato">• Lista</button>';
  fields += '<button type="button" class="toolbar-btn" data-command="insertOrderedList" title="Elenco numerato">1. Lista</button>';
  fields += '<button type="button" class="toolbar-btn" data-command="createLink" title="Inserisci link">🔗 Link</button>';
  fields += '</div>';
  
  languages.forEach(lang => {
    const value = item?.notes?.[lang] || '';
    fields += `
      <div class="lang-editor-group">
        <label class="lang-label">${lang.toUpperCase()}</label>
        <div 
          class="html-editor-content" 
          contenteditable="true" 
          data-lang="${lang}"
          data-field="notes"
          style="min-height: 120px; border: 1px solid #ddd; border-radius: 4px; padding: 12px; margin-bottom: 0.5rem; background: white;"
        >${value}</div>
        <input type="hidden" name="notes_${lang}" class="notes-hidden-${lang}">
      </div>
    `;
  });
  fields += '<small>Inserisci dettagli, informazioni turistiche, suggerimenti. Puoi formattare il testo e aggiungere link per ogni lingua.</small>';
  fields += '</div>';
  
  fields += `
    <div class="form-group">
      <label>Guida PDF</label>
      ${item?.pdfUrl ? `
        <div class="current-file">
          <p style="margin-bottom: 0.5rem;">
            📄 <a href="${item.pdfUrl}" target="_blank" style="color: #6da34d;">Guida corrente</a>
          </p>
        </div>
      ` : ''}
      <input type="file" name="pdf" accept=".pdf,application/pdf" id="pdf-upload">
      <small>Carica una guida in PDF (max 10MB) - opzionale</small>
    </div>
  `;
  
  // Ordine
  fields += `
    <div class="form-group">
      <label>Ordine</label>
      <input type="number" name="ordine" value="${item?.ordine || 1}" min="1">
    </div>
  `;
  
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
  ['icona', 'distanza', 'durata', 'mapsUrl', 'telefono'].forEach(field => {
    const value = formData.get(field);
    if (value) data[field] = value;
  });
  
  // Checkbox
  data.featured = formData.get('featured') === 'on';
  if (collection === 'taste') {
    data.prenotazioneConsigliata = formData.get('prenotazioneConsigliata') === 'on';
  }
  
  try {
    await setDoc(doc(db, collection, id), data);
    console.log('✅ Item salvato:', id);
    alert('Salvato con successo!');
    // Ricarica solo il dashboard admin senza reload completo
    const adminContent = document.querySelector('#admin-content');
    if (adminContent) {
      adminContent.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
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
      adminContent.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
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
    'ui-config': 'Configurazione UI'
  };
  return titles[section] || section;
}

// ========== SEZIONE CONFIGURAZIONE UI ==========

async function renderUIConfigSection() {
  const container = document.createElement('div');
  container.className = 'ui-config-section';
  
  // Carica configurazione corrente
  const config = await uiConfigService.loadConfig();
  
  container.innerHTML = `
    <div class="ui-config-header">
      <h3>🎨 Configurazione UI</h3>
      <p>Personalizza colori, logo, nome app e testi dell'interfaccia</p>
    </div>
    
    <form id="ui-config-form" class="ui-config-form">
      <!-- PALETTE COLORI -->
      <div class="config-section">
        <h4>🎨 Palette Colori</h4>
        <p class="section-desc">Modifica i colori principali dell'interfaccia</p>
        
        <div class="color-grid">
          <div class="color-input-group">
            <label>Colore Primario (Verde)</label>
            <input type="color" name="color-primary" value="${config.colors.primary}">
            <input type="text" name="color-primary-text" value="${config.colors.primary}" pattern="^#[0-9A-Fa-f]{6}$">
          </div>
          
          <div class="color-input-group">
            <label>Colore Secondario (Viola)</label>
            <input type="color" name="color-secondary" value="${config.colors.secondary}">
            <input type="text" name="color-secondary-text" value="${config.colors.secondary}" pattern="^#[0-9A-Fa-f]{6}$">
          </div>
          
          <div class="color-input-group">
            <label>Colore Accento (Salvia)</label>
            <input type="color" name="color-accent" value="${config.colors.accent}">
            <input type="text" name="color-accent-text" value="${config.colors.accent}" pattern="^#[0-9A-Fa-f]{6}$">
          </div>
          
          <div class="color-input-group">
            <label>Colore Teal</label>
            <input type="color" name="color-teal" value="${config.colors.teal}">
            <input type="text" name="color-teal-text" value="${config.colors.teal}" pattern="^#[0-9A-Fa-f]{6}$">
          </div>
          
          <div class="color-input-group">
            <label>Verde Chiaro</label>
            <input type="color" name="color-light-green" value="${config.colors.lightGreen}">
            <input type="text" name="color-light-green-text" value="${config.colors.lightGreen}" pattern="^#[0-9A-Fa-f]{6}$">
          </div>
          
          <div class="color-input-group">
            <label>Sfondo</label>
            <input type="color" name="color-background" value="${config.colors.background}">
            <input type="text" name="color-background-text" value="${config.colors.background}" pattern="^#[0-9A-Fa-f]{6}$">
          </div>
        </div>
      </div>
      
      <!-- BRANDING -->
      <div class="config-section">
        <h4>🏷️ Branding</h4>
        <p class="section-desc">Nome dell'app e slogan (multilingua)</p>
        
        <div class="branding-inputs">
          <h5>Nome App</h5>
          <div class="multilang-inputs">
            <input type="text" name="app-name-it" placeholder="Italiano" value="${config.branding.appName.it}">
            <input type="text" name="app-name-en" placeholder="English" value="${config.branding.appName.en}">
            <input type="text" name="app-name-fr" placeholder="Français" value="${config.branding.appName.fr}">
            <input type="text" name="app-name-de" placeholder="Deutsch" value="${config.branding.appName.de}">
            <input type="text" name="app-name-es" placeholder="Español" value="${config.branding.appName.es}">
          </div>
          
          <h5>Slogan / Tagline</h5>
          <div class="multilang-inputs">
            <input type="text" name="app-tagline-it" placeholder="Italiano" value="${config.branding.appTagline.it}">
            <input type="text" name="app-tagline-en" placeholder="English" value="${config.branding.appTagline.en}">
            <input type="text" name="app-tagline-fr" placeholder="Français" value="${config.branding.appTagline.fr}">
            <input type="text" name="app-tagline-de" placeholder="Deutsch" value="${config.branding.appTagline.de}">
            <input type="text" name="app-tagline-es" placeholder="Español" value="${config.branding.appTagline.es}">
          </div>
        </div>
      </div>
      
      <!-- TESTI HOMEPAGE -->
      <div class="config-section">
        <h4>🏠 Testi Homepage</h4>
        <p class="section-desc">Testi che appaiono nella homepage</p>
        
        <div class="branding-inputs">
          <h5>Sottotitolo Benvenuto</h5>
          <div class="multilang-inputs">
            <input type="text" name="welcome-subtitle-it" placeholder="Italiano" value="${config.homeTexts.welcomeSubtitle.it}">
            <input type="text" name="welcome-subtitle-en" placeholder="English" value="${config.homeTexts.welcomeSubtitle.en}">
            <input type="text" name="welcome-subtitle-fr" placeholder="Français" value="${config.homeTexts.welcomeSubtitle.fr}">
            <input type="text" name="welcome-subtitle-de" placeholder="Deutsch" value="${config.homeTexts.welcomeSubtitle.de}">
            <input type="text" name="welcome-subtitle-es" placeholder="Español" value="${config.homeTexts.welcomeSubtitle.es}">
          </div>
        </div>
      </div>
      
      <!-- FOOTER -->
      <div class="config-section">
        <h4>📄 Footer</h4>
        <p class="section-desc">Testi del piè di pagina</p>
        
        <div class="branding-inputs">
          <h5>Copyright</h5>
          <input type="text" name="footer-copyright" placeholder="Nome copyright" value="${config.footer.copyright}">
          
          <h5>Anno</h5>
          <input type="text" name="footer-year" placeholder="Anno" value="${config.footer.year}">
        </div>
      </div>
      
      <!-- PULSANTI AZIONE -->
      <div class="ui-config-actions">
        <button type="button" class="btn btn-secondary" id="preview-config-btn">
          👁️ Anteprima
        </button>
        <button type="submit" class="btn btn-primary">
          💾 Salva e Applica
        </button>
        <button type="button" class="btn btn-secondary" id="reset-config-btn">
          ↩️ Ripristina Default
        </button>
      </div>
    </form>
  `;
  
  // Sincronizza color picker con text input
  container.querySelectorAll('.color-input-group').forEach(group => {
    const colorInput = group.querySelector('input[type="color"]');
    const textInput = group.querySelector('input[type="text"]');
    
    colorInput.addEventListener('input', () => {
      textInput.value = colorInput.value;
    });
    
    textInput.addEventListener('input', () => {
      if (textInput.checkValidity()) {
        colorInput.value = textInput.value;
      }
    });
  });
  
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
      logoType: 'svg',
      logoUrl: null,
      logoSvg: null
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
