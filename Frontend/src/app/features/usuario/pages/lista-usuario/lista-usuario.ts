import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario';
import { Usuario } from '../../models/usuario.model';

/**
 * ============================================================================
 * COMPONENTE: LISTA DE USUARIOS (lista-usuario.ts)
 * ============================================================================
 * Muestra la tabla con todo el personal registrado en el sistema (Administradores,
 * Técnicos, Cobradores, etc.) y permite editar sus perfiles o habilitar/inhabilitar su acceso.
 */
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
  esAdmin = false;

  /** Al iniciar, comprueba si el usuario actual es Administrador y descarga la lista de usuarios */
  ngOnInit(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      this.esAdmin = usuario.Ocupacion === 'Administrador';
    }
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

  /** Redirige al formulario de edición del usuario seleccionado */
  editarUsuario(id: number){
    this.router.navigate(['/usuario/actualizar-usuario', id]);
  }

  /** Habilita o inhabilita el acceso de un usuario al sistema previa confirmación */
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