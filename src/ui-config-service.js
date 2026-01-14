// Servizio di configurazione UI dinamica - MyLyfe
// Gestisce colori, logo, nome app, slogan e testi homepage

import { db, storage } from './firebase-config.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

class UIConfigService {
  constructor() {
    this.config = null;
    this.defaultConfig = {
      // Palette colori
      colors: {
        primary: '#6da34d',      // Verde
        secondary: '#56445d',    // Viola scuro
        accent: '#8d9c71',       // Verde oliva/salvia
        teal: '#548687',         // Teal
        lightGreen: '#c5e99b',   // Verde chiaro
        background: '#F5F5F5',   // Grigio chiaro
        cardBg: '#ffffff',
        text: '#2c3e50',
        textLight: '#7f8c8d',
        border: '#e8e8e8'
      },
      
      // Branding
      branding: {
        appName: {
          it: 'MyLyfe',
          en: 'MyLyfe',
          fr: 'MyLyfe',
          de: 'MyLyfe',
          es: 'MyLyfe'
        },
        appTagline: {
          it: 'La tua guida personale in Umbria',
          en: 'Your personal guide in Umbria',
          fr: 'Votre guide personnel en Ombrie',
          de: 'Ihr persönlicher Führer in Umbrien',
          es: 'Tu guía personal en Umbría'
        },
        logoType: 'svg', // 'svg' o 'image'
        logoUrl: null,    // URL per immagini custom
        logoSvg: null     // SVG custom
      },
      
      // Testi homepage
      homeTexts: {
        welcomeTitle: {
          it: 'Benvenuti',
          en: 'Welcome',
          fr: 'Bienvenue',
          de: 'Willkommen',
          es: 'Bienvenido'
        },
        welcomeSubtitle: {
          it: 'Benvenuti • Welcome • Bienvenue • Willkommen • Bienvenido',
          en: 'Welcome • Benvenuti • Bienvenue • Willkommen • Bienvenido',
          fr: 'Bienvenue • Welcome • Benvenuti • Willkommen • Bienvenido',
          de: 'Willkommen • Welcome • Benvenuti • Bienvenue • Bienvenido',
          es: 'Bienvenido • Welcome • Benvenuti • Bienvenue • Willkommen'
        }
      },
      
      // Footer
      footer: {
        copyright: 'My Lyfe Umbria',
        year: '2026',
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
  }
  
  // Carica la configurazione da Firebase
  async loadConfig() {
    try {
      const docRef = doc(db, 'settings', 'ui-config');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.config = { ...this.defaultConfig, ...docSnap.data() };
        console.log('✅ Configurazione UI caricata da Firebase');
      } else {
        // Se non esiste, crea la configurazione di default
        this.config = this.defaultConfig;
        await this.saveConfig(this.config);
        console.log('✅ Configurazione UI di default creata');
      }
      
      return this.config;
    } catch (error) {
      console.error('❌ Errore nel caricamento configurazione UI:', error);
      this.config = this.defaultConfig;
      return this.config;
    }
  }
  
  // Salva la configurazione su Firebase
  async saveConfig(config) {
    try {
      const docRef = doc(db, 'settings', 'ui-config');
      await setDoc(docRef, config);
      this.config = config;
      console.log('✅ Configurazione UI salvata');
      return true;
    } catch (error) {
      console.error('❌ Errore nel salvataggio configurazione UI:', error);
      throw error;
    }
  }
  
  // Ottiene la configurazione corrente
  getConfig() {
    return this.config || this.defaultConfig;
  }
  
  // Applica i colori custom al CSS
  applyColors(colors) {
    const root = document.documentElement;
    
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--accent-color', colors.accent);
    root.style.setProperty('--teal-color', colors.teal);
    root.style.setProperty('--light-green', colors.lightGreen);
    root.style.setProperty('--bg-color', colors.background);
    root.style.setProperty('--card-bg', colors.cardBg);
    root.style.setProperty('--text-color', colors.text);
    root.style.setProperty('--text-light', colors.textLight);
    root.style.setProperty('--border-color', colors.border);
    
    // Aggiorna anche le shadow con il colore primario
    const primaryRgb = this.hexToRgb(colors.primary);
    root.style.setProperty('--shadow', `0 2px 12px rgba(${primaryRgb.r},${primaryRgb.g},${primaryRgb.b},0.1)`);
    root.style.setProperty('--shadow-hover', `0 6px 20px rgba(${primaryRgb.r},${primaryRgb.g},${primaryRgb.b},0.2)`);
    
    console.log('🎨 Colori applicati all\'interfaccia');
  }
  
  // Converte hex in RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 109, g: 163, b: 77 }; // Default verde
  }
  
  // Upload logo personalizzato
  async uploadLogo(file) {
    try {
      const timestamp = Date.now();
      const storageRef = ref(storage, `config/logo-${timestamp}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log('✅ Logo caricato:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('❌ Errore nel caricamento logo:', error);
      throw error;
    }
  }
  
  // Ottiene testo tradotto per la lingua corrente
  getText(category, key, lang = 'it') {
    const config = this.getConfig();
    return config[category]?.[key]?.[lang] || config[category]?.[key] || '';
  }
  
  // Inizializza l'interfaccia con la configurazione
  async initialize() {
    await this.loadConfig();
    const config = this.getConfig();
    
    // Applica i colori
    this.applyColors(config.colors);
    
    return config;
  }
}

// Esporta istanza singleton
export const uiConfigService = new UIConfigService();
