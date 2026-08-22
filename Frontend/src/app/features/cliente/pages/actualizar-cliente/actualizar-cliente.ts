import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClienteService } from '../../services/cliente';

@Component({
  selector: 'app-actualizar-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './actualizar-cliente.html',
  styleUrl: './actualizar-cliente.scss',
})
export class ActualizarCliente implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clienteService = inject(ClienteService);

  clienteId: number | null = null;
  
  cargando = signal(true);
  guardando = signal(false);

  cliente = {
    Nombre_Cliente: '',
    Telefono: '',
    Direccion: '',
    TipoCliente: '' as '' | 'Fisica' | 'Moral'
  };

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

  cargarCliente(id: number) {
    this.clienteService.getClientePorId(id).subscribe({
      next: (data) => {
        this.cliente = {
          Nombre_Cliente: data.Nombre_Cliente || '',
          Telefono: data.Telefono || '',
          Direccion: data.Direccion || '',
          TipoCliente: (data.TipoCliente as 'Fisica' | 'Moral') || ''
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

  guardarCambios() {
    if (!this.clienteId) return;

    if (!this.cliente.Nombre_Cliente.trim() || !this.cliente.Telefono.trim() || !this.cliente.Direccion.trim() || !this.cliente.TipoCliente) {
      alert('Completa todos los campos correctamente.');
      return;
    }

    this.guardando.set(true);

    const datos = {
      Nombre_Cliente: this.cliente.Nombre_Cliente.trim(),
      Telefono: this.cliente.Telefono.trim(),
      Direccion: this.cliente.Direccion.trim(),
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