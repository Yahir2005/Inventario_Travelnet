import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { imagen_instalacion } from '../models/imagen_instalacion.model';
import { environment } from '../../../../environments/environment';

/**
 * ============================================================================
 * SERVICIO DE IMÁGENES DE INSTALACIÓN (imagen-instalacion.ts)
 * ============================================================================
 * Se encarga de enviar y consultar las fotografías de evidencia técnica
 * asociadas a una instalación (convertidas en formato Base64).
 */
@Injectable({
  providedIn: 'root',
})
export class ImagenInstalacionService {
  private http = inject(HttpClient);
  private apiInsertar_Imagen = `${environment.apiUrl}/imagenInstalacion`;

  /** Obtiene todas las imágenes registradas en el servidor */
  getImagen_Instalacion(): Observable <imagen_instalacion[]>{
    return this.http.get<imagen_instalacion[]>(this.apiInsertar_Imagen);
  }

  /** Envía una nueva fotografía de evidencia (con su InstalacionId y Uuid_local) al backend */
  postImagen_Instalacion(datosImagenInstalacion:any){
    return this.http.post(this.apiInsertar_Imagen,datosImagenInstalacion);
  }
}
