import { Routes } from '@angular/router';

/**
 * ============================================================================
 * RUTAS DEL MÓDULO DE USUARIOS / EMPLEADOS (usuario.routes.ts)
 * ============================================================================
 * Define las rutas para listar al personal de TravelNet, registrar nuevos
 * empleados y editar sus datos o permisos.
 */
export const USUARIO: Routes = [
    {
        // Ruta: /usuario -> Tabla de usuarios registrados
        path: '',
        loadComponent: () =>
            import('./pages/lista-usuario/lista-usuario').then(
                (m) => m.ListaUsuario
            )
    },
    {
        // Ruta: /usuario/insertar-usuario -> Formulario de registro de nuevo empleado
        path: 'insertar-usuario',
        loadComponent: () => 
            import('./pages/insertar-usuario/insertar-usuario').then(
                (m) => m.InsertarUsuario
            )
    },
    {
        // Ruta: /usuario/actualizar-usuario/:id -> Edición de un usuario existente
        path: 'actualizar-usuario/:id',
        loadComponent: () =>
            import('./pages/actualizar-usuario/actualizar-usuario').then(
                (m) => m.ActualizarUsuario
            )
    }
];