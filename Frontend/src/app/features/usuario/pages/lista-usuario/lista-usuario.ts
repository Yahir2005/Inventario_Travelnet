import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-lista-usuario',
  imports: [CommonModule],
  templateUrl: './lista-usuario.html',
  styleUrl: './lista-usuario.scss',
})
export class ListaUsuario implements OnInit {

  private usuarioService = inject(UsuarioService);
  usuario = signal<Usuario[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  ngOnInit(): void {
    this.loading.set(true);
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.usuario.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los usuarios');
        this.loading.set(false);
      }
    });
  }
}
