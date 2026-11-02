import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { provideServiceWorker } from '@angular/service-worker';

/**
 * CONFIGURACIÓN GLOBAL DE ANGULAR (app.config.ts)
 * -----------------------------------------------
 * Aquí se activan las herramientas globales que usará toda la aplicación:
 *  1. `provideRouter(routes)`: Activa la navegación entre páginas según las rutas de `app.routes.ts`.
 *  2. `provideHttpClient(...)`: Activa las peticiones HTTP hacia el Backend y les conecta `authInterceptor`
 *     para adjuntar automáticamente el token JWT en cada petición.
 *  3. `provideServiceWorker(...)`: Activa el Service Worker (PWA) en modo producción para caché de archivos.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
