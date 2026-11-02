import { Routes } from '@angular/router';
import { Login } from './features/usuario/pages/login/login';
import { authGuard } from './shared/auth.guard';

/**
 * ============================================================================
 * ENRUTADOR PRINCIPAL DE LA APLICACIÓN (app.routes.ts)
 * ============================================================================
 * Define el mapa general de URLs de todo el sistema Angular.
 * - La ruta `/login` es pública para que el personal pueda iniciar sesión.
 * - Todas las demás rutas están protegidas por `canActivate: [authGuard]`,
 *   lo que impide el acceso si el usuario no ha iniciado sesión o su token expiró.
 * - Usa `loadChildren` y `loadComponent` (Lazy Loading) para cargar cada módulo
 *   bajo demanda y hacer que la página cargue más rápido.
 */
export const routes: Routes = [
    {
        // Pantalla de inicio de sesión (pública)
        path: 'login',
        component: Login
    },
    {
        // Panel principal (Dashboard) con métricas de clientes, instalaciones e ingresos
        path: 'home',
        canActivate: [authGuard],
        loadComponent: () => import('./features/home/pages/home/home').then(m => m.Home)
    },
    {
        // Si el usuario entra a la raíz del sitio ('/'), lo redirige automáticamente a '/home'
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        // Módulo de gestión de Usuarios / Empleados
        path: 'usuario',
        canActivate:[authGuard],
        loadChildren: () =>
            import('./features/usuario/usuario.routes').then(
                (m) => m.USUARIO
            )
    },
    {
        // Módulo de gestión de Clientes
        path: 'cliente',
        canActivate:[authGuard],
        loadChildren: () =>
            import('./features/cliente/cliente.routes').then(
                (m) => m.CLIENTE_ROUTES
            )
    },
    {
        // Módulo de Cobranza, Pagos y Corte de Caja rápido
        path: 'pago',
        canActivate:[authGuard],
        loadChildren: () =>
            import('./features/pago/pago.routes').then(
                (m) => m.PAGO_ROUTES
            )
    },
    {
        // Módulo de Mensualidades individuales
        path: 'mensualidad',
        canActivate:[authGuard],
        loadChildren: () =>
            import('./features/mensualidad/mensualidad.routes').then(
                (m) => m.MENSUALIDAD_ROUTES
            )
    },
    {
        // Módulo de Instalaciones de Fibra Óptica y Antenas
        path: 'instalacion',
        canActivate:[authGuard],
        loadChildren: () =>
            import('./features/instalacion/instalacion.routes').then(
                (m) => m.INSTALACION_ROUTES
            )
    },
    {
        // Módulo de Servicios adicionales
        path: 'servicios',
        canActivate:[authGuard],
        loadChildren: () =>
            import('./features/servicios/servicios.routes').then(
                (m) => m.SERVICIOS_ROUTES
            )
    },
    {
        // Módulo de Cámara y Evidencia Fotográfica de Instalaciones
        path: 'imagen-instalacion',
        canActivate:[authGuard],
        loadChildren: () => 
            import('./features/imagen_instalacion/imagen_instalacion.routes').then(
                (m) => m.IMAGEN_INSTALACION_ROUTES
            )
    },
    {
        // Módulo de Historial y Administración de Cortes de Caja
        path: 'Corte-Caja',
        canActivate:[authGuard],
        loadChildren: () =>
            import('./features/corte-caja/corte-caja.routes').then(
                (m) => m.CORTE_CAJA_ROUTES
            )
    },
    {
        // Módulo de Infraestructura: Torres de telecomunicaciones (Antenas)
        path: 'Torre',
        canActivate: [authGuard],
        loadChildren: () =>
            import('./features/Torre/torre.routes').then(
                (m) => m.TORRE_ROUTES
            )
    },
    {
        // Módulo de Infraestructura: Equipos OLT (Fibra Óptica)
        path: 'OLT',
        canActivate: [authGuard],
        loadChildren:() =>
            import('./features/OLT/olt.routes').then(
                (m) => m.OLT_ROUTES
            )
    },
    {
        // Módulo de Catálogo de Planes de Internet y Tarifas
        path: 'plan',
        canActivate: [authGuard],
        loadChildren: () =>
            import('./features/plan/plan.routes').then(
                (m) => m.PLAN_ROUTES
            )
    }
];
