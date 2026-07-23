import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../services/cliente';
import { Cliente } from '../../models/cliente.model'

@Component({
  selector: 'app-lista-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-cliente.html',
  styleUrl: './lista-cliente.scss',
})
export class ListaCliente implements OnInit {
  private clienteService = inject(ClienteService);

  clientes = signal<Cliente[]>([]);
  clienteSeleccionado = signal<Cliente | null>(null);
  loading = signal(false);
  
  ngOnInit(): void {
    this.loading.set(true);
    this.clienteService.getClientes().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar clientes',err);
        this.loading.set(false);
      }
    });
  }
  verDetalles(cliente: Cliente) {
    this.clienteSeleccionado.set(cliente);
  }
}

