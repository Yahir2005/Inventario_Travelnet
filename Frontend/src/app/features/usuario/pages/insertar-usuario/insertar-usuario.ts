import { Component, inject } from '@angular/core';
import { UsuarioService } from '../../services/usuario';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-insertar-usuario',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule], 
  templateUrl: './insertar-usuario.html',
  styleUrl: './insertar-usuario.scss',
})
export class InsertarUsuario {
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  usuario = {
    Nombre: '',
    Usuario: '',
    Password: '',
    Email: '',
    Telefono: '',
    Ocupacion: ''
  };

  guardarUsuario(){
    this.usuarioService.postCrearUsuario(this.usuario).subscribe({
      next: (respuesta:any) =>{
        alert('Usuario guardado exitosamente');
        
        this.router.navigate(['/usuario'])
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        alert('Ocurrió un error al intentar guardar el usuario en la base de datos.');
      }
    });

  }
}
