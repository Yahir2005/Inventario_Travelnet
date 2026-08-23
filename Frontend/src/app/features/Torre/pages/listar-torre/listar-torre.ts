import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TorreService } from '../../service/torre';
import { Torre } from '../../model/torre.model';

@Component({
  selector: 'app-listar-torre',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listar-torre.html',
  styleUrl: './listar-torre.scss',
})
export class ListarTorre implements OnInit {
  private torreService = inject(TorreService);
  private router = inject(Router);

  torres = signal<Torre[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  esAdmin = false;

  ngOnInit(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      this.esAdmin = usuario.Ocupacion === 'Administrador';
    }
    this.cargarTorres();
  }

  cargarTorres(){
    this.loading.set(true);
    this.torreService.getTorres().subscribe({
      next: (data) => {
        this.torres.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar las torres', err);
        this.error.set('No se pudieron cargar las torres.');
        this.loading.set(false);
      }
    });
  }

  agregarTorre(){
    if (!this.esAdmin) return;
    this.router.navigate(['/Torre/insertar-torre']);
  }

  editarTorre(torre: Torre){
    if (!this.esAdmin) return;
    this.router.navigate(['/Torre/actualizar-torre', torre.TorreId]);
  }
}
