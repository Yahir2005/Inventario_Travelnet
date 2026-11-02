import { Routes } from "@angular/router";

/**
 * ============================================================================
 * RUTAS DEL MÓDULO DE CORTES DE CAJA (corte-caja.routes.ts)
 * ============================================================================
 * Define las rutas para consultar el historial de cortes de caja y editarlos.
 */
export const CORTE_CAJA_ROUTES: Routes = [
    {
        // Ruta: /Corte-Caja/lista -> Historial de cortes y agrupación por día/semana/mes/año
        path: 'lista',
        loadComponent: () => 
            import('./pages/lista-corte-caja/lista-corte-caja').then(
                (m) => m.ListaCorteCajaComponent
            )
    },
    {
        // Ruta: /Corte-Caja/actualizar-corte-caja/:id -> Edición de un corte (solo Administradores)
        path: 'actualizar-corte-caja/:id',
        loadComponent: () =>
            import('./pages/actualizar-corte-caja/actualizar-corte-caja').then(
                (m) => m.ActualizarCorteCaja
            )
    }
]