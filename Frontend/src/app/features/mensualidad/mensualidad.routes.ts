import { Routes } from "@angular/router";

export const MENSUALIDAD_ROUTES: Routes = [
    {
        path: 'actualizar-mensualidad/:id',
        loadComponent: () => 
            import('./pages/actualizar-mensualidad/actualizar-mensualidad').then(
                (m) => m.ActualizarMensualidad
            )
    }
]