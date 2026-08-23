import { Routes } from "@angular/router";

export const TORRE_ROUTES: Routes = [
    {
        path: 'listar-torres',
        loadComponent: () =>
            import('./pages/listar-torre/listar-torre').then(
                (m) => m.ListarTorre
            )
    },
    {
        path: 'insertar-torre',
        loadComponent: () =>
            import('./pages/insertar-torre/insertar-torre').then(
                (m) => m.InsertarTorre
            )
    },
    {
        path: 'actualizar-torre/:id',
        loadComponent: () =>
            import('./pages/actualizar-torre/actualizar-torre').then(
                (m) => m.ActualizarTorre
            )
    }
]