import { Routes } from "@angular/router";

export const OLT_ROUTES: Routes = [
    {
        path: 'lista-olts',
        loadComponent: () =>
            import('./pages/listar-olt/listar-olt').then(
                (m) => m.ListarOLT
            )
    },
    {
        path: 'insertar-olt',
        loadComponent: () => 
            import('./pages/insertar-olt/insertar-olt').then(
                (m) => m.InsertarOLT
            )
    },
    {
        path: 'actualizar-olt/:id',
        loadComponent: () =>
            import('./pages/actualizar-olt/actualizar-olt').then(
                (m) => m.ActualizarOLT
            )
    }
]