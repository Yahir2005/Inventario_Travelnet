import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Olt } from '../model/olt.model';

@Injectable({
  providedIn: 'root',
})
export class OltService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/OLT';

  getOlts(): Observable<Olt[]>{
    return this.http.get<Olt[]>(this.apiUrl);
  }

  getOltPorId(id: number): Observable<Olt>{
    return this.http.get<Olt>(`${this.apiUrl}/${id}`);
  }

  crearOlt(datos: Olt | any): Observable<Olt>{
    return this.http.post<Olt>(this.apiUrl, datos);
  }

  actualizarOlt(id: number, datosActualizados: Olt | any): Observable<Olt>{
    return this.http.put<Olt>(`${this.apiUrl}/${id}`, datosActualizados);
  }
}
