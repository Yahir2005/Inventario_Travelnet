import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <--- OBLIGATORIO PARA ngModel
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../services/cliente';
import { SyncService } from '../../../pago/services/sync.service';

/**
 * COMPONENTE: INSERTAR CLIENTE (InsertarClienteComponent)
 * -------------------------------------------------------
 * Pantalla con el formulario para dar de alta a un nuevo cliente.
 * Soporta tanto el registro en línea (directo a MariaDB) como el registro Offline
 * (guardando en IndexedDB cuando el instalador no tiene señal en campo).
 */
@Component({
  selector: 'app-insertar-cliente',
  standalone: true,
  // Asegúrate de incluir FormsModule en los imports
  imports: [FormsModule, RouterModule, CommonModule], 
  templateUrl: './insertar-cliente.html',
  styleUrls: ['./insertar-cliente.scss']
})
export class InsertarClienteComponent {
  // Servicios para comunicarse con el Backend, manejar la cola Offline y navegar entre páginas
  private clienteService = inject(ClienteService);
  private syncService = inject(SyncService);
  private router = inject(Router);

  // Objeto que almacena en tiempo real lo que el usuario escribe en cada caja de texto del formulario
  // gracias a la directiva `[(ngModel)]` en el archivo HTML.
  cliente = {
    Nombre_Cliente: '',
    Telefono: '',
    Calle: '',
    Numero: '',
    Colonia: '',
    Codigo_Postal: '',
    Direccion: '',
    TipoCliente: 'Fisica'
  };

  /**
   * Se ejecuta cuando el usuario presiona el botón "Guardar Cliente".
   * 1. Verifica que al menos el nombre y el teléfono no estén vacíos.
   * 2. Si NO hay conexión a internet, guarda el cliente localmente en IndexedDB (`guardarClienteOffline`).
   * 3. Si HAY conexión, lo envía al servidor y redirige automáticamente al formulario de
   *    Nueva Instalación llevando el `clienteId` recién creado en la URL.
   */
  async guardarCliente() {
    if (!this.cliente.Nombre_Cliente || !this.cliente.Telefono) {
      alert('Por favor, ingresa al menos el nombre y el teléfono.');
      return;
    }

    const payload = {
      ...this.cliente,
      Calle: this.cliente.Calle || this.cliente.Direccion
    };

    // Si el navegador detecta que no hay red, guardamos en la cola Offline
    if (!this.syncService.estaEnLinea()) {
      await this.guardarClienteOffline(payload);
      return;
    }

    // Si hay internet, enviamos los datos al servidor mediante POST /api/cliente
    this.clienteService.crearCliente(payload).subscribe({
      next: (respuesta: any) => {
        alert('Cliente guardado exitosamente');
        const idGenerado = respuesta.ClienteId;

        // Llevamos al usuario directo a registrar la instalación para este nuevo cliente
        this.router.navigate(['instalacion/insertar-instalacion'], {
          queryParams: { clienteId: idGenerado }
        });
      },
      error: async (err) => {
        console.error('Error al guardar:', err);
        // Si el servidor no respondió por corte de red (status 0) o caída temporal (>= 500),
        // respaldamos el cliente en modo Offline para no perder la captura.
        if (err.status === 0 || err.status >= 500) {
          await this.guardarClienteOffline(payload);
        } else {
          alert('Ocurrió un error al intentar guardar el cliente en la base de datos.');
        }
      }
    });
  }

  /**
   * Guarda el cliente en la base de datos local del navegador (`clientesPendientes`)
   * asignándole un ID temporal negativo y permite continuar con el registro de su instalación.
   */
  private async guardarClienteOffline(payload: any): Promise<void> {
    try {
      const tempId = await this.syncService.encolarClienteOffline(payload);
      alert('Sin conexión: Cliente guardado localmente. Se sincronizará en cuanto vuelva la red.');
      this.router.navigate(['instalacion/insertar-instalacion'], {
        queryParams: { clienteId: tempId }
      });
    } catch (error) {
      console.error('Error guardando cliente offline:', error);
      alert('Error al guardar el cliente localmente.');
    }
  }
}