import { Routes } from '@angular/router';
import { Usuario } from './services/usuario';

export const USUARIO: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/lista-usuario/lista-usuario').then(
                (m) => m.ListaUsuario
            )
    }
];