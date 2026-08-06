import { Injectable,inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Instalacion } from '../models/instalacion.model';
import { Olt } from '../models/olt.model';
import { Torre } from '../models/torre.model';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class InstalacionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/instalacion';
  private apiTorre = 'http://localhost:3000/api/torre';
  private apiOlt = 'http://localhost:3000/api/olt';
  private apiCliente = 'http://localhost:3000/api/cliente';

  getInstalaciones(): Observable <Instalacion[]>{
    return this.http.get<Instalacion[]>(`${this.apiUrl}/lista`);
  }
  crearInstalacion(datosInstalacion:any){
    return this.http.post(this.apiUrl,datosInstalacion);
  }

  getClientes():Observable <Cliente[]>{
    return this.http.get<Cliente[]>(this.apiCliente);
  }

  getOlts(): Observable <Olt[]>{
    return this.http.get<Olt[]>(this.apiOlt);
  }

  getTorre(): Observable <Torre[]>{
    return this.http.get<Torre[]>(this.apiTorre);
  }

}