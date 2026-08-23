import { Routes } from "@angular/router";

export const CORTE_CAJA_ROUTES: Routes = [
    {
        path: 'lista',
        loadComponent: () => 
            import('./pages/lista-corte-caja/lista-corte-caja').then(
                (m) => m.ListaCorteCajaComponent
            )
    },
    {
        path: 'actualizar-corte-caja',
        loadComponent: () =>
            import('./pages/actualizar-corte-caja/actualizar-corte-caja').then(
                (m) => m.ActualizarCorteCaja
            )
    }
]