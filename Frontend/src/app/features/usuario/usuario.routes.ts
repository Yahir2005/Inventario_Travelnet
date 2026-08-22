import { Routes } from '@angular/router';

export const USUARIO: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/lista-usuario/lista-usuario').then(
                (m) => m.ListaUsuario
            )
    },
    {
        path: 'insertar-usuario',
        loadComponent: () => 
            import('./pages/insertar-usuario/insertar-usuario').then(
                (m) => m.InsertarUsuario
            )
    },
    {
        path: 'actualizar-usuario/:id',
        loadComponent: () =>
            import('./pages/actualizar-usuario/actualizar-usuario').then(
                (m) => m.ActualizarUsuario
            )
    }
];