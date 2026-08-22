import { Component,inject,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-actualizar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './actualizar-usuario.html',
  styleUrl: './actualizar-usuario.scss',
})
export class ActualizarUsuario {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);

  usuarioForm: Partial<Usuario> = {};
  cargando = true;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if(id){
        this.cargarUsuario(Number(id));
      }
    })
  }

  cargarUsuario(id: number){
    this.usuarioService.getByIdUsuario(id).subscribe({
      next: (data) => {
        this.usuarioForm = {...data,Password: ''};
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar el usuario',err);
        alert('No se pudo carar la información del usuario');
        this.router.navigate(['/usuario']);
      }
    })
  }

  guardarCambios(){
    if(!this.usuarioForm.UsuarioId) return;
    this.usuarioService.putUsuario(this.usuarioForm.UsuarioId,this.usuarioForm).subscribe({
      next: () => {
        alert('Usuario actualizado correctamente')
        this.router.navigate(['/usuario']);
      },
      error: (err) => {
        console.error('Error al actualizar ',err);
        alert('Ocurrió un error al actualizar el usuario');
      }
    });
  }
}
