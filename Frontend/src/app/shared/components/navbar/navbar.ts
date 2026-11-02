import { Component, inject, OnInit } from '@angular/core';
import { Router,RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SyncService } from '../../../features/pago/services/sync.service';

/**
 * COMPONENTE: BARRA DE NAVEGACIÓN SUPERIOR (Navbar)
 * -------------------------------------------------
 * Muestra el menú principal adaptado a los permisos del usuario conectado (`Administrador`, `Mostrador`, `Instalador`),
 * el indicador en vivo de conexión (`En línea` / `Modo Offline`), el contador de registros pendientes por sincronizar,
 * el botón de Modo Oscuro / Claro y el botón para cerrar sesión.
 */
@Component({
  selector: 'app-navbar',
  imports: [RouterModule,CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit{
  private router = inject(Router);
  public syncService = inject(SyncService);
  public ocupacionUsuario: string = 'Cargando ...';

  // Banderas booleanas que controlan qué menús se muestran en el HTML según el rol del usuario
  public esAdmin: boolean = false;
  public esMostrador: boolean = false;
  public esInstalador: boolean = false;
  public isDarkMode: boolean = false;

  ngOnInit(): void {
    this.obtenerOcupacion();
    this.checkCurrentTheme();
    this.syncService.actualizarConteoPendientes();
  }

  /**
   * Dispara manualmente la sincronización de registros pendientes cuando hay conexión a internet.
   */
  async forzarSincronizacion(): Promise<void> {
    await this.syncService.sincronizarTodo();
  }

  /**
   * Revisa si el documento HTML tiene activo el tema oscuro (`data-bs-theme="dark"`).
   */
  checkCurrentTheme(): void {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    this.isDarkMode = currentTheme === 'dark';
  }

  /**
   * Alterna entre Modo Oscuro y Modo Claro y guarda la preferencia en `localStorage`.
   */
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    const newTheme = this.isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  /**
   * Lee los datos del usuario desde `localStorage` para determinar su rol (`Administrador`, `Mostrador` o `Instalador`).
   */
  obtenerOcupacion(): void {
    const usuarioString = localStorage.getItem('usuario');

    if(usuarioString){
      const usuario = JSON.parse(usuarioString);
      const rolNombre = usuario.Rol || usuario.Ocupacion || 'Desconocido';
      this.ocupacionUsuario = rolNombre;

      this.esAdmin = (rolNombre === 'Administrador');
      this.esMostrador = (rolNombre === 'Mostrador');
      this.esInstalador = (rolNombre === 'Instalador');
    }else {
      this.ocupacionUsuario = 'Desconocido';
      this.esAdmin = false;
      this.esMostrador = false;
      this.esInstalador = false;
    }
  }

  /**
   * Elimina el token y los datos del usuario del navegador y redirige a la pantalla de Login.
   */
  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    this.router.navigate(['/login']);
  }
}
