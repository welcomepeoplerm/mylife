// Servizio di autenticazione per admin - MyLyfe

import { auth } from './firebase-config.js';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];
    this.initAuth();
  }
  
  // Inizializza l'autenticazione
  initAuth() {
    // Imposta persistenza locale
    setPersistence(auth, browserLocalPersistence);
    
    // Ascolta cambiamenti stato auth
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.notifyListeners(user);
    });
  }
  
  // Login admin
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login effettuato:', userCredential.user.email);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('❌ Errore login:', error.code);
      
      let message = 'Errore durante il login';
      switch (error.code) {
        case 'auth/invalid-email':
          message = 'Email non valida';
          break;
        case 'auth/user-disabled':
          message = 'Utente disabilitato';
          break;
        case 'auth/user-not-found':
          message = 'Utente non trovato';
          break;
        case 'auth/wrong-password':
          message = 'Password errata';
          break;
        case 'auth/invalid-credential':
          message = 'Credenziali non valide';
          break;
        case 'auth/too-many-requests':
          message = 'Troppi tentativi. Riprova più tardi';
          break;
      }
      
      return { success: false, error: message };
    }
  }
  
  // Logout
  async logout() {
    try {
      await signOut(auth);
      console.log('✅ Logout effettuato');
      return { success: true };
    } catch (error) {
      console.error('❌ Errore logout:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Verifica se utente è loggato
  isAuthenticated() {
    return this.currentUser !== null;
  }
  
  // Ottiene utente corrente
  getCurrentUser() {
    return this.currentUser;
  }
  
  // Verifica se l'utente è admin autorizzato
  isAdmin() {
    if (!this.currentUser) return false;
    
    // Lista email admin autorizzati
    const adminEmails = [
      'gozzolif@gmail.com',
      // Aggiungi qui altri admin se necessario
    ];
    
    return adminEmails.includes(this.currentUser.email);
  }
  
  // Registra listener per cambio stato auth
  onAuthChange(callback) {
    this.authListeners.push(callback);
    // Chiama subito con stato corrente
    callback(this.currentUser);
    
    // Ritorna funzione per rimuovere listener
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }
  
  // Notifica tutti i listeners
  notifyListeners(user) {
    this.authListeners.forEach(callback => callback(user));
  }
  
  // Aspetta che l'auth sia inizializzato
  async waitForAuth() {
    return new Promise((resolve) => {
      if (this.currentUser !== undefined) {
        resolve(this.currentUser);
      } else {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        });
      }
    });
  }
}

export const authService = new AuthService();
export default authService;
