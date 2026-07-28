import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../services/cliente';
import { ClienteListView } from '../../models/cliente-list-view.model';

@Component({
  selector: 'app-lista-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-cliente.html',
  styleUrl: './lista-cliente.scss',
})
export class ListaCliente implements OnInit {
  clientes = signal<ClienteListView[]>([]);
  loading = signal<boolean>(true);

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.clienteService.getClientesListView().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        this.loading.set(false);
      },
    });
  }

  verDetalles(cliente: ClienteListView): void {
    console.log(cliente);
    // TODO: navegar a detalles o abrir modal
  }
}