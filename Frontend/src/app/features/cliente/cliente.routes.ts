import { Routes } from '@angular/router';

export const CLIENTE_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/lista-cliente/lista-cliente').then(
                (m) => m.ListaCliente
            )
    }
];