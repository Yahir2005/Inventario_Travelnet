import { Routes } from '@angular/router';

export const CLIENTE_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/lista-cliente/lista-cliente').then(
                (m) => m.ListaCliente
            )
    },
    {
        path: 'insertar',
        loadComponent: () =>
            import('./pages/insertar-cliente/insertar-cliente').then(
                (m) => m.InsertarCliente
            )
    }
];