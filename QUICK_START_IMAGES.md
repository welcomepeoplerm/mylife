# 🖼️ Quick Start - Aggiungere Immagini

## Metodo 1: Download da Unsplash (Consigliato)

### Passo 1: Cerca Immagini
Vai su https://unsplash.com e cerca:
- "Assisi Italy"
- "Perugia Italy"
- "Umbria landscape"
- "Italian food"
- "Italian restaurant"

### Passo 2: Download
1. Clicca sull'immagine che ti piace
2. Clicca "Download free"
3. Scegli dimensione "Medium" o "Large" (1200px width)

### Passo 3: Rinomina e Ottimizza
```bash
# Rinomina file
mv photo-1234567890.jpg assisi-basilica.jpg

# Ottimizza con online tool
# Vai su https://tinypng.com e carica il file
# Oppure usa ImageOptim (Mac) o FileOptimizer (Windows)
```

### Passo 4: Carica in Firebase Storage

```javascript
// Nell'admin panel, aggiungi immagine
{
  titolo: { it: "Basilica di San Francesco" },
  imgUrl: "https://firebasestorage.googleapis.com/v0/b/...", // URL Firebase
  categoria: { it: "Monumenti" },
  descrizione: { it: "Patrimonio UNESCO..." }
}
```

## Metodo 2: Usa Placeholder SVG Temporanei

Le immagini placeholder sono già pronte in `public/images/`:
- `placeholder-journey.svg` - Per luoghi
- `placeholder-taste.svg` - Per ristoranti

Nel database, usa:
```javascript
imgUrl: "/images/placeholder-journey.svg"
```

## Metodo 3: Genera con AI

### DALL-E (OpenAI)
```
Prompt: "Professional photograph of Basilica of Saint Francis 
in Assisi, Umbria, Italy. Golden hour lighting, clear blue sky, 
beautiful architecture, high quality, photorealistic, 16:9"
```

### Midjourney
```
/imagine professional photo of Assisi Basilica, Umbria Italy, 
golden hour, stunning architecture, photorealistic --ar 3:2 --q 2
```

## 🎯 Quick Reference

### Dimensioni Ideali
| Tipo | Larghezza | Altezza | Ratio | Peso |
|------|-----------|---------|-------|------|
| Hero | 1920px | 1080px | 16:9 | < 300KB |
| Card | 1200px | 800px | 3:2 | < 200KB |
| Thumbnail | 600px | 400px | 3:2 | < 100KB |
| Icon | 200px | 200px | 1:1 | < 50KB |

### Nomi File Consigliati

```
# Luoghi
assisi-basilica-san-francesco.jpg
perugia-fontana-maggiore.jpg
spoleto-duomo.jpg
orvieto-cattedrale.jpg
gubbio-palazzo-consoli.jpg
todi-piazza-popolo.jpg
cascata-marmore.jpg
lago-trasimeno.jpg

# Ristoranti
ristorante-nome-citta.jpg
trattoria-nome-luogo.jpg
cantina-nome-vino.jpg

# Prodotti
truffle-umbria.jpg
vino-sagrantino.jpg
olio-oliva-umbro.jpg
```

## 🚀 Upload Veloce con Script

Crea file `upload-images.js`:

```javascript
import { storage } from './src/firebase-config.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

async function uploadImage(file, path) {
  const storageRef = ref(storage, `images/${path}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  console.log('✅ Uploaded:', path, '→', url);
  return url;
}

// Usa nell'admin panel
```

## ✅ Checklist Pre-Upload

- [ ] Immagine ottimizzata (< 200KB)
- [ ] Nome file descrittivo
- [ ] Dimensioni corrette (1200x800px)
- [ ] Formato JPEG per foto
- [ ] Qualità 80-85%
- [ ] Licenza verificata (gratis o acquistata)

## 🎨 Palette Colori da Rispettare

Quando scegli immagini, preferisci quelle con tonalità:
- 🟢 Verde acqua (#5FB8AC)
- 🟡 Giallo/Oro (#F4B942)
- 🟢 Verde naturale
- 🔵 Azzurro cielo
- 🟤 Toni caldi della terra

Evita:
- ❌ Colori troppo saturi
- ❌ Bianco e nero (preferisci colori)
- ❌ Filtri pesanti

## 📝 Template Dati Firebase

```javascript
// Template per My Journey
{
  titolo: {
    it: "Basilica di San Francesco",
    en: "Basilica of Saint Francis",
    fr: "Basilique de Saint-François",
    de: "Basilika des Heiligen Franziskus",
    es: "Basílica de San Francisco"
  },
  imgUrl: "/images/assisi-basilica.jpg", // o URL Firebase Storage
  categoria: {
    it: "Monumenti",
    en: "Monuments",
    fr: "Monuments",
    de: "Denkmäler",
    es: "Monumentos"
  },
  descrizione: {
    it: "Patrimonio dell'UNESCO, la basilica è uno dei luoghi...",
    en: "UNESCO World Heritage site, the basilica is one of...",
    // altre lingue...
  },
  distanza: "5 km dal casale",
  durata: "1-2 ore",
  mapsUrl: "https://maps.google.com/?q=Basilica+San+Francesco+Assisi",
  ordine: 1
}

// Template per My Taste
{
  titolo: {
    it: "Trattoria Da Cecco",
    en: "Cecco's Trattoria",
    // ...
  },
  imgUrl: "/images/trattoria-cecco.jpg",
  categoria: {
    it: "Ristorante",
    en: "Restaurant",
    // ...
  },
  tipoCucina: {
    it: "Cucina umbra tradizionale",
    en: "Traditional Umbrian cuisine",
    // ...
  },
  descrizione: {
    it: "Ristorante a conduzione familiare...",
    // ...
  },
  prezzoMedio: {
    it: "€€ (25-40€)",
    en: "€€ (25-40€)",
    // ...
  },
  telefono: "+39 075 123456",
  mapsUrl: "https://maps.google.com/?q=...",
  ordine: 1
}
```

## 🔥 Hot Tip!

Per un risultato professionale immediato:
1. Scarica 5-6 immagini da Unsplash
2. Ottimizzale con TinyPNG
3. Caricale in `public/images/`
4. Aggiorna i record nel database con gli URL
5. **Fatto!** 🎉

---

**Tempo stimato:** 30-45 minuti per setup completo con 10-15 immagini
