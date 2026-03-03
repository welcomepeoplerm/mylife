# 🤖 Guida Implementazione Chatbot Oliver

## 📋 Prerequisiti

- Node.js installato
- Progetto MyLyfe Umbria configurato
- Firebase configurato e funzionante

---

## 🎯 Architettura Soluzione

**Sistema Pattern Matching:**
1. **Analisi Keywords** → Rileva categoria e località
2. **Query Firebase** → Cerca dati reali dal database
3. **Risposte Contestuali** → Mostra risultati con card
4. **100% Gratuito** → Nessun costo API esterno

---

## 🤖 Step 1: Crea Servizio Chatbot

### File: `src/chatbot-service.js`

```javascript
// src/chatbot-service.js
import { firebaseService } from './firebase-service.js';
import { i18n } from './i18n.js';

class ChatbotService {
  constructor() {
    // Keywords per categorie
    this.keywords = {
      ristoranti: ['mangiare', 'ristorante', 'cibo', 'pranzo', 'cena', 'trattoria', 'osteria', 'eat', 'restaurant', 'food', 'cucina', 'chef'],
      cantine: ['vino', 'cantina', 'degustazione', 'wine', 'winery', 'tasting', 'enologia', 'vineyard'],
      luoghi: ['visitare', 'vedere', 'luogo', 'attrazione', 'monumento', 'visit', 'see', 'place', 'attraction', 'turistico'],
      natura: ['natura', 'parco', 'oasi', 'lago', 'cascata', 'nature', 'park', 'waterfall', 'montagna', 'fiume'],
      home: ['wifi', 'password', 'piscina', 'checkin', 'checkout', 'pool', 'casa', 'casale', 'servizi']
    };
    
    // Località riconosciute
    this.locations = ['orvieto', 'assisi', 'perugia', 'terni', 'spoleto', 'gubbio', 'todi', 'norcia', 'cascata delle marmore'];
  }
  
  // Processa messaggio principale
  async processMessage(userMessage) {
    const messageLower = userMessage.toLowerCase().trim();
    
    // 1. Gestisci saluti e ringraziamenti
    if (this.isGreeting(messageLower)) {
      return {
        text: 'Ciao! 👋 Sono Oliver, il tuo assistente personale. Posso aiutarti a trovare ristoranti, luoghi da visitare o informazioni sul casale. Cosa ti interessa?',
        results: [],
        category: null
      };
    }
    
    if (this.isThanks(messageLower)) {
      return {
        text: 'Prego! 😊 Sono qui se hai altre domande.',
        results: [],
        category: null
      };
    }
    
    // 2. Rileva categoria e località
    const category = this.detectCategory(messageLower);
    const location = this.detectLocation(messageLower);
    
    let results = [];
    let response = '';
    
    // 3. Query diretta se categoria riconosciuta
    if (category === 'ristoranti' || category === 'cantine') {
      results = await this.searchTaste(messageLower, location);
      response = this.buildTasteResponse(results, location);
    } 
    else if (category === 'luoghi' || category === 'natura') {
      results = await this.searchJourney(messageLower, location);
      response = this.buildJourneyResponse(results, location);
    }
    else if (category === 'home') {
      results = await this.searchHome(messageLower);
      response = this.buildHomeResponse(results);
    }
    else {
      // 4. Risposta generica con suggerimenti
      response = this.handleGenericQuery(messageLower);
      results = [];
    }
    
    return {
      text: response,
      results: results,
      category: category
    };
  }
  
  // Rileva categoria dal messaggio
  detectCategory(message) {
    for (const [category, keywords] of Object.entries(this.keywords)) {
      if (keywords.some(kw => message.includes(kw))) {
        return category;
      }
    }
    return null;
  }
  
  // Rileva località
  detectLocation(message) {
    return this.locations.find(loc => message.includes(loc)) || null;
  }
  
  // Verifica se è un saluto
  isGreeting(message) {
    const greetings = ['ciao', 'salve', 'buongiorno', 'buonasera', 'hello', 'hi', 'hey'];
    return greetings.some(g => message.includes(g));
  }
  
  // Verifica se è un ringraziamento
  isThanks(message) {
    const thanks = ['grazie', 'thank', 'merci', 'gracias'];
    return thanks.some(t => message.includes(t));
  }
  
  // Cerca ristoranti/cantine
  async searchTaste(message, location) {
    try {
      const allTaste = await firebaseService.getTasteData();
      
      if (!location) {
        return allTaste.slice(0, 10); // Primi 10
      }
      
      return allTaste.filter(item => {
        const titleLower = i18n.tm(item.titolo).toLowerCase();
        const descLower = i18n.tm(item.descrizione).toLowerCase();
        
        return titleLower.includes(location) || descLower.includes(location);
      });
    } catch (error) {
      console.error('Search taste error:', error);
      return [];
    }
  }
  
  // Cerca luoghi da visitare
  async searchJourney(message, location) {
    try {
      const allJourney = await firebaseService.getJourneyData();
      
      if (!location) {
        return allJourney.slice(0, 10);
      }
      
      return allJourney.filter(item => {
        const titleLower = i18n.tm(item.titolo).toLowerCase();
        const descLower = i18n.tm(item.descrizione).toLowerCase();
        
        return titleLower.includes(location) || descLower.includes(location);
      });
    } catch (error) {
      console.error('Search journey error:', error);
      return [];
    }
  }
  
  // Cerca info My Home
  async searchHome(message) {
    try {
      const allHome = await firebaseService.getHomeData();
      
      return allHome.filter(item => {
        const titleLower = i18n.tm(item.titolo).toLowerCase();
        const descLower = i18n.tm(item.descrizione).toLowerCase();
        
        return message.split(' ').some(word => 
          word.length > 3 && (titleLower.includes(word) || descLower.includes(word))
        );
      });
    } catch (error) {
      console.error('Search home error:', error);
      return [];
    }
  }
  
  // Chiedi a Gemini AI (con cache e rate limiting)
  asyGestisci domande generiche
  handleGenericQuery(message) {
    // Analizza keywords per suggerimenti
    const hasFood = ['cibo', 'mangiare', 'pranzo', 'cena'].some(w => message.includes(w));
    const hasVisit = ['visitare', 'vedere', 'gita', 'tour'].some(w => message.includes(w));
    const hasDistance = ['distanza', 'lontano', 'vicino', 'quanto dista'].some(w => message.includes(w));
    const hasKids = ['bambini', 'figli', 'famiglia', 'kids'].some(w => message.includes(w));
    
    if (hasFood) {
      return 'Per trovare ristoranti, prova a specificare una località. Ad esempio: "ristoranti a Orvieto" oppure "dove mangiare ad Assisi"';
    }
    
    if (hasVisit) {
      return 'Posso aiutarti a trovare luoghi da visitare! Prova a chiedere: "cosa visitare in Umbria" oppure "luoghi vicino al casale"';
    }
    
    if (hasDistance) {
      return 'Le principali città umbre sono:\n• Orvieto: 30 km\n• Todi: 40 km\n• Assisi: 70 km\n• Perugia: 60 km\nPer informazioni più specifiche, chiedi pure!';
    }
    
    if (hasKids) {
      return 'Per attività con bambini, ti consiglio di cercare: "parchi naturali", "cascata delle marmore" o "luoghi per famiglie". Cosa ti interessa in particolare?';
    }
    
    // Risposta default
    return `Non sono sicuro di aver capito. Puoi chiedermi:
• 🍴 "Dove mangiare a [città]"
• 🗺️ "Cosa visitare"
• 🏠 "Password Wi-Fi" o "Info sul casale"
• 📍 "Luoghi vicini"

Cosa ti serve?`;
  
  // Costruisci risposta ristoranti
  buildTasteResponse(results, location) {
    if (results.length === 0) {
      return location 
        ? `Non ho trovato ristoranti specifici a ${location}. Ecco tutti i ristoranti consigliati:`
        : 'Ecco tutti i ristoranti e cantine consigliati:';
    }
    
    const locationText = location ? ` a ${location}` : '';
    return `Ho trovato ${results.length} ${results.length === 1 ? 'ristorante' : 'ristoranti'}${locationText}:`;
  }
  
  // Costruisci risposta luoghi
  buildJourneyResponse(results, location) {
    if (results.length === 0) {
      return `Ecco i luoghi più belli da visitare in Umbria:`;
    }
    
    const locationText = location ? ` vicino a ${location}` : '';
    return `Ho trovato ${results.length} ${results.length === 1 ? 'luogo' : 'luoghi'} da visitare${locationText}:`;
  }
  
  // Costruisci risposta My Home
  buildHomeResponse(results) {
    if (results.length === 0) {
      return 'Non ho trovato informazioni specifiche. Posso aiutarti con Wi-Fi, piscina, check-in/check-out o altri servizi?';
    }
    
    return `Ecco le informazioni richieste:`;
  }
}

export const chatbotService = new ChatbotService();
```

---

## 🎨 Step 6: Aggiorna Pagina My Assistant

### Modifica: `src/pages.js`

Cerca la funzione `renderMyAssistantPage` e sostituiscila con:

```javascript
// src/pages.js
import { chatbotService } from './chatbot-service.js';
import { createCard } from './components.js';
import { getSectorIcon } from './icons.js';

export async function renderMyAssistantPage() {
  const container = createContainer();
  
  container.innerHTML = `
    <div class="page-header">
      <div class="page-icon-wrapper">${getSectorIcon('assistant')}</div>
      <h2>Oliver - ${i18n.t('myAssistant')}</h2>
      <p class="page-subtitle">Il tuo assistente personale per l'Umbria 🤖</p>
    </div>
    
    <div class="chatbot-container">
      <div class="chatbot-messages" id="chatbot-messages">
        <div class="chatbot-message bot-message">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <p><strong>Ciao! Sono Oliver</strong>, il tuo assistente virtuale.</p>
            <p>Posso aiutarti a trovare:</p>
            <ul>
              <li>🍴 Ristoranti e cantine</li>
              <li>🗺️ Luoghi da visitare</li>
              <li>🏠 Informazioni sul casale</li>
            </ul>
            <p><strong>Prova a chiedere:</strong></p>
            <div class="quick-replies">
              <button class="quick-reply-btn" data-query="Dove posso mangiare ad Orvieto?">🍕 Ristoranti a Orvieto</button>
           2  <button class="quick-reply-btn" data-query="Cosa visitare in Umbria?">🏛️ Cosa visitare</button>
              <button class="quick-reply-btn" data-query="Password Wi-Fi">📶 Password Wi-Fi</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chatbot-results" id="chatbot-results"></div>
      
      <form class="chatbot-input-form" id="chatbot-form">
        <input 
          type="text" 
          id="chatbot-input" 
          placeholder="Scrivi la tua domanda..."
          autocomplete="off"
          required
        />
        <button type="submit" class="btn btn-primary">
          <span class="btn-icon">📤</span>
          <span class="btn-text">Invia</span>
        </button>
      </form>
    </div>
  `;
  
  // Setup event listeners

  ## 📌 Campi consigliati per i documenti (ricerca)

  - `keywords` (array, minuscole senza accenti): parole chiave per il matching rapido, es. `['orvieto','ristorante','pizza']`
  - `locations` (array): localita'/aree supportate, es. `['orvieto']`
  - `ordine` (number): per ordinamento coerente dei risultati
  - Campi testo (`titolo`, `descrizione`): usati come fallback nel filtraggio locale

  setupChatbot(container);
  
  return container;
}

function setupChatbot(container) {
  const form = container.querySelector('#chatbot-form');
  const input = container.querySelector('#chatbot-input');
  const messagesContainer = container.querySelector('#chatbot-messages');
  const resultsContainer = container.querySelector('#chatbot-results');
  
  // Quick replies
  container.querySelectorAll('.quick-reply-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.dataset.query;
      input.value = query;
      form.dispatchEvent(new Event('submit'));
    });
  });
  
  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userMessage = input.value.trim();
    if (!userMessage) return;
    
    // Aggiungi messaggio utente
    addMessage(userMessage, 'user', messagesContainer);
    input.value = '';
    input.disabled = true;
    
    // Mostra typing indicator
    const typingId = addTypingIndicator(messagesContainer);
    
    try {
      // Processa con chatbot
      const response = await chatbotService.processMessage(userMessage);
      
      // Rimuovi typing
      removeTypingIndicator(typingId, messagesContainer);
      
      // Aggiungi risposta bot
      addMessage(response.text, 'bot', messagesContainer);
      
      // Mostra risultati come card
      if (response.results && response.results.length > 0) {
        displayResults(response.results, response.category, resultsContainer);
      } else {
        resultsContainer.innerHTML = '';
      }
      
    } catch (error) {
      console.error('Chatbot error:', error);
      removeTypingIndicator(typingId, messagesContainer);
      addMessage('Mi dispiace, si è verificato un errore. Riprova tra poco.', 'bot', messagesContainer);
    } finally {
      input.disabled = false;
      input.focus();
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });
}

function addMessage(text, sender, container) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chatbot-message ${sender}-message`;
  
  const avatar = sender === 'user' ? '👤' : '🤖';
  
  messageDiv.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">
      <p>${text}</p>
    </div>
  `;
  
  container.appendChild(messageDiv);
  container.scrollTop = container.scrollHeight;
  return messageDiv;
}

function addTypingIndicator(container) {
  const id = 'typing-' + Date.now();
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chatbot-message bot-message';
  typingDiv.id = id;
  typingDiv.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content typing-indicator">
      <span></span><span></span><span></span>
    </div>
  `;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id, container) {
  const typing = container.querySelector(`#${id}`);
  if (typing) typing.remove();
}

function displayResults(results, category, container) {
  container.innerHTML = '<h3 class="results-title">📋 Risultati:</h3><div class="cards-container" id="cards-grid"></div>';
  const cardsContainer = container.querySelector('#cards-grid');
  
  results.forEach(item => {
    const cardType = category === 'ristoranti' || category === 'cantine' 
      ? 'taste' 
      : category === 'home' 
        ? 'home' 
        : 'journey';
    
    cardsContainer.appendChild(createCard(item, cardType));
  });
}
```

---

## 🎨 Step 7: Aggiungi Stili CSS

### Modifica: `src/style.css`

Aggiungi alla fine del file:

```css
/* ==========================================
   CHATBOT STYLES
   ========================================== */

.chatbot-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 280px);
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}

.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f8f9fa;
}

.chatbot-message {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  animation3 slideIn 0.3s ease;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  font-size: 2rem;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-content {
  background: white;
  padding: 0.875rem 1.125rem;
  border-radius: 16px;
  max-width: 70%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
}

.user-message .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-content p {
  margin: 0.5rem 0;
  line-height: 1.5;
}

.message-content p:first-child {
  margin-top: 0;
}

.message-content p:last-child {
  margin-bottom: 0;
}

.message-content ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.message-content ul li {
  margin: 0.25rem 0;
}

/* Quick Replies */
.quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.quick-reply-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.quick-reply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  gap: 0.375rem;
  padding: 0.75rem 1rem;
  background: white;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* Chatbot Results */
.chatbot-results {
  padding: 1.5rem;
  border-top: 2px solid #e9ecef;
  background: white;
  max-height: 450px;
  overflow-y: auto;
}

.results-title {
  margin: 0 0 1rem 0;
  color: #667eea;
  font-size: 1.125rem;
}

.chatbot-results .cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

/* Chatbot Input Form */
.chatbot-input-form {
  display: flex;
  gap: 0.75rem;
  padding: 1.25rem;
  border-top: 2px solid #e9ecef;
  background: white;
}

.chatbot-input-form input {
  flex: 1;
  padding: 0.875rem 1.25rem;
  border: 2px solid #dee2e6;
  border-radius: 28px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s;
  font-family: inherit;
}

.chatbot-input-form input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.chatbot-input-form input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.chatbot-input-form button {
  border-radius: 28px;
  padding: 0.875rem 1.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.chatbot-input-form button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.chatbot-input-form button:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 1.125rem;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .chatbot-container {
    height: calc(100vh - 220px);
    border-radius: 12px;
  }
  
  .chatbot-messages {
    padding: 1rem;
  }
  
  .message-content {
    max-width: 85%;
    font-size: 0.9375rem;
  }
  
  .chatbot-results {
    max-height: 350px;
  }
  
  .chatbot-results .cards-container {
    grid-template-columns: 1fr;
  }
  
  .chatbot-input-form {
    padding: 1rem;
    gap: 0.5rem;
  }
  
  .chatbot-input-form input {
    font-size: 0.9375rem;
  }
  
  .btn-text {
    display: none;
  }
  
  .quick-reply-btn {
    font-size: 0.8125rem;
    padding: 0.375rem 0.875rem;
  }
}

@media (max-width: 480px) {
  .message-avatar {
    font-size: 1.5rem;
    width: 32px;
    height: 32px;
  }
  
  .message-content {
    font-size: 0.875rem;
    padding: 0.75rem 1rem;
  }
}

/* Scrollbar personalizzata */
.chatbot-messages::-webkit-scrollbar,
.chatbot-results::-webkit-scrollbar {
  width: 8px;
}

.chatbot-messages::-webkit-scrollbar-track,
.chatbot-results::-webkit-scrollbar-track {
  background: #f1f3f5;
  border-radius: 4px;
}

.chatbot-messages::-webkit-scrollbar-thumb,
.chatbot-results::-webkit-scrollbar-thumb {
  background: #adb5bd;
  border-radius: 4px;
}

.chatbot-messages::-webkit-scrollbar-thumb:hover,
.chatbot-results::-webkit-scrollbar-thumb:hover {
  background: #868e96;
}
```

---

## 🧪 Step 8: Test e Verifica

### 8.1 Avvia il server di sviluppo

```bash
npm run dev
```

### 8.2 Test Domande

Vai su `http://localhost:5173/#/assistant` e prova:

**Pattern Matching (Veloce):**
- ✅ "Dove mangiare a Orvieto"
- ✅ "Ristoranti consigliati"
- ✅ "Cosa visitare"
- ✅ "Password Wi-Fi"

**Esempi Avanzati (Pattern Matching):**
- ✅ "Dove mangiare a Orvieto"
- ✅ "Ristoranti consigliati"
- ✅ "Cosa visitare"
- ✅ "Password Wi-Fi"
- ✅ "Luoghi vicino al casale"
- ✅ "Cantine per degustazione"
- ✅ "Dove portare i bambini"
- ✅ "Quanto dista Assisi"

### 8.3 Verifica Console

Apri DevTools (F12) e controlla:
- ✅ Nessun errore nella console
- ✅ Chiamate Firebase funzionanti
- ✅ Cache locale attiva (se implementata)

---

## 🔒 Step 9: Sicurezza

### 9.1 NON committare `.env` su GitHub

Verifica `.4: Test e Verifica

### 4.1 Avvia il server di sviluppo

```bash
npm run dev
```

### 4.2 Test Domande

Vai su `http://localhost:5173/#/assistant` e prova:

**Pattern Matching:**
- ✅ "Dove mangiare a Orvieto"
- ✅ "Ristoranti consigliati"
- ✅ "Cosa visitare"
- ✅ "Password Wi-Fi"
- ✅ "Luoghi vicino al casale"
- ✅ "Cantine per degustazione"
- ✅ "Dove portare i bambini"

### 4.3 Verifica Console

Apri DevTools (F12) e controlla:
- ✅ Nessun errore nella console
- ✅ Chiamate Firebase funzionanti
- ✅ Risultati mostrati correttamente

---

## 🚀 Step 5: Deploy Produzione

### 5.1 Build
---

## 📈 Ottimizzazioni Future

### 1. Feedback Loop

```javascript
// Salva feedback utenti
function saveFeedback(question, answer, helpful) {
  firestore.collection('chatbot_feedback').add({
```

### 5.2 Deploy

```bash
firebase deploy
```

---

## 🛠️ Troubleshooting

### Problema: Chatbot non risponde

**Soluzione:**
1. Verifica Firebase configurato correttamente
2. Controlla console per errori
3. Verifica `firebaseService` funzionante

### Problema: Nessun risultato trovato

**Soluzione:**
1. Controlla database Firestore popolato
2. Verifica nomi collezioni corretti
3. Testa query Firebase manualmente

### Problema: Card non visualizzate

**Soluzione:**
1. Verifica `createCard()` in `components.js`
2. Controlla CSS caricato correttamente
1. Verifica struttura dati item

- [ ] `.env` creato e configurato (solo se aggiungi integrazioni esterne)
- [ ] `.gitignore` aggiornato
- [ ] Miglioramenti Futuri (Opzionali)

### 1. Storico Conversazioni

```javascript
// Salva conversazioni in localStorage
function saveConversation(userMessage, botResponse) {
  const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  history.push({
    user: userMessage,
    bot: botResponse,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('chatHistory', JSON.stringify(history.slice(-50)));
}
```

### 2. Analytics

```javascript
// Traccia domande frequenti
function trackQuestion(question, category) {
  analytics.logEvent('chatbot_question', {
    query: question,
    category: category
  });
}
```

### 3. Ricerca Avanzata

```javascript
// Ricerca full-text nel database
async function searchFullText(query) {
  const allData = await Promise.all([
    firebaseService.getTasteData(),
    firebaseService.getJourneyData(),
    firebaseService.getHomeData()
  ]);
  
  return allData.flat().filter(item => {
    const text = `${i18n.tm(item.titolo)} ${i18n.tm(item.descrizione)}`.toLowerCase();
    reFile creati:
  - [ ] `src/chatbot-service.js`
- [ ] File modificati:
  - [ ] `src/pages.js` (funzione `renderMyAssistantPage`)
  - [ ] `src/style.css` (stili chatbot)
- [ ] Server avviato (`npm run dev`)
- [ ] Test funzionali completati
- [ ] Nessun errore in console
- [ ] Firebase funzionante
- [ ] Card visualizzate correttamente

---

## 💰 Riepilogo Costi

| Servizio | Piano | Costo |
|----------|-------|-------|
| Firebase Spark | Gratuito | €0 |
| Chatbot Pattern Matching | Locale | €0 |
| **TOTALE** | | **€0** |

---

## 📞 Supporto

**Problemi con Firebase:**
- Documentazione: https://firebase.google.com/docs
- Console: https://console.firebase.google.com

**Problemi con MyLyfe:**
- Verifica console browser (F12)
- Controlla Firebase logs
- Testa query Firestore manualmentecon pattern matching che:
- ✅ Risponde in italiano
- ✅ Cerca dati reali da Firebase
- ✅ Analizza keywords per categorie
- ✅ Mostra risultati con card native
- ✅ 100% gratuito
- ✅ Veloce e offline-ready
- ✅ Nessuna dipendenza esterna

---

## 🌟 Vantaggi di Questa Soluzione

✓ **Zero Costi** - Nessuna API a pagamento  
✓ **Velocità** - Risposta istantanea  
✓ **Privacy** - Tutto locale, nessun dato inviato a terzi  
✓ **Affidabilità** - Nessun rate limit o problemi di connessione  
✓ **Manutenibilità** - Codice semplice e comprensibile  

---

**Data creazione:** 15 Gennaio 2026  
**Versione:** 1.0  
**Stato:** Pronto per implementazione  
**Tipo:** Pattern Matching Locale (No AI)