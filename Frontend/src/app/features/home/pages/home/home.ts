import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { ClienteService } from '../../../cliente/services/cliente';
import { InstalacionService } from '../../../instalacion/services/instalacion';
import { PagoService } from '../../../pago/services/pago';
import { UsuarioService } from '../../../usuario/services/usuario';
import { OltService } from '../../../OLT/service/olt';
import { TorreService } from '../../../Torre/service/torre';

/**
 * COMPONENTE: PANEL DE INICIO / DASHBOARD (Home)
 * ----------------------------------------------
 * Es la primera pantalla que ve el usuario después de iniciar sesión (`/home`):
 *  - Si el usuario es `Administrador`: descarga en paralelo las métricas generales
 *    (total de clientes, instalaciones, cobros del día, usuarios por rol, OLTs y Torres)
 *    y actualiza cada tarjeta conforme llega su respuesta.
 *  - Si el usuario es `Mostrador` o `Instalador`: muestra un mensaje de bienvenida personalizado.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  // Banderas que identifican el rol del usuario conectado
  esAdmin = false;
  esInstalador = false;
  esMostrador = false;
  nombreUsuario = '';

  // Servicios
  private clienteService = inject(ClienteService);
  private instalacionService = inject(InstalacionService);
  private pagoService = inject(PagoService);
  private usuarioService = inject(UsuarioService);
  private oltService = inject(OltService);
  private torreService = inject(TorreService);
  // `ChangeDetectorRef` avisa a Angular que debe repintar la pantalla cuando llegan los datos asíncronos
  private cdr = inject(ChangeDetectorRef);

  // Métricas
  totalClientes = 0;
  totalInstalaciones = 0;
  totalOlt = 0;
  totalTorres = 0;

  pagosHoyConteo = 0;
  pagosHoyMonto = 0;

  totalUsuarios = 0;
  rolesResumen: { rol: string, total: number }[] = [];

  cargando = true;

  /**
   * Al cargar la pantalla, verifica qué usuario está en sesión y, si es Administrador,
   * lanza la consulta de todas las métricas del panel.
   */
  ngOnInit(): void {
    this.cargarUsuarioStorage();
    if (this.esAdmin) {
      this.cargarMetricas();
    } else {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  private cargarUsuarioStorage(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const user = JSON.parse(usuarioString);
      this.nombreUsuario = user.Nombre || user.Usuario || 'Usuario';
      
      const ocupacion = user.Rol || user.Ocupacion;
      this.esAdmin = (ocupacion === 'Administrador');
      this.esInstalador = (ocupacion === 'Instalador');
      this.esMostrador = (ocupacion === 'Mostrador');
    }
  }

  private obtenerFechaLocalISO(fecha: Date = new Date()): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private cargarMetricas(): void {
    this.cargando = true;

    forkJoin({
      clientes: this.clienteService.getClientes().pipe(
        tap((clientes) => {
          this.totalClientes = clientes.length;
          this.cdr.markForCheck();
        }),
        catchError(() => of([]))
      ),
      instalaciones: this.instalacionService.getInstalaciones().pipe(
        tap((instalaciones) => {
          this.totalInstalaciones = instalaciones.length;
          this.cdr.markForCheck();
        }),
        catchError(() => of([]))
      ),
      pagos: this.pagoService.getPagos().pipe(
        tap((pagos) => {
          const hoyISO = this.obtenerFechaLocalISO();
          let conteo = 0;
          let monto = 0;
          pagos.forEach(p => {
            if (p.Fecha_Pago) {
              const fechaPagoStr = this.obtenerFechaLocalISO(new Date(p.Fecha_Pago));
              if (fechaPagoStr === hoyISO && p.Estado_Pago === 'Completado') {
                conteo++;
                monto += Number(p.Monto) || 0;
              }
            }
          });
          this.pagosHoyConteo = conteo;
          this.pagosHoyMonto = monto;
          this.cdr.markForCheck();
        }),
        catchError(() => of([]))
      ),
      usuarios: this.usuarioService.getUsuarios().pipe(
        tap((usuarios) => {
          this.totalUsuarios = usuarios.length;
          const conteo: Record<string, number> = {};
          usuarios.forEach(u => {
            const rol = (u as any).Rol || u.Ocupacion || 'Desconocido';
            conteo[rol] = (conteo[rol] || 0) + 1;
          });
          this.rolesResumen = Object.keys(conteo).map(key => ({
            rol: key,
            total: conteo[key]
          }));
          this.cdr.markForCheck();
        }),
        catchError(() => of([]))
      ),
      olts: this.oltService.getOlts().pipe(
        tap((olts) => {
          this.totalOlt = olts.length;
          this.cdr.markForCheck();
        }),
        catchError(() => of([]))
      ),
      torres: this.torreService.getTorres().pipe(
        tap((torres) => {
          this.totalTorres = torres.length;
          this.cdr.markForCheck();
        }),
        catchError(() => of([]))
      )
    })
      .pipe(finalize(() => {
        this.cargando = false;
        this.cdr.markForCheck();
      }))
      .subscribe();
  }
}
