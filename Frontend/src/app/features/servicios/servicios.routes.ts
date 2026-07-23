import { Routes } from '@angular/router';

export const SERVICIOS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/lista-servicios/lista-servicios').then(
                (m) => m.ListaServicios
            )
    }
]