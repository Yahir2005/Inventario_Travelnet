import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Mensualidad } from '../model/mensualidad.model';
import { AppDB } from '../../../db/app.db';

@Injectable({
  providedIn: 'root',
})
export class MensualidadService {
  private http = inject(HttpClient);
  private db = inject(AppDB);
  private apiUrl = 'http://localhost:3000/api/mensualidad';

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

