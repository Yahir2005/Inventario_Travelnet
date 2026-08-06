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
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['instalacionId']) {
        this.imagen_instalacion.InstalacionId = Number(params['instalacionId']);
      }
    });
  }

  ngOnDestroy(): void {
    this.detenerCamara();
  }

  async iniciarCamara() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); 
      this.videoElement.nativeElement.srcObject = this.mediaStream;
    } catch (error) {
      console.error("Error al acceder a la cámara", error);
      alert("No se pudo acceder a la cámara. Revisa los permisos de tu navegador.");
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
      // Convertimos la imagen a texto (Base64)
      this.fotoCapturada = canvas.toDataURL('image/jpeg', 0.8); 
      this.imagen_instalacion.Ruta_Imagen = this.fotoCapturada;
      
      this.detenerCamara(); 
    }
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
