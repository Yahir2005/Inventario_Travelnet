import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TorreService } from '../../service/torre';
import { Torre } from '../../model/torre.model';

/**
 * ============================================================================
 * COMPONENTE: LISTAR TORRES (listar-torre.ts)
 * ============================================================================
 * Muestra el catálogo de torres de telecomunicaciones para enlaces por antena
 * y permite a los Administradores agregar o editar registros.
 */
@Component({
  selector: 'app-listar-torre',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listar-torre.html',
  styleUrl: './listar-torre.scss',
})
export class ListarTorre implements OnInit {
  private torreService = inject(TorreService);
  private router = inject(Router);

  torres = signal<Torre[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  esAdmin = false;

  ngOnInit(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      this.esAdmin = usuario.Ocupacion === 'Administrador';
    }
    this.cargarTorres();
  }

  /** Consulta las torres al backend y actualiza el signal `torres` */
  cargarTorres(){
    this.loading.set(true);
    this.torreService.getTorres().subscribe({
      next: (data) => {
        this.torres.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar las torres', err);
        this.error.set('No se pudieron cargar las torres.');
        this.loading.set(false);
      }
    });
  }

  /** Redirige al formulario de creación de torre (solo Administradores) */
  agregarTorre(){
    if (!this.esAdmin) return;
    this.router.navigate(['/Torre/insertar-torre']);
  }

  /** Redirige al formulario de edición de la torre seleccionada */
  editarTorre(torre: Torre){
    if (!this.esAdmin) return;
    this.router.navigate(['/Torre/actualizar-torre', torre.TorreId]);
  }
}
