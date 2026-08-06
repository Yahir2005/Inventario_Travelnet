import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <--- OBLIGATORIO PARA ngModel
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../services/cliente';

@Component({
  selector: 'app-insertar-cliente',
  standalone: true,
  // Asegúrate de incluir FormsModule en los imports
  imports: [FormsModule, RouterModule, CommonModule], 
  templateUrl: './insertar-cliente.html',
  styleUrls: ['./insertar-cliente.scss']
})
export class InsertarClienteComponent {
  
  private clienteService = inject(ClienteService);
  private router = inject(Router);

  cliente = {
    Nombre_Cliente: '',
    Telefono: '',
    Direccion: '',
    TipoCliente: ''
  };

  guardarCliente() {
    if (!this.cliente.Nombre_Cliente || !this.cliente.Telefono) {
      alert('Por favor, ingresa al menos el nombre y el teléfono.');
      return;
    }

    this.clienteService.crearCliente(this.cliente).subscribe({
      next: (respuesta:any) => {
        alert('Cliente guardado exitosamente');
        
        const idGenerado = respuesta.ClienteId;

        console.log('ID que se va a enviar:', idGenerado);

        this.router.navigate(['instalacion/insertar-instalacion'], {
          queryParams: {clienteId: idGenerado}
        });

      },
      error: (err) => {
        console.error('Error al guardar:', err);
        alert('Ocurrió un error al intentar guardar el cliente en la base de datos.');
      }
    });
  }
}