import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  constructor(private http: HttpClient) { }
  private readonly dataUrl = '/public/assets/data/empleados.json';
  getUsuarios(): Observable<Usuario[]> {
    //return this.http.get<Usuario[]>('/public/assets/data/empleados.json');
    return this.http.get<Usuario[]>(this.dataUrl);
  }
}