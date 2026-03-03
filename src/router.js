// Simple SPA Router per MyLyfe

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = '';
    this.listeners = [];
    this.isNavigating = false; // Flag per prevenire navigazioni concorrenti
    
    // Gestisce navigazione browser
    window.addEventListener('popstate', () => {
      const newPath = window.location.hash.slice(1) || '/';
      // Evita loop se stiamo già navigando
      if (!this.isNavigating && this.currentRoute !== newPath) {
        this.navigate(newPath);
      }
    });
  }
  
  // Registra una route
  register(path, handler) {
    this.routes[path] = handler;
  }
  
  // Naviga a una route con supporto parametri
  navigate(path, params = {}) {
    // Prevenzione loop: non navigare se siamo già su questa route
    if (this.currentRoute === path && !Object.keys(params).length) {
      console.log('🔄 Navigation skipped - already on', path);
      return;
    }
    
    // Prevenzione navigazioni concorrenti
    if (this.isNavigating) {
      console.log('⏳ Navigation in progress, skipping...');
      return;
    }
    
    this.isNavigating = true;
    this.currentRoute = path;
    this.currentParams = params;
    window.location.hash = path;
    
    // Cerca handler esatto o pattern-based
    let handler = this.routes[path];
    
    // Se non trovato, cerca pattern con parametri (es: /journey/detail/:id)
    if (!handler) {
      for (const [routePath, routeHandler] of Object.entries(this.routes)) {
        if (routePath.includes(':')) {
          const pattern = routePath.replace(/:[^/]+/g, '([^/]+)');
          const regex = new RegExp(`^${pattern}$`);
          const match = path.match(regex);
          if (match) {
            handler = routeHandler;
            // Estrai parametri dalla route
            const paramNames = routePath.match(/:[^/]+/g)?.map(p => p.slice(1)) || [];
            paramNames.forEach((name, index) => {
              params[name] = match[index + 1];
            });
            this.currentParams = params;
            break;
          }
        }
      }
    }
    
    // Fallback alla home
    if (!handler) {
      handler = this.routes['/'];
    }
    
    // Esegui handler della route
    if (handler) {
      handler(params);
    }
    
    // Notifica listeners
    this.listeners.forEach(callback => callback(path));
    
    // Reset flag navigazione
    this.isNavigating = false;
  }
  
  // Ottiene i parametri correnti
  getParams() {
    return this.currentParams || {};
  }
  
  // Registra listener per cambio route
  onChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
  
  // Ottiene la route corrente
  getCurrentRoute() {
    return this.currentRoute;
  }
}

export const router = new Router();
export default router;
