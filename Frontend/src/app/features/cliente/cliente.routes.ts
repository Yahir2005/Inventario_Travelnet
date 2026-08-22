import { Routes } from '@angular/router';

export const CLIENTE_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/lista-cliente/lista-cliente').then(
                (m) => m.ListaClienteComponent
            )
    },
    {
        path: 'insertar',
        loadComponent: () =>
            import('./pages/insertar-cliente/insertar-cliente').then(
                (m) => m.InsertarClienteComponent
            )
    },
    {
        path: 'actualizar-cliente/:id',
        loadComponent: () => 
            import('./pages/actualizar-cliente/actualizar-cliente').then(
                (m) => m.ActualizarCliente
            )
    }
];