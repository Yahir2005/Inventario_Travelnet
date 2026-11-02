import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PlanService } from '../../service/plan';
import { Plan } from '../../model/plan.model';

/**
 * ============================================================================
 * COMPONENTE: LISTA DE PLANES (lista-plan.ts)
 * ============================================================================
 * Muestra el catálogo de paquetes de internet con sus velocidades y precios
 * por modalidad. Permite a los Administradores editar planes o habilitarlos/inhabilitarlos.
 */
@Component({
  selector: 'app-lista-plan',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-plan.html',
  styleUrl: './lista-plan.scss',
})
export class ListaPlan implements OnInit {
  private planService = inject(PlanService);
  private router = inject(Router);

  planes = signal<Plan[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  esAdmin = false;

  ngOnInit(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      this.esAdmin = (usuario.Rol || usuario.Ocupacion) === 'Administrador';
    }
    this.cargarPlanes();
  }

  /** Consulta los planes y sus tarifas al servidor */
  cargarPlanes(): void {
    this.loading.set(true);
    this.planService.getPlanes().subscribe({
      next: (data) => {
        this.planes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar planes:', err);
        this.error.set('Error al cargar la lista de planes.');
        this.loading.set(false);
      },
    });
  }

  /** Redirige al formulario de edición del plan seleccionado */
  editarPlan(id?: number): void {
    if (!id) return;
    this.router.navigate(['/plan/actualizar-plan', id]);
  }

  /** Activa o desactiva un plan previa confirmación del Administrador */
  cambiarEstado(plan: Plan): void {
    if (!plan.PlanId) return;
    const nuevoEstado = !plan.Active;
    const accion = nuevoEstado ? 'habilitar' : 'inhabilitar';
    if (!confirm(`¿Deseas ${accion} el plan ${plan.Nombre}?`)) return;

    this.planService.actualizarPlan(plan.PlanId, { Active: nuevoEstado }).subscribe({
      next: () => {
        plan.Active = nuevoEstado;
      },
      error: (err) => {
        console.error('Error al cambiar estado del plan:', err);
        alert('No se pudo actualizar el estado del plan.');
      },
    });
  }
}
