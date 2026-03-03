// Servizio Firebase per MyLyfe

import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, where, limit as limitDocs } from 'firebase/firestore';

// Normalizza testo per confronti/ricerche (minuscole, senza accenti)
function normalizeText(value = '') {
  return value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Servizio per gestire i dati da Firebase
class FirebaseService {
  
  // Ottiene tutti i documenti da una collezione
  async getCollection(collectionName) {
    try {
      const q = query(
        collection(db, collectionName),
        orderBy('ordine', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return items;
    } catch (error) {
      console.error(`Error getting ${collectionName}:`, error);
      throw error;
    }
  }
  
  // Ottiene i dati di My Home
  async getHomeData() {
    return this.getCollection('home');
  }
  
  // Ottiene i luoghi di My Journey
  async getJourneyData() {
    return this.getCollection('journey');
  }
  
  // Ottiene solo i luoghi featured
  async getFeaturedJourneys() {
    try {
      const q = query(
        collection(db, 'journey'),
        where('featured', '==', true),
        orderBy('ordine', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return items;
    } catch (error) {
      console.error('Error getting featured journeys:', error);
      return this.getJourneyData(); // Fallback a tutti i luoghi
    }
  }
  
  // Ottiene i ristoranti di My Taste
  async getTasteData() {
    return this.getCollection('taste');
  }
  
  // Ottiene gli eventi di My Events (ordinati per datainserimento decrescente)
  async getEventsData(orderField = 'datainserimento', orderDirection = 'desc') {
    try {
      const q = query(
        collection(db, 'events'),
        orderBy(orderField, orderDirection)
      );
      const querySnapshot = await getDocs(q);
      
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return items;
    } catch (error) {
      console.error('Error getting events with ordering:', error);
      console.log('Trying fallback: loading events without specific ordering...');
      
      // Fallback: carica eventi senza ordinamento specifico
      try {
        const querySnapshot = await getDocs(collection(db, 'events'));
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Ordina in memoria per datainserimento se disponibile, altrimenti per ordine
        items.sort((a, b) => {
          if (a.datainserimento && b.datainserimento) {
            return orderDirection === 'desc' 
              ? new Date(b.datainserimento) - new Date(a.datainserimento)
              : new Date(a.datainserimento) - new Date(b.datainserimento);
          }
          if (a.dataEvento && b.dataEvento) {
            return orderDirection === 'desc'
              ? new Date(b.dataEvento) - new Date(a.dataEvento)
              : new Date(a.dataEvento) - new Date(b.dataEvento);
          }
          return (a.ordine || 0) - (b.ordine || 0);
        });
        
        return items;
      } catch (fallbackError) {
        console.error('Error in fallback:', fallbackError);
        return [];
      }
    }
  }

  // Ricerca keyword-based con fetch on-demand (usa campi array "keywords" e "locations")
  async searchCollectionWithKeywords(collectionName, { keyword, location, limitResults } = {}) {
    const constraints = [];

    const normalizedKeyword = keyword ? normalizeText(keyword) : null;
    const normalizedLocation = location ? normalizeText(location) : null;

    if (normalizedKeyword) {
      constraints.push(where('keywords', 'array-contains', normalizedKeyword));
    }

    if (normalizedLocation) {
      constraints.push(where('locations', 'array-contains', normalizedLocation));
    }

    constraints.push(orderBy('ordine', 'asc'));

    if (limitResults) {
      constraints.push(limitDocs(limitResults));
    }

    try {
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      // Se mancano indici o c'e' un errore, fallback a filtro locale.
      console.warn(`Search fallback on ${collectionName}:`, error);
      return this.searchCollectionLocal(collectionName, { keyword: normalizedKeyword, location: normalizedLocation, limitResults });
    }
  }

  // Fallback locale: filtra i risultati in memoria (usa testo normalizzato e keywords)
  async searchCollectionLocal(collectionName, { keyword, location, limitResults } = {}) {
    const items = await this.getCollection(collectionName);

    const filtered = items.filter(item => {
      const itemKeywords = (item.keywords || []).map(normalizeText);
      const itemLocations = (item.locations || []).map(normalizeText);

      const title = normalizeText(item.titolo || '');
      const desc = normalizeText(item.descrizione || '');
      const locField = normalizeText(item.location || '');

      const matchesKeyword = keyword
        ? itemKeywords.includes(keyword) || title.includes(keyword) || desc.includes(keyword)
        : true;

      const matchesLocation = location
        ? itemLocations.includes(location) || locField.includes(location)
        : true;

      return matchesKeyword && matchesLocation;
    }).sort((a, b) => (a.ordine || 0) - (b.ordine || 0));

    if (limitResults) {
      return filtered.slice(0, limitResults);
    }

    return filtered;
  }

  // Ricerca specifiche
  async searchTaste(params = {}) {
    return this.searchCollectionWithKeywords('taste', params);
  }

  async searchJourney(params = {}) {
    return this.searchCollectionWithKeywords('journey', params);
  }

  async searchHome(params = {}) {
    return this.searchCollectionWithKeywords('home', params);
  }
  
  // Ottiene solo ristoranti/cantine featured
  async getFeaturedTaste() {
    try {
      const q = query(
        collection(db, 'taste'),
        where('featured', '==', true),
        orderBy('ordine', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return items;
    } catch (error) {
      console.error('Error getting featured taste:', error);
      return this.getTasteData(); // Fallback
    }
  }
  
  // Ottiene le impostazioni di My Assistant
  async getAssistantSettings() {
    try {
      const q = query(collection(db, 'assistant'));
      const querySnapshot = await getDocs(q);
      
      let settings = null;
      querySnapshot.forEach((doc) => {
        if (doc.id === 'settings') {
          settings = doc.data();
        }
      });
      
      return settings;
    } catch (error) {
      console.error('Error getting assistant settings:', error);
      return null;
    }
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;
