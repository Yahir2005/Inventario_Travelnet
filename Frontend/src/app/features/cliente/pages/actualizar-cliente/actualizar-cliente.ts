import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClienteService } from '../../services/cliente';

/**
 * COMPONENTE: ACTUALIZAR CLIENTE (ActualizarCliente)
 * --------------------------------------------------
 * Permite consultar los datos actuales de un cliente por su ID y modificarlos.
 * Se accede desde la ruta `/cliente/actualizar-cliente/:id`.
 */
@Component({
  selector: 'app-actualizar-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './actualizar-cliente.html',
  styleUrl: './actualizar-cliente.scss',
})
export class ActualizarCliente implements OnInit {
  // `ActivatedRoute` permite leer el parámetro `:id` que viene en la barra de direcciones (URL)
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clienteService = inject(ClienteService);

  // Guarda el ID numérico del cliente que estamos editando
  clienteId: number | null = null;
  
  // Señales reactivas para mostrar el spinner al cargar datos o al guardar cambios
  cargando = signal(true);
  guardando = signal(false);

  // Objeto conectado a los campos del formulario de edición
  cliente = {
    Nombre_Cliente: '',
    Telefono: '',
    Calle: '',
    Numero: '',
    Colonia: '',
    Codigo_Postal: '',
    Direccion: '',
    Saldo_Actual: 0,
    TipoCliente: '' as '' | 'Fisica' | 'Moral'
  };

  /**
   * Al iniciar la pantalla, lee el parámetro `id` de la URL y llama a `cargarCliente()`.
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.clienteId = Number(id);
        this.cargarCliente(this.clienteId);
      } else {
        this.cargando.set(false);
      }
    });
  }

  /**
   * Pide al servidor (`GET /api/cliente/:id`) los datos actuales del cliente
   * y rellena el formulario para que el usuario pueda editarlos.
   */
  cargarCliente(id: number) {
    this.clienteService.getClientePorId(id).subscribe({
      next: (data) => {
        this.cliente = {
          Nombre_Cliente: data.Nombre_Cliente || '',
          Telefono: data.Telefono || '',
          Calle: data.Calle || data.Direccion || '',
          Numero: data.Numero || '',
          Colonia: data.Colonia || '',
          Codigo_Postal: data.Codigo_Postal || '',
          Direccion: data.Direccion || '',
          Saldo_Actual: Number(data.Saldo_Actual) || 0,
          TipoCliente: (data.TipoCliente as 'Fisica' | 'Moral') || 'Fisica'
        };
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar el cliente', err);
        alert('No se pudo cargar la información del cliente');
        this.cargando.set(false);
        this.router.navigate(['/cliente']);
      }
    });
  }

  /**
   * Se ejecuta al enviar el formulario ("Guardar Cambios").
   * Limpia espacios en blanco (`.trim()`), verifica que los campos obligatorios estén completos
   * y envía la petición `PUT /api/cliente/:id` al servidor.
   */
  guardarCambios() {
    if (!this.clienteId) return;

    const calleFinal = this.cliente.Calle.trim() || this.cliente.Direccion.trim();
    if (!this.cliente.Nombre_Cliente.trim() || !this.cliente.Telefono.trim() || !calleFinal || !this.cliente.TipoCliente) {
      alert('Completa todos los campos obligatorios correctamente.');
      return;
    }

    this.guardando.set(true);

    const datos = {
      Nombre_Cliente: this.cliente.Nombre_Cliente.trim(),
      Telefono: this.cliente.Telefono.trim(),
      Calle: calleFinal,
      Numero: this.cliente.Numero.trim() || null,
      Colonia: this.cliente.Colonia.trim() || null,
      Codigo_Postal: this.cliente.Codigo_Postal.trim() || null,
      TipoCliente: this.cliente.TipoCliente
    };

    this.clienteService.putCliente(this.clienteId, datos).subscribe({
      next: () => {
        this.guardando.set(false);
        alert('Cliente actualizado correctamente');
        this.router.navigate(['/cliente']);
      },
      error: (err) => {
        this.guardando.set(false);
        console.error('Error al actualizar el cliente', err);
        alert('Ocurrió un error al actualizar el cliente');
      }
    });
  }
}