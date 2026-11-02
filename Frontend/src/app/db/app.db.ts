import Dexie, { Table } from 'dexie';
import { Injectable } from '@angular/core';

/**
 * BASE DE DATOS LOCAL DEL NAVEGADOR (AppDB - Dexie / IndexedDB)
 * -------------------------------------------------------------
 * Esta clase crea una base de datos llamada `TravelNetOfflineDB` directamente
 * dentro del navegador del usuario (usando la librería Dexie sobre IndexedDB).
 *
 * Se divide en dos tipos de tablas:
 *  1. `...Pendientes`: Colas temporales donde se guardan clientes, instalaciones,
 *     imágenes y pagos creados cuando NO hay internet. Una vez subidos al servidor, se borran de aquí.
 *  2. `cache...`: Copias locales de las listas y catálogos descargados del servidor,
 *     para que las tablas y menús desplegables sigan funcionando cuando se pierde la red.
 */
@Injectable({
  providedIn: 'root'
})
export class AppDB extends Dexie {
  pagosPendientes!: Table<any, number>;
  clientesPendientes!: Table<any, number>;
  instalacionesPendientes!: Table<any, number>;
  imagenesPendientes!: Table<any, number>;

  cacheClientes!: Table<any, number>;
  cacheClientesBasico!: Table<any, number>;
  cachePagos!: Table<any, number>;
  cacheInstalaciones!: Table<any, number>;
  cacheMensualidades!: Table<any, number>;
  cacheOlts!: Table<any, number>;
  cacheTorres!: Table<any, number>;
  cacheLocalidades!: Table<any, number>;
  cachePlanes!: Table<any, number>;
  cacheTarifas!: Table<any, number>;

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

    this.version(4).stores({
      pagosPendientes: '++id, Uuid_local, InstalacionId',
      clientesPendientes: '++id, tempClienteId',
      instalacionesPendientes: '++id, Uuid_local, tempInstalacionId, ClienteId',
      imagenesPendientes: '++id, Uuid_local, InstalacionId',
      cacheClientes: '++id, ClienteId',
      cacheClientesBasico: '++id, ClienteId',
      cachePagos: '++id, InstalacionId',
      cacheInstalaciones: '++id, InstalacionId',
      cacheMensualidades: '++id, instalacionId',
      cacheOlts: '++id',
      cacheTorres: '++id',
      cacheLocalidades: '++id',
      cachePlanes: '++id',
      cacheTarifas: '++id'
    });
  }
}