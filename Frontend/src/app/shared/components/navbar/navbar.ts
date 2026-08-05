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

  ngOnInit(): void {
    this.obtenerOcupacion();
  }

  obtenerOcupacion(): void {
    const usuarioString = localStorage.getItem('usuario');

    if(usuarioString){
      const usuario = JSON.parse(usuarioString);
      this.ocupacionUsuario = usuario.Ocupacion;

      this.esAdmin = (usuario.Ocupacion === 'Administrador');
    }else {
      this.ocupacionUsuario = 'Desconocido';
      this.esAdmin = false;
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    this.router.navigate(['/login']);
  }
}
