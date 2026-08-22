import { Component, inject, Inject, OnInit,signal,Signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ClienteService } from "../../services/cliente";
import { ClienteDetallado } from "../../models/cliente-list-view.model";

@Component({
  selector: 'app-lista-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-cliente.html',
  styleUrls: ['./lista-cliente.scss']
})

export class ListaClienteComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private router = inject(Router);

  clientes = signal<ClienteDetallado[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.cargarClientes();
}
  cargarClientes(){
    this.loading.set(true);

    this.clienteService.obtenerListaDetallada().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar la lista de clientes',err);
        this.loading.set(false);
      }
    });
  }

  verDetalles(cliente:ClienteDetallado){
    console.log('Motrando detalles del cliente: ',cliente.Nombre_Cliente);
  }

  editarCliente(cliente:ClienteDetallado){
    this.router.navigate(['/cliente/actualizar-cliente', cliente.ClienteId]);
  }
}