import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstalacionService } from '../../services/instalacion';
import { InstalacionDetallada } from '../../models/instalacion-list-view.model';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-lista-instalacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lista-instalacion.html',
  styleUrl: './lista-instalacion.scss',
})
export class ListaInstalacion implements OnInit {
  private instalacionService = inject(InstalacionService);
  private router = inject(Router);

  instalaciones = signal<InstalacionDetallada[]>([]);
  instalacionesFiltradas: InstalacionDetallada[] = [];
  loading = signal(true);
  error = signal<string | null>(null);
  terminoBusqueda = '';
  cargandoUbicacion: boolean = false;
  ubicacionObtenida: boolean = false;
  esAdmin = false;

  ngOnInit(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      this.esAdmin = usuario.Ocupacion === 'Administrador';
    }
    this.cargarInstalaciones();
  }

  cargarInstalaciones() {
    this.loading.set(true);
    this.instalacionService.getInstalacionesDetalladas().subscribe({
      next: (data) => {
        const normalizadas = data.map(inst => ({ ...inst, Cantidad_Imagenes: Number(inst.Cantidad_Imagenes) || 0 }));
        this.instalaciones.set(normalizadas);
        this.aplicarFiltro();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las instalaciones.');
        console.error('Error al cargar las instalaciones', err);
        this.loading.set(false);
      }
    });
  }

  aplicarFiltro() {
    const termino = this.terminoBusqueda.toLowerCase().trim();
    if (!termino) {
      this.instalacionesFiltradas = this.instalaciones();
      return;
    }
    this.instalacionesFiltradas = this.instalaciones().filter(inst =>
      (inst.Nombre_Cliente || '').toLowerCase().includes(termino) ||
      (inst.Localidad_Nombre || '').toLowerCase().includes(termino) ||
      (inst.Tipo || '').toLowerCase().includes(termino) ||
      (inst.Plan || '').toLowerCase().includes(termino)
    );
  }

  buscarInstalaciones() {
    this.aplicarFiltro();
  }

  limpiarBusqueda() {
    this.terminoBusqueda = '';
    this.aplicarFiltro();
  }

  agregarImagen(instalacion: InstalacionDetallada) {
    this.router.navigate(['/imagen-instalacion/insertar-imagen-instalacion'], {
      queryParams: { instalacionId: instalacion.InstalacionId }
    });
  }

  modificarInstalacion(instalacion: InstalacionDetallada) {
    this.router.navigate(['/instalacion/actualizar-instalacion', instalacion.InstalacionId]);
  }

  agregarUbicacion(instalacionTarget: InstalacionDetallada){

    let mensaje = 'Estas seguro que deseas capturar y guardar tu ubicación actual para esta instalación?'

    if (instalacionTarget.Ubicacion_Maps) {
      mensaje = 'Esta instalación "YA TIENE" una ubicación guardada. ¿Estás seguro de que deseas "SOBREESCRIBIRLA" con tu ubicación actual?';
    }

    const usuarioConfirma = confirm(mensaje);

    if (!usuarioConfirma) {
      return; 
    }

    this.cargandoUbicacion = true;
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const nuevoLinkMaps = `https://maps.google.com?q=${lat},${lng}`;
          
          this.instalacionService.putInstalaciones(instalacionTarget.InstalacionId,{Ubicacion_Maps:nuevoLinkMaps}).subscribe({
            next:() => {
              instalacionTarget.Ubicacion_Maps = nuevoLinkMaps;
              this.ubicacionObtenida = true;
              this.cargandoUbicacion = false;
              alert('Ubicación actualizada y guardada correctamente.');
            },
            error: (err) =>{
              console.error("Error al guardar en BD: ", err);
              alert('Se obtuvo la ubicación, pero hubo un error al guardarla en la base de datos.');
              this.cargandoUbicacion = false;
            }
          });
        },
        (error) => {
          console.error("Error obteniendo ubicación: ", error);
          alert('No se pudo obtener la ubicación. Asegúrate de darle permisos al navegador.');
          this.cargandoUbicacion = false;  
        },
        { enableHighAccuracy: true }
      );
    }else{
      alert("La geolocalización no es soportada por este navegador.");
      this.cargandoUbicacion = false;     
    }
  }

  obtenerUrlImagen(ruta?: string | null): string | null {
    if (!ruta) return null;
    if (ruta.startsWith('http')) return ruta;
    return `http://localhost:3000${ruta}`;
  }

  registrarPago(instalacion: InstalacionDetallada) {
    this.router.navigate(['/pago/insertar']);
  }
}