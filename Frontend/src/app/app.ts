import { Component, inject, OnInit, signal } from '@angular/core';
import { Router,RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { SyncService } from './features/pago/services/sync.service';

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
    if (this.syncService.estaEnLinea()) {
      this.syncService.sincronizarTodo();
    }
  }
}
