// Configurazione Firebase per MyLyfe Umbria
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Configurazione Firebase - MyLyfe Umbria
// Account: gozzolif@gmail.com
const firebaseConfig = {
  apiKey: "AIzaSyBzZ-lJU61VLOjmTAWMd4xEf6DA3CE08sU",
  authDomain: "mylyfeumbria.firebaseapp.com",
  projectId: "mylyfeumbria",
  storageBucket: "mylyfeumbria.firebasestorage.app",
  messagingSenderId: "626642477198",
  appId: "1:626642477198:web:9b8bb3128ab3741ed129df",
  measurementId: "G-B9MG29VJ57"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Inizializza i servizi Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (opzionale, funziona solo in produzione)
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.log('Analytics non disponibile in ambiente di sviluppo');
  }
}

export { analytics };
export default app;
