import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario';

/**
 * ============================================================================
 * COMPONENTE: INICIO DE SESIÓN / LOGIN (login.ts)
 * ============================================================================
 * Pantalla de acceso al sistema TravelNet.
 * Permite ingresar usuario y contraseña, alternar la visibilidad de la contraseña,
 * y cambiar entre Modo Claro y Modo Oscuro antes de entrar a la plataforma.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private authService = inject(UsuarioService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  credenciales = { Usuario: '', Password: '' };
  mensajeError = '';

  mostrarPassword = false;
  isDarkMode = false;

  ngOnInit(): void {
    this.checkCurrentTheme();
  }

  /** Detecta si el documento HTML tiene activo el tema oscuro (`data-bs-theme="dark"`) */
  checkCurrentTheme(): void {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    this.isDarkMode = currentTheme === 'dark';
  }

  /** Alterna entre Modo Claro y Modo Oscuro y guarda la preferencia en `localStorage` */
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    const newTheme = this.isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  /** Muestra u oculta los caracteres del campo de contraseña */
  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  /** Envía las credenciales al backend; si son correctas redirige a `/home`, o muestra error */
  onLogin() {
    this.authService.login(this.credenciales).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: () => {
        this.mensajeError = 'Credenciales incorrectas. Intenta de nuevo';
        this.cdr.markForCheck();
      }
    });
  }
}
