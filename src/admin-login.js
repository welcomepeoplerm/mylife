// Pagina Login Admin - MyLyfe

import { i18n } from './i18n.js';
import { authService } from './auth-service.js';
import { router } from './router.js';

export async function renderLoginPage() {
  const container = document.createElement('div');
  container.className = 'login-container';
  
  container.innerHTML = `
    <div class="login-card">
      <div class="login-header">
        <h2>🔐 Admin Login</h2>
        <p>MyLyfe - Pannello Amministrativo</p>
      </div>
      
      <form id="login-form" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            autocomplete="email"
            placeholder="admin@example.com"
          >
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            required 
            autocomplete="current-password"
            placeholder="••••••••"
          >
        </div>
        
        <div id="error-message" class="error-alert" style="display: none;"></div>
        
        <button type="submit" class="btn btn-primary btn-block" id="login-btn">
          Accedi
        </button>
      </form>
      
      <div class="login-footer">
        <button class="btn-link" id="back-to-app">
          ← Torna all'app
        </button>
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
    loginBtn.textContent = 'Accesso in corso...';
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
        errorMessage.textContent = '⚠️ Non sei autorizzato ad accedere al pannello admin';
        errorMessage.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Accedi';
      }
    } else {
      // Login fallito
      errorMessage.textContent = `❌ ${result.error}`;
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
  await authService.waitForAuth();
  
  if (!authService.isAuthenticated()) {
    router.navigate('/admin/login');
    return false;
  }
  
  if (!authService.isAdmin()) {
    router.navigate('/');
    return false;
  }
  
  return true;
}
