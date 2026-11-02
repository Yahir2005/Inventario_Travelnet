import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MensualidadService } from '../../services/mensualidad';
import { Mensualidad } from '../../model/mensualidad.model';

/**
 * ============================================================================
 * COMPONENTE: HISTORIAL DE MENSUALIDADES (lista-mensualidad.ts)
 * ============================================================================
 * Componente hijo que se incrusta dentro del modal de la pantalla de Pagos.
 * Recibe un `@Input() instalacionId`, muestra todos los meses pagados de esa
 * instalación y permite reimprimir recibos, editar o cancelar una mensualidad.
 */
@Component({
  selector: 'app-lista-mensualidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-mensualidad.html',
  styleUrl: './lista-mensualidad.scss',
})
export class ListaMensualidad implements OnInit, OnChanges {
  private mensualidadService = inject(MensualidadService);
  private router = inject(Router);

  // @Input recibe el ID de la instalación desde el componente padre (ListaPago)
  @Input() instalacionId?: number;
  // @Output avisa al componente padre cuando se cancela una mensualidad o se pide imprimir un ticket
  @Output() mensualidadActualizada = new EventEmitter<void>();
  @Output() imprimirTicket = new EventEmitter<Mensualidad>();

  mensualidades = signal<Mensualidad[]>([]);
  loading = signal(false);
  guardando = signal(false);

  /** Emite el evento al componente padre para que imprima el ticket de esta mensualidad */
  imprimir(m: Mensualidad) {
    this.imprimirTicket.emit(m);
  }

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

  /** Se ejecuta automáticamente cada vez que el usuario selecciona otra instalación en la tabla de Pagos */
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

  /** Consulta las mensualidades de la instalación seleccionada */
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

  editarMensualidad(mensualidad: Mensualidad): void {
    this.router.navigate(['/mensualidad/actualizar-mensualidad', mensualidad.MensualidadId]);
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

  /** Envía la solicitud de cancelación de mensualidad junto con el motivo obligatorio */
  confirmarCancelacion(): void {
    if (!this.mensualidadACancelar) return;

    if (!this.motivoCancelar.trim()) {
      alert('Debes ingresar el motivo de la baja del pago.');
      return;
    }

    this.guardando.set(true);
    const usuarioString = localStorage.getItem('usuario');
    const usuarioActual = usuarioString ? JSON.parse(usuarioString) : null;

    this.mensualidadService.cancelarMensualidad({
      MensualidadId: this.mensualidadACancelar.MensualidadId,
      PagoId: this.mensualidadACancelar.PagoId ?? null,
      UsuarioId: usuarioActual?.UsuarioId ?? null,
      Motivo: this.motivoCancelar.trim(),
      Observaciones: this.motivoCancelar.trim()
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

