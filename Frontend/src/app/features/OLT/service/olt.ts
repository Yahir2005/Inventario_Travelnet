import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Olt } from '../model/olt.model';
import { environment } from '../../../../environments/environment';

/**
 * ============================================================================
 * SERVICIO DE OLT (olt.ts)
 * ============================================================================
 * Conecta con el endpoint `/api/olt` del backend para consultar, crear y
 * actualizar las terminales de fibra óptica (OLT).
 */
@Injectable({
  providedIn: 'root',
})
export class OltService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/olt`;

  /** Obtiene la lista completa de OLTs */
  getOlts(): Observable<Olt[]>{
    return this.http.get<Olt[]>(this.apiUrl);
  }

  /** Obtiene una OLT específica por su ID */
  getOltPorId(id: number): Observable<Olt>{
    return this.http.get<Olt>(`${this.apiUrl}/${id}`);
  }

  /** Registra una nueva OLT en la base de datos */
  crearOlt(datos: Olt | any): Observable<Olt>{
    return this.http.post<Olt>(this.apiUrl, datos);
  }

  /** Actualiza el nombre o ubicación de una OLT existente */
  actualizarOlt(id: number, datosActualizados: Olt | any): Observable<Olt>{
    return this.http.put<Olt>(`${this.apiUrl}/${id}`, datosActualizados);
  }
}
