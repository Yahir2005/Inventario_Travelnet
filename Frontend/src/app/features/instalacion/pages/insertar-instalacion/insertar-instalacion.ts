import { Component,OnInit,Inject, inject } from '@angular/core';
import { Router,ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../../cliente/services/cliente';
import { InstalacionService } from '../../services/instalacion';


@Component({
  selector: 'app-insertar-instalacion',
  standalone: true,
  imports: [FormsModule,RouterModule,CommonModule],
  templateUrl: './insertar-instalacion.html',
  styleUrl: './insertar-instalacion.scss',
})
export class InsertarInstalacionComponent implements OnInit{
  private instalacionService = inject(InstalacionService);
  private clienteService = inject(ClienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  clientes: any[] =[];
  olts: any[] = [];
  torres: any[] = [];
  localidades: any[] = [];

  esClientePreasignado: boolean = false;
  terminoBusquedaCliente: string = '';
  clientesFiltrados: any[] = [];

  instalacion = {
    UsuarioId: null as number | null,
    ClienteId: null as number | null,
    OLTId: null as number | null,
    TorreId: null as number | null,
    Ubicacion_Maps: '',
    Nombre_Wifi: '',
    Password_Wifi: '',
    Tipo: '', // 'Fibra' o 'Antena'
    LocalidadId: null as number | null,
    Plan: '20 MEGAS',
    Modalidad_Servicio: 'Mensual'
  };

  ubicacionObtenida: boolean = false;
  cargandoUbicacion: boolean = false;

  ngOnInit(): void {
    this.obtenerUsuarioActual();
    this.cargarCatalogos();
    this.cargarOlts();
    this.cargarTorre();
    this.cargarLocalidades();
    this.obtenerClienteDeUrl();
  }

obtenerClienteDeUrl() {
    this.route.queryParams.subscribe(params => {
      if (params['clienteId']) {
        this.instalacion.ClienteId = Number(params['clienteId']);
        this.esClientePreasignado = true;
      } else {
        this.esClientePreasignado = false;
      }
    });
  }



  obtenerUsuarioActual(){
    const usuarioString = localStorage.getItem('usuario');
    if(usuarioString){
      const usuario = JSON.parse(usuarioString);
      this.instalacion.UsuarioId = usuario.UsuarioId;
    }
  }

  cargarCatalogos(){
    this.clienteService.getClientes().subscribe(res => {
      this.clientes = res;
      this.clientesFiltrados = res;
    });
  }

  filtrarClientes() {
    const termino = this.terminoBusquedaCliente.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(cliente => 
      cliente.Nombre_Cliente.toLowerCase().includes(termino)
    );
  }

  cargarOlts(){
    
    this.instalacionService.getOlts().subscribe(res => this.olts = res);

  }

  cargarTorre(){
    this.instalacionService.getTorre().subscribe(res => this.torres = res);
  }

  cargarLocalidades(){
    this.instalacionService.getLocalidades().subscribe(res => this.localidades = res);
  }

  obtenerUbicacion(){
    this.cargandoUbicacion = true; 
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          this.instalacion.Ubicacion_Maps = `https://maps.google.com?q=${lat},${lng}`;
          this.ubicacionObtenida = true;
          this.cargandoUbicacion = false;
        },
        (error) => {
          console.error("Error obteniendo ubicación: ", error);
          alert('No se pudo obtener la ubicación. Asegúrate de darle permisos al navegador.');
          this.cargandoUbicacion = false;          
        }
      );
    }else{
      alert("La geolocalización no es soportada por este navegador.");
      this.cargandoUbicacion = false;     
    }
  }

  guardarInstalacion(){
    if(this.instalacion.Tipo === 'Fibra'){
      this.instalacion.TorreId = null;
    }else if (this.instalacion.Tipo === 'Antena'){
      this.instalacion.OLTId = null;
    }

    if(!this.instalacion.Ubicacion_Maps){
      alert('Debes obtener la ubicación del dispositivo antes de guardar.');
      return;     
    }

    this.instalacionService.crearInstalacion(this.instalacion).subscribe({
      next: (res: any) => {
        alert('Instalación guardada exitosamente')
        if (res && res.InstalacionId) {
          const agregarImagen = confirm('¿Deseas agregar una imagen de instalación para este cliente?');
          if (agregarImagen) {
            this.router.navigate(['/imagen-instalacion/insertar-imagen-instalacion'], {
              queryParams: { instalacionId: res.InstalacionId }
            });
            return;
          }
        }
        this.router.navigate(['/cliente']);
      },
      error: (err) => {
        console.error(err);
        alert('Error al guardar la instalación');        
      }
    });

  }
  
}
