import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PagoService } from '../../services/pago';
import { PagoDetallado, PagoForm } from '../../models/pago.model';
import { ListaMensualidad } from '../../../mensualidad/pages/lista-mensualidad/lista-mensualidad';
import { UsuarioService } from '../../../usuario/services/usuario';

@Component({
  selector: 'app-lista-pago',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ListaMensualidad],
  templateUrl: './lista-pago.html',
  styleUrl: './lista-pago.scss',
})
export class ListaPago implements OnInit {
  private pagoService = inject(PagoService);
  private usuarioService = inject(UsuarioService);

  pagos = signal<PagoDetallado[]>([]);
  loading = signal(true);
  cargando = signal(false);
  error = signal<string | null>(null);
  pagosFiltrados: PagoDetallado[] = [];
  terminoBusqueda = '';

  mostrarModal = false;
  pagoSeleccionado: PagoDetallado | null = null;

  mostrarModalCorte = false;
  totalCorteCaja = 0;
  pagosDelCorte: any[] = [];
  
  authAdmin = { Usuario: '', Password: '' };
  cargandoAuth = false;
  errorAuth = '';

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

  ngOnInit(): void {
    this.verificarPermisos();
    this.pagoService.getPagos().subscribe({
      next: (data) => {
        this.pagos.set(data);
        this.pagosFiltrados = data;
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los pagos.');
        console.error('Error al cargar los pagos', err);
        this.loading.set(false);
      }
    });
  }

  verificarPermisos(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      this.esAdmin = (usuario.Ocupacion === 'Administrador');
    }
  }

  prepararCorteCaja(){
    const miUsuarioId = this.obtenerUsuarioActual();
    const hoyISO = new Date().toISOString().split('T')[0];
    this.totalCorteCaja = 0;
    this.pagosDelCorte = []

    this.pagosDelCorte = this.pagos().filter(p =>{
      if (!p.Fecha_Pago || !p.Pago_UsuarioId) return false;
      const fechaPagoStr = new Date(p.Fecha_Pago).toISOString().split('T')[0];

      return (fechaPagoStr === hoyISO) && 
             (Number(p.Pago_UsuarioId) === miUsuarioId) && 
             (p.Tipo_Pago === 'Efectivo') &&
             (p.Estado_Pago === 'Completado');
    });

    this.pagosDelCorte.forEach(p => {
      this.totalCorteCaja += Number(p.Monto) || 0;
    });

    this.authAdmin = { Usuario: '', Password: '' };
    this.errorAuth = '';
    this.mostrarModalCorte = true;

  }

  cerrarModalCorte() {
    this.mostrarModalCorte = false;
  }

  autorizarCorte(){
    this.cargandoAuth = true;
    this.errorAuth = '';

    this.usuarioService.autorizarAdmin(this.authAdmin).subscribe({
      next: (respuesta) => {
        this.cargandoAuth = false;

        const usuarioAdmin = respuesta.user;

          if (usuarioAdmin && usuarioAdmin.Ocupacion === 'Administrador') {
            this.cerrarModalCorte();
            this.imprimirCorteDirecto();
            
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

  imprimirCorteDirecto() {
    const usuarioLocalStorage = JSON.parse(localStorage.getItem('usuario') || '{}');
    const miNombre = usuarioLocalStorage.Nombre || 'Admin';
    // El Admin se autoriza a sí mismo, por eso mandamos su propio nombre
    this.ejecutarCorte(miNombre);
  }

imprimirTicketCorte(autorizador: string) {
    const fechaActual = new Date().toLocaleString('es-MX');
    const usuarioLocalStorage = JSON.parse(localStorage.getItem('usuario') || '{}');
    const empleado = usuarioLocalStorage.Nombre || 'Empleado';

    let listaHTML = '';
    this.pagosDelCorte.forEach(p => {
      listaHTML += `
        <div style="display: flex; justify-content: space-between; font-size: 12px;">
          <span>${p.Nombre_Cliente.substring(0, 15)}...</span>
          <span>$${Number(p.Monto).toFixed(2)}</span>
        </div>
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
          <p style="text-align: left;"><strong>Autorizó:</strong> ${autorizador}</p>
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

  aplicarFiltro(){
    const termino = this.terminoBusqueda.toLocaleLowerCase().trim();
    if(!termino) {
      this.pagosFiltrados = this.pagos();
      return;
    }
    this.pagosFiltrados = this.pagos().filter( inst =>
      (inst.Nombre_Cliente || '').toLocaleLowerCase().includes(termino) ||
      (inst.Localidad || '').toLocaleLowerCase().includes(termino) ||
      (inst.Telefono || '').toLocaleLowerCase().includes(termino)
    );
  }

  buscarPagos(){
    this.aplicarFiltro();
  }

  limpiarBusqueda(){
    this.terminoBusqueda = '';
    this.aplicarFiltro();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.pagoSeleccionado = null;
  }

  abrirModalMensualidades(pago: PagoDetallado) {
    this.pagoMensualidadesSeleccionado = pago;
    this.mostrarModalMensualidades = true;
  }

  cerrarModalMensualidades() {
    this.mostrarModalMensualidades = false;
    this.pagoMensualidadesSeleccionado = null;
    this.ngOnInit();
  }

  onMensualidadActualizada() {
    this.ngOnInit();
  }

  imprimirTicket(pago: PagoDetallado){
    if(!pago.Ultimo_Mes_Pagado || !pago.Ultimo_Anio_Pagado){
      alert('Este cliente no tiene pagos recientes registrados para imprimir.');
      return;
    }
    const fechaActual = new Date().toLocaleDateString('es-MX', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    const nombreEmpresa = 'TravelNET'

    const conceptoTicket = pago.Concepto_Ultimo_Pago || `Mensualidad ${this.obtenerNombreMes(pago.Ultimo_Mes_Pagado)} ${pago.Ultimo_Anio_Pagado}`;
    const montoTicket = pago.Monto ? parseFloat(pago.Monto.toString()).toFixed(2) : '0.00';

    const ticketHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket de Pago - ${pago.Nombre_Cliente}</title>
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
            <p><strong>Cliente:</strong> ${pago.Nombre_Cliente}</p>
            <p><strong>Instalación:</strong> #${pago.InstalacionId}</p>
            <p><strong>Plan:</strong> ${pago.Plan || 'N/A'}</p>
            <p><strong>Localidad:</strong> ${pago.Localidad || 'N/A'}</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="text-left">
            <p><strong>Concepto:</strong></p>
            <p>${conceptoTicket}</p>
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

  registrarPago() {
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

    this.cargando.set(true);
    this.pagoService.crearPago(this.formPago).subscribe({
      next: () => {
        this.cargando.set(false);
        this.cerrarModal();
        this.ngOnInit();
        alert('Pago registrado correctamente.');
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error al registrar el pago', err);
        alert('Ocurrió un error al registrar el pago.');
      }
    });
  }

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

  ejecutarCorte(autorizador: string) {
    this.cargandoAuth = true;

    const usuarioLocalStorage = JSON.parse(localStorage.getItem('usuario') || '{}');
    const miUsuarioId = usuarioLocalStorage.UsuarioId;

    const payloadCorte = {
      UsuarioId: miUsuarioId,
      Autorizador: autorizador,
      MontoTotal: this.totalCorteCaja,

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
        
        // Llamamos al ticket pasándole el nombre del autorizador
        this.imprimirTicketCorte(autorizador);
      },
      error: (err) => {
        this.cargandoAuth = false;
        console.error('Error al guardar el corte:', err);
        alert('Hubo un error al registrar el corte en la base de datos.');
      }
    });
  }
}