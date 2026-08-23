import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TorreService } from '../../service/torre';

@Component({
  selector: 'app-actualizar-torre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './actualizar-torre.html',
  styleUrl: './actualizar-torre.scss',
})
export class ActualizarTorre implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private torreService = inject(TorreService);

  esAdmin = false;
  loading = signal(true);
  guardando = signal(false);
  errorCarga = signal<string | null>(null);

  torreId = 0;

  form = {
    Nombre: '',
    Ubicacion: ''
  };

  ngOnInit(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      this.esAdmin = usuario.Ocupacion === 'Administrador';
    }

    if (!this.esAdmin) {
      this.loading.set(false);
      return;
    }

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorCarga.set('Torre no especificada.');
      this.loading.set(false);
      return;
    }
    this.torreId = id;

    this.torreService.getTorrePorId(id).subscribe({
      next: (torre) => {
        this.form.Nombre = torre.Nombre ?? '';
        this.form.Ubicacion = torre.Ubicacion ?? '';
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar la torre', err);
        this.errorCarga.set('No se pudo cargar la torre.');
        this.loading.set(false);
      }
    });
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
    this.torreService.actualizarTorre(this.torreId, {
      Nombre: this.form.Nombre.trim(),
      Ubicacion: this.form.Ubicacion.trim()
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        alert('Torre actualizada correctamente.');
        this.router.navigate(['/Torre/listar-torres']);
      },
      error: (err) => {
        console.error('Error al actualizar la torre', err);
        this.guardando.set(false);
        alert('Ocurrió un error al actualizar la torre.');
      }
    });
  }

  cancelar(){
    this.router.navigate(['/Torre/listar-torres']);
  }
}
