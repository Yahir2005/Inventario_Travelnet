import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ClienteService } from "../../services/cliente";
import { ClienteDetallado } from "../../models/cliente-list-view.model";

/**
 * Lista fija con todas las modalidades de pago posibles en el servicio de internet.
 * Se utiliza para llenar el menú desplegable de filtros en la vista.
 */
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

/**
 * COMPONENTE: LISTA DE CLIENTES (ListaClienteComponent)
 * -----------------------------------------------------
 * Muestra la tabla general de clientes, permite buscarlos por nombre o teléfono,
 * filtrarlos por tipo de conexión (Antena/Fibra), modalidad o adeudo, y abrir
 * un modal con el detalle de todas las instalaciones y contraseñas Wi-Fi de cada cliente.
 */
@Component({
  selector: 'app-lista-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-cliente.html',
  styleUrls: ['./lista-cliente.scss']
})

export class ListaClienteComponent implements OnInit {
  // Inyección del servicio de clientes (para pedir datos al Backend) y del Router (para cambiar de página)
  private clienteService = inject(ClienteService);
  private router = inject(Router);

  // `signal` es una variable reactiva de Angular: cuando su valor cambia con `.set()`,
  // la tabla HTML se actualiza automáticamente en pantalla.
  clientes = signal<ClienteDetallado[]>([]);
  loading = signal<boolean>(true);

  // Guardan el cliente que el usuario seleccionó al presionar "Detalles" y la lista de sus instalaciones
  clienteSeleccionado: ClienteDetallado | null = null;
  instalacionesCliente: any[] = [];

  modalidades = MODALIDADES;

  // Variables conectadas a los controles de ordenamiento y filtrado de la parte superior de la tabla
  ordenCampo: '' | 'nombre' | 'id' | 'adeudo' | 'pago' = '';
  ordenDireccion: 'asc' | 'desc' = 'asc';

  filtroTipo: '' | 'Antena' | 'Fibra' = '';
  filtroModalidad: '' | (typeof MODALIDADES)[number] = '';
  soloConAdeudo = false;

  terminoBusqueda = '';
  esAdmin = false;

  /**
   * `ngOnInit` se ejecuta automáticamente cuando el usuario entra a la pantalla `/cliente`.
   * 1. Revisa en `localStorage` si el usuario conectado es `Administrador` (para mostrar botones de edición).
   * 2. Llama a `cargarClientes()` para pedir la lista al servidor.
   */
  ngOnInit(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      this.esAdmin = (usuario.Rol || usuario.Ocupacion) === 'Administrador';
    }
    this.cargarClientes();
  }

  /**
   * Solicita al servicio la lista detallada de clientes.
   * Mientras espera la respuesta activa el indicador de carga (`loading.set(true)`).
   */
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

  /**
   * Cambia la dirección del ordenamiento entre Ascendente (A-Z / menor a mayor) y Descendente (Z-A / mayor a menor).
   */
  alternarOrden(){
    this.ordenDireccion = this.ordenDireccion === 'asc' ? 'desc' : 'asc';
  }

  /**
   * Restablece todos los filtros y el cuadro de búsqueda a su estado inicial vacío.
   */
  limpiarFiltros(){
    this.filtroTipo = '';
    this.filtroModalidad = '';
    this.soloConAdeudo = false;
    this.terminoBusqueda = '';
  }

  /**
   * Como un mismo cliente puede tener más de una instalación en la consulta SQL,
   * este método agrupa por `ClienteId` para que cada cliente aparezca una sola vez
   * en la tabla principal (conservando el registro con el pago más reciente).
   */
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

  /**
   * Calcula en tiempo real la lista de clientes que se muestra en la tabla HTML,
   * aplicando primero los filtros seleccionados (tipo, modalidad, adeudo, texto de búsqueda)
   * y finalmente ordenando la lista según el criterio elegido.
   */
  clientesVista(): ClienteDetallado[] {
    let lista = this.clientesUnicos();

    // 1. Filtrar por tipo de conexión (Antena o Fibra)
    if (this.filtroTipo) {
      lista = lista.filter(c => c.Tipo === this.filtroTipo);
    }
    // 2. Filtrar por modalidad de pago (Mensual, Bimestral, etc.)
    if (this.filtroModalidad) {
      lista = lista.filter(c => c.Modalidad_Servicio === this.filtroModalidad);
    }
    // 3. Filtrar únicamente clientes con pago atrasado
    if (this.soloConAdeudo) {
      lista = lista.filter(c => c.Atrasado === true);
    }

    // 4. Filtrar por texto escrito en el buscador (busca coincidencias en Nombre o Teléfono)
    const termino = this.terminoBusqueda.trim().toLowerCase();
    if (termino) {
      lista = lista.filter(c =>
        c.Nombre_Cliente.toLowerCase().includes(termino) ||
        (c.Telefono ?? '').toLowerCase().includes(termino)
      );
    }

    // 5. Si no se eligió un campo para ordenar, devolver la lista filtrada tal cual
    if (!this.ordenCampo) {
      return lista;
    }

    // 6. Ordenar la lista según el campo seleccionado (nombre, id, días de atraso o fecha de pago)
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

  /**
   * Se ejecuta al presionar el botón "Detalles" de un cliente.
   * Guarda el cliente seleccionado y busca todas las instalaciones que le pertenecen
   * para mostrarlas dentro de la ventana emergente (modal).
   */
  verDetalles(cliente: ClienteDetallado) {
    this.clienteSeleccionado = cliente;
    
    // Filtrar las instalaciones de este cliente
    this.instalacionesCliente = this.clientes()
      .filter(c => c.ClienteId === cliente.ClienteId && c.InstalacionId)
      .map(inst => ({
        ...inst,
        mostrarWifi: false // propiedad para alternar la visibilidad de la contraseña
      }));
  }

  /**
   * Muestra u oculta el nombre de red y contraseña Wi-Fi de una instalación dentro del modal de detalles.
   */
  toggleWifi(inst: any) {
    inst.mostrarWifi = !inst.mostrarWifi;
  }

  /**
   * Redirige al formulario de edición llevando el ID del cliente en la URL.
   */
  editarCliente(cliente:ClienteDetallado){
    this.router.navigate(['/cliente/actualizar-cliente', cliente.ClienteId]);
  }

  /**
   * Redirige a la pantalla de registro de pagos.
   */
  registrarPago(cliente:ClienteDetallado){
    this.router.navigate(['/pago/insertar']);
  }
}
