// App Statistics Service - MyLyfe Umbria
// Registra sessioni e installazioni PWA per audit (dati non sensibili)
import { db } from './firebase-config.js';
import {
  collection, addDoc, serverTimestamp,
  getDocs, query, orderBy, limit, where, Timestamp
} from 'firebase/firestore';
import { APP_VERSION } from './version.js';

const COLLECTION = 'app_stats';
const DEVICE_ID_KEY       = 'mlu_device_id';
const SESSION_ID_KEY      = 'mlu_session_id';
const FIRST_VISIT_KEY     = 'mlu_first_visit_done';
const PWA_FIRST_LAUNCH_KEY = 'mlu_pwa_first_launch';

// ─── Utility: genera UUID v4 semplice ───────────────────────────────────────
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// ─── Utility: rileva OS/Platform ────────────────────────────────────────────
function detectPlatform() {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Windows/.test(ua))  return 'Windows';
  if (/Mac/.test(ua))      return 'macOS';
  if (/Linux/.test(ua))    return 'Linux';
  return 'Unknown';
}

// ─── Utility: rileva Browser ────────────────────────────────────────────────
function detectBrowser() {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua))    return 'Edge';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Other';
}

// ─── Utility: rileva tipo dispositivo (più preciso) ─────────────────────────
function detectDeviceType() {
  const ua  = navigator.userAgent;
  const mtp = navigator.maxTouchPoints || 0;
  // iPad moderni si identificano come Mac con touchpoints
  if (/iPad/.test(ua) || (/Mac/.test(ua) && mtp > 1)) return 'tablet';
  // Android tablet: Android senza 'Mobile'
  if (/Android/.test(ua) && !/Mobile/.test(ua)) return 'tablet';
  // Qualsiasi altro touch mobile
  if (/Mobi|Android|iPhone|iPod/.test(ua) || mtp > 0 && screen.width < 768) return 'mobile';
  return 'desktop';
}

// ─── Ottieni o crea Device ID (localStorage, non sensibile) ─────────────────
function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// ─── Ottieni o crea Session ID (sessionStorage, per sessione) ───────────────
function getSessionId() {
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = uuid();
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

// ─── Payload dati non sensibili ─────────────────────────────────────────────
function buildPayload(eventType) {
  const isPwa = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;

  return {
    eventType,                                         // 'session_start' | 'first_visit' | 'pwa_install'
    appVersion:   APP_VERSION,
    sessionId:    getSessionId(),
    deviceId:     getDeviceId(),                       // ID anonimo locale
    platform:     detectPlatform(),
    browser:      detectBrowser(),
    deviceType:   detectDeviceType(),
    displayMode:  isPwa ? 'standalone (PWA)' : 'browser',
    language:     navigator.language || 'unknown',
    timezone:     Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
    screenWidth:  screen.width,
    screenHeight: screen.height,
    referrer:     document.referrer || 'direct',
    timestamp:    serverTimestamp(),
  };
}

// ─── Salva evento su Firestore ───────────────────────────────────────────────
async function saveEvent(eventType, source = 'app') {
  try {
    await addDoc(collection(db, COLLECTION), buildPayload(eventType, source));
    console.log(`[AppStats] Evento registrato: ${eventType} (source: ${source})`);
  } catch (err) {
    console.warn('[AppStats] Errore salvataggio:', err.message);
  }
}

// ─── API Pubblica ─────────────────────────────────────────────────────────────

/**
 * Da chiamare all'avvio dell'app.
 * Registra 'first_visit' la prima volta, poi 'session_start' ad ogni sessione.
 * Rileva anche l'installazione PWA (standalone mode + prima apertura).
 */
export async function trackAppSession(source = 'app') {
  const isPwa = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;

  const isFirstVisit   = !localStorage.getItem(FIRST_VISIT_KEY);
  const isPwaFirstOpen = isPwa && !localStorage.getItem(PWA_FIRST_LAUNCH_KEY);

  if (isFirstVisit) {
    localStorage.setItem(FIRST_VISIT_KEY, '1');
    if (isPwa) {
      localStorage.setItem(PWA_FIRST_LAUNCH_KEY, '1');
      await saveEvent('pwa_first_launch', source);
    } else {
      await saveEvent('first_visit', source);
    }
  } else if (isPwaFirstOpen) {
    localStorage.setItem(PWA_FIRST_LAUNCH_KEY, '1');
    await saveEvent('pwa_first_launch', source);
  } else {
    await saveEvent('session_start', source);
  }

  // Listener nativo appinstalled (Chrome/Android)
  window.addEventListener('appinstalled', async () => {
    if (!localStorage.getItem(PWA_FIRST_LAUNCH_KEY)) {
      localStorage.setItem(PWA_FIRST_LAUNCH_KEY, '1');
      await saveEvent('pwa_install', 'app');
    }
    console.log('[AppStats] PWA installata (appinstalled event)!');
  });
}

// ─── Query per Backoffice ─────────────────────────────────────────────────────

/** Cancella tutti i documenti della collection (reset statistiche) */
export async function deleteAllStats() {
  const snap = await getDocs(collection(db, COLLECTION));
  // Firestore non ha batch illimitato: chunked da 500
  const chunks = [];
  let chunk = [];
  snap.docs.forEach((d, i) => {
    chunk.push(d.ref);
    if (chunk.length === 499) { chunks.push(chunk); chunk = []; }
  });
  if (chunk.length) chunks.push(chunk);

  const { writeBatch } = await import('firebase/firestore');
  for (const ch of chunks) {
    const batch = writeBatch(db);
    ch.forEach(ref => batch.delete(ref));
    await batch.commit();
  }
}
export async function getRecentSessions(limitN = 200) {
  const q = query(
    collection(db, COLLECTION),
    orderBy('timestamp', 'desc'),
    limit(limitN + 50) // fetch extra to compensate for filtered admin entries
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(d => d.source !== 'admin')
    .slice(0, limitN);
}

/** Conteggi aggregati per dashboard KPI — esclude sessioni admin */
export async function getStatsKpi() {
  const snap = await getDocs(collection(db, COLLECTION));
  const all  = snap.docs.map(d => d.data());
  // Escludi sessioni originate dal backoffice
  const docs = all.filter(d => d.source !== 'admin');

  const total       = docs.filter(d => d.eventType !== 'notification_click').length;
  const pwaInstalls = docs.filter(d =>
    d.eventType === 'pwa_install' || d.eventType === 'pwa_first_launch'
  ).length;
  const firstVisits = docs.filter(d =>
    d.eventType === 'first_visit' || d.eventType === 'pwa_first_launch'
  ).length;

  // Dispositivi unici (per deviceId)
  const uniqueDevices = new Set(docs.map(d => d.deviceId)).size;

  // Sessioni oggi
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTs = Timestamp.fromDate(todayStart);
  const todaySessions = docs.filter(d =>
    d.timestamp && d.timestamp.seconds >= todayTs.seconds
  ).length;

  // Distribuzione per piattaforma
  const byPlatform = {};
  docs.forEach(d => { byPlatform[d.platform] = (byPlatform[d.platform] || 0) + 1; });

  // Distribuzione per browser
  const byBrowser = {};
  docs.forEach(d => { byBrowser[d.browser] = (byBrowser[d.browser] || 0) + 1; });

  // Distribuzione per tipo dispositivo
  const byDeviceType = {};
  docs.forEach(d => { byDeviceType[d.deviceType] = (byDeviceType[d.deviceType] || 0) + 1; });

  // Distribuzione installazioni PWA per tipo dispositivo
  const pwaByDeviceType = {};
  docs
    .filter(d => d.eventType === 'pwa_install' || d.eventType === 'pwa_first_launch')
    .forEach(d => { pwaByDeviceType[d.deviceType] = (pwaByDeviceType[d.deviceType] || 0) + 1; });

  // Click su notifiche push
  const notifClicks = docs.filter(d => d.eventType === 'notification_click');
  const notificationClicks = notifClicks.length;

  // Distribuzione click per titolo notifica
  const byNotification = {};
  notifClicks.forEach(d => {
    const key = d.notificationTitle || d.notificationTag || 'Senza titolo';
    byNotification[key] = (byNotification[key] || 0) + 1;
  });

  return { total, pwaInstalls, firstVisits, uniqueDevices, todaySessions,
           notificationClicks, byPlatform, byBrowser, byDeviceType, pwaByDeviceType, byNotification };
}
