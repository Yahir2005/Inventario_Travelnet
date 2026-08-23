import { Routes } from "@angular/router";

export const PAGO_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/lista-pago/lista-pago').then(
                (m) => m.ListaPago
            )
    },
    {
        path: 'insertar',
        loadComponent: () =>
            import('./pages/insertar-pago/insertar-pago').then(
                (m) => m.InsertarPago
            )
    },
    {
        path:'actualizar-pago/:id',
        loadComponent: () => 
            import('./pages/actualizar-pago/actualizar-pago').then(
                (m) => m.ActualizarPago
            )
    }
];