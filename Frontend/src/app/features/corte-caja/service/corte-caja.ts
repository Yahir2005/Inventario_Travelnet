import { Injectable,inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CorteCaja } from '../model/corte-caja.model';
import { Usuario } from '../../usuario/models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class CorteCajaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/CorteCaja';
  private readonly apiUrlUsuario = 'http://localhost:3000/api/usuarios';

  getCorteCaja(): Observable<CorteCaja[]>{
    return this.http.get<CorteCaja[]>(this.apiUrl);
  }

  postCorteCaja(datos: CorteCaja | any): Observable<any>{
    return this.http.post<CorteCaja>(this.apiUrl, datos);
  }

  putCorteCaja(id: number, datosActualizados:any):Observable<any>{
    return this.http.put(`${this.apiUrl}/${id}`, datosActualizados);
  }

  getUsuarios():Observable<Usuario[]>{
    return this.http.get<Usuario[]>(this.apiUrlUsuario);
  }
  
}
