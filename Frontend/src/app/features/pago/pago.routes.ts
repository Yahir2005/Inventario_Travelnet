import { Routes } from "@angular/router";

export const PAGO_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/lista-pago/lista-pago').then(
                (m) => m.ListaPago
            )
    }
];