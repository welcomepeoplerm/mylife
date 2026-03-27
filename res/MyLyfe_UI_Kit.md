
# MyLyfe UI Kit – Componenti Completi

Questo UI Kit fornisce la struttura standardizzata dei componenti per implementare la nuova interfaccia MyLyfe secondo stile Material 3/Fluent.

---

## 1. Palette Colori
- **Primario**: #2F8B57
- **Primario chiaro**: #DFF1E6
- **Primario scuro**: #1F5E3C
- **Secondario**: #88C39C
- **Sfondo**: #F6F8F7
- **Sfondo cards**: #FFFFFF
- **Testo primario**: #1B1B1B
- **Testo secondario**: #5F5F5F

---

## 2. Tipografia
### Title
- `Title Large`: 22px, semi-bold
- `Title Medium`: 18px, semi-bold

### Body
- `Body Large`: 16px
- `Body Medium`: 14px
- `Body Small`: 12px

### Label
- `Label Small`: 11px

---

## 3. Componenti UI

### 3.1 Top App Bar
```
Altezza: 64px
Sfondo: #FFFFFF
Icone: 24px
Elevation: 2
Elementi: Logo, Titolo, Selettore lingua
```

---

### 3.2 Hero Section
```
Altezza: 140–180px
Layout: Testo a sinistra, illustrazione a destra
Background: gradiente verde chiaro
Padding: 24px
```

---

### 3.3 Cards Funzionali (Dashboard)
```
Altezza: 82px
Sfondo: #FFFFFF
Bordi: 12px
Icona: 32px colore primario
Testo titolo: Title Medium
Testo sottotitolo: Body Small
Chevron finale: 20px
Elevation: 1–2
```

---

### 3.4 Card Informativa (Sezione My Home)
```
Dimensioni: variabili, min 160px altezza
Sfondo: #FFFFFF
Bordi: 16px
Immagine superiore: 16:9
Titolo: Title Small
Testo descrizione: Body Small
Pulsante opzionale: filled-tonal
```

---

### 3.5 Pulsanti
#### Filled Button
```
Altezza: 44px
Background: colore primario
Testo: bianco
Bordo: 10px radius
```

#### Tonal Button
```
Background: primario chiaro
Testo: primario
Icona opzionale
```

#### Text Button
```
Senza elevation
Testo primario
```

---

### 3.6 Iconografia
- Stile: Material Symbols Rounded
- Peso: 300 / 400
- Colorazione: primario

---

### 3.7 Liste / Sezioni interne
```
Padding verticale sezioni: 16–24px
Titoli sezione: Title Medium
Spaziatura elementi: 12–16px
```

---

### 3.8 Footer
```
Altezza: 56px
Testo: Body Small, colore secondario
Allineamento: centro
```

---

## 4. Layout Grid
```
Margini laterali: 20px
Area contenuti: max 480px
Breakpoints: mobile-first (360–480px)
```

---

## 5. Stile Illustrazioni
- Vettoriale flat
- Palette derivata dai verdi principali
- Forme morbide, bordi arrotondati

---

## 6. Guidelines Interattive
- Touch target minimo: 48px
- Chevron sempre a destra per elementi cliccabili
- Feedback visivo on-tap (ripple Material)
- Contrasto minimo WCAG: 4.5:1

---

## 7. Componenti JSON (opzionale per integrazione)
### Card Funzionale
```json
{
  "type": "functional-card",
  "icon": "home",
  "title": "My Home",
  "subtitle": "Istruzioni del casale",
  "action": "navigate:/home"
}
```

### Card Informativa
```json
{
  "type": "info-card",
  "image": "pool.jpg",
  "title": "Piscina",
  "description": "Aperta dalle 09.00 alle 19.00",
  "button": {
    "label": "Apri su Maps",
    "action": "external:maps"
  }
}
```

---

## 8. Conclusione
Questo UI Kit definisce lo stile visivo, i componenti modulari e le regole di utilizzo per mantenere coerenza grafica in tutta l’app MyLyfe.

