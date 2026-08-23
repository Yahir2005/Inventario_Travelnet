import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ClienteService } from "../../services/cliente";
import { ClienteDetallado } from "../../models/cliente-list-view.model";

const MODALIDADES = [
  'Mensual',
  'Bimestral',
  'Trimestral',
  'Cuatrimestral',
  'Quinquemestral',
  'Semestral',
  'Heptamestral',
  'Octomestral',
  'Nonamestral',
  'Decamestral',
  'Oncemestral',
  'Anual'
] as const;

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

  modalidades = MODALIDADES;

  ordenCampo: '' | 'nombre' | 'id' | 'adeudo' | 'pago' = '';
  ordenDireccion: 'asc' | 'desc' = 'asc';

  filtroTipo: '' | 'Antena' | 'Fibra' = '';
  filtroModalidad: '' | (typeof MODALIDADES)[number] = '';
  soloConAdeudo = false;

  terminoBusqueda = '';
  esAdmin = false;

  ngOnInit(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      this.esAdmin = usuario.Ocupacion === 'Administrador';
    }
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

  alternarOrden(){
    this.ordenDireccion = this.ordenDireccion === 'asc' ? 'desc' : 'asc';
  }

  limpiarFiltros(){
    this.filtroTipo = '';
    this.filtroModalidad = '';
    this.soloConAdeudo = false;
    this.terminoBusqueda = '';
  }

  clientesUnicos(): ClienteDetallado[] {
    const porCliente = new Map<number, ClienteDetallado>();
    for (const cliente of this.clientes()) {
      const actual = porCliente.get(cliente.ClienteId);
      if (!actual || ((cliente.PagoId ?? -1) > (actual.PagoId ?? -1))) {
        porCliente.set(cliente.ClienteId, cliente);
      }
    }
    return [...porCliente.values()];
  }

  clientesVista(): ClienteDetallado[] {
    let lista = this.clientesUnicos();

    if (this.filtroTipo) {
      lista = lista.filter(c => c.Tipo === this.filtroTipo);
    }
    if (this.filtroModalidad) {
      lista = lista.filter(c => c.Modalidad_Servicio === this.filtroModalidad);
    }
    if (this.soloConAdeudo) {
      lista = lista.filter(c => c.Atrasado === true);
    }

    const termino = this.terminoBusqueda.trim().toLowerCase();
    if (termino) {
      lista = lista.filter(c =>
        c.Nombre_Cliente.toLowerCase().includes(termino) ||
        (c.Telefono ?? '').toLowerCase().includes(termino)
      );
    }

    if (!this.ordenCampo) {
      return lista;
    }

    const direccion = this.ordenDireccion === 'asc' ? 1 : -1;
    return [...lista].sort((a, b) => {
      switch (this.ordenCampo) {
        case 'nombre':
          return direccion * a.Nombre_Cliente.localeCompare(b.Nombre_Cliente, 'es', { sensitivity: 'base' });
        case 'id':
          return direccion * (a.ClienteId - b.ClienteId);
        case 'adeudo':
          return direccion * ((a.Dias_Atraso ?? 0) - (b.Dias_Atraso ?? 0));
        case 'pago': {
          const fa = a.Fecha_Pago ? new Date(a.Fecha_Pago).getTime() : null;
          const fb = b.Fecha_Pago ? new Date(b.Fecha_Pago).getTime() : null;
          if (fa === null && fb === null) return 0;
          if (fa === null) return 1;
          if (fb === null) return -1;
          return direccion * (fa - fb);
        }
        default:
          return 0;
      }
    });
  }

  verDetalles(cliente:ClienteDetallado){
    console.log('Motrando detalles del cliente: ',cliente.Nombre_Cliente);
  }

  editarCliente(cliente:ClienteDetallado){
    this.router.navigate(['/cliente/actualizar-cliente', cliente.ClienteId]);
  }

  registrarPago(cliente:ClienteDetallado){
    this.router.navigate(['/pago/insertar']);
  }
}
