import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstalacionService } from '../../services/instalacion';
import { InstalacionDetallada } from '../../models/instalacion-list-view.model';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-lista-instalacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lista-instalacion.html',
  styleUrl: './lista-instalacion.scss',
})
export class ListaInstalacion implements OnInit {
  private instalacionService = inject(InstalacionService);
  private router = inject(Router);

  instalaciones = signal<InstalacionDetallada[]>([]);
  instalacionesFiltradas: InstalacionDetallada[] = [];
  loading = signal(true);
  error = signal<string | null>(null);
  terminoBusqueda = '';

  ngOnInit(): void {
    this.cargarInstalaciones();
  }

  cargarInstalaciones() {
    this.loading.set(true);
    this.instalacionService.getInstalacionesDetalladas().subscribe({
      next: (data) => {
        const normalizadas = data.map(inst => ({ ...inst, Cantidad_Imagenes: Number(inst.Cantidad_Imagenes) || 0 }));
        this.instalaciones.set(normalizadas);
        this.aplicarFiltro();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las instalaciones.');
        console.error('Error al cargar las instalaciones', err);
        this.loading.set(false);
      }
    });
  }

  aplicarFiltro() {
    const termino = this.terminoBusqueda.toLowerCase().trim();
    if (!termino) {
      this.instalacionesFiltradas = this.instalaciones();
      return;
    }
    this.instalacionesFiltradas = this.instalaciones().filter(inst =>
      (inst.Nombre_Cliente || '').toLowerCase().includes(termino) ||
      (inst.Localidad_Nombre || '').toLowerCase().includes(termino) ||
      (inst.Tipo || '').toLowerCase().includes(termino) ||
      (inst.Plan || '').toLowerCase().includes(termino)
    );
  }

  buscarInstalaciones() {
    this.aplicarFiltro();
  }

  limpiarBusqueda() {
    this.terminoBusqueda = '';
    this.aplicarFiltro();
  }

  agregarImagen(instalacion: InstalacionDetallada) {
    this.router.navigate(['/imagen-instalacion/insertar-imagen-instalacion'], {
      queryParams: { instalacionId: instalacion.InstalacionId }
    });
  }

  obtenerUrlImagen(ruta?: string | null): string | null {
    if (!ruta) return null;
    if (ruta.startsWith('http')) return ruta;
    return `http://localhost:3000${ruta}`;
  }

  registrarPago(instalacion: InstalacionDetallada) {
    this.router.navigate(['/pago/insertar']);
  }
}