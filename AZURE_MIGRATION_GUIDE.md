# Guida Completa: Migrazione "My Lyfe Umbria" da Firebase ad Azure Cloud

## Prerequisiti

- Account Azure attivo
- Azure CLI installato ([Download](https://docs.microsoft.com/cli/azure/install-azure-cli))
- Node.js e npm installati
- Codice sorgente dell'app corrente
- Accesso al progetto Firebase esistente

---

## STEP 1: Setup Account e Risorse Azure

### 1.1 Login ad Azure

```bash
# Login ad Azure
az login

# Imposta la subscription (se ne hai più di una)
az account list --output table
az account set --subscription "NOME_O_ID_SUBSCRIPTION"
```

### 1.2 Crea un Resource Group

```bash
# Crea un resource group nella regione West Europe
az group create --name MyLyfeUmbria-RG --location westeurope
```

### 1.3 Crea Azure Cosmos DB (NoSQL)

```bash
# Crea un account Cosmos DB (API NoSQL compatibile con MongoDB)
az cosmosdb create \
  --name mylyfeumbria-db \
  --resource-group MyLyfeUmbria-RG \
  --kind MongoDB \
  --server-version 4.2 \
  --locations regionName=westeurope failoverPriority=0 isZoneRedundant=False

# Crea il database
az cosmosdb mongodb database create \
  --account-name mylyfeumbria-db \
  --resource-group MyLyfeUmbria-RG \
  --name MyLyfeUmbriaDB

# Crea le collezioni (home, journey, taste)
az cosmosdb mongodb collection create \
  --account-name mylyfeumbria-db \
  --resource-group MyLyfeUmbria-RG \
  --database-name MyLyfeUmbriaDB \
  --name home \
  --shard "id"

az cosmosdb mongodb collection create \
  --account-name mylyfeumbria-db \
  --resource-group MyLyfeUmbria-RG \
  --database-name MyLyfeUmbriaDB \
  --name journey \
  --shard "id"

az cosmosdb mongodb collection create \
  --account-name mylyfeumbria-db \
  --resource-group MyLyfeUmbria-RG \
  --database-name MyLyfeUmbriaDB \
  --name taste \
  --shard "id"

# Ottieni la connection string
az cosmosdb keys list \
  --name mylyfeumbria-db \
  --resource-group MyLyfeUmbria-RG \
  --type connection-strings \
  --query "connectionStrings[0].connectionString" \
  --output tsv
```

**Salva la connection string** - la userai dopo!

---

## STEP 2: Esporta Dati da Firebase

### 2.1 Esporta dati da Firestore

```bash
# Installa Firebase CLI se non l'hai già
npm install -g firebase-tools

# Login a Firebase
firebase login

# Seleziona il progetto
firebase use MyLyfeUmbria

# Esporta i dati (crea file JSON)
# Metodo manuale: vai nella console Firebase > Firestore > Esporta/Importa
```

### 2.2 Script di Esportazione Firestore

Crea un file `export-firestore.js`:

```javascript
// filepath: scripts/export-firestore.js
const admin = require('firebase-admin');
const fs = require('fs');

// Inizializza Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json'); // Scaricalo da Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const data = [];
  
  snapshot.forEach(doc => {
    data.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  fs.writeFileSync(`${collectionName}.json`, JSON.stringify(data, null, 2));
  console.log(`Esportati ${data.length} documenti da ${collectionName}`);
}

async function exportAll() {
  await exportCollection('home');
  await exportCollection('journey');
  await exportCollection('taste');
}

exportAll().then(() => {
  console.log('Esportazione completata!');
  process.exit(0);
}).catch(err => {
  console.error('Errore:', err);
  process.exit(1);
});
```

Esegui:

```bash
cd scripts
npm init -y
npm install firebase-admin
node export-firestore.js
```

---

## STEP 3: Importa Dati in Cosmos DB

### 3.1 Script di Importazione

Crea `import-cosmosdb.js`:

```javascript
// filepath: scripts/import-cosmosdb.js
const { MongoClient } = require('mongodb');
const fs = require('fs');

const CONNECTION_STRING = 'TUA_CONNECTION_STRING_QUI'; // Dalla STEP 1.3
const DB_NAME = 'MyLyfeUmbriaDB';

async function importCollection(collectionName) {
  const client = new MongoClient(CONNECTION_STRING);
  
  try {
    await client.connect();
    console.log(`Connesso a Cosmos DB`);
    
    const db = client.db(DB_NAME);
    const collection = db.collection(collectionName);
    
    // Leggi i dati esportati
    const data = JSON.parse(fs.readFileSync(`${collectionName}.json`, 'utf8'));
    
    // Inserisci i documenti
    if (data.length > 0) {
      const result = await collection.insertMany(data);
      console.log(`Importati ${result.insertedCount} documenti in ${collectionName}`);
    }
  } finally {
    await client.close();
  }
}

async function importAll() {
  await importCollection('home');
  await importCollection('journey');
  await importCollection('taste');
}

importAll().then(() => {
  console.log('Importazione completata!');
  process.exit(0);
}).catch(err => {
  console.error('Errore:', err);
  process.exit(1);
});
```

Esegui:

```bash
npm install mongodb
node import-cosmosdb.js
```

---

## STEP 4: Crea Azure Functions (Backend API)

### 4.1 Inizializza Progetto Azure Functions

```bash
# Installa Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Crea progetto Functions
mkdir azure-functions
cd azure-functions
func init --javascript

# Crea funzioni HTTP per ogni collezione
func new --name GetHome --template "HTTP trigger"
func new --name GetJourney --template "HTTP trigger"
func new --name GetTaste --template "HTTP trigger"
func new --name AddContent --template "HTTP trigger"
func new --name UpdateContent --template "HTTP trigger"
func new --name DeleteContent --template "HTTP trigger"
```

### 4.2 Configura Cosmos DB nelle Functions

Installa il driver MongoDB:

```bash
npm install mongodb
```

Crea `shared/cosmosdb.js`:

```javascript
// filepath: azure-functions/shared/cosmosdb.js
const { MongoClient } = require('mongodb');

const CONNECTION_STRING = process.env.COSMOS_CONNECTION_STRING;
const DB_NAME = 'MyLyfeUmbriaDB';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = new MongoClient(CONNECTION_STRING);
  await client.connect();
  cachedClient = client;
  return client;
}

async function getCollection(collectionName) {
  const client = await connectToDatabase();
  return client.db(DB_NAME).collection(collectionName);
}

module.exports = { getCollection };
```

### 4.3 Implementa le Functions

**GetHome/index.js:**

```javascript
// filepath: azure-functions/GetHome/index.js
const { getCollection } = require('../shared/cosmosdb');

module.exports = async function (context, req) {
  try {
    const collection = await getCollection('home');
    const documents = await collection.find({}).toArray();
    
    context.res = {
      status: 200,
      body: documents,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: { error: error.message }
    };
  }
};
```

**GetJourney/index.js:**

```javascript
// filepath: azure-functions/GetJourney/index.js
const { getCollection } = require('../shared/cosmosdb');

module.exports = async function (context, req) {
  try {
    const collection = await getCollection('journey');
    const documents = await collection.find({}).toArray();
    
    context.res = {
      status: 200,
      body: documents,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: { error: error.message }
    };
  }
};
```

**GetTaste/index.js:**

```javascript
// filepath: azure-functions/GetTaste/index.js
const { getCollection } = require('../shared/cosmosdb');

module.exports = async function (context, req) {
  try {
    const collection = await getCollection('taste');
    const documents = await collection.find({}).toArray();
    
    context.res = {
      status: 200,
      body: documents,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: { error: error.message }
    };
  }
};
```

**AddContent/index.js (per Backend Admin):**

```javascript
// filepath: azure-functions/AddContent/index.js
const { getCollection } = require('../shared/cosmosdb');

module.exports = async function (context, req) {
  try {
    const { collectionName, document } = req.body;
    
    if (!collectionName || !document) {
      context.res = {
        status: 400,
        body: { error: 'collectionName e document sono richiesti' }
      };
      return;
    }
    
    const collection = await getCollection(collectionName);
    const result = await collection.insertOne(document);
    
    context.res = {
      status: 201,
      body: { id: result.insertedId, ...document },
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: { error: error.message }
    };
  }
};
```

**UpdateContent/index.js:**

```javascript
// filepath: azure-functions/UpdateContent/index.js
const { getCollection } = require('../shared/cosmosdb');
const { ObjectId } = require('mongodb');

module.exports = async function (context, req) {
  try {
    const { collectionName, id, updates } = req.body;
    
    if (!collectionName || !id || !updates) {
      context.res = {
        status: 400,
        body: { error: 'collectionName, id e updates sono richiesti' }
      };
      return;
    }
    
    const collection = await getCollection(collectionName);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    
    context.res = {
      status: 200,
      body: { modified: result.modifiedCount },
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: { error: error.message }
    };
  }
};
```

**DeleteContent/index.js:**

```javascript
// filepath: azure-functions/DeleteContent/index.js
const { getCollection } = require('../shared/cosmosdb');
const { ObjectId } = require('mongodb');

module.exports = async function (context, req) {
  try {
    const { collectionName, id } = req.body;
    
    if (!collectionName || !id) {
      context.res = {
        status: 400,
        body: { error: 'collectionName e id sono richiesti' }
      };
      return;
    }
    
    const collection = await getCollection(collectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    context.res = {
      status: 200,
      body: { deleted: result.deletedCount },
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: { error: error.message }
    };
  }
};
```

### 4.4 Deploy Azure Functions

```bash
# Crea una Function App
az functionapp create \
  --resource-group MyLyfeUmbria-RG \
  --consumption-plan-location westeurope \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name mylyfeumbria-api \
  --storage-account mylyfeumbriast \
  --os-type Linux

# Crea lo storage account prima (se non esiste)
az storage account create \
  --name mylyfeumbriast \
  --resource-group MyLyfeUmbria-RG \
  --location westeurope \
  --sku Standard_LRS

# Configura la connection string come variabile d'ambiente
az functionapp config appsettings set \
  --name mylyfeumbria-api \
  --resource-group MyLyfeUmbria-RG \
  --settings "COSMOS_CONNECTION_STRING=TUA_CONNECTION_STRING_QUI"

# Deploy delle functions
func azure functionapp publish mylyfeumbria-api
```

**URL delle API** saranno tipo:
- `https://mylyfeumbria-api.azurewebsites.net/api/GetHome`
- `https://mylyfeumbria-api.azurewebsites.net/api/GetJourney`
- ecc.

---

## STEP 5: Migra il Frontend (PWA)

### 5.1 Aggiorna Configurazione API

Nel tuo codice frontend, sostituisci le chiamate Firebase con chiamate REST alle Azure Functions:

**Prima (Firebase):**
```javascript
import { collection, getDocs } from 'firebase/firestore';

const querySnapshot = await getDocs(collection(db, 'home'));
```

**Dopo (Azure):**
```javascript
const response = await fetch('https://mylyfeumbria-api.azurewebsites.net/api/GetHome');
const data = await response.json();
```

### 5.2 Crea File di Configurazione

Crea `src/config/azure.js`:

```javascript
// filepath: src/config/azure.js
export const AZURE_API_BASE_URL = 'https://mylyfeumbria-api.azurewebsites.net/api';

export const API_ENDPOINTS = {
  home: `${AZURE_API_BASE_URL}/GetHome`,
  journey: `${AZURE_API_BASE_URL}/GetJourney`,
  taste: `${AZURE_API_BASE_URL}/GetTaste`,
  addContent: `${AZURE_API_BASE_URL}/AddContent`,
  updateContent: `${AZURE_API_BASE_URL}/UpdateContent`,
  deleteContent: `${AZURE_API_BASE_URL}/DeleteContent`
};
```

### 5.3 Crea Service Layer

Crea `src/services/api.js`:

```javascript
// filepath: src/services/api.js
import { API_ENDPOINTS } from '../config/azure';

export async function getHomeData() {
  const response = await fetch(API_ENDPOINTS.home);
  if (!response.ok) throw new Error('Failed to fetch home data');
  return response.json();
}

export async function getJourneyData() {
  const response = await fetch(API_ENDPOINTS.journey);
  if (!response.ok) throw new Error('Failed to fetch journey data');
  return response.json();
}

export async function getTasteData() {
  const response = await fetch(API_ENDPOINTS.taste);
  if (!response.ok) throw new Error('Failed to fetch taste data');
  return response.json();
}

export async function addContent(collectionName, document) {
  const response = await fetch(API_ENDPOINTS.addContent, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collectionName, document })
  });
  if (!response.ok) throw new Error('Failed to add content');
  return response.json();
}

export async function updateContent(collectionName, id, updates) {
  const response = await fetch(API_ENDPOINTS.updateContent, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collectionName, id, updates })
  });
  if (!response.ok) throw new Error('Failed to update content');
  return response.json();
}

export async function deleteContent(collectionName, id) {
  const response = await fetch(API_ENDPOINTS.deleteContent, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collectionName, id })
  });
  if (!response.ok) throw new Error('Failed to delete content');
  return response.json();
}
```

---

## STEP 6: Deploy del Frontend su Azure

### 6.1 Crea Azure Static Web App

```bash
# Crea una Static Web App
az staticwebapp create \
  --name mylyfeumbria \
  --resource-group MyLyfeUmbria-RG \
  --location westeurope \
  --source https://github.com/TUO_USERNAME/mylyfeumbria \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github
```

### 6.2 Build e Deploy Manuale

Se preferisci il deploy manuale:

```bash
# Build dell'app
npm run build

# Installa SWA CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy ./dist \
  --app-name mylyfeumbria \
  --resource-group MyLyfeUmbria-RG \
  --subscription-id TUA_SUBSCRIPTION_ID
```

### 6.3 Configura Custom Domain (opzionale)

```bash
az staticwebapp hostname set \
  --name mylyfeumbria \
  --resource-group MyLyfeUmbria-RG \
  --hostname www.mylyfeumbria.com
```

---

## STEP 7: Crea Backend Admin Interface

### 7.1 Crea Pagina Admin

Crea `src/pages/Admin.jsx`:

```javascript
// filepath: src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { getHomeData, getJourneyData, getTasteData, addContent, updateContent, deleteContent } from '../services/api';

export default function Admin() {
  const [collection, setCollection] = useState('home');
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({});
  
  useEffect(() => {
    loadData();
  }, [collection]);
  
  async function loadData() {
    let data;
    if (collection === 'home') data = await getHomeData();
    else if (collection === 'journey') data = await getJourneyData();
    else if (collection === 'taste') data = await getTasteData();
    setItems(data);
  }
  
  async function handleAdd() {
    await addContent(collection, formData);
    setFormData({});
    loadData();
  }
  
  async function handleUpdate(id) {
    await updateContent(collection, id, formData);
    setFormData({});
    loadData();
  }
  
  async function handleDelete(id) {
    await deleteContent(collection, id);
    loadData();
  }
  
  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      
      <select value={collection} onChange={(e) => setCollection(e.target.value)}>
        <option value="home">My Home</option>
        <option value="journey">My Journey</option>
        <option value="taste">My Taste</option>
      </select>
      
      <div className="items-list">
        {items.map(item => (
          <div key={item._id} className="item-card">
            <h3>{item.titolo?.it || item.titolo}</h3>
            <p>{item.descrizione?.it || item.descrizione}</p>
            <button onClick={() => handleUpdate(item._id)}>Modifica</button>
            <button onClick={() => handleDelete(item._id)}>Elimina</button>
          </div>
        ))}
      </div>
      
      <div className="add-form">
        <h2>Aggiungi Nuovo</h2>
        <input 
          placeholder="Titolo (IT)" 
          onChange={(e) => setFormData({...formData, titolo: {...formData.titolo, it: e.target.value}})}
        />
        <input 
          placeholder="Descrizione (IT)" 
          onChange={(e) => setFormData({...formData, descrizione: {...formData.descrizione, it: e.target.value}})}
        />
        <button onClick={handleAdd}>Aggiungi</button>
      </div>
    </div>
  );
}
```

### 7.2 Proteggi la Route Admin

Crea `src/components/ProtectedRoute.jsx`:

```javascript
// filepath: src/components/ProtectedRoute.jsx
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

const ADMIN_PASSWORD = 'Lyfe2025Admin'; // Cambialo!

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('adminAuth') === 'true'
  );
  const [password, setPassword] = useState('');
  
  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
    } else {
      alert('Password errata!');
    }
  }
  
  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <h2>Admin Login</h2>
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }
  
  return children;
}
```

Aggiorna il router:

```javascript
// filepath: src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ...altre routes... */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## STEP 8: Configurazione Storage per Media

### 8.1 Crea Azure Blob Storage

```bash
# Lo storage account esiste già (mylyfeumbriast)
# Crea un container per le immagini
az storage container create \
  --name images \
  --account-name mylyfeumbriast \
  --public-access blob

# Ottieni la connection string
az storage account show-connection-string \
  --name mylyfeumbriast \
  --resource-group MyLyfeUmbria-RG \
  --query connectionString \
  --output tsv
```

### 8.2 Upload Immagini

```bash
# Upload singola immagine
az storage blob upload \
  --account-name mylyfeumbriast \
  --container-name images \
  --name orvieto.jpg \
  --file ./images/orvieto.jpg

# URL pubblico sarà:
# https://mylyfeumbriast.blob.core.windows.net/images/orvieto.jpg
```

### 8.3 Integra nel Frontend

```javascript
// filepath: src/services/storage.js
const STORAGE_BASE_URL = 'https://mylyfeumbriast.blob.core.windows.net/images';

export function getImageUrl(filename) {
  return `${STORAGE_BASE_URL}/${filename}`;
}
```

---

## STEP 9: Monitoring e Logging

### 9.1 Abilita Application Insights

```bash
# Crea Application Insights
az monitor app-insights component create \
  --app mylyfeumbria-insights \
  --location westeurope \
  --resource-group MyLyfeUmbria-RG \
  --application-type web

# Collega alle Functions
az functionapp config appsettings set \
  --name mylyfeumbria-api \
  --resource-group MyLyfeUmbria-RG \
  --settings "APPINSIGHTS_INSTRUMENTATIONKEY=$(az monitor app-insights component show --app mylyfeumbria-insights --resource-group MyLyfeUmbria-RG --query instrumentationKey -o tsv)"
```

### 9.2 Monitora le Metriche

Accedi al portale Azure:
- Vai su Application Insights > mylyfeumbria-insights
- Visualizza metriche, errori, performance

---

## STEP 10: Testing e Verifica

### 10.1 Test delle API

```bash
# Test GetHome
curl https://mylyfeumbria-api.azurewebsites.net/api/GetHome

# Test AddContent (da Postman o curl)
curl -X POST https://mylyfeumbria-api.azurewebsites.net/api/AddContent \
  -H "Content-Type: application/json" \
  -d '{
    "collectionName": "home",
    "document": {
      "id": "test",
      "titolo": {"it": "Test"},
      "descrizione": {"it": "Descrizione test"}
    }
  }'
```

### 10.2 Test PWA

1. Apri l'app nel browser: `https://mylyfeumbria.azurewebsites.net`
2. Verifica il manifest.json
3. Testa l'installazione PWA (pulsante "Installa app")
4. Verifica la funzionalità offline (Service Worker)

---

## STEP 11: Ottimizzazioni Post-Migrazione

### 11.1 CDN per Performance

```bash
# Crea un CDN Profile
az cdn profile create \
  --name mylyfeumbria-cdn \
  --resource-group MyLyfeUmbria-RG \
  --sku Standard_Microsoft

# Crea un endpoint CDN
az cdn endpoint create \
  --name mylyfeumbria \
  --profile-name mylyfeumbria-cdn \
  --resource-group MyLyfeUmbria-RG \
  --origin mylyfeumbria.azurewebsites.net \
  --origin-host-header mylyfeumbria.azurewebsites.net
```

### 11.2 Backup Automatico Cosmos DB

```bash
# Abilita backup continuo
az cosmosdb update \
  --name mylyfeumbria-db \
  --resource-group MyLyfeUmbria-RG \
  --backup-policy-type Continuous
```

---

## STEP 12: Checklist Finale

- [ ] Cosmos DB configurato con collezioni `home`, `journey`, `taste`
- [ ] Dati migrati da Firebase a Cosmos DB
- [ ] Azure Functions deployate e funzionanti
- [ ] Frontend aggiornato per usare le API Azure
- [ ] Static Web App deployata
- [ ] Admin panel protetto e funzionante
- [ ] Blob Storage configurato per immagini
- [ ] Application Insights abilitato
- [ ] PWA manifest e service worker configurati
- [ ] Test completi eseguiti
- [ ] Custom domain configurato (opzionale)
- [ ] Backup configurati

---

## Comandi Utili per Manutenzione

```bash
# Visualizza logs delle Functions
func azure functionapp logstream mylyfeumbria-api

# Restart Function App
az functionapp restart --name mylyfeumbria-api --resource-group MyLyfeUmbria-RG

# Visualizza metriche Cosmos DB
az cosmosdb show --name mylyfeumbria-db --resource-group MyLyfeUmbria-RG

# Lista tutti gli endpoint
az functionapp function show \
  --name mylyfeumbria-api \
  --resource-group MyLyfeUmbria-RG \
  --function-name GetHome
```

---

## Costi Stimati Mensili

- **Cosmos DB**: ~€25-50 (dipende dall'uso, con 400 RU/s)
- **Azure Functions**: ~€5-15 (Consumption Plan, primi 1M esecuzioni gratis)
- **Static Web App**: Gratis (Piano Free)
- **Blob Storage**: ~€1-5 (dipende dalle immagini)
- **Application Insights**: ~€5-10 (primi 5GB gratis)

**Totale stimato**: €35-80/mese

---

## Note Finali

Questa guida fornisce un percorso completo per migrare da Firebase ad Azure Cloud. Ogni step può essere personalizzato in base alle tue esigenze specifiche. Per domande o problemi durante la migrazione, consulta la documentazione ufficiale di Azure o contatta il supporto tecnico.
