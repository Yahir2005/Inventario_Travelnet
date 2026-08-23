import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ClienteService } from '../../../cliente/services/cliente';
import { InstalacionService } from '../../../instalacion/services/instalacion';
import { PagoService } from '../../../pago/services/pago';
import { UsuarioService } from '../../../usuario/services/usuario';
import { OltService } from '../../../OLT/service/olt';
import { TorreService } from '../../../Torre/service/torre';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
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

  ngOnInit(): void {
    this.cargarUsuarioStorage();
    if (this.esAdmin) {
      this.cargarMetricas();
    } else {
      this.cargando = false;
    }
  }

  private cargarUsuarioStorage(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const user = JSON.parse(usuarioString);
      this.nombreUsuario = user.Nombre || user.Usuario || 'Usuario';
      
      const ocupacion = user.Ocupacion;
      this.esAdmin = (ocupacion === 'Administrador');
      this.esInstalador = (ocupacion === 'Instalador');
      this.esMostrador = (ocupacion === 'Mostrador');
    }
  }

  private cargarMetricas(): void {
    // Clientes
    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
        this.totalClientes = clientes.length;
      }
    });

    // Instalaciones
    this.instalacionService.getInstalaciones().subscribe({
      next: (inst) => {
        this.totalInstalaciones = inst.length;
      }
    });

    // Pagos
    this.pagoService.getPagos().subscribe({
      next: (pagos) => {
        const hoyISO = new Date().toISOString().split('T')[0];
        
        pagos.forEach(p => {
          if (p.Fecha_Pago) {
            const fechaPagoStr = new Date(p.Fecha_Pago).toISOString().split('T')[0];
            if (fechaPagoStr === hoyISO && p.Estado_Pago === 'Completado') {
              this.pagosHoyConteo++;
              this.pagosHoyMonto += Number(p.Monto) || 0;
            }
          }
        });
      }
    });

    // Usuarios
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.totalUsuarios = usuarios.length;
        const conteo: Record<string, number> = {};
        usuarios.forEach(u => {
          const rol = u.Ocupacion || 'Desconocido';
          conteo[rol] = (conteo[rol] || 0) + 1;
        });
        this.rolesResumen = Object.keys(conteo).map(key => ({
          rol: key,
          total: conteo[key]
        }));
      }
    });

    // OLT
    this.oltService.getOlts().subscribe({
      next: (olts) => {
        this.totalOlt = olts.length;
      }
    });

    // Torres
    this.torreService.getTorres().subscribe({
      next: (torres) => {
        this.totalTorres = torres.length;
      }
    });

    // Timeout para ocultar loader
    setTimeout(() => {
      this.cargando = false;
    }, 1200);
  }
}
