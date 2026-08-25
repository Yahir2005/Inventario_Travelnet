import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CorteCajaService } from '../../service/corte-caja';

@Component({
  selector: 'app-lista-corte-caja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-corte-caja.html',
  styleUrl: './lista-corte-caja.scss',
})
export class ListaCorteCajaComponent {
  private corteCajaService = inject(CorteCajaService);
  private router = inject(Router);
  cortes = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  esAdmin = false;

  filtrosSelecionado: string = '0';
  cortesAgrupados: any[] = [];

  mostrarModalDetalles = false;
  corteSeleccionado: any = null;
  pagosDelCorteSeleccionado: any[] =[];

  cargandoDesglose = signal(false);
  desglosePagos = signal<any[]>([]);

  ngOnInit(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      this.esAdmin = usuario.Ocupacion === 'Administrador';
    }

    this.loading.set(true);
    this.corteCajaService.getCorteCaja().subscribe({
      next: (data) => {
        this.cortes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar cortes: ',err);
        this.error.set('No se pudieron cargar los cortes de caja');
        this.loading.set(false);
      }
    });
  }

  editarCorte(corte: any){
    if (!this.esAdmin) return;
    this.router.navigate(['/Corte-Caja/actualizar-corte-caja', corte.CorteId]);
  }

  parsearPagos(valor: any): any[] {
    if (!valor) return [];
    if (Array.isArray(valor)) return valor;
    try {
      const resultado = JSON.parse(valor);
      return Array.isArray(resultado) ? resultado : [];
    } catch {
      return [];
    }
  }

  abrirModalDetalles(corte: any){
    this.corteSeleccionado = corte;
    this.pagosDelCorteSeleccionado = this.parsearPagos(corte.Pagos_Incluidos);
    this.mostrarModalDetalles = true;
    this.desglosePagos.set([]);
    this.cargandoDesglose.set(true);

    const pagoIds = this.pagosDelCorteSeleccionado.map(p => p.PagoId).filter(id => !!id);
    if (pagoIds.length > 0) {
      this.corteCajaService.getDesglosePagos(pagoIds).subscribe({
        next: (data) => {
          this.desglosePagos.set(data);
          this.cargandoDesglose.set(false);
        },
        error: (err) => {
          console.error('Error al desglosar pagos:', err);
          this.cargandoDesglose.set(false);
        }
      });
    } else {
      this.cargandoDesglose.set(false);
    }
  }

  cerrarModalDetalles(){
    this.mostrarModalDetalles = false;
    this.corteSeleccionado = null;
    this.pagosDelCorteSeleccionado = [];
    this.desglosePagos.set([]);
  }

  @HostListener('document:keydown.escape')
  onEscape(){
    if (this.mostrarModalDetalles) {
      this.cerrarModalDetalles();
    }
  }

  contarPagos(jsonString: string): number {
    return this.parsearPagos(jsonString).length;
  }

  agruparCortes(){
    if(this.filtrosSelecionado === '0'){
      this.cortesAgrupados = [];
      return;
    }

    const grupos = new Map<string,any>();
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    this.cortes().forEach( corte => {
      const fecha = new Date(corte.FechaCorte);
      let llaveGrupo = '';

      if(this.filtrosSelecionado === '1'){
        llaveGrupo = fecha.toLocaleDateString('es-MX');
      } else if (this.filtrosSelecionado === '2'){
        const primerDiaDelAnio = new Date(fecha.getFullYear(), 0, 1);
        const diasPasados = (fecha.getTime() - primerDiaDelAnio.getTime()) / 86400000;
        const numeroSemana = Math.ceil((diasPasados + primerDiaDelAnio.getDay() + 1) / 7);
        llaveGrupo = `Semana ${numeroSemana} - ${fecha.getFullYear()}`;
      } else if (this.filtrosSelecionado === '3'){
        llaveGrupo = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
      } else if (this.filtrosSelecionado === '4'){
        llaveGrupo = `${fecha.getFullYear()}`;
      }

      if(!grupos.has(llaveGrupo)){
        grupos.set(llaveGrupo,{
          nombre: llaveGrupo,
          totalMonto: 0,
          totalCortes: 0,
          expandido: false,
          cortes: []
        });
      }
      const grupoActual = grupos.get(llaveGrupo);
      grupoActual.totalMonto += Number(corte.MontoTotal) || 0;
      grupoActual.totalCortes++;
      grupoActual.cortes.push(corte);
    });
    this.cortesAgrupados = Array.from(grupos.values());
  }

  corteTienePagosEnCero(pagos: any[]): boolean {
    return pagos.some(p => Number(p.Monto) === 0);
  }

  obtenerNombreMes(mes: number | string): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[Number(mes) - 1] || 'Desconocido';
  }
}
