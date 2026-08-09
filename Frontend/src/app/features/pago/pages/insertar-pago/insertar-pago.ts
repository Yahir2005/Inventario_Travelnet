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

  pago: PagoForm = {
    InstalacionId: 0,
    UsuarioId: null,
    Tipo_Pago: 'Efectivo',
    Numero_cuenta: '',
    Descuento: null,
    Monto: null,
    Estado_Pago: 'Completado'
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
