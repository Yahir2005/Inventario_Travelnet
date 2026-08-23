import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OltService } from '../../service/olt';

@Component({
  selector: 'app-actualizar-olt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './actualizar-olt.html',
  styleUrl: './actualizar-olt.scss',
})
export class ActualizarOLT implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private oltService = inject(OltService);

  esAdmin = false;
  loading = signal(true);
  guardando = signal(false);
  errorCarga = signal<string | null>(null);

  oltId = 0;

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
      this.errorCarga.set('OLT no especificada.');
      this.loading.set(false);
      return;
    }
    this.oltId = id;

    this.oltService.getOltPorId(id).subscribe({
      next: (olt) => {
        this.form.Nombre = olt.Nombre ?? '';
        this.form.Ubicacion = olt.Ubicacion ?? '';
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar la OLT', err);
        this.errorCarga.set('No se pudo cargar la OLT.');
        this.loading.set(false);
      }
    });
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
    this.oltService.actualizarOlt(this.oltId, {
      Nombre: this.form.Nombre.trim(),
      Ubicacion: this.form.Ubicacion.trim()
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        alert('OLT actualizada correctamente.');
        this.router.navigate(['/OLT/lista-olts']);
      },
      error: (err) => {
        console.error('Error al actualizar la OLT', err);
        this.guardando.set(false);
        alert('Ocurrió un error al actualizar la OLT.');
      }
    });
  }

  cancelar(){
    this.router.navigate(['/OLT/lista-olts']);
  }
}
