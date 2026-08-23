import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OltService } from '../../service/olt';

@Component({
  selector: 'app-insertar-olt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './insertar-olt.html',
  styleUrl: './insertar-olt.scss',
})
export class InsertarOLT {
  private oltService = inject(OltService);
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
      alert('El nombre de la OLT es obligatorio.');
      return;
    }
    if (this.form.Nombre.trim().length > 50) {
      alert('El nombre no puede exceder 50 caracteres.');
      return;
    }

    this.guardando.set(true);
    this.oltService.crearOlt({
      Nombre: this.form.Nombre.trim(),
      Ubicacion: this.form.Ubicacion.trim()
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        alert('OLT registrada correctamente.');
        this.router.navigate(['/OLT/lista-olts']);
      },
      error: (err) => {
        console.error('Error al registrar la OLT', err);
        this.guardando.set(false);
        alert('Ocurrió un error al registrar la OLT.');
      }
    });
  }

  cancelar(){
    this.router.navigate(['/OLT/lista-olts']);
  }
}
