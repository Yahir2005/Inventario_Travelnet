import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pago, PagoDetallado, PagoForm } from '../models/pago.model';

@Injectable({
  providedIn: 'root',
})
export class PagoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/pago';

  getPagos(): Observable<PagoDetallado[]> {
    return this.http.get<PagoDetallado[]>(this.apiUrl);
  }

  getPago(id: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/${id}`);
  }

  crearPago(datos: PagoForm): Observable<Pago> {
    return this.http.post<Pago>(this.apiUrl, datos);
  }

  actualizarPago(id: number, datos: Partial<PagoForm>): Observable<Pago> {
    return this.http.put<Pago>(`${this.apiUrl}/${id}`, datos);
  }
}
