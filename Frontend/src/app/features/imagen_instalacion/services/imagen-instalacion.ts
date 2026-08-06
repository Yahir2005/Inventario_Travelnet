import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { imagen_instalacion } from '../models/imagen_instalacion.model';

@Injectable({
  providedIn: 'root',
})
export class ImagenInstalacionService {
  private http = inject(HttpClient);
  private apiInsertar_Imagen = 'http://localhost:3000/api/imagenInstalacion';

  getImagen_Instalacion(): Observable <imagen_instalacion[]>{
    return this.http.get<imagen_instalacion[]>(this.apiInsertar_Imagen);
  }
  postImagen_Instalacion(datosImagenInstalacion:any){
    return this.http.post(this.apiInsertar_Imagen,datosImagenInstalacion);
  }
}
