import { Routes } from "@angular/router";

/**
 * ============================================================================
 * RUTAS DEL MÓDULO DE MENSUALIDADES (mensualidad.routes.ts)
 * ============================================================================
 * Define la ruta para editar una mensualidad individual.
 * (La lista de mensualidades se muestra como modal dentro de la pantalla de Pagos).
 */
export const MENSUALIDAD_ROUTES: Routes = [
    {
        // Ruta: /mensualidad/actualizar-mensualidad/:id
        path: 'actualizar-mensualidad/:id',
        loadComponent: () => 
            import('./pages/actualizar-mensualidad/actualizar-mensualidad').then(
                (m) => m.ActualizarMensualidad
            )
    }
]