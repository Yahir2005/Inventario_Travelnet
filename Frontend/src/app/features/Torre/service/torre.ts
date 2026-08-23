import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Torre } from '../model/torre.model';

@Injectable({
  providedIn: 'root',
})
export class TorreService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/Torre';

  getTorres(): Observable<Torre[]>{
    return this.http.get<Torre[]>(this.apiUrl);
  }

  getTorrePorId(id: number): Observable<Torre>{
    return this.http.get<Torre>(`${this.apiUrl}/${id}`);
  }

  crearTorre(datos: Torre | any): Observable<Torre>{
    return this.http.post<Torre>(this.apiUrl, datos);
  }

  actualizarTorre(id: number, datosActualizados: Torre | any): Observable<Torre>{
    return this.http.put<Torre>(`${this.apiUrl}/${id}`, datosActualizados);
  }
}
