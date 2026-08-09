import { Component, inject, OnInit } from '@angular/core';
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

  pagos: PagoDetallado[] = [];
  loading = true;
  cargando = false;

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
    this.cargarPagos();
  }

  cargarPagos() {
    this.loading = true;
    this.pagoService.getPagos().subscribe({
      next: (data) => {
        this.pagos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar los pagos', err);
        this.loading = false;
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

    this.cargando = true;
    this.pagoService.crearPago(this.formPago).subscribe({
      next: () => {
        this.cargando = false;
        this.cerrarModal();
        this.cargarPagos();
        alert('Pago registrado correctamente.');
      },
      error: (err) => {
        this.cargando = false;
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
