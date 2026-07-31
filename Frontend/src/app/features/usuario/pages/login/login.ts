import { Component,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(UsuarioService);
  private router = inject(Router);

  credenciales = { Usuario: '', Password: ''};
  mensajeError = '';

  onLogin(){
    this.authService.login(this.credenciales).subscribe({
      next: (res) => {
        this.router.navigate(['/cliente']);
      },
      error: (err) => {
        this.mensajeError = "Credenciales incorrectas. Intenta de nuevo";
      }
    });
  }
}
