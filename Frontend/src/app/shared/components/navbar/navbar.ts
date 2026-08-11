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

  ngOnInit(): void {
    this.obtenerOcupacion();
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
