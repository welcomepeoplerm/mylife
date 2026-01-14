// SVG Icons per i settori dell'app

export const sectorIcons = {
  home: `
    <svg viewBox="0 0 120 120" class="sector-icon">
      <defs>
        <linearGradient id="homeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6da34d;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#c5e99b;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#8d9c71;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6da34d;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Ombra sotto -->
      <ellipse cx="60" cy="98" rx="45" ry="5" fill="#56445d" opacity="0.2"/>
      
      <!-- Base della casa (muro) -->
      <rect x="30" y="55" width="60" height="45" rx="2" fill="white"/>
      <rect x="30" y="55" width="60" height="45" rx="2" fill="url(#homeGrad)" opacity="0.15"/>
      
      <!-- Finestre -->
      <rect x="40" y="65" width="12" height="12" rx="1" fill="#548687" opacity="0.6"/>
      <line x1="46" y1="65" x2="46" y2="77" stroke="white" stroke-width="1.5" opacity="0.4"/>
      <line x1="40" y1="71" x2="52" y2="71" stroke="white" stroke-width="1.5" opacity="0.4"/>
      
      <rect x="68" y="65" width="12" height="12" rx="1" fill="#548687" opacity="0.6"/>
      <line x1="74" y1="65" x2="74" y2="77" stroke="white" stroke-width="1.5" opacity="0.4"/>
      <line x1="68" y1="71" x2="80" y2="71" stroke="white" stroke-width="1.5" opacity="0.4"/>
      
      <!-- Porta -->
      <rect x="52" y="78" width="16" height="22" rx="2" fill="#56445d"/>
      <circle cx="63" cy="90" r="1.5" fill="#c5e99b"/>
      <line x1="60" y1="78" x2="60" y2="100" stroke="#8d9c71" stroke-width="1" opacity="0.3"/>
      
      <!-- Tetto 3D -->
      <path d="M 25 55 L 60 25 L 95 55 L 90 55 L 60 30 L 30 55 Z" fill="url(#roofGrad)"/>
      <path d="M 60 25 L 95 55 L 95 50 L 60 20 Z" fill="#6da34d" opacity="0.8"/>
      
      <!-- Bordo del tetto -->
      <path d="M 25 55 L 60 25 L 95 55" stroke="#56445d" stroke-width="2" fill="none" stroke-linejoin="round"/>
      
      <!-- Camino -->
      <rect x="72" y="38" width="8" height="14" fill="#56445d"/>
      <rect x="70" y="36" width="12" height="3" rx="1" fill="#8d9c71"/>
      
      <!-- Fumetto dal camino -->
      <circle cx="76" cy="30" r="3" fill="#548687" opacity="0.3"/>
      <circle cx="78" cy="26" r="3.5" fill="#548687" opacity="0.25"/>
      <circle cx="80" cy="22" r="4" fill="#548687" opacity="0.2"/>
      
      <!-- Dettagli decorativi -->
      <rect x="30" y="53" width="60" height="2" fill="#8d9c71" opacity="0.5"/>
      
      <!-- Piante ai lati -->
      <ellipse cx="20" cy="95" rx="6" ry="8" fill="#6da34d" opacity="0.6"/>
      <ellipse cx="18" cy="92" rx="4" ry="6" fill="#c5e99b" opacity="0.5"/>
      
      <ellipse cx="100" cy="95" rx="6" ry="8" fill="#6da34d" opacity="0.6"/>
      <ellipse cx="102" cy="92" rx="4" ry="6" fill="#c5e99b" opacity="0.5"/>
    </svg>
  `,
  
  journey: `
    <svg viewBox="0 0 120 120" class="sector-icon">
      <defs>
        <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f5f5f5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e8e8e8;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="pinGrad" cx="50%" cy="30%">
          <stop offset="0%" style="stop-color:#c5e99b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6da34d;stop-opacity:1" />
        </radialGradient>
      </defs>
      
      <!-- Ombra sotto -->
      <ellipse cx="60" cy="98" rx="45" ry="5" fill="#56445d" opacity="0.2"/>
      
      <!-- Mappa piegata - pezzo sinistro -->
      <path d="M 25 35 L 55 35 L 55 85 L 25 85 Z" fill="white"/>
      <path d="M 25 35 L 55 35 L 55 85 L 25 85 Z" fill="url(#mapGrad)"/>
      
      <!-- Mappa piegata - pezzo destro -->
      <path d="M 55 35 L 95 35 L 95 85 L 55 85 Z" fill="white"/>
      <path d="M 55 35 L 95 35 L 95 85 L 55 85 Z" fill="url(#mapGrad)" opacity="0.8"/>
      
      <!-- Piega centrale -->
      <line x1="55" y1="35" x2="55" y2="85" stroke="#d0d0d0" stroke-width="2"/>
      
      <!-- Bordo mappa -->
      <rect x="25" y="35" width="70" height="50" rx="2" fill="none" stroke="#8d9c71" stroke-width="2"/>
      
      <!-- Griglia della mappa -->
      <line x1="35" y1="35" x2="35" y2="85" stroke="#c5e99b" stroke-width="1" opacity="0.3"/>
      <line x1="45" y1="35" x2="45" y2="85" stroke="#c5e99b" stroke-width="1" opacity="0.3"/>
      <line x1="65" y1="35" x2="65" y2="85" stroke="#c5e99b" stroke-width="1" opacity="0.3"/>
      <line x1="75" y1="35" x2="75" y2="85" stroke="#c5e99b" stroke-width="1" opacity="0.3"/>
      <line x1="85" y1="35" x2="85" y2="85" stroke="#c5e99b" stroke-width="1" opacity="0.3"/>
      
      <line x1="25" y1="45" x2="95" y2="45" stroke="#c5e99b" stroke-width="1" opacity="0.3"/>
      <line x1="25" y1="55" x2="95" y2="55" stroke="#c5e99b" stroke-width="1" opacity="0.3"/>
      <line x1="25" y1="65" x2="95" y2="65" stroke="#c5e99b" stroke-width="1" opacity="0.3"/>
      <line x1="25" y1="75" x2="95" y2="75" stroke="#c5e99b" stroke-width="1" opacity="0.3"/>
      
      <!-- Strade sulla mappa -->
      <path d="M 30 50 Q 45 48 60 55" stroke="#548687" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M 60 55 Q 70 60 85 58" stroke="#548687" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="45" cy="48" r="2" fill="#8d9c71"/>
      <circle cx="70" cy="60" r="2" fill="#8d9c71"/>
      
      <!-- Pin di posizione 3D principale -->
      <ellipse cx="60" cy="72" rx="8" ry="3" fill="#6da34d" opacity="0.3"/>
      <path d="M 52 55 Q 52 48 60 45 Q 68 48 68 55 Q 68 60 60 72 Q 52 60 52 55" fill="url(#pinGrad)"/>
      <circle cx="60" cy="52" r="6" fill="white"/>
      <circle cx="60" cy="52" r="3" fill="#6da34d"/>
      
      <!-- Bussola decorativa nell'angolo -->
      <circle cx="82" cy="73" r="8" fill="white"/>
      <circle cx="82" cy="73" r="8" fill="none" stroke="#8d9c71" stroke-width="1.5"/>
      <path d="M 82 67 L 82 79" stroke="#56445d" stroke-width="1" opacity="0.5"/>
      <path d="M 76 73 L 88 73" stroke="#56445d" stroke-width="1" opacity="0.5"/>
      <path d="M 82 67 L 84 73 L 82 75 Z" fill="#6da34d"/>
      <path d="M 82 79 L 80 73 L 82 71 Z" fill="#c5e99b"/>
      
      <!-- Aree colorate (zone turistiche) -->
      <circle cx="38" cy="60" r="5" fill="#c5e99b" opacity="0.4"/>
      <circle cx="75" cy="50" r="4" fill="#6da34d" opacity="0.3"/>
    </svg>
  `,
  
  taste: `
    <svg viewBox="0 0 120 120" class="sector-icon">
      <defs>
        <radialGradient id="tasteGrad" cx="50%" cy="40%">
          <stop offset="0%" style="stop-color:#c5e99b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6da34d;stop-opacity:1" />
        </radialGradient>
        <linearGradient id="plateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f5f5f5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e8e8e8;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Ombra sotto -->
      <ellipse cx="60" cy="98" rx="42" ry="5" fill="#56445d" opacity="0.2"/>
      
      <!-- Piatto principale -->
      <ellipse cx="60" cy="75" rx="48" ry="12" fill="#d0d0d0"/>
      <ellipse cx="60" cy="74" rx="47" ry="11" fill="url(#plateGrad)"/>
      <ellipse cx="60" cy="73" rx="45" ry="10" fill="white"/>
      <ellipse cx="60" cy="73" rx="38" ry="8" fill="#f9f9f9"/>
      
      <!-- Cibo sul piatto - Pasta/Verdure -->
      <!-- Base pasta -->
      <ellipse cx="60" cy="65" rx="22" ry="6" fill="#c5e99b" opacity="0.9"/>
      
      <!-- Spaghetti arrotolati -->
      <path d="M 50 60 Q 52 58 54 60 Q 56 62 58 60 Q 60 58 62 60" stroke="#6da34d" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M 52 63 Q 54 61 56 63 Q 58 65 60 63 Q 62 61 64 63" stroke="#6da34d" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M 48 65 Q 50 63 52 65 Q 54 67 56 65" stroke="#8d9c71" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M 60 66 Q 62 64 64 66 Q 66 68 68 66" stroke="#8d9c71" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      
      <!-- Pomodorini -->
      <circle cx="52" cy="58" r="4" fill="#d84315" opacity="0.8"/>
      <circle cx="68" cy="60" r="4" fill="#d84315" opacity="0.8"/>
      <circle cx="60" cy="56" r="3.5" fill="#e53935" opacity="0.7"/>
      
      <!-- Basilico -->
      <ellipse cx="56" cy="62" rx="3" ry="4" fill="#6da34d" opacity="0.8"/>
      <ellipse cx="64" cy="64" rx="3" ry="4" fill="#6da34d" opacity="0.8"/>
      
      <!-- Forchetta a sinistra -->
      <line x1="22" y1="75" x2="22" y2="45" stroke="#8d9c71" stroke-width="3" stroke-linecap="round"/>
      <line x1="18" y1="45" x2="18" y2="52" stroke="#8d9c71" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="22" y1="45" x2="22" y2="52" stroke="#8d9c71" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="26" y1="45" x2="26" y2="52" stroke="#8d9c71" stroke-width="2.5" stroke-linecap="round"/>
      
      <!-- Coltello a destra -->
      <line x1="98" y1="75" x2="98" y2="45" stroke="#56445d" stroke-width="3" stroke-linecap="round"/>
      <path d="M 95 45 L 101 45 L 101 50 L 95 50 Z" fill="#56445d"/>
      <line x1="98" y1="50" x2="98" y2="54" stroke="#56445d" stroke-width="4"/>
      
      <!-- Vapore caldo -->
      <path d="M 48 48 Q 50 42 52 48" stroke="#548687" stroke-width="2" fill="none" opacity="0.4" stroke-linecap="round"/>
      <path d="M 58 45 Q 60 39 62 45" stroke="#548687" stroke-width="2" fill="none" opacity="0.5" stroke-linecap="round"/>
      <path d="M 68 48 Q 70 42 72 48" stroke="#548687" stroke-width="2" fill="none" opacity="0.4" stroke-linecap="round"/>
    </svg>
  `,
  
  assistant: `
    <svg viewBox="0 0 120 120" class="sector-icon">
      <defs>
        <radialGradient id="assistantGrad" cx="50%" cy="30%">
          <stop offset="0%" style="stop-color:#c5e99b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6da34d;stop-opacity:1" />
        </radialGradient>
        <radialGradient id="antennaGrad" cx="50%" cy="50%">
          <stop offset="0%" style="stop-color:#c5e99b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8d9c71;stop-opacity:1" />
        </radialGradient>
      </defs>
      
      <!-- Corpo principale (sfera verde) -->
      <circle cx="60" cy="65" r="35" fill="url(#assistantGrad)"/>
      
      <!-- Ombra sotto -->
      <ellipse cx="60" cy="95" rx="30" ry="5" fill="#56445d" opacity="0.2"/>
      
      <!-- Antenne -->
      <line x1="48" y1="32" x2="48" y2="18" stroke="#8d9c71" stroke-width="3" stroke-linecap="round"/>
      <circle cx="48" cy="15" r="6" fill="url(#antennaGrad)"/>
      
      <line x1="72" y1="32" x2="72" y2="18" stroke="#8d9c71" stroke-width="3" stroke-linecap="round"/>
      <circle cx="72" cy="15" r="6" fill="url(#antennaGrad)"/>
      
      <!-- Occhi -->
      <circle cx="50" cy="60" r="7" fill="white"/>
      <circle cx="70" cy="60" r="7" fill="white"/>
      <circle cx="50" cy="60" r="5" fill="#56445d"/>
      <circle cx="70" cy="60" r="5" fill="#56445d"/>
      
      <!-- Riflessi occhi -->
      <circle cx="51" cy="58" r="2" fill="white" opacity="0.8"/>
      <circle cx="71" cy="58" r="2" fill="white" opacity="0.8"/>
      
      <!-- Bocca sorridente -->
      <path d="M 47 72 Q 60 80 73 72" stroke="white" stroke-width="4" fill="none" stroke-linecap="round"/>
      
      <!-- Dettaglio superiore (buco antenna) -->
      <ellipse cx="60" cy="35" rx="6" ry="3" fill="#548687" opacity="0.5"/>
      
      <!-- Bolle decorative laterali -->
      <circle cx="88" cy="55" r="8" fill="#c5e99b" opacity="0.3"/>
      <circle cx="92" cy="65" r="6" fill="#c5e99b" opacity="0.2"/>
      <circle cx="85" cy="72" r="5" fill="#c5e99b" opacity="0.25"/>
      
      <!-- Piccoli dettagli -->
      <circle cx="38" cy="68" r="3" fill="#8d9c71" opacity="0.4"/>
      <circle cx="82" cy="68" r="3" fill="#8d9c71" opacity="0.4"/>
    </svg>
  `,
  
  // Icone aggiuntive per i contenuti
  wifi: `
    <svg viewBox="0 0 80 80" class="content-icon">
      <path d="M40 55 L40 60 M40 50 Q45 50 45 45 M40 50 Q35 50 35 45 M40 40 Q50 40 50 30 M40 40 Q30 40 30 30 M40 30 Q55 30 55 20 M40 30 Q25 30 25 20" 
            stroke="#6da34d" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="40" cy="57" r="3" fill="#6da34d"/>
    </svg>
  `,
  
  pool: `
    <svg viewBox="0 0 80 80" class="content-icon">
      <path d="M10 50 Q15 45 20 50 T30 50 T40 50 T50 50 T60 50 T70 50" stroke="#548687" stroke-width="3" fill="none"/>
      <path d="M10 58 Q15 53 20 58 T30 58 T40 58 T50 58 T60 58 T70 58" stroke="#c5e99b" stroke-width="3" fill="none"/>
      <circle cx="55" cy="25" r="8" fill="#8d9c71"/>
      <path d="M40 38 L35 33 L38 25 L46 25 L48 30 L45 35" fill="#548687" opacity="0.7"/>
    </svg>
  `,
  
  restaurant: `
    <svg viewBox="0 0 80 80" class="content-icon">
      <ellipse cx="40" cy="60" rx="30" ry="5" fill="#56445d" opacity="0.2"/>
      <circle cx="40" cy="55" r="25" fill="none" stroke="#6da34d" stroke-width="3"/>
      <line x1="25" y1="55" x2="25" y2="35" stroke="#8d9c71" stroke-width="2"/>
      <line x1="55" y1="55" x2="55" y2="35" stroke="#56445d" stroke-width="2"/>
    </svg>
  `,
  
  monument: `
    <svg viewBox="0 0 80 80" class="content-icon">
      <path d="M20 60 L30 20 L50 20 L60 60 Z" fill="#6da34d" opacity="0.3"/>
      <rect x="25" y="55" width="30" height="10" fill="#56445d"/>
      <rect x="35" y="30" width="10" height="20" fill="#c5e99b"/>
      <path d="M40 15 L45 20 L35 20 Z" fill="#8d9c71"/>
    </svg>
  `,
  
  nature: `
    <svg viewBox="0 0 80 80" class="content-icon">
      <circle cx="40" cy="25" r="12" fill="#8d9c71" opacity="0.7"/>
      <path d="M10 65 L25 45 L40 65" fill="#c5e99b"/>
      <path d="M30 65 L45 35 L60 65" fill="#6da34d"/>
      <path d="M50 65 L65 50 L80 65" fill="#c5e99b" opacity="0.7"/>
      <rect x="0" y="65" width="80" height="3" fill="#56445d" opacity="0.3"/>
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
      <ellipse cx="60" cy="100" rx="45" ry="5" fill="#56445d" opacity="0.2"/>
      
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
          <stop offset="0%" style="stop-color:#8d9c71;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6da34d;stop-opacity:1" />
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
          <stop offset="100%" style="stop-color:#56445d;stop-opacity:1" />
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
