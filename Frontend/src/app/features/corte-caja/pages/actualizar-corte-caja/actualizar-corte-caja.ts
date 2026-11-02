import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CorteCajaService } from '../../service/corte-caja';
import { PagoService } from '../../../pago/services/pago';
import { PagoDetallado } from '../../../pago/models/pago.model';
import { Usuario } from '../../../usuario/models/usuario.model';

interface PagoCorte {
  PagoId: number;
  Cliente: string;
  Monto: number;
}

/**
 * ============================================================================
 * COMPONENTE: ACTUALIZAR CORTE DE CAJA (actualizar-corte-caja.ts)
 * ============================================================================
 * Permite a un Administrador modificar un corte de caja existente:
 * cambiar el empleado responsable, el autorizador, la fecha, o agregar/quitar
 * pagos del corte recalculando automáticamente el monto total.
 */
@Component({
  selector: 'app-actualizar-corte-caja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './actualizar-corte-caja.html',
  styleUrl: './actualizar-corte-caja.scss',
})
export class ActualizarCorteCaja implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private corteService = inject(CorteCajaService);
  private pagoService = inject(PagoService);

  esAdmin = false;
  loading = signal(true);
  guardando = signal(false);
  errorCarga = signal<string | null>(null);

  corteId = 0;
  usuarios: Usuario[] = [];

  form = {
    UsuarioId: null as number | null,
    Autorizador: '',
    FechaInput: ''
  };

  pagosEnCorte: PagoCorte[] = [];
  pagosDisponibles: PagoCorte[] = [];

  /** Verifica permisos de Administrador, obtiene el ID del corte de la URL y carga los datos */
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
      this.errorCarga.set('Corte de caja no especificado.');
      this.loading.set(false);
      return;
    }
    this.corteId = id;
    this.cargarDatos();
  }

  parsearPagos(valor: any): PagoCorte[] {
    if (!valor) return [];
    if (Array.isArray(valor)) return valor;
    try {
      const resultado = JSON.parse(valor);
      return Array.isArray(resultado) ? resultado : [];
    } catch {
      return [];
    }
  }

  /** Carga en paralelo (`forkJoin`) el corte actual, todos los cortes, los pagos y los usuarios */
  cargarDatos(): void {
    forkJoin({
      corte: this.corteService.getCortePorId(this.corteId),
      cortes: this.corteService.getCorteCaja(),
      pagos: this.pagoService.getPagos(),
      usuarios: this.corteService.getUsuarios()
    }).subscribe({
      next: ({ corte, cortes, pagos, usuarios }) => {
        this.usuarios = usuarios;

        this.form.UsuarioId = corte.UsuarioId ?? null;
        this.form.Autorizador = corte.Autorizador ?? '';
        this.form.FechaInput = this.convertirAFechaLocal(corte.FechaCorte);

        this.pagosEnCorte = this.parsearPagos(corte.Pagos_Incluidos);

        // Identifica qué pagos ya están metidos en OTROS cortes para no duplicarlos
        const usadosEnOtrosCortes = new Set<number>();
        for (const otro of cortes) {
          if (otro.CorteId === this.corteId) continue;
          for (const pago of this.parsearPagos(otro.Pagos_Incluidos)) {
            if (pago.PagoId) usadosEnOtrosCortes.add(pago.PagoId);
          }
        }

        this.pagosDisponibles = pagos
          .filter((p: PagoDetallado) =>
            p.Estado_Pago === 'Completado' &&
            !usadosEnOtrosCortes.has(p.PagoId!) &&
            !this.pagosEnCorte.some(x => x.PagoId === p.PagoId)
          )
          .map((p: PagoDetallado) => ({
            PagoId: p.PagoId!,
            Cliente: p.Nombre_Cliente,
            Monto: Number(p.Monto) || 0
          }));

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar el corte de caja', err);
        this.errorCarga.set('No se pudo cargar el corte de caja.');
        this.loading.set(false);
      }
    });
  }

  /** Convierte una fecha ISO al formato requerido por un input `<input type="datetime-local">` */
  convertirAFechaLocal(valor: string | undefined | null): string {
    if (!valor) return '';
    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
  }

  /** Calcula la suma total en dinero de los pagos actualmente incluidos en el corte */
  totalCorte(): number {
    return this.pagosEnCorte.reduce((suma, pago) => suma + (Number(pago.Monto) || 0), 0);
  }

  /** Pasa un pago de la lista de disponibles a la lista de incluidos en el corte */
  agregarPago(pago: PagoCorte): void {
    this.pagosDisponibles = this.pagosDisponibles.filter(p => p.PagoId !== pago.PagoId);
    this.pagosEnCorte = [...this.pagosEnCorte, pago];
  }

  /** Quita un pago del corte y lo devuelve a la lista de pagos disponibles */
  quitarPago(pago: PagoCorte): void {
    this.pagosEnCorte = this.pagosEnCorte.filter(p => p.PagoId !== pago.PagoId);
    this.pagosDisponibles = [...this.pagosDisponibles, pago]
      .sort((a, b) => b.PagoId - a.PagoId);
  }

  /** Guarda los cambios del corte de caja en el backend */
  guardar(): void {
    if (!this.form.UsuarioId) {
      alert('Selecciona el empleado dueño del corte.');
      return;
    }
    if (!this.form.Autorizador.trim()) {
      alert('El nombre de quien autoriza es obligatorio.');
      return;
    }
    if (this.pagosEnCorte.length === 0) {
      alert('El corte debe incluir al menos un pago. Si no aplica, elimina el corte.');
      return;
    }

    this.guardando.set(true);

    const payload: any = {
      UsuarioId: this.form.UsuarioId,
      Autorizador: this.form.Autorizador.trim(),
      MontoTotal: this.totalCorte(),
      Pagos_Incluidos: JSON.stringify(this.pagosEnCorte)
    };
    if (this.form.FechaInput) {
      payload.FechaCorte = `${this.form.FechaInput.replace('T', ' ')}:00`;
    }

    this.corteService.putCorteCaja(this.corteId, payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/Corte-Caja/lista']);
      },
      error: (err) => {
        console.error('Error al actualizar el corte', err);
        this.guardando.set(false);
        alert('Ocurrió un error al guardar los cambios del corte.');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/Corte-Caja/lista']);
  }
}
