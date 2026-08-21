import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CorteCajaService } from '../../service/corte-caja';

@Component({
  selector: 'app-lista-corte-caja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-corte-caja.html',
  styleUrl: './lista-corte-caja.scss',
})
export class ListaCorteCajaComponent {
  private corteCajaService = inject(CorteCajaService);
  cortes = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    this.corteCajaService.getCorteCaja().subscribe({
      next: (data) => {
        this.cortes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar cortes: ',err);
        this.error.set('No se pudieron cargar los cortes de caja');
        this.loading.set(false);
      }
    });
  }

  contarPagos(jsonString: string): number {
    try {
      if(!jsonString) return 0;
      const arreglo = JSON.parse(jsonString);
      return Array.isArray(arreglo) ? arreglo.length: 0;
    } catch (error) {
      return 0;
    }
  }
}
