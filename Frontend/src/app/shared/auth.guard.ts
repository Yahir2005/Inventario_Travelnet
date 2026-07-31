import { inject } from "@angular/core";
import { CanActivateFn,Router } from "@angular/router";
import { UsuarioService } from "../features/usuario/services/usuario";

export const authGuard: CanActivateFn = (route,state) => {
    const authService = inject(UsuarioService);
    const router = inject(Router);

    if(authService.estaAutenticado()){
        return true;
    }else{
        router.navigate(['/login']);
        return false;
    }
};