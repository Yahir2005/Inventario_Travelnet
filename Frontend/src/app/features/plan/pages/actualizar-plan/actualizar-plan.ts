import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PlanService } from '../../service/plan';
import { ModalidadTarifa, PlanTarifa } from '../../model/plan.model';

/**
 * ============================================================================
 * COMPONENTE: ACTUALIZAR PLAN Y TARIFAS (actualizar-plan.ts)
 * ============================================================================
 * Permite editar el nombre, velocidad y estado activo de un plan de internet,
 * así como agregar, modificar o eliminar individualmente sus tarifas asociadas.
 */
@Component({
  selector: 'app-actualizar-plan',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './actualizar-plan.html',
  styleUrl: './actualizar-plan.scss',
})
export class ActualizarPlan implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private planService = inject(PlanService);

  planId = 0;
  cargando = signal(true);
  guardando = signal(false);

  modalidades: ModalidadTarifa[] = [
    'Mensual', 'Bimestral', 'Trimestral', 'Cuatrimestral',
    'Quinquemestral', 'Semestral', 'Heptamestral', 'Octomestral',
    'Nonamestral', 'Decamestral', 'Oncemestral', 'Anual'
  ];

  plan = {
    Nombre: '',
    Velocidad_Mbps: 20,
    Active: true
  };

  tarifas = signal<PlanTarifa[]>([]);
  nuevaTarifa: PlanTarifa = { Modalidad: 'Mensual', Precio: 0 };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.planId = id;
      this.cargarPlan(id);
    } else {
      this.cargando.set(false);
    }
  }

  /** Obtiene los datos del plan y su lista de tarifas desde el servidor */
  cargarPlan(id: number): void {
    this.planService.getPlanPorId(id).subscribe({
      next: (data) => {
        this.plan = {
          Nombre: data.Nombre,
          Velocidad_Mbps: data.Velocidad_Mbps,
          Active: data.Active ?? true
        };
        this.tarifas.set(data.Tarifas || []);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar plan:', err);
        alert('No se pudo cargar el plan.');
        this.cargando.set(false);
        this.router.navigate(['/plan']);
      }
    });
  }

  /** Guarda los cambios generales del plan (Nombre, Velocidad_Mbps, Active) */
  guardarCambios(): void {
    if (!this.planId) return;
    this.guardando.set(true);
    this.planService.actualizarPlan(this.planId, this.plan).subscribe({
      next: () => {
        this.guardando.set(false);
        alert('Plan actualizado correctamente.');
        this.router.navigate(['/plan']);
      },
      error: (err) => {
        this.guardando.set(false);
        console.error('Error al actualizar plan:', err);
        alert('Error al actualizar el plan.');
      }
    });
  }

  /** Crea inmediatamente una nueva tarifa asociada a este plan en la base de datos */
  agregarTarifa(): void {
    if (!this.planId) return;
    this.planService.crearTarifa({
      PlanId: this.planId,
      Modalidad: this.nuevaTarifa.Modalidad,
      Precio: Number(this.nuevaTarifa.Precio)
    }).subscribe({
      next: (creada) => {
        this.tarifas.set([...this.tarifas(), creada]);
        this.nuevaTarifa = { Modalidad: 'Mensual', Precio: 0 };
      },
      error: (err) => {
        console.error('Error al agregar tarifa:', err);
        alert('No se pudo agregar la tarifa (verifica que la modalidad no esté duplicada).');
      }
    });
  }

  /** Guarda los cambios de modalidad o precio de una tarifa individual */
  actualizarTarifaExistente(t: PlanTarifa): void {
    if (!t.TarifaId) return;
    this.planService.actualizarTarifa(t.TarifaId, {
      Modalidad: t.Modalidad,
      Precio: Number(t.Precio)
    }).subscribe({
      next: () => alert('Tarifa actualizada.'),
      error: (err) => {
        console.error('Error al actualizar tarifa:', err);
        alert('No se pudo actualizar la tarifa.');
      }
    });
  }

  /** Elimina una tarifa del plan si no está en uso por alguna instalación */
  eliminarTarifaExistente(t: PlanTarifa): void {
    if (!t.TarifaId) return;
    if (!confirm(`¿Eliminar la tarifa ${t.Modalidad}?`)) return;
    this.planService.eliminarTarifa(t.TarifaId).subscribe({
      next: () => {
        this.tarifas.set(this.tarifas().filter(item => item.TarifaId !== t.TarifaId));
      },
      error: (err) => {
        console.error('Error al eliminar tarifa:', err);
        alert('No se pudo eliminar la tarifa (puede estar asignada a una instalación).');
      }
    });
  }
}
