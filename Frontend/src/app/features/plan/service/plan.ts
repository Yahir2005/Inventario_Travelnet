import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plan, PlanTarifa } from '../model/plan.model';
import { environment } from '../../../../environments/environment';

/**
 * ============================================================================
 * SERVICIO DE PLANES Y TARIFAS (plan.ts)
 * ============================================================================
 * Gestiona las peticiones HTTP hacia `/api/plan` para administrar tanto los
 * paquetes de velocidad (ej. " Básico 20 Mbps") como sus tarifas por modalidad
 * (`PlanTarifa`: Mensual, Semestral, Anual, etc.).
 */
@Injectable({
  providedIn: 'root',
})
export class PlanService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/plan`;

  /** Obtiene todos los planes junto con su arreglo de tarifas asociadas */
  getPlanes(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.apiUrl);
  }

  /** Obtiene un plan específico por su ID */
  getPlanPorId(id: number): Observable<Plan> {
    return this.http.get<Plan>(`${this.apiUrl}/${id}`);
  }

  /** Crea un nuevo plan junto con sus tarifas iniciales */
  crearPlan(datos: Plan): Observable<Plan> {
    return this.http.post<Plan>(this.apiUrl, datos);
  }

  /** Actualiza los datos generales de un plan (Nombre, Velocidad_Mbps, Active) */
  actualizarPlan(id: number, datosActualizados: Partial<Plan>): Observable<Plan> {
    return this.http.put<Plan>(`${this.apiUrl}/${id}`, datosActualizados);
  }

  /** Desactiva un plan en el catálogo */
  desactivarPlan(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /** Obtiene la lista plana de todas las tarifas disponibles */
  getTarifas(): Observable<PlanTarifa[]> {
    return this.http.get<PlanTarifa[]>(`${this.apiUrl}/tarifas`);
  }

  /** Agrega una nueva modalidad/precio (`PlanTarifa`) a un plan existente */
  crearTarifa(datos: PlanTarifa): Observable<PlanTarifa> {
    return this.http.post<PlanTarifa>(`${this.apiUrl}/tarifas`, datos);
  }

  /** Modifica el precio o la modalidad de una tarifa existente */
  actualizarTarifa(tarifaId: number, datos: Partial<PlanTarifa>): Observable<PlanTarifa> {
    return this.http.put<PlanTarifa>(`${this.apiUrl}/tarifas/${tarifaId}`, datos);
  }

  /** Elimina una tarifa específica si no está asignada a ninguna instalación */
  eliminarTarifa(tarifaId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tarifas/${tarifaId}`);
  }
}
export { PlanService as Plan };
