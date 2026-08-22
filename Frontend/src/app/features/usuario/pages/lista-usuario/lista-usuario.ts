import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-lista-usuario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-usuario.html',
  styleUrl: './lista-usuario.scss',
})
export class ListaUsuario implements OnInit {
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  usuario = signal<Usuario[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    this.usuarioService.getUsuarios().subscribe({
      next: (data: Usuario[]) => {
        this.usuario.set(data);
        this.loading.set(false);
      },
      error: () => {
          this.error.set('Error al cargar los usuarios');
          this.loading.set(false);
      }
    });
  }

  editarUsuario(id: number){
    this.router.navigate(['/usuario/actualizar-usuario', id]);
  }

  cambiarEstado(usuarioTarget: Usuario){
    const accion = usuarioTarget.Active ? 'inhabilitar' : 'habilitar';
    const confirmacion = confirm(`¿Estás seguro de que deseas ${accion} al usuario ${usuarioTarget.Nombre}?`);
    
    if (!confirmacion) return;
    const nuevoEstado = !usuarioTarget.Active;

   this.usuarioService.putUsuario(usuarioTarget.UsuarioId,{Active: nuevoEstado}).subscribe({
    next: () =>{
        usuarioTarget.Active = nuevoEstado;
        alert(`Usuario ${accion}do correctamente.`);
    },
    error: (err) => {
      console.error(err);
      alert(`Ocurrió un error al intentar ${accion} el usuario.`);
    }
   });
  }
}