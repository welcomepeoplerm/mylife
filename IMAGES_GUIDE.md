# Guida alle Immagini per MyLyfe

## Cartella delle Immagini
Le immagini devono essere inserite in: `public/images/`

## Immagini Consigliate per Settori

### 1. My Journey (Luoghi da Visitare)
Dimensioni consigliate: **1200x800px** o rapporto 3:2

Esempi di immagini da inserire:
- `assisi-basilica.jpg` - Basilica di San Francesco d'Assisi
- `perugia-fontana.jpg` - Fontana Maggiore, Perugia
- `spoleto-duomo.jpg` - Duomo di Spoleto
- `todi-piazza.jpg` - Piazza del Popolo, Todi
- `orvieto-duomo.jpg` - Duomo di Orvieto
- `cascata-marmore.jpg` - Cascata delle Marmore
- `lago-trasimeno.jpg` - Lago Trasimeno
- `gubbio-palazzo.jpg` - Palazzo dei Consoli, Gubbio

### 2. My Taste (Ristoranti e Enogastronomia)
Dimensioni consigliate: **1200x800px** o rapporto 3:2

Esempi di immagini da inserire:
- Piatti tipici umbri (truffe, torta al testo, strangozzi)
- Interni ed esterni di ristoranti
- Vigneti e cantine
- Prodotti tipici (olio, vino, salumi)

Formato consigliato: JPEG con qualità 80-85% per ottimizzare il caricamento

### 3. My Home (Servizi e Struttura)
Icone SVG già integrate nel codice per:
- Wi-Fi
- Piscina
- Check-in/Check-out
- Servizi generali

## Ottimizzazione delle Immagini

### Strumenti consigliati:
1. **TinyPNG** (https://tinypng.com/) - Compressione online
2. **ImageOptim** (Mac) o **FileOptimizer** (Windows)
3. **Squoosh** (https://squoosh.app/) - Tool Google

### Best Practices:
- Formato: **JPEG** per foto, **PNG** per loghi/icone con trasparenza
- Risoluzione: Max **1920px** larghezza per immagini grandi
- Peso: Target **< 200KB** per immagine
- Usa `loading="lazy"` nel codice HTML per caricamento progressivo

## Placeholder e Immagini Mancanti

Se un'immagine non è disponibile, il sistema mostra automaticamente un placeholder con gradiente colorato.

## Licenze e Copyright

Assicurati che tutte le immagini utilizzate:
- Siano di tua proprietà
- Siano sotto licenza Creative Commons o simile
- Siano acquistate da stock photos (Unsplash, Pexels, Pixabay)

## Fonti Gratuite Consigliate

1. **Unsplash** (https://unsplash.com/) - Alta qualità, gratis
2. **Pexels** (https://pexels.com/) - Gratis per uso commerciale
3. **Pixabay** (https://pixabay.com/) - Gratis
4. **Flickr** (con filtro Creative Commons)

## Naming Convention

Usa nomi descrittivi in minuscolo con trattini:
- ✅ `assisi-basilica-san-francesco.jpg`
- ✅ `ristorante-la-taverna-perugia.jpg`
- ❌ `IMG_1234.jpg`
- ❌ `photo (1).jpg`

## Aggiungere Immagini al Database

Quando inserisci un elemento nel database Firebase, usa il campo `imgUrl`:

```javascript
{
  titolo: { it: "Basilica di San Francesco", en: "Basilica of St. Francis" },
  imgUrl: "/images/assisi-basilica.jpg",  // ← Path relativo
  descrizione: { it: "...", en: "..." },
  // altri campi...
}
```

## Generazione Automatica con AI

Puoi anche generare immagini con:
- **DALL-E** (OpenAI)
- **Midjourney**
- **Stable Diffusion**

Prompt suggerito:
```
"Beautiful landscape photo of [location] in Umbria, Italy, 
golden hour lighting, professional photography, high quality, 
vibrant colors, 3:2 aspect ratio"
```
