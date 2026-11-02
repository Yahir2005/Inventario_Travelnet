import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PagoService } from '../../services/pago';
import { SyncService } from '../../services/sync.service';
import { PagoDetallado, PagoForm } from '../../models/pago.model';
import { ListaMensualidad } from '../../../mensualidad/pages/lista-mensualidad/lista-mensualidad';
import { UsuarioService } from '../../../usuario/services/usuario';
import * as XLSX from 'xlsx';

/**
 * ============================================================================
 * COMPONENTE: LISTA DE PAGOS Y COBRANZA (lista-pago.ts)
 * ============================================================================
 * Es el panel principal de cobranza donde los cajeros y administradores pueden:
 * 1. Ver todas las instalaciones y si están al corriente o atrasadas.
 * 2. Filtrar por cliente, localidad, plan o modalidad.
 * 3. Cobrar mensualidades desde un modal rápido (con soporte Offline) e imprimir tickets térmicos.
 * 4. Ver el historial de mensualidades de cada instalación (`ListaMensualidad`).
 * 5. Realizar el Corte de Caja del turno (con autorización de Administrador) y exportar a Excel.
 */
@Component({
  selector: 'app-lista-pago',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ListaMensualidad],
  templateUrl: './lista-pago.html',
  styleUrl: './lista-pago.scss',
})
export class ListaPago implements OnInit {
  private pagoService = inject(PagoService);
  private syncService = inject(SyncService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  // Signals reactivos para la lista de pagos y estados de carga
  pagos = signal<PagoDetallado[]>([]);
  loading = signal(true);
  cargando = signal(false);
  error = signal<string | null>(null);
  pagosFiltrados: PagoDetallado[] = [];
  terminoBusqueda = '';
  filtroLocalidad = '';
  filtroPlan = '';
  filtroModalidad = '';

  /** Extrae automáticamente las localidades únicas para llenar el filtro desplegable */
  get localidadesDisponibles(): string[] {
    return [...new Set(this.pagos().map(p => p.Localidad).filter(l => Boolean(l)))].sort() as string[];
  }

  /** Extrae automáticamente los planes únicos para llenar el filtro desplegable */
  get planesDisponibles(): string[] {
    return [...new Set(this.pagos().map(p => p.Plan).filter(p => Boolean(p)))].sort() as string[];
  }

  /** Extrae automáticamente las modalidades únicas para llenar el filtro desplegable */
  get modalidadesDisponibles(): string[] {
    return [...new Set(this.pagos().map(p => p.Modalidad_Servicio).filter(m => Boolean(m)))].sort() as string[];
  }
  
  // Variables de control para el modal de cobro rápido
  mostrarModal = false;
  pagoSeleccionado: PagoDetallado | null = null;

  // Variables de control para el modal de Corte de Caja
  mostrarModalCorte = false;
  totalCorteCaja = 0;
  pagosDelCorte: any[] = [];
  
  authAdmin = { Usuario: '', Password: '' };
  cargandoAuth = false;
  errorAuth = '';

  // Variables de control para el modal de historial de mensualidades
  mostrarModalMensualidades = false;
  pagoMensualidadesSeleccionado: PagoDetallado | null = null;

  tipoPagos = ['Efectivo', 'Transferencia', 'Cheque', 'Trueque', 'Paypal', 'MercadoPago', 'Pagaré'];
  estadosPago = ['Completado', 'Incompleto', 'Pendiente'];

  mesesLista = [
    { id: 1, nombre: 'Enero' },
    { id: 2, nombre: 'Febrero' },
    { id: 3, nombre: 'Marzo' },
    { id: 4, nombre: 'Abril' },
    { id: 5, nombre: 'Mayo' },
    { id: 6, nombre: 'Junio' },
    { id: 7, nombre: 'Julio' },
    { id: 8, nombre: 'Agosto' },
    { id: 9, nombre: 'Septiembre' },
    { id: 10, nombre: 'Octubre' },
    { id: 11, nombre: 'Noviembre' },
    { id: 12, nombre: 'Diciembre' }
  ];

  // Mapa para saber cuántos meses cubre cada modalidad de pago automáticamente
  modalidadMesesMap: Record<string, number> = {
    'Mensual': 1,
    'Bimestral': 2,
    'Trimestral': 3,
    'Cuatrimestral': 4,
    'Quinquemestral': 5,
    'Semestral': 6,
    'Heptamestral': 7,
    'Octomestral': 8,
    'Nonamestral': 9,
    'Decamestral': 10,
    'Oncemestral': 11,
    'Anual': 12
  };

  formPago: PagoForm = {
    InstalacionId: 0,
    UsuarioId: null,
    Tipo_Pago: 'Efectivo',
    Numero_cuenta: '',
    Descuento: null,
    Monto: null,
    Estado_Pago: 'Completado',
    Mes: new Date().getMonth() + 1,
    Anio: new Date().getFullYear(),
    Cantidad_Meses: 1,
    Concepto: ''
  };

  esAdmin: boolean =false;
  exportando = signal(false);

  ngOnInit(): void {
    this.verificarPermisos();
    this.cargarPagos();
  }

  /** Carga la lista de instalaciones y su último estado de pago desde el backend o caché local */
  cargarPagos(): void {
    this.loading.set(true);
    this.pagoService.getPagos().subscribe({
      next: (data) => {
        this.pagos.set(data);
        this.aplicarFiltro();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los pagos.');
        console.error('Error al cargar los pagos', err);
        this.loading.set(false);
      }
    });
  }

  /** Comprueba si el usuario actual tiene rol de Administrador */
  verificarPermisos(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      this.esAdmin = (usuario.Ocupacion === 'Administrador');
    }
  }

  /** Formatea una fecha a YYYY-MM-DD respetando la zona horaria local */
  private obtenerFechaLocalISO(fecha: Date = new Date()): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  /** Consulta los pagos en efectivo pendientes de corte del usuario actual y abre el modal de Corte de Caja */
  prepararCorteCaja(){
    const miUsuarioId = this.obtenerUsuarioActual();
    this.totalCorteCaja = 0;
    this.pagosDelCorte = [];
    this.authAdmin = { Usuario: '', Password: '' };
    this.errorAuth = '';

    this.pagoService.getPagosPendientesCorte(miUsuarioId).subscribe({
      next: (pagosPendientes) => {
        this.pagosDelCorte = pagosPendientes || [];
        this.totalCorteCaja = this.pagosDelCorte.reduce((acc, p) => acc + (Number(p.Monto) || 0), 0);
        this.mostrarModalCorte = true;
      },
      error: () => {
        const hoyISO = this.obtenerFechaLocalISO();
        this.pagosDelCorte = this.pagos().filter(p => {
          if (!p.Fecha_Pago || !p.Pago_UsuarioId) return false;
          const fechaPagoStr = this.obtenerFechaLocalISO(new Date(p.Fecha_Pago));
          return (fechaPagoStr === hoyISO) &&
                 (Number(p.Pago_UsuarioId) === miUsuarioId) &&
                 (p.Tipo_Pago === 'Efectivo') &&
                 (p.Estado_Pago === 'Completado');
        });
        this.totalCorteCaja = this.pagosDelCorte.reduce((acc, p) => acc + (Number(p.Monto) || 0), 0);
        this.mostrarModalCorte = true;
      }
    });
  }

  cerrarModalCorte() {
    this.mostrarModalCorte = false;
  }

  /** Verifica las credenciales de un Administrador para autorizar el cierre de caja de un empleado */
  autorizarCorte(imprimir: boolean = true){
    this.cargandoAuth = true;
    this.errorAuth = '';

    this.usuarioService.autorizarAdmin(this.authAdmin).subscribe({
      next: (respuesta) => {
        this.cargandoAuth = false;

        const usuarioAdmin = respuesta.user;

          if (usuarioAdmin && usuarioAdmin.Ocupacion === 'Administrador') {
            this.cerrarModalCorte();
            this.ejecutarCorte(usuarioAdmin.Nombre, imprimir);
            
          } else {
            this.errorAuth = 'El usuario ingresado no tiene permisos de Administrador.';
          }
      },
      error: () => {
        this.cargandoAuth = false;
        this.errorAuth = 'Credenciales inválidas. Inténtalo de nuevo.';
      }
    })
  }

  /** Si el usuario en sesión ya es Administrador, realiza e imprime el corte sin pedir otra contraseña */
  imprimirCorteDirecto() {
    const usuarioLocalStorage = JSON.parse(localStorage.getItem('usuario') || '{}');
    const miNombre = usuarioLocalStorage.Nombre || 'Admin';
    // El Admin se autoriza a sí mismo, por eso mandamos su propio nombre
    this.ejecutarCorte(miNombre, true);
  }

  /** Realiza el corte directamente sin abrir la ventana de impresión */
  realizarCorteDirecto() {
    const usuarioLocalStorage = JSON.parse(localStorage.getItem('usuario') || '{}');
    const miNombre = usuarioLocalStorage.Nombre || 'Admin';
    this.ejecutarCorte(miNombre, false);
  }

  /** Sanitiza textos antes de inyectarlos en el HTML de los tickets para prevenir ataques XSS */
  private escapeHtml(valor: unknown): string {
    return String(valor ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Genera e imprime el ticket térmico del Corte de Caja en una ventana emergente */
  imprimirTicketCorte(autorizador: string) {
    const fechaActual = this.escapeHtml(new Date().toLocaleString('es-MX'));
    const usuarioLocalStorage = JSON.parse(localStorage.getItem('usuario') || '{}');
    const empleado = this.escapeHtml(usuarioLocalStorage.Nombre || 'Empleado');
    const autorizadorSafe = this.escapeHtml(autorizador);

    let listaHTML = '';
    this.pagosDelCorte.forEach(p => {
      let concepto = p.Concepto_Ultimo_Pago || 'Pago';
      if (p.Ultimo_Mes_Pagado && p.Ultimo_Anio_Pagado) {
        concepto += ` (${this.obtenerNombreMes(p.Ultimo_Mes_Pagado)} ${p.Ultimo_Anio_Pagado})`;
      }
      const nombreCorto = this.escapeHtml((p.Nombre_Cliente || '').substring(0, 18));
      const conceptoSafe = this.escapeHtml(concepto);

      listaHTML += `
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 4px;">
          <span>${nombreCorto}...<br><small style="font-size: 10px; color: #555;">${conceptoSafe}</small></span>
          <span>$${Number(p.Monto).toFixed(2)}</span>
        </div>
        <div style="border-bottom: 1px dashed #ccc; margin-top: 2px;"></div>
      `;
    });
  
    const ticketHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Corte de Caja</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0 auto; padding: 10px; color: #000; }
            h2, h3, p { margin: 5px 0; text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
          </style>
        </head>
        <body>
          <h2>TRAVELNET</h2>
          <h3>CORTE DE CAJA AUTORIZADO</h3>
          <p class="small">${fechaActual}</p>
          <div class="divider"></div>
          <p style="text-align: left;"><strong>Empleado:</strong> ${empleado}</p>
          <p style="text-align: left;"><strong>Autorizó:</strong> ${autorizadorSafe}</p>
          <div class="divider"></div>
          
          <h4 style="text-align: left; margin-bottom: 5px;">Movimientos Efectivo:</h4>
          ${listaHTML || '<p>No hubo cobros en efectivo.</p>'}
          
          <div class="divider"></div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px;">
            <span>TOTAL EN CAJA:</span>
            <span>$${this.totalCorteCaja.toFixed(2)}</span>
          </div>
          <div class="divider"></div>
          <p>Cierre de turno exitoso.</p>
          
          <script>
            window.onload = function() { window.print(); setTimeout(() => { window.close(); }, 500); }
          </script>
        </body>
      </html>
    `;

    const ventana = window.open('', '_blank', 'width=400,height=600');
    if (ventana) {
      ventana.document.write(ticketHTML);
      ventana.document.close();
    }
  }

  /** Filtra la tabla de pagos combinando el buscador de texto y los selectores de Localidad, Plan y Modalidad */
  aplicarFiltro(){
    const termino = this.terminoBusqueda.toLocaleLowerCase().trim();
    this.pagosFiltrados = this.pagos().filter( inst => {
      const coincideTexto = !termino || 
        (inst.Nombre_Cliente || '').toLocaleLowerCase().includes(termino) ||
        (inst.Localidad || '').toLocaleLowerCase().includes(termino) ||
        (inst.Telefono || '').toLocaleLowerCase().includes(termino);
        
      const coincideLocalidad = !this.filtroLocalidad || inst.Localidad === this.filtroLocalidad;
      const coincidePlan = !this.filtroPlan || inst.Plan === this.filtroPlan;
      const coincideModalidad = !this.filtroModalidad || inst.Modalidad_Servicio === this.filtroModalidad;

      return coincideTexto && coincideLocalidad && coincidePlan && coincideModalidad;
    });
  }

  buscarPagos(){
    this.aplicarFiltro();
  }

  /** Restablece todos los filtros de búsqueda y vuelve a mostrar todos los registros */
  limpiarBusqueda(){
    this.terminoBusqueda = '';
    this.filtroLocalidad = '';
    this.filtroPlan = '';
    this.filtroModalidad = '';
    this.aplicarFiltro();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.pagoSeleccionado = null;
  }

  /** Abre el modal con el historial de mensualidades de una instalación específica */
  abrirModalMensualidades(pago: PagoDetallado) {
    this.pagoMensualidadesSeleccionado = pago;
    this.mostrarModalMensualidades = true;
  }

  cerrarModalMensualidades() {
    this.mostrarModalMensualidades = false;
    this.pagoMensualidadesSeleccionado = null;
    this.cargarPagos();
  }

  onMensualidadActualizada() {
    this.cargarPagos();
  }

  /** Imprime el comprobante de una mensualidad específica seleccionada desde el historial */
  imprimirMensualidadIndividual(mensualidad: any) {
    if (!this.pagoMensualidadesSeleccionado) return;
    
    const cliente = this.pagoMensualidadesSeleccionado;
    const mesStr = this.escapeHtml(this.mesesLista.find(m => m.id === mensualidad.Mes)?.nombre || '');
    const anioSafe = this.escapeHtml(mensualidad.Anio);
    const logoUrl = this.escapeHtml(window.location.origin + '/assets/images/TravelNet.png');
    const fechaActual = this.escapeHtml(new Date().toLocaleString());
    const nombreClienteSafe = this.escapeHtml(cliente.Nombre_Cliente);
    const instalacionIdSafe = this.escapeHtml(cliente.InstalacionId);
    const planSafe = this.escapeHtml(cliente.Plan || 'N/A');
    const localidadSafe = this.escapeHtml(cliente.Localidad || 'N/A');
    const metodoSafe = this.escapeHtml(mensualidad.Tipo_Pago || 'Efectivo');
    const conceptoSafe = this.escapeHtml(mensualidad.Concepto || 'Pago de Mensualidad');
    const montoSafe = (parseFloat(mensualidad.Monto) || 0).toFixed(2);

    let desgloseHTML = `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                          <span>${mesStr} ${anioSafe}</span>
                          <span>$${montoSafe}</span>
                        </div>`;

    const ticketHTML = `
      <html>
        <head>
          <title>Imprimir Ticket - ${mesStr} ${anioSafe}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; font-size: 14px; padding: 10px; max-width: 300px; margin: 0 auto; color: #000; }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .flex { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div style="text-align: center; margin-bottom: 5px;">
            <img src="${logoUrl}" alt="TravelNET" style="max-width: 180px; max-height: 80px;">
          </div>
          <p class="text-center bold">Comprobante de Pago</p>
          <p style="font-size: 12px; text-align: center;">${fechaActual}</p>
          
          <div class="divider"></div>
          
          <div class="text-left">
            <p><strong>Cliente:</strong> ${nombreClienteSafe}</p>
            <p><strong>Instalación:</strong> #${instalacionIdSafe}</p>
            <p><strong>Plan:</strong> ${planSafe}</p>
            <p><strong>Localidad:</strong> ${localidadSafe}</p>
            <p><strong>Método:</strong> ${metodoSafe}</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="text-left">
            <p class="bold">Concepto:</p>
            <p>${conceptoSafe}</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="text-left">
            <p class="bold" style="margin-bottom: 5px;">Mes Pagado:</p>
            ${desgloseHTML}
          </div>
          
          <div class="divider"></div>
          
          <div class="flex bold" style="font-size: 16px;">
            <span>TOTAL:</span>
            <span>$${montoSafe}</span>
          </div>
          
          <div class="divider"></div>
          <p style="font-size: 12px; text-align: center;">¡Gracias por tu pago!</p>
          <p style="font-size: 12px; text-align: center;">Conserva este ticket para cualquier aclaración.</p>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(ticketHTML);
      printWindow.document.close();
    }
  }

  /** Reimprime el ticket del último pago registrado de una instalación desde la fila de la tabla */
  imprimirTicket(pago: PagoDetallado){
    if(!pago.Ultimo_Mes_Pagado || !pago.Ultimo_Anio_Pagado){
      alert('Este cliente no tiene pagos recientes registrados para imprimir.');
      return;
    }
    const fechaActual = this.escapeHtml(new Date().toLocaleDateString('es-MX', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    }));

    const nombreEmpresa = 'TravelNET';

    let conceptoTicket = pago.Concepto_Ultimo_Pago || `Mensualidad`;
    if (pago.Ultimo_Mes_Pagado && pago.Ultimo_Anio_Pagado) {
      conceptoTicket += ` (${this.obtenerNombreMes(pago.Ultimo_Mes_Pagado)} ${pago.Ultimo_Anio_Pagado})`;
    }
    const nombreClienteSafe = this.escapeHtml(pago.Nombre_Cliente);
    const instalacionIdSafe = this.escapeHtml(pago.InstalacionId);
    const planSafe = this.escapeHtml(pago.Plan || 'N/A');
    const localidadSafe = this.escapeHtml(pago.Localidad || 'N/A');
    const conceptoSafe = this.escapeHtml(conceptoTicket);
    const montoTicket = pago.Monto ? parseFloat(pago.Monto.toString()).toFixed(2) : '0.00';

    const ticketHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket de Pago - ${nombreClienteSafe}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 300px; /* Ajustable a 200px si tu impresora es de 58mm */
              margin: 0 auto;
              padding: 10px;
              color: #000;
              font-size: 14px;
            }
            h2, h3, p { margin: 5px 0; text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .text-left { text-align: left; }
            .flex { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>${nombreEmpresa}</h2>
          <p>Comprobante de Pago</p>
          <p class="small">${fechaActual}</p>
          
          <div class="divider"></div>
          
          <div class="text-left">
            <p><strong>Cliente:</strong> ${nombreClienteSafe}</p>
            <p><strong>Instalación:</strong> #${instalacionIdSafe}</p>
            <p><strong>Plan:</strong> ${planSafe}</p>
            <p><strong>Localidad:</strong> ${localidadSafe}</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="text-left">
            <p><strong>Concepto:</strong></p>
            <p>${conceptoSafe}</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="flex bold" style="font-size: 16px;">
            <span>TOTAL PAGADO:</span>
            <span>$${montoTicket}</span>
          </div>
          
          <div class="divider"></div>
          
          <p>¡Gracias por su preferencia!</p>
          <p style="font-size: 12px;">Conserve este ticket para cualquier aclaración.</p>
          
          <!-- Script que lanza la ventana de impresión y luego la cierra -->
          <script>
            window.onload = function() { 
              window.print(); 
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
    const ventanaImpresion = window.open('', '_blank', 'width=1000,height=600');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(ticketHTML);
      ventanaImpresion.document.close();
    } else {
      alert('Por favor, permite las ventanas emergentes (pop-ups) en tu navegador para imprimir el ticket.');
    }
  }

  /** Navega a la pantalla de edición del último pago de la instalación */
  editarPago(pago: PagoDetallado) {
    if (!pago.PagoId) return;
    this.router.navigate(['/pago/actualizar-pago', pago.PagoId]);
  }

  mostrarModalImprimir = signal(false);
  pagoReciente: PagoForm | null = null;
  instReciente: PagoDetallado | null = null;

  /** Registra un nuevo cobro desde el modal rápido; si no hay red, lo guarda en la cola offline */
  async registrarPago() {
    if (!this.formPago.Monto || this.formPago.Monto <= 0) {
      const confirmar = confirm('Estás a punto de efectuar un pago con cantidad cero. ¿Deseas continuar?');
      if(!confirmar){
        return;
      }
    }

    if (this.formPago.Tipo_Pago !== 'Efectivo' && !this.formPago.Numero_cuenta) {
      alert('Indica el número de cuenta para este tipo de pago.');
      return;
    }

    if (!this.formPago.Uuid_local && typeof crypto !== 'undefined' && crypto.randomUUID) {
      this.formPago.Uuid_local = crypto.randomUUID();
    }

    this.cargando.set(true);

    if (!this.syncService.estaEnLinea() || Number(this.formPago.InstalacionId) < 0) {
      await this.guardarPagoModalOffline();
      return;
    }

    this.pagoService.crearPago(this.formPago).subscribe({
      next: () => {
        this.cargando.set(false);
        this.pagoReciente = JSON.parse(JSON.stringify(this.formPago));
        this.instReciente = this.pagoSeleccionado ? JSON.parse(JSON.stringify(this.pagoSeleccionado)) : null;
        
        this.cerrarModal();
        this.cargarPagos();
        
        // Disparar modal en lugar de alert
        this.mostrarModalImprimir.set(true);
      },
      error: async (err) => {
        console.error('Error al registrar el pago', err);
        if (err.status === 0 || err.status >= 500) {
          await this.guardarPagoModalOffline();
        } else {
          this.cargando.set(false);
          alert('Ocurrió un error al registrar el pago.');
        }
      }
    });
  }

  /** Guarda el cobro localmente en IndexedDB y permite imprimir el ticket aun estando sin internet */
  private async guardarPagoModalOffline(): Promise<void> {
    try {
      await this.syncService.encolarPagoOffline(this.formPago);
      this.cargando.set(false);
      this.pagoReciente = JSON.parse(JSON.stringify(this.formPago));
      this.instReciente = this.pagoSeleccionado ? JSON.parse(JSON.stringify(this.pagoSeleccionado)) : null;
      this.cerrarModal();
      this.cargarPagos();
      this.mostrarModalImprimir.set(true);
    } catch (error) {
      this.cargando.set(false);
      console.error('Error guardando pago offline:', error);
      alert('Error al guardar el pago localmente.');
    }
  }

  finalizarSinImprimirNuevo() {
    this.mostrarModalImprimir.set(false);
    this.pagoReciente = null;
    this.instReciente = null;
  }

  finalizarEImprimirNuevo() {
    this.mostrarModalImprimir.set(false);
    if (this.instReciente && this.pagoReciente) {
      this.imprimirTicketGuardado(this.instReciente, this.pagoReciente);
    }
    this.pagoReciente = null;
    this.instReciente = null;
  }

  /** Imprime el ticket desglosando todos los meses cubiertos por el pago recién registrado */
  imprimirTicketGuardado(inst: PagoDetallado, pago: PagoForm) {
    const fechaActual = this.escapeHtml(new Date().toLocaleDateString('es-MX', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    }));

    const nombreCliente = this.escapeHtml(inst ? inst.Nombre_Cliente : 'Cliente Desconocido');
    const plan = this.escapeHtml(inst ? inst.Plan : 'N/A');
    const localidad = this.escapeHtml(inst ? inst.Localidad : 'N/A');
    const instalacionIdSafe = this.escapeHtml(pago.InstalacionId);
    const tipoPagoSafe = this.escapeHtml(pago.Tipo_Pago);
    const conceptoTicket = this.escapeHtml(pago.Concepto || 'Mensualidad');
    const montoTicket = pago.Monto !== null ? parseFloat(pago.Monto.toString()).toFixed(2) : '0.00';

    const cant = Number(pago.Cantidad_Meses) || 1;
    const montoTotal = Number(pago.Monto) || 0;
    const montoPorMes = montoTotal / cant;
    
    const startMes = Number(pago.Mes) || 1;
    const startAnio = Number(pago.Anio) || new Date().getFullYear();

    let desgloseHTML = '';
    for (let i = 0; i < cant; i++) {
      const mesIndex = (startMes - 1 + i) % 12;
      const anio = startAnio + Math.floor((startMes - 1 + i) / 12);
      const nombreMes = this.escapeHtml(this.mesesLista[mesIndex].nombre);
      
      desgloseHTML += `
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
          <span>${nombreMes} ${anio}</span>
          <span>$${montoPorMes.toFixed(2)}</span>
        </div>
      `;
    }

    const logoUrl = this.escapeHtml(`${window.location.origin}/assets/images/TravelNet.png`);

    const ticketHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket de Pago - ${nombreCliente}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 300px; 
              margin: 0 auto;
              padding: 10px;
              color: #000;
              font-size: 14px;
            }
            h2, h3, p { margin: 5px 0; text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .text-left { text-align: left; }
            .flex { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div style="text-align: center; margin-bottom: 5px;">
            <img src="${logoUrl}" alt="TravelNET" style="max-width: 180px; max-height: 80px;">
          </div>
          <p>Comprobante de Pago</p>
          <p style="font-size: 12px; text-align: center;">${fechaActual}</p>
          
          <div class="divider"></div>
          
          <div class="text-left">
            <p><strong>Cliente:</strong> ${nombreCliente}</p>
            <p><strong>Instalación:</strong> #${instalacionIdSafe}</p>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Localidad:</strong> ${localidad}</p>
            <p><strong>Método:</strong> ${tipoPagoSafe}</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="text-left">
            <p class="bold">Concepto:</p>
            <p>${conceptoTicket}</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="text-left">
            <p class="bold" style="margin-bottom: 5px;">Detalle de Meses:</p>
            ${desgloseHTML}
          </div>
          
          <div class="divider"></div>
          
          <div class="flex bold" style="font-size: 16px;">
            <span>TOTAL:</span>
            <span>$${montoTicket}</span>
          </div>
          
          <div class="divider"></div>
          <p style="font-size: 12px; text-align: center;">¡Gracias por tu pago!</p>
          <p style="font-size: 12px; text-align: center;">Conserva este ticket para cualquier aclaración.</p>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(ticketHTML);
      printWindow.document.close();
    }
  }

  /** Abre el modal de cobro rápido calculando automáticamente el siguiente mes que le toca pagar al cliente */
  abrirModal(pago: PagoDetallado) {
    this.pagoSeleccionado = pago;
    
    let mesInicio = new Date().getMonth() + 1;
    let anioInicio = new Date().getFullYear();

    if (pago.Ultimo_Mes_Pagado && pago.Ultimo_Anio_Pagado) {
      mesInicio = pago.Ultimo_Mes_Pagado + 1;
      anioInicio = pago.Ultimo_Anio_Pagado;
      if (mesInicio > 12) {
        mesInicio = 1;
        anioInicio++;
      }
    }

    const cantidadDefault = pago.Modalidad_Servicio ? (this.modalidadMesesMap[pago.Modalidad_Servicio] || 1) : 1;

    this.formPago = {
      InstalacionId: pago.InstalacionId,
      UsuarioId: this.obtenerUsuarioActual(),
      Tipo_Pago: 'Efectivo',
      Numero_cuenta: '',
      Descuento: null,
      Monto: null,
      Estado_Pago: 'Completado',
      Mes: mesInicio,
      Anio: anioInicio,
      Cantidad_Meses: cantidadDefault,
      Concepto: ''
    };

    this.actualizarConcepto();
    this.mostrarModal = true;
  }

  /** Genera automáticamente el texto del concepto (ej. "Mensualidad Marzo 2026") según los meses seleccionados */
  actualizarConcepto() {
    const startMes = Number(this.formPago.Mes) || 1;
    const startAnio = Number(this.formPago.Anio) || new Date().getFullYear();
    const cant = Number(this.formPago.Cantidad_Meses) || 1;

    const startMesObj = this.mesesLista.find(m => m.id === startMes);
    const startNombre = startMesObj ? startMesObj.nombre : '';

    if (cant === 1) {
      this.formPago.Concepto = `Mensualidad ${startNombre} ${startAnio}`;
    } else {
      const endMesIndex = (startMes - 1 + cant - 1) % 12;
      const endAnio = startAnio + Math.floor((startMes - 1 + cant - 1) / 12);
      const endNombre = this.mesesLista[endMesIndex].nombre;
      this.formPago.Concepto = `Pago de ${cant} meses (${startNombre} ${startAnio} - ${endNombre} ${endAnio})`;
    }
  }

  obtenerNombreMes(mesId?: number | null): string {
    if (!mesId) return '';
    const m = this.mesesLista.find(item => item.id === mesId);
    return m ? m.nombre : '';
  }

  private obtenerUsuarioActual(): number | null {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      return usuario.UsuarioId ?? null;
    }
    return null;
  }

  /** Envía el registro del Corte de Caja al backend y lanza la impresión del ticket de cierre */
  ejecutarCorte(autorizador: string, imprimir: boolean = true) {
    this.cargandoAuth = true;

    const usuarioLocalStorage = JSON.parse(localStorage.getItem('usuario') || '{}');
    const miUsuarioId = usuarioLocalStorage.UsuarioId;

    const payloadCorte = {
      UsuarioId: miUsuarioId,
      Autorizador: autorizador,
      MontoTotal_Declarado: this.totalCorteCaja,
      MontoTotal_Calculado: this.totalCorteCaja,
      MontoTotal: this.totalCorteCaja,
      PagoIds: this.pagosDelCorte.map(p => p.PagoId).filter(Boolean),
      Pagos_Incluidos: JSON.stringify(
        this.pagosDelCorte.map(p => ({
          PagoId: p.PagoId, 
          Cliente: p.Nombre_Cliente, 
          Monto: p.Monto
        }))
      )
    };

    this.pagoService.guardarCorteCaja(payloadCorte).subscribe({
      next: (res) => {
        this.cargandoAuth = false;
        this.cerrarModalCorte();
        
        if (imprimir) {
          // Llamamos al ticket pasándole el nombre del autorizador
          this.imprimirTicketCorte(autorizador);
        }
      },
      error: (err) => {
        this.cargandoAuth = false;
        console.error('Error al guardar el corte:', err);
        this.errorAuth = 'Ocurrió un error al intentar guardar el corte.';
      }
    });
  }

  /** Descarga y construye un archivo Excel (.xlsx) con el historial de pagos por mes de cada cliente */
  exportarExcel() {
    this.exportando.set(true);
    this.pagoService.getExportarPagos().subscribe({
      next: (data) => {
        // 1. Agrupar datos por cliente/instalacion
        const clientesMap = new Map<number, any>();
        const mesesNombres = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
        
        data.forEach(row => {
          if (!clientesMap.has(row.InstalacionId)) {
            let fechaInst = '';
            if (row.Fecha_Instalacion) {
              const d = new Date(row.Fecha_Instalacion);
              fechaInst = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
            }

            clientesMap.set(row.InstalacionId, {
              'TELEFONO': row.Telefono || '',
              'CLIENTE': row.Cliente || '',
              'UBICACIÓN': row.Ubicacion || '',
              'FECHA DE INST.': fechaInst,
              'ANTENA AP': row.Antena_AP || '',
              'PLAN': row.Plan || ''
            });
          }

          if (row.Anio && row.Mes) {
            const colName = `${mesesNombres[row.Mes - 1]} ${row.Anio}`;
            const clienteObj = clientesMap.get(row.InstalacionId);
            clienteObj[colName] = `_$* ${Number(row.Monto).toFixed(2)}_-`;
          }
        });

        const datosFinales = Array.from(clientesMap.values());

        // 2. Crear el Excel
        const ws = XLSX.utils.json_to_sheet(datosFinales);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Clientes y Pagos');

        // Ajustar ancho de columnas
        if (datosFinales.length > 0) {
          ws['!cols'] = Object.keys(datosFinales[0]).map(key => ({
            wch: Math.max(key.length, ...datosFinales.map(d => String((d as any)[key] || '').length))
          }));
        }

        const fechaStr = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `Clientes_TravelNet_${fechaStr}.xlsx`);
        this.exportando.set(false);
      },
      error: (err) => {
        this.exportando.set(false);
        console.error('Error al exportar:', err);
        alert('Error al exportar los pagos. Intenta de nuevo.');
      }
    });
  }
}