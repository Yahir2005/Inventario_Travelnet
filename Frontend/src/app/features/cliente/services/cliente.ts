import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, from, of } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { ClienteDetallado } from "../models/cliente-list-view.model";
import { Cliente } from "../models/cliente.model";
import { AppDB } from "../../../db/app.db";

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private db = inject(AppDB);

  private apiUrl = 'http://localhost:3000/api/cliente';

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

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl).pipe(
      tap(async (clientes) => {
        // En este caso omitimos guardar el básico porque el detallado es el principal que vemos,
        // pero por seguridad también podríamos guardarlo.
      }),
      catchError((err) => {
        throw err;
      })
    );
  }

  getClientePorId(id: number): Observable<Cliente>{
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  putCliente(id: number, datosActualizados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, datosActualizados);
  }

  crearCliente(datosCliente:any) {
    return this.http.post(this.apiUrl,datosCliente);
  }
}