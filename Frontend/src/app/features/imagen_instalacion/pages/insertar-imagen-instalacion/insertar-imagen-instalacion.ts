import { Component, ElementRef, ViewChild, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ImagenInstalacionService } from '../../services/imagen-instalacion';

@Component({
  selector: 'app-insertar-imagen-instalacion',
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './insertar-imagen-instalacion.html',
  styleUrl: './insertar-imagen-instalacion.scss',
})
export class InsertarImagenInstalacion implements OnInit{
  private imagenInstalacionService = inject(ImagenInstalacionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  //Variables para la cámara
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  mediaStream: MediaStream | null = null;
  fotoCapturada: string | null = null;


  imagen_instalacion = {
    InstalacionId: null as number | null,
    Ruta_Imagen: ''
  };

  nombreIngeniero: string = 'Desconocido';
  latitud: number = 0;
  longitud: number = 0;
  direccionFisica: string = 'Obteniendo ubicación...';
  coordenadasObtenidas: boolean = false;

  logoFiberhome = new Image();
  logoTravelNet = new Image();
  logofiberhomeCargado: boolean = false;
  logoTravelNetCargado: boolean = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['instalacionId']) {
        this.imagen_instalacion.InstalacionId = Number(params['instalacionId']);
      }
    });
    this.obtenerUsuarioActual();
    this.cargarLogos();
  }

  ngOnDestroy(): void {
    this.detenerCamara();
  }

  cargarLogos() {
    this.logoFiberhome.src = 'assets/images/FIBERHOME-LOGO.png';
    this.logoFiberhome.onload = () => this.logofiberhomeCargado = true;
    this.logoFiberhome.onerror = () => this.logofiberhomeCargado = false;

    this.logoTravelNet.src = 'assets/images/TravelNet.png';
    this.logoTravelNet.onload = () => this.logoTravelNetCargado = true;
    this.logoTravelNet.onerror = () => this.logoTravelNetCargado = false;
  }

  obtenerUsuarioActual(){
    const usuarioString = localStorage.getItem('usuario');
    if(usuarioString){
      const usuario = JSON.parse(usuarioString);
      this.nombreIngeniero = usuario.Nombre || usuario.Usuario || 'Usuario';
    }
  }

  async iniciarCamara() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); 
      this.videoElement.nativeElement.srcObject = this.mediaStream;

      this.obtenerCoordenadasYDireccion();

    } catch (error) {
      console.error("Error al acceder a la cámara", error);
      alert("No se pudo acceder a la cámara. Revisa los permisos de tu navegador.");
    }
  }

obtenerCoordenadasYDireccion() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        this.latitud = position.coords.latitude;
        this.longitud = position.coords.longitude;
        this.coordenadasObtenidas = true;

        // Usamos OpenStreetMap (gratis) para convertir las coordenadas en dirección
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.latitud}&lon=${this.longitud}`;
          const response = await fetch(url);
          const data = await response.json();
          this.direccionFisica = data.display_name || 'Dirección no encontrada';
        } catch (error) {
          this.direccionFisica = 'Error al obtener la calle';
        }
      });
    }
  }

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

  detenerCamara() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  saveImagen_Instalacion() {
    if (!this.imagen_instalacion.Ruta_Imagen) {
      alert('Por favor, captura una foto antes de guardar.');
      return;
    }

    this.imagenInstalacionService.postImagen_Instalacion(this.imagen_instalacion).subscribe({
      next: (res) => {
        alert('Imagen guardada correctamente');
        this.router.navigate(['/cliente']);
      },
      error: (err) => {
        console.error(err);
        alert('Error al guardar la imagen de instalación');
      }
    });
  }
  
}
