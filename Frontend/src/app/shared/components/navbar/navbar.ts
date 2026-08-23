import { Component, inject, OnInit } from '@angular/core';
import { Router,RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule,CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit{
  private router = inject(Router);
  public ocupacionUsuario: string = 'Cargando ...';

  public esAdmin: boolean = false;
  public esMostrador: boolean = false;
  public esInstalador: boolean = false;
  public isDarkMode: boolean = false;

  ngOnInit(): void {
    this.obtenerOcupacion();
    this.checkCurrentTheme();
  }

  checkCurrentTheme(): void {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    this.isDarkMode = currentTheme === 'dark';
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    const newTheme = this.isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  obtenerOcupacion(): void {
    const usuarioString = localStorage.getItem('usuario');

    if(usuarioString){
      const usuario = JSON.parse(usuarioString);
      this.ocupacionUsuario = usuario.Ocupacion;

      this.esAdmin = (usuario.Ocupacion === 'Administrador');
      this.esMostrador = (usuario.Ocupacion === 'Mostrador');
      this.esInstalador = (usuario.Ocupacion === 'Instalador');
    }else {
      this.ocupacionUsuario = 'Desconocido';
      this.esAdmin = false;
      this.esMostrador = false;
      this.esInstalador = false;
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    this.router.navigate(['/login']);
  }
}
