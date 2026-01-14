// Script per popolare il database Firebase con dati di esempio
// MyLyfe

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// Configurazione Firebase
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
const db = getFirestore(app);

// Dati per My Home
const homeData = [
  {
    id: 'wifi',
    titolo: {
      it: 'Wi-Fi',
      en: 'Wi-Fi',
      fr: 'Wi-Fi',
      de: 'WLAN',
      es: 'Wi-Fi'
    },
    descrizione: {
      it: 'Nome rete: LyfeUmbriaGuest\nPassword: Lyfe2025',
      en: 'Network: LyfeUmbriaGuest\nPassword: Lyfe2025',
      fr: 'Réseau: LyfeUmbriaGuest\nMot de passe: Lyfe2025',
      de: 'Netzwerk: LyfeUmbriaGuest\nPasswort: Lyfe2025',
      es: 'Red: LyfeUmbriaGuest\nContraseña: Lyfe2025'
    },
    icona: 'wifi',
    ordine: 1
  },
  {
    id: 'pool',
    titolo: {
      it: 'Piscina',
      en: 'Swimming Pool',
      fr: 'Piscine',
      de: 'Schwimmbad',
      es: 'Piscina'
    },
    descrizione: {
      it: 'Aperta dalle 08:00 alle 20:00.\nSi prega di usare la doccia prima di entrare.',
      en: 'Open from 08:00 to 20:00.\nPlease use the shower before entering.',
      fr: 'Ouvert de 08h00 à 20h00.\nVeuillez utiliser la douche avant d\'entrer.',
      de: 'Geöffnet von 08:00 bis 20:00 Uhr.\nBitte duschen Sie vor dem Betreten.',
      es: 'Abierto de 08:00 a 20:00.\nPor favor, use la ducha antes de entrar.'
    },
    icona: 'pool',
    ordine: 2
  },
  {
    id: 'checkin',
    titolo: {
      it: 'Check-in & Check-out',
      en: 'Check-in & Check-out',
      fr: 'Arrivée & Départ',
      de: 'Ankunft & Abreise',
      es: 'Entrada y Salida'
    },
    descrizione: {
      it: 'Check-in: dalle 15:00 alle 19:00\nCheck-out: entro le 10:00\nLasciare le chiavi nella cassetta all\'uscita.',
      en: 'Check-in: from 3:00 PM to 7:00 PM\nCheck-out: by 10:00 AM\nLeave keys in the box when departing.',
      fr: 'Arrivée: de 15h00 à 19h00\nDépart: avant 10h00\nLaisser les clés dans la boîte en partant.',
      de: 'Ankunft: von 15:00 bis 19:00 Uhr\nAbreise: bis 10:00 Uhr\nSchlüssel beim Verlassen in der Box lassen.',
      es: 'Entrada: de 15:00 a 19:00\nSalida: antes de las 10:00\nDeja las llaves en la caja al salir.'
    },
    icona: 'key',
    ordine: 3
  }
];

// Dati per My Journey
const journeyData = [
  {
    id: 'orvieto',
    titolo: {
      it: 'Duomo di Orvieto',
      en: 'Orvieto Cathedral',
      fr: 'Cathédrale d\'Orvieto',
      de: 'Dom von Orvieto',
      es: 'Catedral de Orvieto'
    },
    categoria: {
      it: 'Arte e Cultura',
      en: 'Art & Culture',
      fr: 'Art et Culture',
      de: 'Kunst und Kultur',
      es: 'Arte y Cultura'
    },
    descrizione: {
      it: 'Uno dei capolavori dell\'architettura gotica italiana, con la sua facciata mozzafiato decorata da mosaici dorati. Non perdere la Cappella di San Brizio con gli affreschi di Luca Signorelli.',
      en: 'One of the masterpieces of Italian Gothic architecture, with its breathtaking facade decorated with golden mosaics. Don\'t miss the Chapel of San Brizio with frescoes by Luca Signorelli.',
      fr: 'L\'un des chefs-d\'œuvre de l\'architecture gothique italienne, avec sa façade époustouflante décorée de mosaïques dorées.',
      de: 'Eines der Meisterwerke der italienischen Gotik mit seiner atemberaubenden, mit Goldmosaiken verzierten Fassade.',
      es: 'Una de las obras maestras de la arquitectura gótica italiana, con su impresionante fachada decorada con mosaicos dorados.'
    },
    distanza: '25 km',
    durata: '30 min',
    mapsUrl: 'https://maps.google.com/?q=Duomo+di+Orvieto',
    featured: true,
    ordine: 1
  },
  {
    id: 'civita',
    titolo: {
      it: 'Civita di Bagnoregio',
      en: 'Civita di Bagnoregio',
      fr: 'Civita di Bagnoregio',
      de: 'Civita di Bagnoregio',
      es: 'Civita di Bagnoregio'
    },
    categoria: {
      it: 'Borgo Storico',
      en: 'Historic Village',
      fr: 'Village Historique',
      de: 'Historisches Dorf',
      es: 'Pueblo Histórico'
    },
    descrizione: {
      it: 'La "città che muore", borgo medievale arroccato su uno sperone di tufo. Accessibile solo tramite un suggestivo ponte pedonale. Un gioiello sospeso nel tempo.',
      en: 'The "dying city", a medieval village perched on a tuff spur. Accessible only via a picturesque pedestrian bridge. A jewel suspended in time.',
      fr: 'La "ville qui meurt", village médiéval perché sur un éperon de tuf. Accessible uniquement par une passerelle piétonne pittoresque.',
      de: 'Die "sterbende Stadt", ein mittelalterliches Dorf auf einem Tuffsteinsporn. Nur über eine malerische Fußgängerbrücke erreichbar.',
      es: 'La "ciudad que muere", pueblo medieval encaramado en un espolón de toba. Accesible solo por un pintoresco puente peatonal.'
    },
    distanza: '15 km',
    durata: '20 min',
    mapsUrl: 'https://maps.google.com/?q=Civita+di+Bagnoregio',
    featured: true,
    ordine: 2
  },
  {
    id: 'marmore',
    titolo: {
      it: 'Cascata delle Marmore',
      en: 'Marmore Falls',
      fr: 'Cascade des Marmore',
      de: 'Marmore-Wasserfälle',
      es: 'Cascada de Marmore'
    },
    categoria: {
      it: 'Natura',
      en: 'Nature',
      fr: 'Nature',
      de: 'Natur',
      es: 'Naturaleza'
    },
    descrizione: {
      it: 'La cascata artificiale più alta d\'Europa (165 metri), creata dai Romani. Spettacolare apertura delle paratoie con orari programmati. Perfetta per escursioni e fotografia naturalistica.',
      en: 'Europe\'s tallest man-made waterfall (165 meters), created by the Romans. Spectacular opening of the floodgates at scheduled times. Perfect for hiking and nature photography.',
      fr: 'La plus haute cascade artificielle d\'Europe (165 mètres), créée par les Romains. Ouverture spectaculaire des vannes à heures programmées.',
      de: 'Der höchste künstliche Wasserfall Europas (165 Meter), von den Römern geschaffen. Spektakuläre Öffnung der Schleusen zu geplanten Zeiten.',
      es: 'La cascada artificial más alta de Europa (165 metros), creada por los romanos. Espectacular apertura de compuertas en horarios programados.'
    },
    distanza: '65 km',
    durata: '1 ora',
    mapsUrl: 'https://maps.google.com/?q=Cascata+delle+Marmore',
    featured: true,
    ordine: 3
  },
  {
    id: 'alviano',
    titolo: {
      it: 'Oasi di Alviano',
      en: 'Alviano Nature Reserve',
      fr: 'Oasis d\'Alviano',
      de: 'Naturschutzgebiet Alviano',
      es: 'Oasis de Alviano'
    },
    categoria: {
      it: 'Natura',
      en: 'Nature',
      fr: 'Nature',
      de: 'Natur',
      es: 'Naturaleza'
    },
    descrizione: {
      it: 'Riserva naturale WWF ideale per birdwatching e passeggiate nella natura. Sentieri attrezzati e osservatori per ammirare diverse specie di uccelli migratori.',
      en: 'WWF nature reserve ideal for birdwatching and nature walks. Equipped trails and observatories to admire various species of migratory birds.',
      fr: 'Réserve naturelle WWF idéale pour l\'observation des oiseaux et les promenades nature.',
      de: 'WWF-Naturschutzgebiet, ideal für Vogelbeobachtung und Naturwanderungen.',
      es: 'Reserva natural WWF ideal para la observación de aves y paseos por la naturaleza.'
    },
    distanza: '10 km',
    durata: '15 min',
    mapsUrl: 'https://maps.google.com/?q=Oasi+WWF+Alviano',
    featured: false,
    ordine: 4
  }
];

// Dati per My Taste
const tasteData = [
  {
    id: 'lapalomba',
    titolo: {
      it: 'La Palomba',
      en: 'La Palomba',
      fr: 'La Palomba',
      de: 'La Palomba',
      es: 'La Palomba'
    },
    categoria: {
      it: 'Ristorante',
      en: 'Restaurant',
      fr: 'Restaurant',
      de: 'Restaurant',
      es: 'Restaurante'
    },
    tipoCucina: {
      it: 'Cucina Umbra Tradizionale',
      en: 'Traditional Umbrian Cuisine',
      fr: 'Cuisine Ombrienne Traditionnelle',
      de: 'Traditionelle Umbrische Küche',
      es: 'Cocina Umbria Tradicional'
    },
    descrizione: {
      it: 'Ottimo per il tartufo e la pasta fatta in casa. Ambiente accogliente e familiare nel centro di Orvieto. Specialità: pappardelle al tartufo nero, piccione alla leccarda.',
      en: 'Excellent for truffles and homemade pasta. Warm and family-friendly atmosphere in the center of Orvieto. Specialties: black truffle pappardelle, pigeon alla leccarda.',
      fr: 'Excellent pour les truffes et les pâtes maison. Ambiance chaleureuse et familiale au centre d\'Orvieto.',
      de: 'Ausgezeichnet für Trüffel und hausgemachte Pasta. Warme und familiäre Atmosphäre im Zentrum von Orvieto.',
      es: 'Excelente para trufas y pasta casera. Ambiente cálido y familiar en el centro de Orvieto.'
    },
    telefono: '+39 0763 343395',
    prezzoMedio: {
      it: '€€ (30-50€ a persona)',
      en: '€€ (30-50€ per person)',
      fr: '€€ (30-50€ par personne)',
      de: '€€ (30-50€ pro Person)',
      es: '€€ (30-50€ por persona)'
    },
    mapsUrl: 'https://maps.google.com/?q=La+Palomba+Orvieto',
    featured: true,
    prenotazioneConsigliata: true,
    ordine: 1
  }
];

// Funzione per popolare una collezione
async function populateCollection(collectionName, data) {
  console.log(`\n📝 Popolamento collezione: ${collectionName}`);
  
  for (const item of data) {
    try {
      const { id, ...itemData } = item;
      await setDoc(doc(db, collectionName, id), itemData);
      console.log(`  ✅ Documento "${id}" creato`);
    } catch (error) {
      console.error(`  ❌ Errore creando "${item.id}":`, error.message);
    }
  }
}

// Funzione principale
async function populateDatabase() {
  console.log('🚀 Inizio popolamento database Firebase per MyLyfe\n');
  console.log('📊 Database: mylyfeumbria');
  console.log('🔗 Progetto:', firebaseConfig.projectId);
  
  try {
    // Popola My Home
    await populateCollection('home', homeData);
    
    // Popola My Journey
    await populateCollection('journey', journeyData);
    
    // Popola My Taste
    await populateCollection('taste', tasteData);
    
    console.log('\n✅ Database popolato con successo!');
    console.log('\n📱 Ricarica l\'app su http://localhost:3000/ per vedere i dati');
    
  } catch (error) {
    console.error('\n❌ Errore durante il popolamento:', error);
    console.error('\nDettagli:', error.message);
  }
  
  process.exit(0);
}

// Esegui lo script
populateDatabase();
