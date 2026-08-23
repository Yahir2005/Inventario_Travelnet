import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pago, PagoDetallado, PagoForm } from '../models/pago.model';
import { CorteCaja } from '../models/corte-caja.model';

@Injectable({
  providedIn: 'root',
})
export class PagoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/pago';
  private datosCorte = 'http://localhost:3000/api/CorteCaja';

  getPagos(): Observable<PagoDetallado[]> {
    return this.http.get<PagoDetallado[]>(this.apiUrl);
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
