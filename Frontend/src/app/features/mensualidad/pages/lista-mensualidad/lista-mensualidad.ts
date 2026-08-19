import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MensualidadService } from '../../services/mensualidad';
import { Mensualidad } from '../../model/mensualidad.model';

@Component({
  selector: 'app-lista-mensualidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-mensualidad.html',
  styleUrl: './lista-mensualidad.scss',
})
export class ListaMensualidad implements OnInit, OnChanges {
  private mensualidadService = inject(MensualidadService);

  @Input() instalacionId?: number;
  @Output() mensualidadActualizada = new EventEmitter<void>();

  mensualidades = signal<Mensualidad[]>([]);
  loading = signal(false);
  guardando = signal(false);

  mostrarModalCancelar = false;
  mensualidadACancelar: Mensualidad | null = null;
  motivoCancelar = '';

  esAdmin: boolean =false;

  mesesNombre = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  ngOnInit(): void {
    this.verificarPermisos();
    if (this.instalacionId) {
      this.cargarMensualidades();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['instalacionId'] && this.instalacionId) {
      this.cargarMensualidades();
    }
  }

  verificarPermisos(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      this.esAdmin = (usuario.Ocupacion === 'Administrador');
    }
  }

  cargarMensualidades(): void {
    if (!this.instalacionId) return;
    this.loading.set(true);
    this.mensualidadService.getMensualidadesPorInstalacion(this.instalacionId).subscribe({
      next: (data) => {
        this.mensualidades.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar las mensualidades', err);
        this.loading.set(false);
      }
    });
  }

  obtenerNombreMes(numMes: number): string {
    return this.mesesNombre[numMes] || `Mes ${numMes}`;
  }

  abrirModalCancelar(mensualidad: Mensualidad): void {
    this.mensualidadACancelar = mensualidad;
    this.motivoCancelar = '';
    this.mostrarModalCancelar = true;
  }

  cerrarModalCancelar(): void {
    this.mostrarModalCancelar = false;
    this.mensualidadACancelar = null;
    this.motivoCancelar = '';
  }

  confirmarCancelacion(): void {
    if (!this.mensualidadACancelar) return;

    if (!this.motivoCancelar.trim()) {
      alert('Debes ingresar el motivo de la baja del pago.');
      return;
    }

    this.guardando.set(true);
    this.mensualidadService.cancelarMensualidad({
      MensualidadId: this.mensualidadACancelar.MensualidadId,
      Motivo: this.motivoCancelar.trim()
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModalCancelar();
        this.cargarMensualidades();
        this.mensualidadActualizada.emit();
        alert('El pago de la mensualidad ha sido dado de baja correctamente.');
      },
      error: (err) => {
        this.guardando.set(false);
        console.error('Error al dar de baja la mensualidad', err);
        alert('Ocurrió un error al dar de baja el pago de la mensualidad.');
      }
    });
  }
}

