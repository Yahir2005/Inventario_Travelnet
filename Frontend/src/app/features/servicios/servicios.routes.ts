import { Routes } from '@angular/router';

/**
 * ============================================================================
 * RUTAS DEL MÓDULO DE SERVICIOS (servicios.routes.ts)
 * ============================================================================
 * Define la ruta para visualizar la página informativa/catálogo de servicios.
 */
export const SERVICIOS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/lista-servicios/lista-servicios').then(
                (m) => m.ListaServicios
            )
    }
]