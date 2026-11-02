import { Injectable, inject, signal } from '@angular/core';
import { AppDB } from '../../../db/app.db';
import { PagoService } from './pago';
import { ClienteService } from '../../cliente/services/cliente';
import { InstalacionService } from '../../instalacion/services/instalacion';
import { ImagenInstalacionService } from '../../imagen_instalacion/services/imagen-instalacion';
import { firstValueFrom } from 'rxjs';

/**
 * ============================================================================
 * SERVICIO DE SINCRONIZACIÓN Y MODO OFFLINE (sync.service.ts)
 * ============================================================================
 * Es el cerebro del Modo Offline de TravelNet.
 * 1. Escucha cuando el dispositivo pierde o recupera el internet (`online` / `offline`).
 * 2. Permite guardar Clientes, Instalaciones, Fotos y Pagos en colas locales (IndexedDB)
 *    usando IDs temporales negativos (ej. `-173000000`) cuando no hay red.
 * 3. Cuando vuelve el internet, sube los registros en orden jerárquico:
 *    Cliente -> Instalación -> Imagen -> Pago, reemplazando los IDs temporales
 *    por los IDs reales que asigna MariaDB.
 */
@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private db = inject(AppDB);
  private pagoService = inject(PagoService);
  private clienteService = inject(ClienteService);
  private instalacionService = inject(InstalacionService);
  private imagenInstalacionService = inject(ImagenInstalacionService);

  // Bandera interna para evitar que se disparen dos sincronizaciones al mismo tiempo
  private sincronizando = false;

  // Signals reactivos que la barra de navegación (Navbar) lee para mostrar el estado de red
  public enLinea = signal<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  public sincronizandoSignal = signal<boolean>(false);
  public pendientesCount = signal<number>(0);

  constructor() {
    if (typeof window !== 'undefined') {
      // Cuando el navegador detecta que regresó el internet, inicia la sincronización automática
      window.addEventListener('online', () => {
        this.enLinea.set(true);
        console.log('¡Conexión recuperada! Sincronizando datos...');
        this.sincronizarTodo();
      });

      // Cuando se corta el internet, actualiza el indicador visual a "Modo Offline"
      window.addEventListener('offline', () => {
        this.enLinea.set(false);
        console.warn('Conexión perdida. Operando en modo Offline.');
      });
    }
    this.actualizarConteoPendientes();
  }

  /** Verifica en tiempo real si el navegador tiene conexión a internet */
  estaEnLinea(): boolean {
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.enLinea.set(online);
    return online;
  }

  /** Cuenta cuántos registros en total están esperando en las 4 colas locales para subirse */
  async actualizarConteoPendientes(): Promise<number> {
    try {
      const [c, i, img, p] = await Promise.all([
        this.db.clientesPendientes.count(),
        this.db.instalacionesPendientes.count(),
        this.db.imagenesPendientes.count(),
        this.db.pagosPendientes.count()
      ]);
      const total = c + i + img + p;
      this.pendientesCount.set(total);
      return total;
    } catch {
      return 0;
    }
  }

  /** Ejecuta la sincronización en cadena respetando las llaves foráneas (Padres antes que Hijos) */
  async sincronizarTodo(): Promise<void> {
    if (this.sincronizando || !this.estaEnLinea()) return;
    this.sincronizando = true;
    this.sincronizandoSignal.set(true);
    try {
      await this.sincronizarClientes();
      await this.sincronizarInstalaciones();
      await this.sincronizarImagenes();
      await this.sincronizarPagos();
    } finally {
      this.sincronizando = false;
      this.sincronizandoSignal.set(false);
      await this.actualizarConteoPendientes();
    }
  }

  /** Paso 1: Sube los clientes pendientes y actualiza su ID real en las instalaciones pendientes asociadas */
  async sincronizarClientes(): Promise<void> {
    const clientes = await this.db.clientesPendientes.toArray();
    for (const cliente of clientes) {
      const tempClienteId = cliente.tempClienteId;
      const payload = { ...cliente };
      delete payload.id;
      delete payload.tempClienteId;

      try {
        const creado: any = await firstValueFrom(this.clienteService.crearCliente(payload));
        const realClienteId = creado?.ClienteId;

        if (tempClienteId && realClienteId) {
          const instPendientes = await this.db.instalacionesPendientes
            .filter((inst: any) => Number(inst.ClienteId) === Number(tempClienteId))
            .toArray();
          for (const inst of instPendientes) {
            await this.db.instalacionesPendientes.update(inst.id, { ClienteId: realClienteId });
          }
        }

        await this.db.clientesPendientes.delete(cliente.id);
        console.log(`Cliente local #${cliente.id} sincronizado con éxito (ID real: ${realClienteId}).`);
      } catch (err) {
        console.error('Error sincronizando cliente', err);
      }
    }
  }

  /** Paso 2: Sube las instalaciones pendientes y actualiza su ID real en las fotos y pagos pendientes asociados */
  async sincronizarInstalaciones(): Promise<void> {
    const instalaciones = await this.db.instalacionesPendientes.toArray();
    for (const inst of instalaciones) {
      if (Number(inst.ClienteId) < 0) {
        // El cliente temporal aún no se ha podido sincronizar
        continue;
      }

      const tempInstalacionId = inst.tempInstalacionId;
      const payload = { ...inst };
      delete payload.id;
      delete payload.tempInstalacionId;

      try {
        const creada: any = await firstValueFrom(this.instalacionService.crearInstalacion(payload));
        const realInstalacionId = creada?.InstalacionId;

        if (tempInstalacionId && realInstalacionId) {
          const imgsPendientes = await this.db.imagenesPendientes
            .filter((img: any) => Number(img.InstalacionId) === Number(tempInstalacionId))
            .toArray();
          for (const img of imgsPendientes) {
            await this.db.imagenesPendientes.update(img.id, { InstalacionId: realInstalacionId });
          }

          const pagosPendientes = await this.db.pagosPendientes
            .filter((p: any) => Number(p.InstalacionId) === Number(tempInstalacionId))
            .toArray();
          for (const p of pagosPendientes) {
            await this.db.pagosPendientes.update(p.id, { InstalacionId: realInstalacionId });
          }
        }

        await this.db.instalacionesPendientes.delete(inst.id);
        console.log(`Instalación local #${inst.id} sincronizada con éxito (ID real: ${realInstalacionId}).`);
      } catch (err) {
        console.error('Error sincronizando instalación', err);
      }
    }
  }

  /** Paso 3: Sube las fotografías de evidencia pendientes una vez que su instalación ya tiene ID real */
  async sincronizarImagenes(): Promise<void> {
    const imagenes = await this.db.imagenesPendientes.toArray();
    for (const img of imagenes) {
      if (Number(img.InstalacionId) < 0) {
        continue;
      }

      const payload = {
        InstalacionId: img.InstalacionId,
        Ruta_Imagen: img.Ruta_Imagen,
        Uuid_local: img.Uuid_local,
        Sincronizado: 1
      };

      try {
        await firstValueFrom(this.imagenInstalacionService.postImagen_Instalacion(payload));
        await this.db.imagenesPendientes.delete(img.id);
        console.log(`Imagen local #${img.id} sincronizada con éxito.`);
      } catch (err) {
        console.error('Error sincronizando imagen de instalación', err);
      }
    }
  }

  /** Paso 4: Sube los cobros pendientes al servidor evitando duplicados mediante `Uuid_local` */
  async sincronizarPagos(): Promise<void> {
    const pagos = await this.db.pagosPendientes.toArray();

    for (const pago of pagos) {
      if (Number(pago.InstalacionId) < 0) {
        continue;
      }

      const pagoPayload = { ...pago };
      delete pagoPayload.id;

      try {
        await firstValueFrom(this.pagoService.crearPago(pagoPayload));
        await this.db.pagosPendientes.delete(pago.id);
        console.log(`Pago local #${pago.id} sincronizado con éxito.`);
      } catch (err) {
        console.error('Error sincronizando pago', err);
      }
    }
  }

  /** Guarda un cliente en la cola offline y lo agrega inmediatamente a la caché local para poder crearle instalaciones */
  async encolarClienteOffline(datosCliente: any): Promise<number> {
    const tempClienteId = -Date.now();
    const registro = {
      ...JSON.parse(JSON.stringify(datosCliente)),
      tempClienteId
    };
    await this.db.clientesPendientes.add(registro);

    const clienteCache = {
      ClienteId: tempClienteId,
      Nombre_Cliente: datosCliente.Nombre_Cliente,
      Telefono: datosCliente.Telefono,
      Calle: datosCliente.Calle || datosCliente.Direccion || '',
      Numero: datosCliente.Numero || '',
      Colonia: datosCliente.Colonia || '',
      Codigo_Postal: datosCliente.Codigo_Postal || '',
      Direccion: datosCliente.Calle || datosCliente.Direccion || '',
      TipoCliente: datosCliente.TipoCliente || 'Fisica',
      Active: 1,
      Total_Instalaciones: 0
    };
    await this.db.cacheClientes.add(clienteCache);
    await this.db.cacheClientesBasico.add(clienteCache);
    await this.actualizarConteoPendientes();
    return tempClienteId;
  }

  /** Guarda una instalación en la cola offline y actualiza las cachés de instalaciones y pagos para que sea visible al instante */
  async encolarInstalacionOffline(datosInstalacion: any, catalogos?: {
    clientes?: any[];
    localidades?: any[];
    olts?: any[];
    torres?: any[];
  }): Promise<number> {
    const tempInstalacionId = -Date.now();
    const uuid = datosInstalacion.Uuid_local || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `inst_${Date.now()}`);

    const registro = {
      ...JSON.parse(JSON.stringify(datosInstalacion)),
      Uuid_local: uuid,
      Sincronizado: 0,
      tempInstalacionId
    };
    await this.db.instalacionesPendientes.add(registro);

    const clienteObj = catalogos?.clientes?.find(c => Number(c.ClienteId) === Number(datosInstalacion.ClienteId));
    const localidadObj = catalogos?.localidades?.find(l => Number(l.LocalidadId) === Number(datosInstalacion.LocalidadId));
    const oltObj = catalogos?.olts?.find(o => Number(o.OLTId) === Number(datosInstalacion.OLTId));
    const torreObj = catalogos?.torres?.find(t => Number(t.TorreId) === Number(datosInstalacion.TorreId));

    const instCache = {
      InstalacionId: tempInstalacionId,
      UsuarioId: datosInstalacion.UsuarioId,
      ClienteId: datosInstalacion.ClienteId,
      TarifaId: datosInstalacion.TarifaId,
      InfraestructuraId: datosInstalacion.InfraestructuraId,
      OLTId: datosInstalacion.OLTId,
      TorreId: datosInstalacion.TorreId,
      LocalidadId: datosInstalacion.LocalidadId,
      Ubicacion_Maps: datosInstalacion.Ubicacion_Maps,
      Nombre_Wifi: datosInstalacion.Nombre_Wifi,
      Password_Wifi: datosInstalacion.Password_Wifi,
      Tipo: datosInstalacion.Tipo,
      Plan: datosInstalacion.Plan,
      Modalidad_Servicio: datosInstalacion.Modalidad_Servicio,
      Nombre_Cliente: clienteObj?.Nombre_Cliente || `Cliente #${datosInstalacion.ClienteId}`,
      Telefono: clienteObj?.Telefono || '',
      Localidad_Nombre: localidadObj?.NombreLocalidad || '',
      Nombre_OLT: oltObj?.Nombre || null,
      Nombre_Torre: torreObj?.Nombre || null,
      Cantidad_Imagenes: 0,
      Ultima_Imagen: null,
      Active: 1,
      Sincronizado: 0,
      Uuid_local: uuid,
      Fecha_Instalacion: new Date().toISOString()
    };

    await this.db.cacheInstalaciones.add(instCache);
    await this.db.cachePagos.add({
      InstalacionId: tempInstalacionId,
      ClienteId: datosInstalacion.ClienteId,
      Nombre_Cliente: instCache.Nombre_Cliente,
      Telefono: instCache.Telefono,
      Localidad: instCache.Localidad_Nombre,
      Plan: datosInstalacion.Plan,
      Modalidad_Servicio: datosInstalacion.Modalidad_Servicio,
      Fecha_Instalacion: instCache.Fecha_Instalacion,
      Instalacion_Activa: 1,
      PagoId: null,
      Fecha_Pago: null,
      Estado_Pago: null,
      Monto: 0,
      Tipo_Pago: null,
      Ultimo_Mes_Pagado: null,
      Ultimo_Anio_Pagado: null,
      Concepto_Ultimo_Pago: null,
      Atrasado: false,
      Dias_Atraso: 0
    });

    await this.actualizarConteoPendientes();
    return tempInstalacionId;
  }

  /** Guarda una foto de evidencia en la cola offline y la muestra en la caché de la instalación correspondiente */
  async encolarImagenOffline(datosImagen: { InstalacionId: number | null; Ruta_Imagen: string; Uuid_local?: string | null }): Promise<void> {
    const uuid = datosImagen.Uuid_local || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `img_${Date.now()}`);
    await this.db.imagenesPendientes.add({
      InstalacionId: Number(datosImagen.InstalacionId),
      Ruta_Imagen: datosImagen.Ruta_Imagen,
      Uuid_local: uuid,
      Sincronizado: 0
    });

    const cachedInst = await this.db.cacheInstalaciones
      .filter((i: any) => Number(i.InstalacionId) === Number(datosImagen.InstalacionId))
      .first();
    if (cachedInst && cachedInst.id) {
      await this.db.cacheInstalaciones.update(cachedInst.id, {
        Cantidad_Imagenes: (Number(cachedInst.Cantidad_Imagenes) || 0) + 1,
        Ultima_Imagen: datosImagen.Ruta_Imagen
      });
    }

    await this.actualizarConteoPendientes();
  }

  /** Guarda un pago en la cola offline y actualiza la fila del cliente en la caché local de cobranza */
  async encolarPagoOffline(datosPago: any): Promise<void> {
    const uuid = datosPago.Uuid_local || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pago_${Date.now()}`);
    const pagoLocal = {
      ...JSON.parse(JSON.stringify(datosPago)),
      Uuid_local: uuid,
      Sincronizado: 0
    };

    await this.db.pagosPendientes.add(pagoLocal);

    const cant = Number(pagoLocal.Cantidad_Meses) || 1;
    const startMes = Number(pagoLocal.Mes) || (new Date().getMonth() + 1);
    const startAnio = Number(pagoLocal.Anio) || new Date().getFullYear();
    const ultimoMes = ((startMes - 1 + cant - 1) % 12) + 1;
    const ultimoAnio = startAnio + Math.floor((startMes - 1 + cant - 1) / 12);

    const cachedPago = await this.db.cachePagos
      .filter((p: any) => Number(p.InstalacionId) === Number(pagoLocal.InstalacionId))
      .first();

    if (cachedPago && cachedPago.id) {
      await this.db.cachePagos.update(cachedPago.id, {
        Pago_UsuarioId: pagoLocal.UsuarioId,
        Fecha_Pago: new Date().toISOString(),
        Estado_Pago: pagoLocal.Estado_Pago || 'Completado',
        Monto: Number(pagoLocal.Monto) || 0,
        Descuento: Number(pagoLocal.Descuento) || 0,
        Metodo_Pago: pagoLocal.Tipo_Pago || 'Efectivo',
        Tipo_Pago: pagoLocal.Tipo_Pago || 'Efectivo',
        Ultimo_Mes_Pagado: ultimoMes,
        Ultimo_Anio_Pagado: ultimoAnio,
        Concepto_Ultimo_Pago: pagoLocal.Concepto || 'Mensualidad',
        Atrasado: false,
        Dias_Atraso: 0
      });
    }

    await this.actualizarConteoPendientes();
  }
}