# Script di Setup Database Firebase

Questo script ti aiuta a popolare il database Firebase con dati di esempio per testare l'app.

## Come usare

1. **Vai alla Firebase Console:**
   https://console.firebase.google.com/

2. **Seleziona il progetto MyLyfeUmbria**

3. **Vai su Firestore Database**
   - Nel menu laterale: Build > Firestore Database
   - Se non è ancora attivo, clicca "Create database"
   - Seleziona "Start in test mode" (per sviluppo)
   - Scegli location: europe-west1

4. **Crea le collezioni e documenti manualmente:**

---

## Collezione: `home`

### Documento ID: `wifi`
```
titolo:
  it: "Wi-Fi"
  en: "Wi-Fi"
  fr: "Wi-Fi"
  de: "WLAN"
  es: "Wi-Fi"

descrizione:
  it: "Nome rete: LyfeUmbriaGuest\nPassword: Lyfe2025"
  en: "Network: LyfeUmbriaGuest\nPassword: Lyfe2025"
  fr: "Réseau: LyfeUmbriaGuest\nMot de passe: Lyfe2025"
  de: "Netzwerk: LyfeUmbriaGuest\nPasswort: Lyfe2025"
  es: "Red: LyfeUmbriaGuest\nContraseña: Lyfe2025"

icona: "wifi"
ordine: 1
```

### Documento ID: `pool`
```
titolo:
  it: "Piscina"
  en: "Swimming Pool"
  fr: "Piscine"
  de: "Schwimmbad"
  es: "Piscina"

descrizione:
  it: "Aperta dalle 08:00 alle 20:00.\nSi prega di usare la doccia prima di entrare."
  en: "Open from 08:00 to 20:00.\nPlease use the shower before entering."
  fr: "Ouvert de 08h00 à 20h00.\nVeuillez utiliser la douche avant d'entrer."
  de: "Geöffnet von 08:00 bis 20:00 Uhr.\nBitte duschen Sie vor dem Betreten."
  es: "Abierto de 08:00 a 20:00.\nPor favor, use la ducha antes de entrar."

icona: "pool"
ordine: 2
```

### Documento ID: `checkin`
```
titolo:
  it: "Check-in & Check-out"
  en: "Check-in & Check-out"
  fr: "Arrivée & Départ"
  de: "Ankunft & Abreise"
  es: "Entrada y Salida"

descrizione:
  it: "Check-in: dalle 15:00 alle 19:00\nCheck-out: entro le 10:00\nLasciare le chiavi nella cassetta."
  en: "Check-in: from 3:00 PM to 7:00 PM\nCheck-out: by 10:00 AM\nLeave keys in the box."
  fr: "Arrivée: de 15h00 à 19h00\nDépart: avant 10h00\nLaisser les clés dans la boîte."
  de: "Ankunft: von 15:00 bis 19:00 Uhr\nAbreise: bis 10:00 Uhr\nSchlüssel in der Box lassen."
  es: "Entrada: de 15:00 a 19:00\nSalida: antes de las 10:00\nDeja las llaves en la caja."

icona: "key"
ordine: 3
```

---

## Collezione: `journey`

### Documento ID: `orvieto`
```
titolo:
  it: "Duomo di Orvieto"
  en: "Orvieto Cathedral"
  fr: "Cathédrale d'Orvieto"
  de: "Dom von Orvieto"
  es: "Catedral de Orvieto"

categoria:
  it: "Arte e Cultura"
  en: "Art & Culture"
  fr: "Art et Culture"
  de: "Kunst und Kultur"
  es: "Arte y Cultura"

descrizione:
  it: "Uno dei capolavori dell'architettura gotica italiana, con la sua facciata mozzafiato decorata da mosaici dorati."
  en: "One of the masterpieces of Italian Gothic architecture, with its breathtaking facade decorated with golden mosaics."
  fr: "L'un des chefs-d'œuvre de l'architecture gothique italienne."
  de: "Eines der Meisterwerke der italienischen Gotik."
  es: "Una de las obras maestras de la arquitectura gótica italiana."

distanza: "25 km"
durata: "30 min"
mapsUrl: "https://maps.google.com/?q=Duomo+di+Orvieto"
featured: true
ordine: 1
```

### Documento ID: `civita`
```
titolo:
  it: "Civita di Bagnoregio"
  en: "Civita di Bagnoregio"
  fr: "Civita di Bagnoregio"
  de: "Civita di Bagnoregio"
  es: "Civita di Bagnoregio"

categoria:
  it: "Borgo Storico"
  en: "Historic Village"
  fr: "Village Historique"
  de: "Historisches Dorf"
  es: "Pueblo Histórico"

descrizione:
  it: "La 'città che muore', borgo medievale arroccato su uno sperone di tufo. Accessibile solo tramite un suggestivo ponte pedonale."
  en: "The 'dying city', a medieval village perched on a tuff spur."
  fr: "La 'ville qui meurt', village médiéval perché sur un éperon de tuf."
  de: "Die 'sterbende Stadt', ein mittelalterliches Dorf."
  es: "La 'ciudad que muere', pueblo medieval."

distanza: "15 km"
durata: "20 min"
mapsUrl: "https://maps.google.com/?q=Civita+di+Bagnoregio"
featured: true
ordine: 2
```

---

## Collezione: `taste`

### Documento ID: `lapalomba`
```
titolo:
  it: "La Palomba"
  en: "La Palomba"
  fr: "La Palomba"
  de: "La Palomba"
  es: "La Palomba"

categoria:
  it: "Ristorante"
  en: "Restaurant"
  fr: "Restaurant"
  de: "Restaurant"
  es: "Restaurante"

tipoCucina:
  it: "Cucina Umbra Tradizionale"
  en: "Traditional Umbrian Cuisine"
  fr: "Cuisine Ombrienne"
  de: "Umbrische Küche"
  es: "Cocina Umbria"

descrizione:
  it: "Ottimo per il tartufo e la pasta fatta in casa. Ambiente accogliente nel centro di Orvieto."
  en: "Excellent for truffles and homemade pasta. Cozy atmosphere in Orvieto center."
  fr: "Excellent pour les truffes et les pâtes maison."
  de: "Ausgezeichnet für Trüffel und hausgemachte Pasta."
  es: "Excelente para trufas y pasta casera."

telefono: "+39 0763 343395"
prezzoMedio:
  it: "€€ (30-50€)"
  en: "€€ (30-50€)"
  fr: "€€ (30-50€)"
  de: "€€ (30-50€)"
  es: "€€ (30-50€)"

mapsUrl: "https://maps.google.com/?q=La+Palomba+Orvieto"
featured: true
ordine: 1
```

---

## Note Importanti

1. **Tipo di campo "Map"**: Per i campi multilingua (titolo, descrizione, ecc.), usa il tipo "Map" in Firestore
2. **Tipo di campo "String"**: Per campi singoli come telefono, distanza, ecc.
3. **Tipo di campo "Number"**: Per il campo "ordine"
4. **Tipo di campo "Boolean"**: Per il campo "featured"

## Regole di Sicurezza (Test Mode)

Per ora, configura le regole in modalità test:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**IMPORTANTE:** Queste regole permettono accesso completo e sono solo per sviluppo!

## Dopo aver creato i dati

1. Ricarica l'app: http://localhost:3000/
2. Clicca sui menu My Home, My Journey, My Taste
3. Verifica che i dati vengano caricati correttamente

---

**Prossimi passi:** Creeremo un pannello admin per inserire questi dati facilmente!
