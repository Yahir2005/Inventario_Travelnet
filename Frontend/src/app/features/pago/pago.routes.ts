import { Routes } from "@angular/router";

/**
 * ============================================================================
 * RUTAS DEL MÓDULO DE PAGOS Y COBRANZA (pago.routes.ts)
 * ============================================================================
 * Define las rutas para ver el estado de pagos por instalación, registrar un
 * nuevo cobro o editar un pago existente.
 */
export const PAGO_ROUTES: Routes = [
    {
        // Ruta: /pago -> Tabla general de cobranza y cortes de caja
        path: '',
        loadComponent: () =>
            import('./pages/lista-pago/lista-pago').then(
                (m) => m.ListaPago
            )
    },
    {
        // Ruta: /pago/insertar -> Formulario dedicado para registrar un pago
        path: 'insertar',
        loadComponent: () =>
            import('./pages/insertar-pago/insertar-pago').then(
                (m) => m.InsertarPago
            )
    },
    {
        // Ruta: /pago/actualizar-pago/:id -> Edición de un pago por su ID
        path:'actualizar-pago/:id',
        loadComponent: () => 
            import('./pages/actualizar-pago/actualizar-pago').then(
                (m) => m.ActualizarPago
            )
    }
];