import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { Cliente } from '../models/cliente.model';
import { Instalacion } from '../models/instalacion.model';
import { Pago } from '../models/pago.model';
import { ClienteListView } from '../models/cliente-list-view.model';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  constructor(private http: HttpClient) {}

  private readonly clientesUrl = '/assets/data/clientes.json';
  private readonly instalacionesUrl = '/assets/data/instalacion.json';
  private readonly pagosUrl = '/assets/data/pago.json';

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.clientesUrl);
  }

  getClientesListView(): Observable<ClienteListView[]> {
    return forkJoin({
      clientes: this.http.get<Cliente[]>(this.clientesUrl),
      instalaciones: this.http.get<Instalacion[]>(this.instalacionesUrl),
      pagos: this.http.get<Pago[]>(this.pagosUrl),
    }).pipe(
      map(({ clientes, instalaciones, pagos }) =>
        clientes.map((cliente) => this.buildListView(cliente, instalaciones, pagos))
      )
    );
  }

  private buildListView(
    cliente: Cliente,
    instalaciones: Instalacion[],
    pagos: Pago[]
  ): ClienteListView {
    const instalacion = instalaciones.find((i) => i.ClienteId === cliente.ClienteId);

    const pagosInstalacion = instalacion
      ? pagos.filter((p) => p.InstalacionId === instalacion.InstalacionId)
      : [];

    const ultimoPago = pagosInstalacion.length
      ? [...pagosInstalacion].sort(
          (a, b) => new Date(b.Fecha_Pago).getTime() - new Date(a.Fecha_Pago).getTime()
        )[0]
      : null;

    const debe = ultimoPago ? ultimoPago.Estado_Pago !== 'Completado' : false;

    return {
      idCliente: cliente.ClienteId,
      Nombre: cliente.Nombre_Cliente,
      Maps: instalacion?.Ubicacion_Maps ?? '',
      Pagos: {
        estado: ultimoPago
          ? debe
            ? 'Debe'
            : `Próximo pago: ${ultimoPago.Fecha_Pago}`
          : 'Sin pagos registrados',
        debe,
      },
      Modalidad: ultimoPago?.Modalidad_Servicio ?? 'N/A',
      Instalacion: instalacion?.Tipo ?? 'N/A',
    };
  }
}