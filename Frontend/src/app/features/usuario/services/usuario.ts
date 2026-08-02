import { inject,Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable,tap } from "rxjs";
import { Usuario } from "../models/usuario.model";

@Injectable({
  providedIn: 'root',
})
export class UsuarioService{
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/usuarios'; 

  login(credenciales: {Usuario: string, Password: string}){
    return this.http.post<any>(`${this.apiUrl}/login`,credenciales).pipe(
      tap(respuesta => {
        if(respuesta && respuesta.token){
          localStorage.setItem('token',respuesta.token);
          localStorage.setItem('usuario',JSON.stringify(respuesta.user));
        }
      })
    )
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  }

  getUsuarios():Observable <Usuario[]>{
    return this.http.get<Usuario[]>(this.apiUrl);
  }
}