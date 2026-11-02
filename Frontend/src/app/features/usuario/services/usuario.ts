import { inject,Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable,tap } from "rxjs";
import { Usuario } from "../models/usuario.model";
import { environment } from "../../../../environments/environment";

/**
 * ============================================================================
 * SERVICIO DE USUARIOS Y AUTENTICACIÓN (usuario.ts)
 * ============================================================================
 * Administra el inicio de sesión (guardando el token JWT y los datos del
 * empleado en `localStorage`), verifica si la sesión sigue vigente y realiza
 * el CRUD completo de usuarios contra `/api/usuarios`.
 */
@Injectable({
  providedIn: 'root',
})
export class UsuarioService{
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/usuarios`; 

  /** Envía usuario y contraseña al backend; si son válidos, guarda el token JWT en el navegador */
  login(credenciales: {Usuario: string, Password: string}){
    return this.http.post<any>(`${this.apiUrl}/login`,credenciales).pipe(
      tap(respuesta => {
        if(respuesta && respuesta.token){
          localStorage.setItem('token',respuesta.token);
          localStorage.setItem('usuario',JSON.stringify(respuesta.user));
        }
      })
    )
  }

  /**
   * Comprueba si existe un token JWT válido en `localStorage` y que su fecha
   * de expiración (`exp`) aún no haya vencido.
   */
  estaAutenticado(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const partes = token.split('.');
      if (partes.length !== 3) {
        this.cerrarSesionLocal();
        return false;
      }
      const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        this.cerrarSesionLocal();
        return false;
      }
      return true;
    } catch {
      this.cerrarSesionLocal();
      return false;
    }
  }

  /** Limpia el token y los datos del usuario del almacenamiento local */
  private cerrarSesionLocal(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  /** Valida las credenciales de un Administrador para autorizar un Corte de Caja sin reemplazar la sesión actual */
  autorizarAdmin(credenciales: {Usuario: string, Password:string}){
    return this.http.post<any>(`${this.apiUrl}/login`,credenciales);
  }

  /** Obtiene la lista de todos los usuarios registrados */
  getUsuarios():Observable <Usuario[]>{
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  /** Obtiene los datos de un usuario específico por su ID */
  getByIdUsuario(id: number): Observable <Usuario>{
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  /** Actualiza los datos o el estado (`Active`) de un usuario existente */
  putUsuario(id: number,datosActualizados: Partial<Usuario>):Observable<any>{
    return this.http.put(`${this.apiUrl}/${id}`, datosActualizados);
  }

  /** Registra un nuevo usuario en la base de datos */
  postCrearUsuario(datosUsuario:any){
    return this.http.post(this.apiUrl,datosUsuario);
  }
}