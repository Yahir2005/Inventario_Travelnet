import { inject } from "@angular/core";
import { CanActivateFn,Router } from "@angular/router";
import { UsuarioService } from "../features/usuario/services/usuario";

/**
 * GUARDIA DE AUTENTICACIÓN (authGuard)
 * ------------------------------------
 * Funciona como un "guardia de seguridad" antes de entrar a cualquier pantalla privada.
 * - Llama a `authService.estaAutenticado()` para revisar si el usuario tiene un token JWT válido y vigente.
 * - Si está autenticado devuelve `true` (le permite el paso).
 * - Si NO ha iniciado sesión o su token venció, lo redirige a `/login` y devuelve `false`.
 */
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