// Servizio Firebase per MyLyfe

import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

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
