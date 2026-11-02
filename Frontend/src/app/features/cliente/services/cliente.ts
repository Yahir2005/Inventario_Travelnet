import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, from, of } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { ClienteDetallado } from "../models/cliente-list-view.model";
import { Cliente } from "../models/cliente.model";
import { AppDB } from "../../../db/app.db";
import { environment } from "../../../../environments/environment";

/**
 * SERVICIO DE CLIENTES (ClienteService)
 * -------------------------------------
 * Un "Servicio" en Angular es una clase puente que comunica las pantallas (componentes)
 * con el servidor Backend (mediante HTTP) y con la base de datos local (IndexedDB) cuando no hay internet.
 *
 * `@Injectable({ providedIn: 'root' })` significa que este servicio está disponible
 * en cualquier parte de la aplicación sin necesidad de volver a instanciarlo.
 */
@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  // Herramienta de Angular para hacer peticiones web (GET, POST, PUT, DELETE)
  private http = inject(HttpClient);
  // Base de datos local en el navegador (Dexie / IndexedDB) para el modo Offline
  private db = inject(AppDB);

  // Dirección base del endpoint de clientes en el servidor (ej. http://localhost:3000/api/cliente)
  private apiUrl = `${environment.apiUrl}/cliente`;

  /**
   * Obtiene la lista completa de clientes junto con sus instalaciones y estado de pago.
   * - Si hay internet: descarga los datos del servidor y guarda una copia fresca en `cacheClientes` (`tap`).
   * - Si NO hay internet: entra en `catchError` y devuelve la copia guardada en IndexedDB.
   */
  obtenerListaDetallada(): Observable<ClienteDetallado[]> {
    return this.http.get<ClienteDetallado[]>(`${this.apiUrl}/lista-detallada`).pipe(
      tap(async (clientes) => {
        await this.db.cacheClientes.clear();
        await this.db.cacheClientes.bulkAdd(clientes);
      }),
      catchError(() => {
        console.warn('Sin red. Recuperando lista de clientes detallada desde IndexedDB.');
        return from(this.db.cacheClientes.toArray() as Promise<ClienteDetallado[]>);
      })
    );
  }

  /**
   * Obtiene el catálogo básico de clientes (usado en selectores y métricas del Home).
   * También respalda la lista en `cacheClientesBasico` para que los formularios funcionen sin red.
   */
  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl).pipe(
      tap(async (clientes) => {
        await this.db.cacheClientesBasico.clear();
        await this.db.cacheClientesBasico.bulkAdd(clientes);
      }),
      catchError(() => {
        console.warn('Sin red. Recuperando catálogo de clientes desde IndexedDB.');
        return from(
          this.db.cacheClientesBasico.toArray().then(async (basicos) => {
            if (basicos.length > 0) return basicos as Cliente[];
            return (await this.db.cacheClientes.toArray()) as Cliente[];
          })
        );
      })
    );
  }

  /**
   * Busca la información de un solo cliente por su ID (usado al abrir la pantalla de Editar Cliente).
   */
  getClientePorId(id: number): Observable<Cliente>{
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  /**
   * Envía al servidor los datos modificados de un cliente existente (`PUT /api/cliente/:id`).
   */
  putCliente(id: number, datosActualizados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, datosActualizados);
  }

  /**
   * Envía al servidor los datos de un cliente nuevo para guardarlo en MariaDB (`POST /api/cliente`).
   */
  crearCliente(datosCliente:any) {
    return this.http.post(this.apiUrl,datosCliente);
  }
}