import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mensualidad } from '../model/mensualidad.model';

@Injectable({
  providedIn: 'root',
})
export class MensualidadService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/mensualidad';

  getMensualidadesPorInstalacion(instalacionId: number): Observable<Mensualidad[]> {
    return this.http.get<Mensualidad[]>(`${this.apiUrl}/instalacion/${instalacionId}`);
  }

  getMensualidadPorId(id: number): Observable<Mensualidad> {
    return this.http.get<Mensualidad>(`${this.apiUrl}/${id}`);
  }

  actualizarMensualidad(id: number, datosActualizados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, datosActualizados);
  }

  cancelarMensualidad(datos: { MensualidadId: number; Motivo: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cancelar`, datos);
  }
}

