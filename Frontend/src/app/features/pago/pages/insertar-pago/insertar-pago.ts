import { Component, inject, OnInit, signal } from '@angular/core'; 
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PagoService } from '../../services/pago';
import { AppDB } from '../../../../db/app.db';
import { SyncService } from '../../services/sync.service';
import { PagoDetallado, PagoForm } from '../../models/pago.model';

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

  private async guardarLocalmente() {
    try {
      const pagoLocal = JSON.parse(JSON.stringify(this.pago)); 
      
      await this.db.pagosPendientes.add(pagoLocal);
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

  imprimirTicketGuardado(inst: PagoDetallado, pago: PagoForm) {
    const fechaActual = new Date().toLocaleDateString('es-MX', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    const nombreCliente = inst ? inst.Nombre_Cliente : 'Cliente Desconocido';
    const plan = inst ? inst.Plan : 'N/A';
    const localidad = inst ? inst.Localidad : 'N/A';

    const conceptoTicket = pago.Concepto || 'Mensualidad';
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
      const nombreMes = this.mesesLista[mesIndex].nombre;
      
      desgloseHTML += `
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
          <span>${nombreMes} ${anio}</span>
          <span>$${montoPorMes.toFixed(2)}</span>
        </div>
      `;
    }

    const logoUrl = `${window.location.origin}/assets/images/TravelNet.png`;

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
            <p><strong>Instalación:</strong> #${pago.InstalacionId}</p>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Localidad:</strong> ${localidad}</p>
            <p><strong>Método:</strong> ${pago.Tipo_Pago}</p>
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