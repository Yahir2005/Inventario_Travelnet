import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/usuarios/login';

  login(credenciales: {Usuario: string, Password: string}){
    return this.http.post<any>(this.apiUrl, credenciales).pipe(
      tap(respuesta => {
        if(respuesta && respuesta.token){
          localStorage.setItem('token',respuesta.token);
          localStorage.setItem('usuario',JSON.stringify(respuesta.user));
        }
      })
    )
  }

  estaAutenticado(): boolean{
    return !!localStorage.getItem('token');
  }
}