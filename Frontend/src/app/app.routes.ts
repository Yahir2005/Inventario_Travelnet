import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'usuario',
        loadChildren: () =>
            import('./features/usuario/usuario.routes').then(
                (m) => m.USUARIO
            )
    }
];
