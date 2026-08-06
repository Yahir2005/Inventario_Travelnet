import { Routes } from '@angular/router';
import { Login } from './features/usuario/pages/login/login';
import { authGuard } from './shared/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: Login
    },
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'usuario',
        canActivate:[authGuard],
        loadChildren: () =>
            import('./features/usuario/usuario.routes').then(
                (m) => m.USUARIO
            )
    },
    {
        path: 'cliente',
        canActivate:[authGuard],
        loadChildren: () =>
            import('./features/cliente/cliente.routes').then(
                (m) => m.CLIENTE_ROUTES
            )
    },
    {
        path: 'pago',
        canActivate:[authGuard],
        loadChildren: () =>
            import('./features/pago/pago.routes').then(
                (m) => m.PAGO_ROUTES
            )
    },
    {
        path: 'instalacion',
        canActivate:[authGuard],
        loadChildren: () =>
            import('./features/instalacion/instalacion.routes').then(
                (m) => m.INSTALACION_ROUTES
            )
    },
    {
        path: 'servicios',
        canActivate:[authGuard],
        loadChildren: () =>
            import('./features/servicios/servicios.routes').then(
                (m) => m.SERVICIOS_ROUTES
            )
    },
    {
        path: 'imagen-instalacion',
        canActivate:[authGuard],
        loadChildren: () => 
            import('./features/imagen_instalacion/imagen_instalacion.routes').then(
                (m) => m.IMAGEN_INSTALACION_ROUTES
            )
    }
];
