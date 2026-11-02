import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Pago, PagoDetallado, PagoForm } from '../models/pago.model';
import { CorteCaja } from '../models/corte-caja.model';
import { AppDB } from '../../../db/app.db';
import { environment } from '../../../../environments/environment';

/**
 * ============================================================================
 * SERVICIO DE PAGOS Y COBRANZA (pago.ts)
 * ============================================================================
 * Administra todas las peticiones HTTP relacionadas con el cobro de mensualidades,
 * exportación a Excel, consulta de pagos pendientes de corte y guardado en caché
 * local (IndexedDB) para consulta sin conexión.
 */
@Injectable({
  providedIn: 'root',
})
export class PagoService {
  private http = inject(HttpClient);
  private db = inject(AppDB);
  private apiUrl = `${environment.apiUrl}/pago`;
  private datosCorte = `${environment.apiUrl}/corteCaja`;

  /**
   * Obtiene el listado detallado de pagos por instalación.
   * Si hay internet, actualiza la caché local `cachePagos`; si no, devuelve la caché guardada.
   */
  getPagos(): Observable<PagoDetallado[]> {
    return this.http.get<PagoDetallado[]>(this.apiUrl).pipe(
      tap(async (pagos) => {
        await this.db.cachePagos.clear();
        await this.db.cachePagos.bulkAdd(pagos);
      }),
      catchError(() => {
        console.warn('Sin red. Recuperando lista de pagos desde IndexedDB.');
        return from(this.db.cachePagos.toArray() as Promise<PagoDetallado[]>);
      })
    );
  }

  /** Obtiene la matriz completa de clientes y sus meses pagados para armar el archivo Excel */
  getExportarPagos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/exportar`);
  }

  /** Consulta los pagos en efectivo que aún no han sido incluidos en ningún corte de caja */
  getPagosPendientesCorte(usuarioId?: number | null): Observable<PagoDetallado[]> {
    const query = usuarioId ? `?usuarioId=${usuarioId}` : '';
    return this.http.get<PagoDetallado[]>(`${this.apiUrl}/pendientes-corte${query}`);
  }

  /** Obtiene un pago específico por su ID para el formulario de edición */
  getPago(id: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/${id}`);
  }

  /** Registra un nuevo pago y sus mensualidades correspondientes en el backend */
  crearPago(datos: PagoForm): Observable<Pago> {
    return this.http.post<Pago>(this.apiUrl, datos);
  }

  /** Procesa un pago mediante el procedimiento almacenado del servidor */
  procesarPagoSP(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/procesar`, datos);
  }

  /** Actualiza los datos de un pago existente */
  actualizarPago(id: number, datosActualizados: any): Observable<Pago> {
    return this.http.put<Pago>(`${this.apiUrl}/${id}`, datosActualizados);
  }

  /** Registra un nuevo corte de caja con los pagos en efectivo del turno */
  guardarCorteCaja(datos: CorteCaja | any): Observable<any>{
    return this.http.post<CorteCaja>(this.datosCorte, datos);
  }
}
