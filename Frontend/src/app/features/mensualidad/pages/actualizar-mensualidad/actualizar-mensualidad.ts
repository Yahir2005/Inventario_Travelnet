import { Component, OnInit, inject, signal } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MensualidadService } from '../../services/mensualidad';

@Component({
  selector: 'app-actualizar-mensualidad',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './actualizar-mensualidad.html',
  styleUrl: './actualizar-mensualidad.scss',
})
export class ActualizarMensualidad implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mensualidadService = inject(MensualidadService);

  mensualidadId: number | null = null;
  
  cargando = signal(true);
  guardando = signal(false);

  mesesLista = [
    { id: 1, nombre: 'Enero' },
    { id: 2, nombre: 'Febrero' },
    { id: 3, nombre: 'Marzo' },
    { id: 4, nombre: 'Abril' },
    { id: 5, nombre: 'Mayo' },
    { id: 6, nombre: 'Junio' },
    { id: 7, nombre: 'Julio' },
    { id: 8, nombre: 'Agosto' },
    { id: 9, nombre: 'Septiembre' },
    { id: 10, nombre: 'Octubre' },
    { id: 11, nombre: 'Noviembre' },
    { id: 12, nombre: 'Diciembre' }
  ];

  estadosLista = ['Pendiente', 'Pagado', 'Vencido'];

  form = {
    InstalacionId: null as number | null,
    Mes: null as number | null,
    Anio: new Date().getFullYear(),
    Concepto: '',
    Monto: null as number | null,
    Estado: 'Pendiente',
    Active: true
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.mensualidadId = Number(id);
        this.cargarMensualidad(this.mensualidadId);
      } else {
        this.cargando.set(false); 
      }
    });
  }

  cargarMensualidad(id: number) {
    this.mensualidadService.getMensualidadPorId(id).subscribe({
      next: (data) => {
        this.form = {
          InstalacionId: data.InstalacionId ?? null,
          Mes: Number(data.Mes) || null,
          Anio: Number(data.Anio) || new Date().getFullYear(),
          Concepto: data.Concepto || '',
          Monto: data.Monto !== null && data.Monto !== undefined ? Number(data.Monto) : null,
          Estado: data.Estado || 'Pendiente',
          Active: Boolean(data.Active)
        };
        this.cargando.set(false); 
      },
      error: (err) => {
        console.error('Error al cargar la mensualidad', err);
        alert('No se pudo cargar la información de la mensualidad');
        this.cargando.set(false);
        this.router.navigate(['/pago']);
      }
    });
  }

  guardarCambios() {
    if (!this.mensualidadId) return;

    if (!this.form.Mes || !this.form.Anio || !this.form.Concepto.trim() || this.form.Monto === null || this.form.Monto < 0) {
      alert('Completa todos los campos correctamente.');
      return;
    }

    this.guardando.set(true);

    const datos = {
      InstalacionId: this.form.InstalacionId,
      Mes: Number(this.form.Mes),
      Anio: Number(this.form.Anio),
      Concepto: this.form.Concepto.trim(),
      Monto: Number(this.form.Monto),
      Estado: this.form.Estado,
      Active: this.form.Active
    };

    this.mensualidadService.actualizarMensualidad(this.mensualidadId, datos).subscribe({
      next: () => {
        this.guardando.set(false);
        alert('Mensualidad actualizada correctamente');
        this.router.navigate(['/pago']);
      },
      error: (err) => {
        this.guardando.set(false);
        console.error('Error al actualizar la mensualidad', err);
        alert('Ocurrió un error al actualizar la mensualidad');
      }
    });
  }
}