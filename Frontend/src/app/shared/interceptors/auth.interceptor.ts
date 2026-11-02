import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";

/**
 * INTERCEPTOR HTTP DE AUTENTICACIÓN (authInterceptor)
 * ---------------------------------------------------
 * Se ejecuta automáticamente en cada petición HTTP que sale hacia el Backend:
 *  1. Lee el `token` JWT guardado en `localStorage` y lo agrega en la cabecera `Authorization: Bearer <token>`.
 *  2. Si el servidor responde con error `401 Unauthorized` (token inválido o vencido),
 *     limpia la sesión local y envía al usuario a la pantalla de `/login`.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const token = localStorage.getItem('token');

    const peticion = token
        ? req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        })
        : req;

    return next(peticion).pipe(
        catchError((err: HttpErrorResponse) => {
            if (err.status === 401 && !req.url.endsWith('/api/usuarios/login')) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                router.navigate(['/login']);
            }
            return throwError(() => err);
        })
    );
}