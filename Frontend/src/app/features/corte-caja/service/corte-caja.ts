import { Injectable,inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CorteCaja } from '../model/corte-caja.model';
import { Usuario } from '../../usuario/models/usuario.model';
import { environment } from '../../../../environments/environment';

/**
 * ============================================================================
 * SERVICIO DE CORTE DE CAJA (corte-caja.ts)
 * ============================================================================
 * Gestiona las peticiones HTTP para listar cortes de caja, consultar el
 * desglose detallado de pagos incluidos en cada corte y actualizarlos.
 */
@Injectable({
  providedIn: 'root',
})
export class CorteCajaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/corteCaja`;
  private readonly apiUrlUsuario = `${environment.apiUrl}/usuarios`;
  private readonly apiUrlPago = `${environment.apiUrl}/pago/desglose`;

  /** Obtiene todos los cortes de caja registrados en el sistema */
  getCorteCaja(): Observable<CorteCaja[]>{
    return this.http.get<CorteCaja[]>(this.apiUrl);
  }

  /** Obtiene un corte de caja específico por su ID */
  getCortePorId(id: number): Observable<CorteCaja>{
    return this.http.get<CorteCaja>(`${this.apiUrl}/${id}`);
  }

  /** Crea un nuevo corte de caja */
  postCorteCaja(datos: CorteCaja | any): Observable<any>{
    return this.http.post<CorteCaja>(this.apiUrl, datos);
  }

  /** Actualiza un corte de caja existente (pagos incluidos, autorizador o fecha) */
  putCorteCaja(id: number, datosActualizados:any):Observable<any>{
    return this.http.put(`${this.apiUrl}/${id}`, datosActualizados);
  }

  /** Obtiene la lista de usuarios para asignar el empleado responsable del corte */
  getUsuarios():Observable<Usuario[]>{
    return this.http.get<Usuario[]>(this.apiUrlUsuario);
  }

  /** Solicita el desglose completo de una lista de IDs de pago para el modal de detalles del corte */
  getDesglosePagos(pagoIds: number[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrlPago}`, { pagoIds });
  }
  
}
