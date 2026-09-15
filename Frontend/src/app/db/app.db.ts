import Dexie, { Table } from 'dexie';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppDB extends Dexie {
  pagosPendientes!: Table<any, number>;
  clientesPendientes!: Table<any, number>;
  instalacionesPendientes!: Table<any, number>;
  
  imagenesPendientes!: Table<{ id?: number, instalacionId: number, archivo: Blob }, number>;

  cacheClientes!: Table<any, number>;
  cachePagos!: Table<any, number>;
  cacheInstalaciones!: Table<any, number>;
  cacheMensualidades!: Table<any, number>;

  constructor() {
    super('TravelNetOfflineDB');
    
    this.version(3).stores({
      pagosPendientes: '++id',
      clientesPendientes: '++id',
      instalacionesPendientes: '++id',
      imagenesPendientes: '++id, instalacionId',
      cacheClientes: '++id',
      cachePagos: '++id',
      cacheInstalaciones: '++id',
      cacheMensualidades: '++id, instalacionId'
    });
  }
}