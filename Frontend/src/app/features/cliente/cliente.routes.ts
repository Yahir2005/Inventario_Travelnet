import { Routes } from '@angular/router';

/**
 * RUTAS DEL MÓDULO DE CLIENTES (cliente.routes.ts)
 * ------------------------------------------------
 * Este archivo le dice a Angular qué pantalla (componente) debe mostrar
 * según la dirección URL que escriba o visite el usuario dentro de "/cliente".
 *
 * Se utiliza `loadComponent` (carga perezosa / lazy loading) para que el navegador
 * descargue el código de cada pantalla únicamente cuando el usuario entra a ella,
 * haciendo que el sistema cargue más rápido.
 */
export const CLIENTE_ROUTES: Routes = [
    {
        // Ruta principal: "/cliente" -> Muestra la tabla con la lista de todos los clientes
        path: '',
        loadComponent: () =>
            import('./pages/lista-cliente/lista-cliente').then(
                (m) => m.ListaClienteComponent
            )
    },
    {
        // Ruta: "/cliente/insertar" -> Muestra el formulario para registrar un cliente nuevo
        path: 'insertar',
        loadComponent: () =>
            import('./pages/insertar-cliente/insertar-cliente').then(
                (m) => m.InsertarClienteComponent
            )
    },
    {
        // Ruta: "/cliente/actualizar-cliente/:id" -> Muestra el formulario para editar un cliente existente.
        // El ":id" es un parámetro dinámico (por ejemplo: /cliente/actualizar-cliente/15)
        path: 'actualizar-cliente/:id',
        loadComponent: () => 
            import('./pages/actualizar-cliente/actualizar-cliente').then(
                (m) => m.ActualizarCliente
            )
    }
];