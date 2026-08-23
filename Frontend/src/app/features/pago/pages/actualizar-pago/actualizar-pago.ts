import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PagoService } from '../../services/pago';

@Component({
  selector: 'app-actualizar-pago',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './actualizar-pago.html',
  styleUrl: './actualizar-pago.scss',
})
export class ActualizarPago implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pagoService = inject(PagoService);

  pagoId: number | null = null;
  
  cargando = signal(true);
  guardando = signal(false);

  tiposPago = ['Efectivo', 'Transferencia', 'Cheque', 'Trueque', 'Paypal', 'MercadoPago', 'Pagaré'];
  estadosLista = ['Completado', 'Incompleto', 'Pendiente'];

  form = {
    InstalacionId: null as number | null,
    UsuarioId: null as number | null,
    Tipo_Pago: 'Efectivo' as string,
    Numero_cuenta: '',
    Descuento: 0 as number | null,
    Monto: null as number | null,
    Estado_Pago: 'Completado' as string
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.pagoId = Number(id);
        this.cargarPago(this.pagoId);
      } else {
        this.cargando.set(false);
      }
    });
  }

  cargarPago(id: number) {
    this.pagoService.getPago(id).subscribe({
      next: (data) => {
        this.form = {
          InstalacionId: data.InstalacionId ?? null,
          UsuarioId: data.UsuarioId ?? null,
          Tipo_Pago: data.Tipo_Pago || 'Efectivo',
          Numero_cuenta: data.Numero_cuenta || '',
          Descuento: data.Descuento !== null && data.Descuento !== undefined ? Number(data.Descuento) : 0,
          Monto: data.Monto !== null && data.Monto !== undefined ? Number(data.Monto) : null,
          Estado_Pago: data.Estado_Pago || 'Completado'
        };
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar el pago', err);
        alert('No se pudo cargar la información del pago');
        this.cargando.set(false);
        this.router.navigate(['/pago']);
      }
    });
  }

  guardarCambios() {
    if (!this.pagoId) return;

    if (this.form.Monto === null || this.form.Monto <= 0) {
      alert('El monto debe ser mayor a cero.');
      return;
    }

    if (!this.form.InstalacionId) {
      alert('El pago no tiene una instalación asociada válida.');
      return;
    }

    if (this.form.Tipo_Pago !== 'Efectivo' && !this.form.Numero_cuenta.trim()) {
      alert('Para pagos que no son en efectivo debes capturar el número de cuenta o referencia.');
      return;
    }

    this.guardando.set(true);

    const datos = {
      InstalacionId: this.form.InstalacionId,
      UsuarioId: this.form.UsuarioId,
      Tipo_Pago: this.form.Tipo_Pago,
      Numero_cuenta: this.form.Numero_cuenta.trim(),
      Descuento: this.form.Descuento || 0,
      Estado_Pago: this.form.Estado_Pago,
      Monto: Number(this.form.Monto)
    };

    this.pagoService.actualizarPago(this.pagoId, datos).subscribe({
      next: () => {
        this.guardando.set(false);
        alert('Pago actualizado correctamente');
        this.router.navigate(['/pago']);
      },
      error: (err) => {
        this.guardando.set(false);
        console.error('Error al actualizar el pago', err);
        alert('Ocurrió un error al actualizar el pago');
      }
    });
  }
}