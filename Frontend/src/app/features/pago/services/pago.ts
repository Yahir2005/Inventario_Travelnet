import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Pago, PagoDetallado, PagoForm } from '../models/pago.model';
import { CorteCaja } from '../models/corte-caja.model';
import { AppDB } from '../../../db/app.db';

@Injectable({
  providedIn: 'root',
})
export class PagoService {
  private http = inject(HttpClient);
  private db = inject(AppDB);
  private apiUrl = 'http://localhost:3000/api/pago';
  private datosCorte = 'http://localhost:3000/api/CorteCaja';

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

  getExportarPagos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/exportar`);
  }

  getPago(id: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/${id}`);
  }

  crearPago(datos: PagoForm): Observable<Pago> {
    return this.http.post<Pago>(this.apiUrl, datos);
  }

  actualizarPago(id: number, datosActualizados: any): Observable<Pago> {
    return this.http.put<Pago>(`${this.apiUrl}/${id}`, datosActualizados);
  }

  guardarCorteCaja(datos: CorteCaja | any): Observable<any>{
    return this.http.post<CorteCaja>(this.datosCorte, datos);
  }
}
