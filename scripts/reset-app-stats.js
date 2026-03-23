// Script per resettare la collection app_stats su Firestore
// Uso: node scripts/reset-app-stats.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBzZ-lJU61VLOjmTAWMd4xEf6DA3CE08sU",
  authDomain: "mylyfeumbria.firebaseapp.com",
  projectId: "mylyfeumbria",
  storageBucket: "mylyfeumbria.firebasestorage.app",
  messagingSenderId: "626642477198",
  appId: "1:626642477198:web:9b8bb3128ab3741ed129df",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

async function resetStats() {
  console.log('🔍 Lettura collection app_stats...');
  const snap = await getDocs(collection(db, 'app_stats'));
  console.log(`📊 Trovati ${snap.size} documenti da eliminare.`);

  if (snap.size === 0) {
    console.log('ℹ️ Nessun documento da eliminare.');
    process.exit(0);
  }

  // Chunked batch delete (max 500 per batch)
  const docs = snap.docs;
  let deleted = 0;
  for (let i = 0; i < docs.length; i += 499) {
    const batch = writeBatch(db);
    docs.slice(i, i + 499).forEach(d => batch.delete(d.ref));
    await batch.commit();
    deleted += Math.min(499, docs.length - i);
    console.log(`🗑️  Eliminati ${deleted}/${docs.length}...`);
  }

  console.log('✅ Reset completato!');
  process.exit(0);
}

resetStats().catch(err => {
  console.error('❌ Errore:', err.message);
  process.exit(1);
});
