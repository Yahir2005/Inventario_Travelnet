import { Injectable, inject } from '@angular/core';
import { AppDB } from '../../../db/app.db';
import { PagoService } from './pago';
import { fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private db = inject(AppDB);
  private pagoService = inject(PagoService);

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
    await this.sincronizarPagos();
  }

  async sincronizarPagos() {
    const pagos = await this.db.pagosPendientes.toArray();
    
    for (const pago of pagos) {
      const pagoPayload = { ...pago };
      delete pagoPayload.id; // Remover el ID generado localmente por Dexie

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