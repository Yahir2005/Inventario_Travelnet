import { Routes } from '@angular/router';

/**
 * RUTAS DEL MÓDULO DE INSTALACIONES (instalacion.routes.ts)
 * ---------------------------------------------------------
 * Define las direcciones dentro de `/instalacion`:
 *  - `/instalacion`: Lista general de instalaciones activas.
 *  - `/instalacion/insertar-instalacion`: Formulario para dar de alta una instalación nueva.
 *  - `/instalacion/actualizar-instalacion/:id`: Formulario para editar una instalación existente.
 */
export const INSTALACION_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/lista-instalacion/lista-instalacion').then(
                (m) => m.ListaInstalacion
            )
    },
    {
        path: 'insertar-instalacion',
        loadComponent: () => 
            import('./pages/insertar-instalacion/insertar-instalacion').then(
                (m) => m.InsertarInstalacionComponent
            )
    },
    {
        path: 'actualizar-instalacion/:id',
        loadComponent: () => 
            import('./pages/actualizar-instalacion/actualizar-instalacion').then(
                (m) => m.ActualizarInstalacion
            )
    }
]