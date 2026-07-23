import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  constructor(private http: HttpClient) {}
  private readonly dataUrl = '/assets/data/clientes.json';
  getClientes(): Observable<Cliente[]>{
    return this.http.get<Cliente[]>(this.dataUrl);
  }
}
