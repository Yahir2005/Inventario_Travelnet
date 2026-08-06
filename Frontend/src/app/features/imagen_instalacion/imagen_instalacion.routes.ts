import { Routes } from '@angular/router';

export const IMAGEN_INSTALACION_ROUTES: Routes = [
    {
        path: 'insertar-imagen-instalacion',
        loadComponent: () => 
            import('./pages/insertar-imagen-instalacion/insertar-imagen-instalacion').then(
                (m) => m.InsertarImagenInstalacion
            )
    }
]