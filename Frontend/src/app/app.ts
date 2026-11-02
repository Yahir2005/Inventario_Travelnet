import { Component, inject, OnInit, signal } from '@angular/core';
import { Router,RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { SyncService } from './features/pago/services/sync.service';

/**
 * COMPONENTE RAÍZ DE LA APLICACIÓN (App)
 * --------------------------------------
 * Es el contenedor principal de todo el sitio web (`<app-root>`).
 * Muestra la barra de navegación superior (`Navbar`) en todas las pantallas excepto en `/login`,
 * y al iniciar la aplicación verifica si hay internet para sincronizar automáticamente
 * cualquier registro que haya quedado pendiente en modo Offline.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  public router = inject(Router);
  private syncService = inject(SyncService);

  ngOnInit() {
    // Si al abrir la página hay conexión a internet, sube los registros pendientes guardados en IndexedDB
    if (this.syncService.estaEnLinea()) {
      this.syncService.sincronizarTodo();
    }
  }
}
