import { Routes } from "@angular/router";

/**
 * ============================================================================
 * RUTAS DEL MÓDULO DE TORRES DE TELECOMUNICACIONES (torre.routes.ts)
 * ============================================================================
 * Define las rutas para listar, crear y editar las torres transmisoras
 * utilizadas en las instalaciones inalámbricas (Antenas).
 */
export const TORRE_ROUTES: Routes = [
    {
        // Ruta: /Torre/listar-torres -> Listado general de torres
        path: 'listar-torres',
        loadComponent: () =>
            import('./pages/listar-torre/listar-torre').then(
                (m) => m.ListarTorre
            )
    },
    {
        // Ruta: /Torre/insertar-torre -> Formulario de alta de nueva torre
        path: 'insertar-torre',
        loadComponent: () =>
            import('./pages/insertar-torre/insertar-torre').then(
                (m) => m.InsertarTorre
            )
    },
    {
        // Ruta: /Torre/actualizar-torre/:id -> Edición de una torre existente
        path: 'actualizar-torre/:id',
        loadComponent: () =>
            import('./pages/actualizar-torre/actualizar-torre').then(
                (m) => m.ActualizarTorre
            )
    }
]