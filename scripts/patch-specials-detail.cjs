const fs = require('fs');
const content = fs.readFileSync('c:/PROGETTI/MYLYFEUMBRIA/src/pages.js', 'utf8');

const OLD_FN_START = 'export async function renderSpecialsDetailPage(params) {';
const OLD_FN_END = '\r\n\r\n// Pagina MyContacts';

const start = content.indexOf(OLD_FN_START);
const end = content.indexOf(OLD_FN_END);

if (start === -1 || end === -1) {
  console.error('Could not find function boundaries');
  process.exit(1);
}

const newFn = `export async function renderSpecialsDetailPage(params) {
  const container = createContainer();
  const itemId = params.id;

  container.appendChild(createLoader());

  try {
    const specialsData = await firebaseService.getSpecialsData();
    const item = specialsData.find(d => d.id === itemId);

    if (!item) {
      container.innerHTML = '<div class="error-message">Offerta non trovata</div>';
      return container;
    }

    const validUntil = item.validoFino
      ? new Date(item.validoFino).toLocaleDateString(i18n.getCurrentLanguage(), {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })
      : '';

    container.innerHTML = \`
      \${item.imgUrl ? \`<img src="\${item.imgUrl}" alt="\${i18n.tm(item.titolo)}" class="detail-page-image">\` : ''}
      <div class="detail-page-content">
        <div class="detail-page-header">
          <h2 class="detail-page-title">\${i18n.tm(item.titolo)}</h2>
          \${item.categoria ? \`<span class="detail-category">\${i18n.tm(item.categoria)}</span>\` : ''}
        </div>
        <p class="detail-page-description">\${i18n.tm(item.descrizione)}</p>
        <div class="detail-info-row">
          \${item.prezzo ? \`<span class="detail-info-item"><span style="text-decoration:\${item.prezzoScontato ? 'line-through' : 'none'};color:\${item.prezzoScontato ? '#aaa' : 'inherit'}">Prezzo: \${parseFloat(item.prezzo).toFixed(2)} \u20AC</span></span>\` : ''}
          \${item.prezzoScontato ? \`<span class="detail-info-item" style="color:#87a34d;font-weight:700">Prezzo scontato: \${parseFloat(item.prezzoScontato).toFixed(2)} \u20AC</span>\` : ''}
          \${item.sconto ? \`<span class="detail-info-item" style="color:#87a34d;font-weight:700">\${i18n.t('specialDiscount')}: \${item.sconto}</span>\` : (item.scontoPerc ? \`<span class="detail-info-item" style="color:#87a34d;font-weight:700">Sconto: \${item.scontoPerc}%</span>\` : '')}
          \${validUntil ? \`<span class="detail-info-item">\${i18n.t('specialValidUntil')}: \${validUntil}</span>\` : ''}
          \${item.luogo ? \`<span class="detail-info-item">\${item.luogo}</span>\` : ''}
        </div>
        \${item.notes ? \`
          <div class="detail-section">
            <h3>Dettagli</h3>
            <div class="detail-notes">\${i18n.tm(item.notes)}</div>
          </div>
        \` : ''}
        <div class="detail-page-actions">
          \${item.mapsUrl ? \`
            <a href="\${item.mapsUrl}" target="_blank" class="btn btn-primary">
              \${i18n.t('openMap')}
            </a>
          \` : ''}
          \${item.sitoWeb ? \`
            <a href="\${item.sitoWeb}" target="_blank" class="btn btn-secondary">
              \${i18n.t('website')}
            </a>
          \` : ''}
        </div>
        \${item.prenotazioneAttiva ? \`
          <div class="booking-btn-wrap">
            <button class="btn-booking" id="booking-open-btn">
              \uD83D\uDCC5 Richiesta di prenotazione
            </button>
            <div class="booking-form-panel" id="booking-panel">
              <p class="booking-form-title">Compila il modulo per richiedere la prenotazione</p>
              <div class="form-group">
                <label>Nominativo <span style="color:#c62828">*</span></label>
                <input type="text" id="booking-nome" placeholder="Nome e Cognome">
              </div>
              <div class="form-group">
                <label>Email <span style="color:#c62828">*</span></label>
                <input type="email" id="booking-email" placeholder="La tua email">
              </div>
              <div class="form-group">
                <label>Telefono <span class="booking-field-hint">(facoltativo)</span></label>
                <input type="tel" id="booking-tel" placeholder="+39 ...">
              </div>
              <div class="booking-submit-row">
                <button class="btn-booking-submit" id="booking-submit-btn">Invia richiesta</button>
                <button class="btn-booking-cancel" id="booking-cancel-btn">Annulla</button>
              </div>
            </div>
          </div>
        \` : ''}
      </div>
    \`;

    if (item.prenotazioneAttiva) {
      const openBtn = container.querySelector('#booking-open-btn');
      const panel = container.querySelector('#booking-panel');
      const cancelBtn = container.querySelector('#booking-cancel-btn');
      const submitBtn = container.querySelector('#booking-submit-btn');
      const nomeInput = container.querySelector('#booking-nome');
      const emailInput = container.querySelector('#booking-email');
      const telInput = container.querySelector('#booking-tel');

      openBtn.addEventListener('click', () => {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) nomeInput.focus();
      });

      cancelBtn.addEventListener('click', () => {
        panel.classList.remove('open');
        nomeInput.value = '';
        emailInput.value = '';
        telInput.value = '';
      });

      [nomeInput, emailInput].forEach(inp => {
        inp.addEventListener('input', () => { inp.style.borderColor = ''; });
      });

      submitBtn.addEventListener('click', () => {
        const nome = nomeInput.value.trim();
        const email = emailInput.value.trim();
        const tel = telInput.value.trim();

        if (!nome) { nomeInput.style.borderColor = '#c62828'; nomeInput.focus(); return; }
        if (!email || !/^\\S+@\\S+\\.\\S+$/.test(email)) { emailInput.style.borderColor = '#c62828'; emailInput.focus(); return; }

        const cfg = uiConfigService.getConfig();
        const toEmail = cfg.contacts && cfg.contacts.email ? cfg.contacts.email : 'info@mylyfeumbria.it';
        const itemTitle = i18n.tm(item.titolo);
        const subject = encodeURIComponent('Richiesta di prenotazione: ' + itemTitle);
        const body = encodeURIComponent(
          'Richiesta di prenotazione per: ' + itemTitle + '\\n\\n' +
          'Nominativo: ' + nome + '\\n' +
          'Email: ' + email + '\\n' +
          (tel ? 'Telefono: ' + tel + '\\n' : '') +
          '\\nInviata dall\\'app MyLyfe Umbria'
        );

        window.open('mailto:' + toEmail + '?subject=' + subject + '&body=' + body, '_blank');
        panel.innerHTML = '<p class="booking-success-msg">\u2705 Il tuo client email si \u00e8 aperto con la richiesta precompilata. Premi \u201cInvia\u201d per confermare.</p>';
      });
    }

  } catch (error) {
    container.innerHTML = '';
    container.appendChild(createError());
  }

  return container;
}`;

const newContent = content.slice(0, start) + newFn + content.slice(end);
fs.writeFileSync('c:/PROGETTI/MYLYFEUMBRIA/src/pages.js', newContent, 'utf8');
console.log('Done. New content size:', newContent.length);
