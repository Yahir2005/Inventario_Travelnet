import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PagoService } from '../../services/pago';
import { PagoDetallado, PagoForm } from '../../models/pago.model';

@Component({
  selector: 'app-lista-pago',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lista-pago.html',
  styleUrl: './lista-pago.scss',
})
export class ListaPago implements OnInit {
  private pagoService = inject(PagoService);

  pagos = signal<PagoDetallado[]>([]);
  loading = signal(true);
  cargando = signal(false);
  error = signal<string | null>(null);

  mostrarModal = false;
  pagoSeleccionado: PagoDetallado | null = null;

  tipoPagos = ['Efectivo', 'Transferencia', 'Cheque', 'Trueque', 'Paypal', 'MercadoPago', 'Pagaré'];
  estadosPago = ['Completado', 'Incompleto', 'Pendiente'];

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

  modalidadMesesMap: Record<string, number> = {
    'Mensual': 1,
    'Bimestral': 2,
    'Trimestral': 3,
    'Cuatrimestral': 4,
    'Quinquemestral': 5,
    'Semestral': 6,
    'Heptamestral': 7,
    'Octomestral': 8,
    'Nonamestral': 9,
    'Decamestral': 10,
    'Oncemestral': 11,
    'Anual': 12
  };

  formPago: PagoForm = {
    InstalacionId: 0,
    UsuarioId: null,
    Tipo_Pago: 'Efectivo',
    Numero_cuenta: '',
    Descuento: null,
    Monto: null,
    Estado_Pago: 'Completado',
    Mes: new Date().getMonth() + 1,
    Anio: new Date().getFullYear(),
    Cantidad_Meses: 1,
    Concepto: ''
  };

  ngOnInit(): void {
    this.pagoService.getPagos().subscribe({
      next: (data) => {
        this.pagos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las categorías');
        this.loading.set(false);
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.pagoSeleccionado = null;
  }

  registrarPago() {
    if (!this.formPago.Monto || this.formPago.Monto <= 0) {
      alert('El monto es obligatorio y debe ser mayor a 0.');
      return;
    }

    if (this.formPago.Tipo_Pago !== 'Efectivo' && !this.formPago.Numero_cuenta) {
      alert('Indica el número de cuenta para este tipo de pago.');
      return;
    }

    this.cargando.set(true);
    this.pagoService.crearPago(this.formPago).subscribe({
      next: () => {
        this.cargando.set(false);
        this.cerrarModal();
        this.ngOnInit();
        alert('Pago registrado correctamente.');
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error al registrar el pago', err);
        alert('Ocurrió un error al registrar el pago.');
      }
    });
  }

  abrirModal(pago: PagoDetallado) {
    this.pagoSeleccionado = pago;
    
    let mesInicio = new Date().getMonth() + 1;
    let anioInicio = new Date().getFullYear();

    if (pago.Ultimo_Mes_Pagado && pago.Ultimo_Anio_Pagado) {
      mesInicio = pago.Ultimo_Mes_Pagado + 1;
      anioInicio = pago.Ultimo_Anio_Pagado;
      if (mesInicio > 12) {
        mesInicio = 1;
        anioInicio++;
      }
    }

    const cantidadDefault = pago.Modalidad_Servicio ? (this.modalidadMesesMap[pago.Modalidad_Servicio] || 1) : 1;

    this.formPago = {
      InstalacionId: pago.InstalacionId,
      UsuarioId: this.obtenerUsuarioActual(),
      Tipo_Pago: 'Efectivo',
      Numero_cuenta: '',
      Descuento: null,
      Monto: null,
      Estado_Pago: 'Completado',
      Mes: mesInicio,
      Anio: anioInicio,
      Cantidad_Meses: cantidadDefault,
      Concepto: ''
    };

    this.actualizarConcepto();
    this.mostrarModal = true;
  }

  actualizarConcepto() {
    const startMes = Number(this.formPago.Mes) || 1;
    const startAnio = Number(this.formPago.Anio) || new Date().getFullYear();
    const cant = Number(this.formPago.Cantidad_Meses) || 1;

    const startMesObj = this.mesesLista.find(m => m.id === startMes);
    const startNombre = startMesObj ? startMesObj.nombre : '';

    if (cant === 1) {
      this.formPago.Concepto = `Mensualidad ${startNombre} ${startAnio}`;
    } else {
      const endMesIndex = (startMes - 1 + cant - 1) % 12;
      const endAnio = startAnio + Math.floor((startMes - 1 + cant - 1) / 12);
      const endNombre = this.mesesLista[endMesIndex].nombre;
      this.formPago.Concepto = `Pago de ${cant} meses (${startNombre} ${startAnio} - ${endNombre} ${endAnio})`;
    }
  }

  obtenerNombreMes(mesId?: number | null): string {
    if (!mesId) return '';
    const m = this.mesesLista.find(item => item.id === mesId);
    return m ? m.nombre : '';
  }

  private obtenerUsuarioActual(): number | null {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      return usuario.UsuarioId ?? null;
    }
    return null;
  }
}

