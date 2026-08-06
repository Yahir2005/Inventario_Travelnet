import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ClienteDetallado } from "../models/cliente-list-view.model";
import { Cliente } from "../models/cliente.model";

@Injectable({
  providedIn: 'root'
})

export class ClienteService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/cliente';

  obtenerListaDetallada(): Observable <ClienteDetallado[]>{
    return this.http.get<ClienteDetallado[]>(`${this.apiUrl}/lista-detallada`);
  }

  getClientes():Observable <Cliente[]>{
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  crearCliente(datosCliente:any) {
    return this.http.post(this.apiUrl,datosCliente);
  }
}