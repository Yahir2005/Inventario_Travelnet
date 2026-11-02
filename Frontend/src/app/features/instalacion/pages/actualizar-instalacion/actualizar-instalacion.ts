import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InstalacionService } from '../../services/instalacion';
import { forkJoin } from 'rxjs'; // <-- IMPORTAMOS FORKJOIN

/**
 * COMPONENTE: ACTUALIZAR INSTALACIÓN (ActualizarInstalacion)
 * ----------------------------------------------------------
 * Permite modificar los datos de una instalación existente (tipo de conexión, OLT/Torre,
 * nombre/clave Wi-Fi, localidad, plan, modalidad y coordenadas de Google Maps).
 * Utiliza `forkJoin` para cargar en paralelo los datos actuales de la instalación
 * junto con todos los catálogos necesarios para los selectores del formulario.
 */
@Component({
  selector: 'app-actualizar-instalacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './actualizar-instalacion.html',
  styleUrl: './actualizar-instalacion.scss',
})
export class ActualizarInstalacion implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private instalacionService = inject(InstalacionService);

  instalacionId: number | null = null;
  cargando = true;
  cargandoUbicacion = false;

  olts: any[] = [];
  torres: any[] = [];
  localidades: any[] = [];
  clientes: any[] = [];

  instalacion = {
    UsuarioId: null as number | null,
    ClienteId: null as number | null,
    TarifaId: null as number | null,
    InfraestructuraId: null as number | null,
    OLTId: null as number | null,
    TorreId: null as number | null,
    Ubicacion_Maps: '',
    Nombre_Wifi: '',
    Password_Wifi: '',
    Tipo: '',
    LocalidadId: null as number | null,
    Plan: '20 MEGAS',
    Modalidad_Servicio: 'Mensual'
  };

  private planOriginal = '';
  private modalidadOriginal = '';

  ngOnInit(): void {
    // Al usar forkJoin ya no llamamos a los métodos individuales aquí
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.instalacionId = Number(id);
        this.cargarTodo(this.instalacionId); // <-- Un solo método maestro
      } else {
        this.cargando = false;
      }
    });
  }

  // MÉTODO MAESTRO CON FORKJOIN
  cargarTodo(id: number) {
    this.cargando = true;

    forkJoin({
      instalacionObj: this.instalacionService.getInstalacionPorId(id),
      oltsList: this.instalacionService.getOlts(),
      torresList: this.instalacionService.getTorre(),
      localidadesList: this.instalacionService.getLocalidades(),
      clientesList: this.instalacionService.getClientes()
    }).subscribe({
      next: (resultados) => {
        // 1. Asignamos todos los catálogos al mismo tiempo
        this.olts = resultados.oltsList;
        this.torres = resultados.torresList;
        this.localidades = resultados.localidadesList;
        this.clientes = resultados.clientesList;

        // 2. Asignamos los datos del formulario
        const data = resultados.instalacionObj;
        this.planOriginal = data.Plan || '20 MEGAS';
        this.modalidadOriginal = data.Modalidad_Servicio || 'Mensual';
        this.instalacion = {
          UsuarioId: data.UsuarioId ?? null,
          ClienteId: data.ClienteId ?? null,
          TarifaId: data.TarifaId ?? null,
          InfraestructuraId: data.InfraestructuraId ?? null,
          OLTId: data.OLTId ?? null,
          TorreId: data.TorreId ?? null,
          Ubicacion_Maps: data.Ubicacion_Maps || '',
          Nombre_Wifi: data.Nombre_Wifi || '',
          Password_Wifi: data.Password_Wifi || '',
          Tipo: data.Tipo || '',
          LocalidadId: data.LocalidadId ?? null,
          Plan: this.planOriginal,
          Modalidad_Servicio: this.modalidadOriginal
        };

        // 3. Apagamos el spinner UNA SOLA VEZ al final
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar la información', err);
        alert('No se pudo cargar la información completa de la instalación');
        this.cargando = false;
        this.router.navigate(['/instalacion']);
      }
    });
  }

  // ... (Tus métodos obtenerNombreCliente, obtenerUbicacion y guardarCambios se quedan exactamente igual)
  obtenerNombreCliente(clienteId: number | null): string {
    if (!clienteId) return 'Sin cliente asignado';
    const cliente = this.clientes.find(c => Number(c.ClienteId) === Number(clienteId));
    return cliente ? `${cliente.Nombre_Cliente} (${cliente.Telefono})` : `Cliente #${clienteId}`;
  }

  obtenerUbicacion() {
    this.cargandoUbicacion = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          this.instalacion.Ubicacion_Maps = `https://maps.google.com?q=${lat},${lng}`;
          this.cargandoUbicacion = false;
        },
        (error) => {
          console.error("Error obteniendo ubicación: ", error);
          alert('No se pudo obtener la ubicación. Asegúrate de darle permisos al navegador.');
          this.cargandoUbicacion = false;
        }
      );
    } else {
      alert("La geolocalización no es soportada por este navegador.");
      this.cargandoUbicacion = false;
    }
  }

  guardarCambios() {
    if (!this.instalacionId) return;

    if (this.instalacion.Tipo === 'Fibra') {
      this.instalacion.TorreId = null;
      this.instalacion.InfraestructuraId = this.instalacion.OLTId ? Number(this.instalacion.OLTId) : null;
    } else if (this.instalacion.Tipo === 'Antena') {
      this.instalacion.OLTId = null;
      this.instalacion.InfraestructuraId = this.instalacion.TorreId ? Number(this.instalacion.TorreId) : null;
    }

    if (
      this.instalacion.Plan !== this.planOriginal ||
      this.instalacion.Modalidad_Servicio !== this.modalidadOriginal
    ) {
      this.instalacion.TarifaId = null;
    }

    if (!this.instalacion.Ubicacion_Maps) {
      alert('Debes capturar la ubicación del dispositivo antes de guardar.');
      return;
    }

    this.instalacionService.putInstalaciones(this.instalacionId, this.instalacion).subscribe({
      next: () => {
        alert('Instalación actualizada correctamente');
        this.router.navigate(['/instalacion']);
      },
      error: (err) => {
        console.error('Error al actualizar la instalación', err);
        alert('Ocurrió un error al actualizar la instalación');
      }
    });
  }
}