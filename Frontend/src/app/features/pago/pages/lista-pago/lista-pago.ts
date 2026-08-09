import { Component, inject, OnInit, Signal, signal } from '@angular/core';
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

  pagos = signal <PagoDetallado[]>([]);
  loading = signal(true);
  cargando = signal(false);
  error = signal<string | null>(null);

  mostrarModal = false;
  pagoSeleccionado: PagoDetallado | null = null;

  tipoPagos = ['Efectivo', 'Transferencia', 'Cheque', 'Trueque', 'Paypal', 'MercadoPago', 'Pagaré'];
  estadosPago = ['Completado', 'Incompleto', 'Pendiente'];

  formPago: PagoForm = {
    InstalacionId: 0,
    UsuarioId: null,
    Tipo_Pago: 'Efectivo',
    Numero_cuenta: '',
    Descuento: null,
    Monto: null,
    Estado_Pago: 'Completado'
  };


  ngOnInit(): void {
    this.pagoService.getPagos().subscribe({
      next: (data) => {
        this.pagos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las categorias');
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
    this.formPago = {
      InstalacionId: pago.InstalacionId,
      UsuarioId: this.obtenerUsuarioActual(),
      Tipo_Pago: 'Efectivo',
      Numero_cuenta: '',
      Descuento: null,
      Monto: null,
      Estado_Pago: 'Completado'
    };
    this.mostrarModal = true;
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
