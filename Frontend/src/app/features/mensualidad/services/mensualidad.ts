import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Mensualidad } from '../model/mensualidad.model';
import { AppDB } from '../../../db/app.db';
import { environment } from '../../../../environments/environment';

/**
 * ============================================================================
 * SERVICIO DE MENSUALIDADES (mensualidad.ts)
 * ============================================================================
 * Permite consultar los meses pagados de una instalación (con respaldo en
 * IndexedDB para Modo Offline), editar una mensualidad o darla de baja con motivo.
 */
@Injectable({
  providedIn: 'root',
})
export class MensualidadService {
  private http = inject(HttpClient);
  private db = inject(AppDB);
  private apiUrl = `${environment.apiUrl}/mensualidad`;

  /** Obtiene las mensualidades de una instalación y las guarda en caché local por si se pierde la red */
  getMensualidadesPorInstalacion(instalacionId: number): Observable<Mensualidad[]> {
    return this.http.get<Mensualidad[]>(`${this.apiUrl}/instalacion/${instalacionId}`).pipe(
      tap(async (mensualidades) => {
        // Removemos las mensualidades viejas de esta instalación
        const deletes = await this.db.cacheMensualidades.where({ instalacionId }).primaryKeys();
        await this.db.cacheMensualidades.bulkDelete(deletes);
        
        // Asignamos el instalacionId para que se pueda filtrar offline
        const aGuardar = mensualidades.map(m => ({ ...m, instalacionId }));
        await this.db.cacheMensualidades.bulkAdd(aGuardar);
      }),
      catchError(() => {
        console.warn('Sin red. Recuperando mensualidades desde IndexedDB.');
        return from(
          this.db.cacheMensualidades.where({ instalacionId }).toArray() as Promise<Mensualidad[]>
        );
      })
    );
  }

  /** Obtiene el detalle de una mensualidad específica por su ID */
  getMensualidadPorId(id: number): Observable<Mensualidad> {
    return this.http.get<Mensualidad>(`${this.apiUrl}/${id}`);
  }

  /** Actualiza el mes, año, concepto, monto o estado de una mensualidad */
  actualizarMensualidad(id: number, datosActualizados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, datosActualizados);
  }

  /** Cancela (da de baja) una mensualidad registrando el motivo y el usuario en la bitácora de auditoría */
  cancelarMensualidad(datos: {
    MensualidadId: number;
    Motivo: string;
    PagoId?: number | null;
    UsuarioId?: number | null;
    MotivoId?: number | null;
    Observaciones?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cancelar`, datos);
  }
}

