import { Routes } from "@angular/router";

/**
 * ============================================================================
 * RUTAS DEL MÓDULO DE EQUIPOS OLT (olt.routes.ts)
 * ============================================================================
 * Define las rutas para listar, registrar y editar las OLTs (Terminales de Línea
 * Óptica) que distribuyen el servicio de Fibra Óptica.
 */
export const OLT_ROUTES: Routes = [
    {
        // Ruta: /OLT/lista-olts -> Tabla de OLTs registradas
        path: 'lista-olts',
        loadComponent: () =>
            import('./pages/listar-olt/listar-olt').then(
                (m) => m.ListarOLT
            )
    },
    {
        // Ruta: /OLT/insertar-olt -> Formulario para dar de alta una nueva OLT
        path: 'insertar-olt',
        loadComponent: () => 
            import('./pages/insertar-olt/insertar-olt').then(
                (m) => m.InsertarOLT
            )
    },
    {
        // Ruta: /OLT/actualizar-olt/:id -> Edición de una OLT existente
        path: 'actualizar-olt/:id',
        loadComponent: () =>
            import('./pages/actualizar-olt/actualizar-olt').then(
                (m) => m.ActualizarOLT
            )
    }
]