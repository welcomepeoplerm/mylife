// SVG Icons per i settori dell'app

export const sectorIcons = {
  home: `
    <svg viewBox="0 0 48 48" class="sector-icon" fill="none">
      <!-- Casa con riempimento verde - stile icona mockup -->
      <path d="M24 6 L4 24 L10 24 L10 42 L38 42 L38 24 L44 24 Z" fill="#c8d8a0" stroke="#87a34d" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Porta -->
      <rect x="19" y="28" width="10" height="14" rx="1" fill="#87a34d" opacity="0.6"/>
    </svg>
  `,
  
  journey: `
    <svg viewBox="0 0 48 48" class="sector-icon" fill="none">
      <!-- Mappa con pin - stile filled mockup -->
      <rect x="6" y="8" width="36" height="32" rx="3" fill="#c8d8a0" stroke="#87a34d" stroke-width="2.5"/>
      <!-- Pieghe mappa -->
      <line x1="18" y1="8" x2="18" y2="40" stroke="#87a34d" stroke-width="1.5" opacity="0.4"/>
      <line x1="30" y1="8" x2="30" y2="40" stroke="#87a34d" stroke-width="1.5" opacity="0.4"/>
      <!-- Pin -->
      <path d="M24 16 C20 16 17 19 17 22.5 C17 27 24 33 24 33 C24 33 31 27 31 22.5 C31 19 28 16 24 16Z" fill="#87a34d" stroke="#5c7a2e" stroke-width="1.5"/>
      <circle cx="24" cy="22.5" r="2.5" fill="#fff"/>
    </svg>
  `,
  
  taste: `
    <svg viewBox="0 0 48 48" class="sector-icon" fill="none">
      <!-- Forchetta e coltello - stile filled mockup -->
      <!-- Forchetta -->
      <path d="M12 8 L12 18 Q12 24 16 24 L16 40" stroke="#87a34d" stroke-width="3" stroke-linecap="round" fill="none"/>
      <line x1="16" y1="8" x2="16" y2="18" stroke="#87a34d" stroke-width="3" stroke-linecap="round"/>
      <line x1="20" y1="8" x2="20" y2="18" stroke="#87a34d" stroke-width="3" stroke-linecap="round"/>
      <path d="M20 18 Q20 24 16 24" stroke="#87a34d" stroke-width="3" fill="none"/>
      <!-- Coltello -->
      <path d="M32 8 C32 8 38 10 38 20 C38 24 32 24 32 24 L32 40" stroke="#87a34d" stroke-width="3" stroke-linecap="round" fill="#c8d8a0"/>
    </svg>
  `,

  assistant: `
    <svg viewBox="0 0 48 48" class="sector-icon" fill="none">
      <!-- Assistente chat bot semplice -->
      <rect x="8" y="10" width="32" height="24" rx="6" stroke="#87a34d" stroke-width="2.5" fill="none"/>
      <circle cx="18" cy="22" r="2.5" fill="#87a34d"/>
      <circle cx="30" cy="22" r="2.5" fill="#87a34d"/>
      <path d="M20 28 Q24 32 28 28" stroke="#87a34d" stroke-width="2" stroke-linecap="round" fill="none"/>
      <!-- Antenna -->
      <line x1="24" y1="10" x2="24" y2="5" stroke="#87a34d" stroke-width="2" stroke-linecap="round"/>
      <circle cx="24" cy="4" r="2" fill="#87a34d"/>
      <!-- Coda fumetto -->
      <path d="M16 34 L12 40 L22 34" stroke="#87a34d" stroke-width="2.5" stroke-linejoin="round" fill="none"/>
    </svg>
  `,
  
  events: `
    <svg viewBox="0 0 48 48" class="sector-icon" fill="none">
      <!-- Calendario semplice - stile Material 3 -->
      <rect x="8" y="12" width="32" height="28" rx="3" stroke="#87a34d" stroke-width="2.5" fill="none"/>
      <!-- Barra superiore -->
      <line x1="8" y1="20" x2="40" y2="20" stroke="#87a34d" stroke-width="2.5"/>
      <!-- Anelli -->
      <line x1="16" y1="8" x2="16" y2="16" stroke="#87a34d" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="32" y1="8" x2="32" y2="16" stroke="#87a34d" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Punti giorni -->
      <circle cx="16" cy="26" r="2" fill="#87a34d"/>
      <circle cx="24" cy="26" r="2" fill="#87a34d"/>
      <circle cx="32" cy="26" r="2" fill="#87a34d"/>
      <circle cx="16" cy="33" r="2" fill="#87a34d"/>
      <circle cx="24" cy="33" r="2" fill="#87a34d"/>
      <circle cx="32" cy="33" r="2" fill="#87a34d"/>
    </svg>
  `,
  
  specials: `
    <svg viewBox="0 0 48 48" class="sector-icon" fill="none">
      <!-- Stella offerta speciale -->
      <polygon points="24,6 29,18 42,18 32,26 36,39 24,31 12,39 16,26 6,18 19,18"
        fill="#c8d8a0" stroke="#87a34d" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Etichetta prezzo -->
      <circle cx="34" cy="34" r="8" fill="#87a34d"/>
      <text x="34" y="38" text-anchor="middle" font-size="9" font-weight="bold" fill="white">%</text>
    </svg>
  `,

  contacts: `
    <svg viewBox="0 0 48 48" class="sector-icon" fill="none">
      <!-- Persona contatto - stile Material 3 -->
      <circle cx="24" cy="16" r="8" stroke="#87a34d" stroke-width="2.5" fill="none"/>
      <path d="M8 42 C8 33 15 28 24 28 C33 28 40 33 40 42" stroke="#87a34d" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    </svg>
  `,
  
  // Icone aggiuntive per i contenuti
  wifi: `
    <svg viewBox="0 0 80 80" class="content-icon">
      <path d="M40 55 L40 60 M40 50 Q45 50 45 45 M40 50 Q35 50 35 45 M40 40 Q50 40 50 30 M40 40 Q30 40 30 30 M40 30 Q55 30 55 20 M40 30 Q25 30 25 20" 
            stroke="#87a34d" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="40" cy="57" r="3" fill="#87a34d"/>
    </svg>
  `,
  
  pool: `
    <svg viewBox="0 0 80 80" class="content-icon">
      <path d="M10 50 Q15 45 20 50 T30 50 T40 50 T50 50 T60 50 T70 50" stroke="#548687" stroke-width="3" fill="none"/>
      <path d="M10 58 Q15 53 20 58 T30 58 T40 58 T50 58 T60 58 T70 58" stroke="#B8DECA" stroke-width="3" fill="none"/>
      <circle cx="55" cy="25" r="8" fill="#88C39C"/>
      <path d="M40 38 L35 33 L38 25 L46 25 L48 30 L45 35" fill="#548687" opacity="0.7"/>
    </svg>
  `,
  
  restaurant: `
    <svg viewBox="0 0 80 80" class="content-icon">
      <ellipse cx="40" cy="60" rx="30" ry="5" fill="#1B6B3A" opacity="0.2"/>
      <circle cx="40" cy="55" r="25" fill="none" stroke="#87a34d" stroke-width="3"/>
      <line x1="25" y1="55" x2="25" y2="35" stroke="#88C39C" stroke-width="2"/>
      <line x1="55" y1="55" x2="55" y2="35" stroke="#1B6B3A" stroke-width="2"/>
    </svg>
  `,
  
  monument: `
    <svg viewBox="0 0 80 80" class="content-icon">
      <path d="M20 60 L30 20 L50 20 L60 60 Z" fill="#87a34d" opacity="0.3"/>
      <rect x="25" y="55" width="30" height="10" fill="#1B6B3A"/>
      <rect x="35" y="30" width="10" height="20" fill="#B8DECA"/>
      <path d="M40 15 L45 20 L35 20 Z" fill="#88C39C"/>
    </svg>
  `,
  
  nature: `
    <svg viewBox="0 0 80 80" class="content-icon">
      <circle cx="40" cy="25" r="12" fill="#88C39C" opacity="0.7"/>
      <path d="M10 65 L25 45 L40 65" fill="#B8DECA"/>
      <path d="M30 65 L45 35 L60 65" fill="#87a34d"/>
      <path d="M50 65 L65 50 L80 65" fill="#B8DECA" opacity="0.7"/>
      <rect x="0" y="65" width="80" height="3" fill="#1B6B3A" opacity="0.3"/>
    </svg>
  `,
  
  whatsapp: `
    <svg viewBox="0 0 120 120" class="sector-icon">
      <defs>
        <radialGradient id="whatsappGrad" cx="50%" cy="50%">
          <stop offset="0%" style="stop-color:#25D366;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#128C7E;stop-opacity:1" />
        </radialGradient>
      </defs>
      
      <!-- Ombra -->
      <ellipse cx="60" cy="100" rx="45" ry="5" fill="#1B6B3A" opacity="0.2"/>
      
      <!-- Cerchio principale WhatsApp -->
      <circle cx="60" cy="60" r="40" fill="url(#whatsappGrad)"/>
      
      <!-- Telefono -->
      <path d="M 45 50 Q 42 48 40 52 L 38 56 Q 37 58 39 60 Q 42 63 48 68 Q 53 73 58 76 Q 62 79 65 77 L 68 74 Q 71 71 69 68 L 65 62 Q 63 60 60 62 L 57 64 Q 55 63 52 60 Q 48 56 47 54 L 50 51 Q 52 49 50 47 Z" 
            fill="white"/>
      
      <!-- Bolle chat decorative -->
      <circle cx="85" cy="45" r="8" fill="#25D366" opacity="0.6"/>
      <circle cx="90" cy="55" r="6" fill="#25D366" opacity="0.4"/>
      <circle cx="35" cy="35" r="6" fill="#128C7E" opacity="0.5"/>
      
      <!-- Punti di notifica -->
      <circle cx="78" cy="35" r="3" fill="white" opacity="0.8"/>
      <circle cx="85" cy="38" r="2" fill="white" opacity="0.7"/>
    </svg>
  `,
  
  email: `
    <svg viewBox="0 0 24 24" class="icon-inline">
      <defs>
        <linearGradient id="emailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#88C39C;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#87a34d;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Busta -->
      <rect x="2" y="6" width="20" height="14" rx="2" fill="url(#emailGrad)"/>
      
      <!-- Lembo superiore -->
      <path d="M 2 6 L 12 13 L 22 6" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      
      <!-- Dettaglio chiusura -->
      <path d="M 2 6 L 12 13 L 22 6" fill="white" opacity="0.2"/>
    </svg>
  `,
  
  phone: `
    <svg viewBox="0 0 24 24" class="icon-inline">
      <defs>
        <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#548687;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1B6B3A;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Telefono -->
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" 
            fill="url(#phoneGrad)"/>
    </svg>
  `
};

// Funzione per ottenere l'icona SVG per settore
export function getSectorIcon(sector) {
  return sectorIcons[sector] || sectorIcons.home;
}

// Funzione per creare un elemento icona
export function createIconElement(iconName) {
  const container = document.createElement('div');
  container.className = 'icon-container';
  container.innerHTML = getSectorIcon(iconName);
  return container;
}
