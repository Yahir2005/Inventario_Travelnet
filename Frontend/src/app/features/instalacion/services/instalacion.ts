import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Instalacion } from '../models/instalacion.model';
import { InstalacionDetallada } from '../models/instalacion-list-view.model';
import { Olt } from '../models/olt.model';
import { Torre } from '../models/torre.model';
import { Cliente } from '../models/cliente.model';
import { AppDB } from '../../../db/app.db';
import { environment } from '../../../../environments/environment';

/**
 * SERVICIO DE INSTALACIONES (InstalacionService)
 * ----------------------------------------------
 * Centraliza las peticiones HTTP relacionadas con instalaciones de clientes
 * y también consulta los catálogos auxiliares (Clientes, OLTs, Torres, Localidades, Planes y Tarifas).
 * Cada consulta guarda una copia en IndexedDB (`AppDB`) para que el instalador pueda trabajar sin internet.
 */
@Injectable({
  providedIn: 'root',
})
export class InstalacionService {
  private http = inject(HttpClient);
  private db = inject(AppDB);
  private apiUrl = `${environment.apiUrl}/instalacion`;
  private apiTorre = `${environment.apiUrl}/torre`;
  private apiOlt = `${environment.apiUrl}/olt`;
  private apiInfraestructura = `${environment.apiUrl}/infraestructura`;
  private apiPlan = `${environment.apiUrl}/plan`;
  private apiCliente = `${environment.apiUrl}/cliente`;
  private apiLocalidad = `${environment.apiUrl}/localidad`;

  getInstalaciones(): Observable<Instalacion[]> {
    return this.http.get<Instalacion[]>(this.apiUrl).pipe(
      catchError(() => {
        console.warn('Sin red. Recuperando instalaciones básicas desde IndexedDB.');
        return from(this.db.cacheInstalaciones.toArray() as Promise<any[]>);
      })
    );
  }

  getInstalacionesDetalladas(): Observable<InstalacionDetallada[]> {
    return this.http.get<InstalacionDetallada[]>(`${this.apiUrl}/lista-detallada`).pipe(
      tap(async (instalaciones) => {
        await this.db.cacheInstalaciones.clear();
        await this.db.cacheInstalaciones.bulkAdd(instalaciones);
      }),
      catchError(() => {
        console.warn('Sin red. Recuperando instalaciones desde IndexedDB.');
        return from(this.db.cacheInstalaciones.toArray() as Promise<InstalacionDetallada[]>);
      })
    );
  }

  getInstalacionPorId(id: number): Observable<Instalacion>{
    return this.http.get<Instalacion>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        return from(
          this.db.cacheInstalaciones
            .filter((i: any) => Number(i.InstalacionId) === Number(id))
            .first() as Promise<Instalacion>
        );
      })
    );
  }

  putInstalaciones(id: number, datosActualizados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, datosActualizados);
  }

  crearInstalacion(datosInstalacion:any){
    return this.http.post(this.apiUrl,datosInstalacion);
  }

  getClientes():Observable <Cliente[]>{
    return this.http.get<Cliente[]>(this.apiCliente).pipe(
      tap(async (clientes) => {
        await this.db.cacheClientesBasico.clear();
        await this.db.cacheClientesBasico.bulkAdd(clientes);
      }),
      catchError(() => {
        return from(
          this.db.cacheClientesBasico.toArray().then(async (basicos) => {
            if (basicos.length > 0) return basicos as Cliente[];
            return (await this.db.cacheClientes.toArray()) as Cliente[];
          })
        );
      })
    );
  }

  getOlts(): Observable <Olt[]>{
    return this.http.get<Olt[]>(this.apiOlt).pipe(
      tap(async (olts) => {
        await this.db.cacheOlts.clear();
        await this.db.cacheOlts.bulkAdd(olts);
      }),
      catchError(() => {
        console.warn('Sin red. Recuperando OLTs desde IndexedDB.');
        return from(this.db.cacheOlts.toArray() as Promise<Olt[]>);
      })
    );
  }

  getTorre(): Observable <Torre[]>{
    return this.http.get<Torre[]>(this.apiTorre).pipe(
      tap(async (torres) => {
        await this.db.cacheTorres.clear();
        await this.db.cacheTorres.bulkAdd(torres);
      }),
      catchError(() => {
        console.warn('Sin red. Recuperando Torres desde IndexedDB.');
        return from(this.db.cacheTorres.toArray() as Promise<Torre[]>);
      })
    );
  }

  getLocalidades(): Observable<any[]>{
    return this.http.get<any[]>(this.apiLocalidad).pipe(
      tap(async (localidades) => {
        await this.db.cacheLocalidades.clear();
        await this.db.cacheLocalidades.bulkAdd(localidades);
      }),
      catchError(() => {
        console.warn('Sin red. Recuperando Localidades desde IndexedDB.');
        return from(this.db.cacheLocalidades.toArray());
      })
    );
  }

  getInfraestructuras(tipo?: 'OLT' | 'Torre'): Observable<any[]> {
    const url = tipo ? `${this.apiInfraestructura}?tipo=${tipo}` : this.apiInfraestructura;
    return this.http.get<any[]>(url);
  }

  getPlanes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiPlan).pipe(
      tap(async (planes) => {
        await this.db.cachePlanes.clear();
        await this.db.cachePlanes.bulkAdd(planes);
      }),
      catchError(() => {
        return from(this.db.cachePlanes.toArray());
      })
    );
  }

  getTarifas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiPlan}/tarifas`).pipe(
      tap(async (tarifas) => {
        await this.db.cacheTarifas.clear();
        await this.db.cacheTarifas.bulkAdd(tarifas);
      }),
      catchError(() => {
        return from(this.db.cacheTarifas.toArray());
      })
    );
  }

}