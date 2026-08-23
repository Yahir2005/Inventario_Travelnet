import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TorreService } from '../../service/torre';

@Component({
  selector: 'app-insertar-torre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './insertar-torre.html',
  styleUrl: './insertar-torre.scss',
})
export class InsertarTorre {
  private torreService = inject(TorreService);
  private router = inject(Router);

  esAdmin = false;
  guardando = signal(false);

  form = {
    Nombre: '',
    Ubicacion: ''
  };

  constructor() {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      this.esAdmin = usuario.Ocupacion === 'Administrador';
    }
  }

  guardar(){
    if (!this.form.Nombre.trim()) {
      alert('El nombre de la torre es obligatorio.');
      return;
    }
    if (this.form.Nombre.trim().length > 50) {
      alert('El nombre no puede exceder 50 caracteres.');
      return;
    }

    this.guardando.set(true);
    this.torreService.crearTorre({
      Nombre: this.form.Nombre.trim(),
      Ubicacion: this.form.Ubicacion.trim()
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        alert('Torre registrada correctamente.');
        this.router.navigate(['/Torre/listar-torres']);
      },
      error: (err) => {
        console.error('Error al registrar la torre', err);
        this.guardando.set(false);
        alert('Ocurrió un error al registrar la torre.');
      }
    });
  }

  cancelar(){
    this.router.navigate(['/Torre/listar-torres']);
  }
}
