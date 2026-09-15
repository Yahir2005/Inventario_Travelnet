import { Injectable, inject } from '@angular/core';
import { AppDB } from '../../../db/app.db';
import { PagoService } from './pago';
import { ClienteService } from '../../cliente/services/cliente';
import { InstalacionService } from '../../instalacion/services/instalacion';
import { fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private db = inject(AppDB);
  private pagoService = inject(PagoService);
  private clienteService = inject(ClienteService);
  private instalacionService = inject(InstalacionService);

  constructor() {
    window.addEventListener('online', () => {
      console.log('¡Conexión recuperada! Sincronizando datos...');
      this.sincronizarTodo();
    });
  }

  estaEnLinea(): boolean {
    return navigator.onLine;
  }

  async sincronizarTodo() {
    await this.sincronizarClientes();
    await this.sincronizarInstalaciones();
    await this.sincronizarPagos();
  }

  async sincronizarClientes() {
    const clientes = await this.db.clientesPendientes.toArray();
    for (const cliente of clientes) {
      const payload = { ...cliente };
      delete payload.id;

      this.clienteService.crearCliente(payload).subscribe({
        next: async () => {
          await this.db.clientesPendientes.delete(cliente.id);
          console.log(`Cliente local #${cliente.id} sincronizado con éxito.`);
        },
        error: (err) => console.error('Error sincronizando cliente', err)
      });
    }
  }

  async sincronizarInstalaciones() {
    const instalaciones = await this.db.instalacionesPendientes.toArray();
    for (const inst of instalaciones) {
      const payload = { ...inst };
      delete payload.id;

      this.instalacionService.crearInstalacion(payload).subscribe({
        next: async () => {
          await this.db.instalacionesPendientes.delete(inst.id);
          console.log(`Instalación local #${inst.id} sincronizada con éxito.`);
        },
        error: (err) => console.error('Error sincronizando instalación', err)
      });
    }
  }

  async sincronizarPagos() {
    const pagos = await this.db.pagosPendientes.toArray();
    
    for (const pago of pagos) {
      const pagoPayload = { ...pago };
      delete pagoPayload.id;

      this.pagoService.crearPago(pagoPayload).subscribe({
        next: async () => {
          await this.db.pagosPendientes.delete(pago.id);
          console.log(`Pago local #${pago.id} sincronizado con éxito.`);
        },
        error: (err) => console.error('Error sincronizando pago', err)
      });
    }
  }
}