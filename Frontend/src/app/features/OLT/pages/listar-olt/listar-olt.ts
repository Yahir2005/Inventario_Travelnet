import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OltService } from '../../service/olt';
import { Olt } from '../../model/olt.model';

@Component({
  selector: 'app-listar-olt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listar-olt.html',
  styleUrl: './listar-olt.scss',
})
export class ListarOLT implements OnInit {
  private oltService = inject(OltService);
  private router = inject(Router);

  olts = signal<Olt[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  esAdmin = false;

  ngOnInit(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      this.esAdmin = usuario.Ocupacion === 'Administrador';
    }
    this.cargarOlts();
  }

  cargarOlts(){
    this.loading.set(true);
    this.oltService.getOlts().subscribe({
      next: (data) => {
        this.olts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar las OLTs', err);
        this.error.set('No se pudieron cargar las OLTs.');
        this.loading.set(false);
      }
    });
  }

  agregarOlt(){
    if (!this.esAdmin) return;
    this.router.navigate(['/OLT/insertar-olt']);
  }

  editarOlt(olt: Olt){
    if (!this.esAdmin) return;
    this.router.navigate(['/OLT/actualizar-olt', olt.OLTId]);
  }
}
