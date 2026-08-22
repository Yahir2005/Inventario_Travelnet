import { Routes } from '@angular/router';

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