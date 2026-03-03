// Pagina Login Admin - MyLyfe (Fluent UI 2 Design)
import './admin-fluent.css';
import { authService } from './auth-service.js';
import { router } from './router.js';

export async function renderLoginPage() {
  const container = document.createElement('div');
  container.className = 'fl-login-root';

  container.innerHTML = `
    <!-- Brand panel (left) -->
    <div class="fl-brand-panel">
      <div class="fl-brand-content">
        <div class="fl-brand-logo-wrap"><i class="ph ph-leaf"></i></div>
        <h1 class="fl-brand-name">MyLyfe Umbria</h1>
        <p class="fl-brand-sub">Pannello Amministrativo</p>
        <div class="fl-brand-divider"></div>
        <p class="fl-brand-desc">
          Gestisci contenuti, eventi, ristoranti e la configurazione completa dell'app dalla tua area riservata.
        </p>
        <div class="fl-brand-features">
          <div class="fl-brand-feature">
            <span class="fl-brand-feature-dot"></span>
            Gestione contenuti multilingua
          </div>
          <div class="fl-brand-feature">
            <span class="fl-brand-feature-dot"></span>
            Upload immagini e PDF
          </div>
          <div class="fl-brand-feature">
            <span class="fl-brand-feature-dot"></span>
            Notifiche push agli utenti
          </div>
          <div class="fl-brand-feature">
            <span class="fl-brand-feature-dot"></span>
            Configurazione UI in tempo reale
          </div>
        </div>
      </div>
    </div>

    <!-- Form panel (right) -->
    <div class="fl-login-panel">
      <div class="fl-login-form-container">
        <p class="fl-login-eyebrow">Backoffice</p>
        <h2 class="fl-login-title">Accedi</h2>
        <p class="fl-login-subtitle">Inserisci le credenziali di amministratore per continuare</p>

        <form id="login-form" class="fl-login-form" novalidate>
          <div class="fl-field">
            <label class="fl-label fl-required" for="email">Email</label>
            <input
              class="fl-input"
              type="email"
              id="email"
              name="email"
              required
              autocomplete="email"
              placeholder="admin@example.com"
              spellcheck="false"
            >
          </div>

          <div class="fl-field">
            <label class="fl-label fl-required" for="password">Password</label>
            <input
              class="fl-input"
              type="password"
              id="password"
              name="password"
              required
              autocomplete="current-password"
              placeholder="••••••••"
            >
          </div>

          <div id="error-message" class="fl-message-bar fl-message-error" style="display:none;"></div>

          <button type="submit" class="fl-button fl-button-primary fl-button-block fl-button-lg" id="login-btn">
            Accedi
          </button>
        </form>

        <div class="fl-login-footer">
          <button class="fl-button-ghost" id="back-to-app">← Torna all'app</button>
        </div>
      </div>
    </div>
  `;
  
  // Gestisci submit form
  const form = container.querySelector('#login-form');
  const errorMessage = container.querySelector('#error-message');
  const loginBtn = container.querySelector('#login-btn');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = form.email.value.trim();
    const password = form.password.value;
    
    // Disabilita form durante login
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="fl-spinner" style="width:16px;height:16px;border-width:2px"></span> Verifica...';
    errorMessage.style.display = 'none';
    
    // Effettua login
    const result = await authService.login(email, password);
    
    if (result.success) {
      // Login riuscito - verifica se è admin
      if (authService.isAdmin()) {
        console.log('✅ Admin autenticato');
        router.navigate('/admin');
      } else {
        // Utente non autorizzato come admin
        await authService.logout();
        errorMessage.textContent = 'Non sei autorizzato ad accedere al pannello amministrativo.';
        errorMessage.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Accedi';
      }
    } else {
      // Login fallito
      errorMessage.textContent = result.error;
      errorMessage.style.display = 'block';
      loginBtn.disabled = false;
      loginBtn.textContent = 'Accedi';
    }
  });
  
  // Bottone torna all'app
  container.querySelector('#back-to-app').addEventListener('click', () => {
    router.navigate('/');
  });
  
  return container;
}

// Componente per proteggere le route admin
export async function requireAuth() {
  // Evita loop infiniti: conta i tentativi di redirect
  const redirectKey = 'admin_redirect_count';
  const redirectTimestampKey = 'admin_redirect_timestamp';
  const now = Date.now();
  const lastRedirect = parseInt(localStorage.getItem(redirectTimestampKey) || '0');
  
  // Resetta il contatore se sono passati più di 5 secondi dall'ultimo redirect
  if (now - lastRedirect > 5000) {
    localStorage.setItem(redirectKey, '0');
  }
  
  const redirectCount = parseInt(localStorage.getItem(redirectKey) || '0');
  
  // Se ci sono stati troppi redirect in poco tempo, c'è un problema
  if (redirectCount > 3) {
    console.error('⚠️ Troppi redirect. Possibile loop rilevato. Reset in corso...');
    localStorage.removeItem(redirectKey);
    localStorage.removeItem(redirectTimestampKey);
    // Forza logout e ritorna alla home
    await authService.logout();
    router.navigate('/');
    return false;
  }
  
  await authService.waitForAuth();
  
  if (!authService.isAuthenticated()) {
    // Incrementa contatore redirect
    localStorage.setItem(redirectKey, (redirectCount + 1).toString());
    localStorage.setItem(redirectTimestampKey, now.toString());
    router.navigate('/admin/login');
    return false;
  }
  
  if (!authService.isAdmin()) {
    // Incrementa contatore redirect
    localStorage.setItem(redirectKey, (redirectCount + 1).toString());
    localStorage.setItem(redirectTimestampKey, now.toString());
    router.navigate('/');
    return false;
  }
  
  // Auth OK - resetta il contatore
  localStorage.setItem(redirectKey, '0');
  return true;
}
