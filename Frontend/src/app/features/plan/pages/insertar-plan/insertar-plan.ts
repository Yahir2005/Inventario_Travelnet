import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PlanService } from '../../service/plan';
import { ModalidadTarifa, PlanTarifa } from '../../model/plan.model';

/**
 * ============================================================================
 * COMPONENTE: INSERTAR PLAN (insertar-plan.ts)
 * ============================================================================
 * Permite crear un nuevo paquete de internet definiendo su nombre, velocidad
 * en Mbps y una lista dinámica de tarifas (Mensual, Anual, etc.).
 */
@Component({
  selector: 'app-insertar-plan',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './insertar-plan.html',
  styleUrl: './insertar-plan.scss',
})
export class InsertarPlan {
  private planService = inject(PlanService);
  private router = inject(Router);

  guardando = signal(false);

  modalidades: ModalidadTarifa[] = [
    'Mensual', 'Bimestral', 'Trimestral', 'Cuatrimestral',
    'Quinquemestral', 'Semestral', 'Heptamestral', 'Octomestral',
    'Nonamestral', 'Decamestral', 'Oncemestral', 'Anual'
  ];

  plan = {
    Nombre: '',
    Velocidad_Mbps: 20,
    Active: true,
    Tarifas: [
      { Modalidad: 'Mensual' as ModalidadTarifa, Precio: 300 },
      { Modalidad: 'Anual' as ModalidadTarifa, Precio: 3000 }
    ] as PlanTarifa[]
  };

  /** Agrega una nueva fila de tarifa al formulario antes de guardar el plan */
  agregarTarifa(): void {
    this.plan.Tarifas.push({ Modalidad: 'Mensual', Precio: 0 });
  }

  /** Elimina una fila de tarifa según su posición en el arreglo */
  quitarTarifa(index: number): void {
    this.plan.Tarifas.splice(index, 1);
  }

  /** Valida y envía el nuevo plan con todas sus tarifas al servidor */
  guardarPlan(): void {
    if (!this.plan.Nombre.trim() || this.plan.Velocidad_Mbps <= 0) {
      alert('Ingresa el nombre del plan y una velocidad válida.');
      return;
    }

    this.guardando.set(true);
    this.planService.crearPlan({
      Nombre: this.plan.Nombre.trim(),
      Velocidad_Mbps: Number(this.plan.Velocidad_Mbps),
      Active: this.plan.Active,
      Tarifas: this.plan.Tarifas
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        alert('Plan registrado correctamente.');
        this.router.navigate(['/plan']);
      },
      error: (err) => {
        this.guardando.set(false);
        console.error('Error al crear plan:', err);
        alert('Error al guardar el plan.');
      }
    });
  }
}
