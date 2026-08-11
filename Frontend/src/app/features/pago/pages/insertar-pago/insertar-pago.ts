import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PagoService } from '../../services/pago';
import { PagoDetallado, PagoForm } from '../../models/pago.model';

@Component({
  selector: 'app-insertar-pago',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './insertar-pago.html',
  styleUrl: './insertar-pago.scss',
})
export class InsertarPago implements OnInit {
  private pagoService = inject(PagoService);
  private router = inject(Router);

  instalaciones: PagoDetallado[] = [];
  loading = true;
  guardando = false;

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

  pago: PagoForm = {
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
    this.pago.UsuarioId = this.obtenerUsuarioActual();
    this.cargarInstalaciones();
  }

  cargarInstalaciones() {
    this.loading = true;
    this.pagoService.getPagos().subscribe({
      next: (data) => {
        this.instalaciones = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar las instalaciones', err);
        this.loading = false;
      }
    });
  }

  onInstalacionChange() {
    const inst = this.instalaciones.find(i => i.InstalacionId === Number(this.pago.InstalacionId));
    if (inst) {
      let mesInicio = new Date().getMonth() + 1;
      let anioInicio = new Date().getFullYear();

      if (inst.Ultimo_Mes_Pagado && inst.Ultimo_Anio_Pagado) {
        mesInicio = inst.Ultimo_Mes_Pagado + 1;
        anioInicio = inst.Ultimo_Anio_Pagado;
        if (mesInicio > 12) {
          mesInicio = 1;
          anioInicio++;
        }
      }

      this.pago.Mes = mesInicio;
      this.pago.Anio = anioInicio;
      this.pago.Cantidad_Meses = inst.Modalidad_Servicio ? (this.modalidadMesesMap[inst.Modalidad_Servicio] || 1) : 1;
      this.actualizarConcepto();
    }
  }

  actualizarConcepto() {
    const startMes = Number(this.pago.Mes) || 1;
    const startAnio = Number(this.pago.Anio) || new Date().getFullYear();
    const cant = Number(this.pago.Cantidad_Meses) || 1;

    const startMesObj = this.mesesLista.find(m => m.id === startMes);
    const startNombre = startMesObj ? startMesObj.nombre : '';

    if (cant === 1) {
      this.pago.Concepto = `Mensualidad ${startNombre} ${startAnio}`;
    } else {
      const endMesIndex = (startMes - 1 + cant - 1) % 12;
      const endAnio = startAnio + Math.floor((startMes - 1 + cant - 1) / 12);
      const endNombre = this.mesesLista[endMesIndex].nombre;
      this.pago.Concepto = `Pago de ${cant} meses (${startNombre} ${startAnio} - ${endNombre} ${endAnio})`;
    }
  }

  guardarPago() {
    if (!this.pago.InstalacionId) {
      alert('Selecciona una instalación.');
      return;
    }
    if (!this.pago.Monto || this.pago.Monto <= 0) {
      alert('El monto es obligatorio y debe ser mayor a 0.');
      return;
    }
    if (this.pago.Tipo_Pago !== 'Efectivo' && !this.pago.Numero_cuenta) {
      alert('Indica el número de cuenta para este tipo de pago.');
      return;
    }

    this.guardando = true;
    this.pagoService.crearPago(this.pago).subscribe({
      next: () => {
        this.guardando = false;
        alert('Pago registrado correctamente.');
        this.router.navigate(['/pago']);
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error al registrar el pago', err);
        alert('Ocurrió un error al registrar el pago.');
      }
    });
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

