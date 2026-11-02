import { Component, inject, OnInit, signal } from '@angular/core'; 
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PagoService } from '../../services/pago';
import { AppDB } from '../../../../db/app.db';
import { SyncService } from '../../services/sync.service';
import { PagoDetallado, PagoForm } from '../../models/pago.model';

/**
 * ============================================================================
 * COMPONENTE: INSERTAR PAGO (insertar-pago.ts)
 * ============================================================================
 * Formulario completo para registrar un pago seleccionando la instalación del
 * cliente. Calcula automáticamente el mes siguiente a cobrar, arma el concepto,
 * soporta guardado en Modo Offline y ofrece imprimir el ticket térmico al terminar.
 */
@Component({
  selector: 'app-insertar-pago',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './insertar-pago.html',
  styleUrl: './insertar-pago.scss',
})
export class InsertarPago implements OnInit {
  private pagoService = inject(PagoService);
  private router = inject(Router);
  private db = inject(AppDB);
  private syncService = inject(SyncService);

  instalaciones: PagoDetallado[] = [];
  
  loading = signal(true);
  guardando = signal(false);

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
    'Mensual': 1, 'Bimestral': 2, 'Trimestral': 3, 'Cuatrimestral': 4,
    'Quinquemestral': 5, 'Semestral': 6, 'Heptamestral': 7, 'Octomestral': 8,
    'Nonamestral': 9, 'Decamestral': 10, 'Oncemestral': 11, 'Anual': 12
  };

  pago: PagoForm = {
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

  ngOnInit(): void {
    this.pago.UsuarioId = this.obtenerUsuarioActual();
    this.cargarInstalaciones();
  }

  /** Obtiene las instalaciones disponibles desde el backend o desde IndexedDB si estamos sin red */
  cargarInstalaciones() {
    this.loading.set(true); 
    this.pagoService.getPagos().subscribe({
      next: (data) => {
        this.instalaciones = data;
        this.loading.set(false); 
      },
      error: (err) => {
        console.error('Error al cargar las instalaciones', err);
        this.loading.set(false);
      }
    });
  }

  /** Cuando el cajero elige una instalación, sugiere el mes siguiente a su último pago registrado */
  onInstalacionChange() {
    const inst = this.instalaciones.find(i => i.InstalacionId === Number(this.pago.InstalacionId));
    if (inst) {
      let mesInicio = new Date().getMonth() + 1;
      let anioInicio = new Date().getFullYear();

      if (inst.Ultimo_Mes_Pagado && inst.Ultimo_Anio_Pagado) {
        mesInicio = inst.Ultimo_Mes_Pagado + 1;
        anioInicio = inst.Ultimo_Anio_Pagado;
        if (mesInicio > 12) {
          mesInicio = 1;
          anioInicio++;
        }
      }

      this.pago.Mes = mesInicio;
      this.pago.Anio = anioInicio;
      this.pago.Cantidad_Meses = inst.Modalidad_Servicio ? (this.modalidadMesesMap[inst.Modalidad_Servicio] || 1) : 1;
      this.actualizarConcepto();
    }
  }

  /** Actualiza automáticamente el texto del concepto según el mes de inicio y la cantidad de meses */
  actualizarConcepto() {
    const startMes = Number(this.pago.Mes) || 1;
    const startAnio = Number(this.pago.Anio) || new Date().getFullYear();
    const cant = Number(this.pago.Cantidad_Meses) || 1;

    const startMesObj = this.mesesLista.find(m => m.id === startMes);
    const startNombre = startMesObj ? startMesObj.nombre : '';

    if (cant === 1) {
      this.pago.Concepto = `Mensualidad ${startNombre} ${startAnio}`;
    } else {
      const endMesIndex = (startMes - 1 + cant - 1) % 12;
      const endAnio = startAnio + Math.floor((startMes - 1 + cant - 1) / 12);
      const endNombre = this.mesesLista[endMesIndex].nombre;
      this.pago.Concepto = `Pago de ${cant} meses (${startNombre} ${startAnio} - ${endNombre} ${endAnio})`;
    }
  }

  mostrarModalImprimir = signal(false);

  /** Valida el formulario y envía el pago al servidor, o lo encola en IndexedDB si no hay conexión */
  async guardarPago() {
    // 1. VALIDACIONES ORIGINALES
    if (!this.pago.InstalacionId) {
      alert('Selecciona una instalación.');
      return;
    }
    if (this.pago.Monto === null || this.pago.Monto === undefined || this.pago.Monto < 0) {
      alert('El monto es obligatorio y debe ser mayor o igual a 0.');
      return;
    }
    if (this.pago.Tipo_Pago !== 'Efectivo' && !this.pago.Numero_cuenta) {
      alert('Indica el número de cuenta para este tipo de pago.');
      return;
    }

    this.guardando.set(true);

    if (!this.pago.Uuid_local && typeof crypto !== 'undefined' && crypto.randomUUID) {
      this.pago.Uuid_local = crypto.randomUUID();
    }

    if (this.syncService.estaEnLinea()) {
      this.pagoService.crearPago(this.pago).subscribe({
        next: () => {
          this.guardando.set(false);
          this.mostrarModalImprimir.set(true);
        },
        error: async (err) => {
          console.error('Error al registrar el pago', err);
          // Si el servidor está caído o hay fallo de red (status 0, 503, 504)
          if (err.status === 0 || err.status >= 500) {
             console.warn('El servidor no respondió, guardando localmente como fallback...');
             await this.guardarLocalmente();
          } else {
             this.guardando.set(false);
             alert('Ocurrió un error al registrar el pago en el servidor.');
          }
        }
      });
    } else {
      await this.guardarLocalmente();
    }
  }

  /** Encola el pago localmente mediante `SyncService` para sincronizarlo en cuanto vuelva la red */
  private async guardarLocalmente() {
    try {
      await this.syncService.encolarPagoOffline(this.pago);
      this.guardando.set(false);
      this.mostrarModalImprimir.set(true);
    } catch (error) {
      this.guardando.set(false);
      console.error('Error de Dexie:', error);
      alert('Error al guardar localmente.');
    }
  }

  finalizarSinImprimir() {
    this.mostrarModalImprimir.set(false);
    this.router.navigate(['/pago']);
  }

  finalizarEImprimir() {
    this.mostrarModalImprimir.set(false);
    const inst = this.instalaciones.find(i => i.InstalacionId === Number(this.pago.InstalacionId));
    if (inst) {
      this.imprimirTicketGuardado(inst, this.pago);
    }
    this.router.navigate(['/pago']);
  }

  /** Escapa caracteres especiales HTML para evitar inyección de código en la ventana de impresión */
  private escapeHtml(valor: unknown): string {
    return String(valor ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Abre una ventana emergente con formato de impresora térmica (58mm/80mm) e imprime el recibo */
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

  private obtenerUsuarioActual(): number | null {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      return usuario.UsuarioId ?? null;
    }
    return null;
  }
}