import { Routes } from '@angular/router';

export const INSTALACION_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/lista-instalacion/lista-instalacion').then(
                (m) => m.ListaInstalacion
            )
    }
]