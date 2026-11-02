import { Routes } from '@angular/router';

/**
 * ============================================================================
 * RUTAS DEL MÓDULO DE EVIDENCIAS FOTOGRÁFICAS (imagen_instalacion.routes.ts)
 * ============================================================================
 * Define la ruta para capturar o subir la foto de evidencia de una instalación.
 */
export const IMAGEN_INSTALACION_ROUTES: Routes = [
    {
        // Ruta: /imagen-instalacion/insertar-imagen-instalacion?instalacionId=X
        path: 'insertar-imagen-instalacion',
        loadComponent: () => 
            import('./pages/insertar-imagen-instalacion/insertar-imagen-instalacion').then(
                (m) => m.InsertarImagenInstalacion
            )
    }
]