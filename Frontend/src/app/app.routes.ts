import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'usuario',
        loadChildren: () =>
            import('./features/usuario/usuario.routes').then(
                (m) => m.USUARIO
            )
    },
    {
        path: 'cliente',
        loadChildren: () =>
            import('./features/cliente/cliente.routes').then(
                (m) => m.CLIENTE_ROUTES
            )
    },
    {
        path: 'pago',
        loadChildren: () =>
            import('./features/pago/pago.routes').then(
                (m) => m.PAGO_ROUTES
            )
    }
];
