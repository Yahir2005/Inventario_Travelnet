import { Component, ElementRef, ViewChild, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ImagenInstalacionService } from '../../services/imagen-instalacion';
import { SyncService } from '../../../pago/services/sync.service';

/**
 * ============================================================================
 * COMPONENTE: CAPTURAR EVIDENCIA DE INSTALACIÓN (insertar-imagen-instalacion.ts)
 * ============================================================================
 * Permite al técnico abrir la cámara de su celular/computadora o subir una foto,
 * estampar automáticamente una marca de agua con logos, fecha, nombre del técnico
 * y coordenadas GPS en un `<canvas>`, y guardarla tanto con internet como en Modo Offline.
 */
@Component({
  selector: 'app-insertar-imagen-instalacion',
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './insertar-imagen-instalacion.html',
  styleUrl: './insertar-imagen-instalacion.scss',
})
export class InsertarImagenInstalacion implements OnInit{
  private imagenInstalacionService = inject(ImagenInstalacionService);
  private syncService = inject(SyncService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Variables para la cámara: @ViewChild conecta estas variables con las etiquetas <video> y <canvas> del HTML
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  mediaStream: MediaStream | null = null;
  fotoCapturada: string | null = null;

  // Datos que se enviarán al backend o a la cola offline
  imagen_instalacion = {
    InstalacionId: null as number | null,
    Ruta_Imagen: '',
    Uuid_local: null as string | null
  };

  // Datos que se imprimen en la marca de agua de la foto
  nombreIngeniero: string = 'Desconocido';
  latitud: number = 0;
  longitud: number = 0;
  direccionFisica: string = 'Obteniendo ubicación...';
  coordenadasObtenidas: boolean = false;

  // Imágenes de los logotipos para dibujarlos sobre la fotografía
  logoFiberhome = new Image();
  logoTravelNet = new Image();
  logofiberhomeCargado: boolean = false;
  logoTravelNetCargado: boolean = false;

  /** Al abrir la pantalla, lee el ID de la instalación de la URL, identifica al técnico y precarga los logos */
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['instalacionId']) {
        this.imagen_instalacion.InstalacionId = Number(params['instalacionId']);
      }
    });
    this.obtenerUsuarioActual();
    this.cargarLogos();
  }

  /** Al salir de la pantalla, apaga la cámara para no gastar batería ni dejar el foco encendido */
  ngOnDestroy(): void {
    this.detenerCamara();
  }

  /** Precarga en memoria los logotipos de Fiberhome y TravelNet desde la carpeta assets */
  cargarLogos() {
    this.logoFiberhome.src = 'assets/images/FIBERHOME-LOGO.png';
    this.logoFiberhome.onload = () => this.logofiberhomeCargado = true;
    this.logoFiberhome.onerror = () => this.logofiberhomeCargado = false;

    this.logoTravelNet.src = 'assets/images/TravelNet.png';
    this.logoTravelNet.onload = () => this.logoTravelNetCargado = true;
    this.logoTravelNet.onerror = () => this.logoTravelNetCargado = false;
  }

  /** Obtiene el nombre del técnico que inició sesión para estamparlo en la evidencia */
  obtenerUsuarioActual(){
    const usuarioString = localStorage.getItem('usuario');
    if(usuarioString){
      const usuario = JSON.parse(usuarioString);
      this.nombreIngeniero = usuario.Nombre || usuario.Usuario || 'Usuario';
    }
  }

  /** Solicita permiso al navegador para abrir la cámara trasera ('environment') en alta definición */
  async iniciarCamara() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 
          'environment' ,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      }); 
      this.videoElement.nativeElement.srcObject = this.mediaStream;

      this.obtenerCoordenadasYDireccion();

    } catch (error) {
      console.error("Error al acceder a la cámara", error);
      alert("No se pudo acceder a la cámara. Revisa los permisos de tu navegador.");
    }
  }

  /** Obtiene las coordenadas GPS del dispositivo y, si hay internet, consulta el nombre de la calle en OpenStreetMap */
  obtenerCoordenadasYDireccion() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        this.latitud = position.coords.latitude;
        this.longitud = position.coords.longitude;
        this.coordenadasObtenidas = true;

        if (!this.syncService.estaEnLinea()) {
          this.direccionFisica = `GPS: ${this.latitud.toFixed(5)}, ${this.longitud.toFixed(5)} (Modo Offline)`;
          return;
        }

        // Usamos OpenStreetMap (gratis) para convertir las coordenadas en dirección
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.latitud}&lon=${this.longitud}`;
          const response = await fetch(url);
          const data = await response.json();
          this.direccionFisica = data.display_name || 'Dirección no encontrada';
        } catch (error) {
          this.direccionFisica = `GPS: ${this.latitud.toFixed(5)}, ${this.longitud.toFixed(5)}`;
        }
      });
    }
  }

  /** Congela el cuadro actual del video en un lienzo (<canvas>) y dibuja encima la ficha técnica de ingeniería */
  capturarFoto() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const boxX = 15;
      const boxY = canvas.height - 280;
      const boxWidth = 400;

      context.fillStyle = 'rgba(240,240,240,0.85)'
    
      // Fondo Blanco semitransparente
      context.fillStyle = 'rgba(240, 240, 240, 0.85)';
      context.fillRect(boxX, boxY, boxWidth, 260);

    if (this.logofiberhomeCargado && this.logoFiberhome.naturalWidth > 0) {
      // Posición X, Posición Y, Ancho, Alto
      context.drawImage(this.logoFiberhome, boxX + 15, boxY + 10, 160, 45);
    }
    if (this.logoTravelNetCargado && this.logoTravelNet.naturalWidth > 0) {
      context.drawImage(this.logoTravelNet, boxX + 220, boxY + 5, 160, 50);
    }     

      // Cabecera Azul
      context.fillStyle = '#4c5eb3'; // Color azul similar a tu foto
      context.fillRect(boxX, boxY + 60, boxWidth, 70);

      // Textos de la Cabecera
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.font = 'bold 20px Arial';
      context.fillText('Registros de ingeniería', boxX + (boxWidth / 2), boxY + 90);
      
      context.font = '18px Arial';
      context.fillText(this.nombreIngeniero, boxX + (boxWidth / 2), boxY + 115);

      // Textos de los Datos (Tiempo, Ubicación, Coordenadas)
      context.fillStyle = 'black';
      context.textAlign = 'left';
      context.font = '16px Arial';
      
      // Tiempo
      const fechaActual = new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
      context.fillText('Tiempo', boxX + 10, boxY + 160);
      context.fillText(`: ${fechaActual}`, boxX + 100, boxY + 160);

      // Coordenadas (Abajo)
      context.fillText('Coordenadas', boxX + 10, boxY + 240);
      context.fillText(`: ${this.latitud.toFixed(6)}°N, ${this.longitud.toFixed(6)}°W`, boxX + 100, boxY + 240);

      // Ubicación (Con salto de línea automático para direcciones largas)
      context.fillText('Ubicación', boxX + 10, boxY + 190);
      this.dibujarTextoMultilinea(context, `: ${this.direccionFisica}`, boxX + 100, boxY + 190, boxWidth - 110, 20);

      // Convertimos la imagen a texto (Base64)
      this.fotoCapturada = canvas.toDataURL('image/jpeg', 0.8); 
      this.imagen_instalacion.Ruta_Imagen = this.fotoCapturada;
      
      this.detenerCamara(); 
    }
  }

  // Función de ayuda para que la dirección no se salga del cuadro blanco
  dibujarTextoMultilinea(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  /** Detiene todas las pistas de video activas de la cámara */
  detenerCamara() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  /** Guarda la fotografía en el servidor o la encola en IndexedDB si no hay internet o la instalación aún es temporal (< 0) */
  async saveImagen_Instalacion() {
    if (!this.imagen_instalacion.Ruta_Imagen) {
      alert('Por favor, captura una foto antes de guardar.');
      return;
    }

    if (!this.imagen_instalacion.Uuid_local && typeof crypto !== 'undefined' && crypto.randomUUID) {
      this.imagen_instalacion.Uuid_local = crypto.randomUUID();
    }

    if (!this.syncService.estaEnLinea() || Number(this.imagen_instalacion.InstalacionId) < 0) {
      await this.guardarImagenOffline();
      return;
    }

    this.imagenInstalacionService.postImagen_Instalacion(this.imagen_instalacion).subscribe({
      next: () => {
        alert('Imagen guardada correctamente');
        this.router.navigate(['/cliente']);
      },
      error: async (err) => {
        console.error(err);
        if (err.status === 0 || err.status >= 500) {
          await this.guardarImagenOffline();
        } else {
          alert('Error al guardar la imagen de instalación');
        }
      }
    });
  }

  /** Encola la foto en la base de datos local del navegador para subirla automáticamente cuando regrese la señal */
  private async guardarImagenOffline(): Promise<void> {
    try {
      await this.syncService.encolarImagenOffline(this.imagen_instalacion);
      alert('Sin conexión: Evidencia guardada localmente. Se sincronizará cuando vuelva la red.');
      this.router.navigate(['/cliente']);
    } catch (error) {
      console.error('Error guardando imagen offline:', error);
      alert('Error al guardar la imagen localmente.');
    }
  }

  /** Permite seleccionar una foto existente desde la galería del teléfono/PC y la comprime a máximo 1920px */
  cargarImagenManual(event: Event) {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = this.canvasElement.nativeElement;
        
        let width = img.width;
        let height = img.height;
        const max_dim = 1920;
        
        if (width > height) {
          if (width > max_dim) {
            height = Math.round((height * max_dim) / width);
            width = max_dim;
          }
        } else {
          if (height > max_dim) {
            width = Math.round((width * max_dim) / height);
            height = max_dim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          this.fotoCapturada = canvas.toDataURL('image/jpeg', 0.8);
          this.imagen_instalacion.Ruta_Imagen = this.fotoCapturada;
          this.detenerCamara(); 
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    
    // Limpiar el input para permitir subir la misma imagen nuevamente si se elimina
    element.value = '';
  }
  
}
