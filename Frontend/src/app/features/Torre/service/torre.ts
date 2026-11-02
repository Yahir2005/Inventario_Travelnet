import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Torre } from '../model/torre.model';
import { environment } from '../../../../environments/environment';

/**
 * ============================================================================
 * SERVICIO DE TORRES (torre.ts)
 * ============================================================================
 * Se comunica con `/api/torre` en el backend para consultar, registrar y
 * modificar las torres de transmisión inalámbrica.
 */
@Injectable({
  providedIn: 'root',
})
export class TorreService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/torre`;

  /** Obtiene todas las torres registradas */
  getTorres(): Observable<Torre[]>{
    return this.http.get<Torre[]>(this.apiUrl);
  }

  /** Obtiene una torre específica por su ID */
  getTorrePorId(id: number): Observable<Torre>{
    return this.http.get<Torre>(`${this.apiUrl}/${id}`);
  }

  /** Registra una nueva torre en la base de datos */
  crearTorre(datos: Torre | any): Observable<Torre>{
    return this.http.post<Torre>(this.apiUrl, datos);
  }

  /** Actualiza el nombre o ubicación de una torre existente */
  actualizarTorre(id: number, datosActualizados: Torre | any): Observable<Torre>{
    return this.http.put<Torre>(`${this.apiUrl}/${id}`, datosActualizados);
  }
}
