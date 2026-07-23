export interface PagoHistorial {
  PagoId: number;
  Fecha_Pago: string;
  Monto: number;
  Estado_Pago: 'Completado' | 'Incompleto' | 'Pendiente';
  Tipo_Pago: 'Efectivo' | 'Transferencia' | 'Otro';
}

export interface PagosInfo {
  estado: string;
  fecha_proximo_pago: string | null;
  debe: boolean;
  monto_adeudo?: number;
}

export interface InstalacionDetalle {
  InstalacionId: number;
  Fecha_Instalacion: string;
  Ubicacion_Maps: string;
  Nombre_Wifi: string;
  Password_Wifi: string;
  Active: boolean;
  Tipo: 'Fibra' | 'Antena';
  
  Equipo_Asignado: {
    TipoEquipo: 'OLT' | 'Torre';
    NombreEquipo: string;
    UbicacionEquipo: string;
  };
  
  Nombre_Instalador: string; 
  
  Uuid_local: string | null;
  Sincronizado: boolean;
}

export interface DetallesCliente {
  Instalacion: InstalacionDetalle;
  
  Plan: '20 MEGAS' | '40 MEGAS' | '60 MEGAS' | '80 MEGAS' | '100 MEGAS';
  Cantidad_Pagos: number;
  Pagos_Historial: PagoHistorial[];
}

export interface Cliente {
    idCliente: number;
    Nombre: string;
    Maps: string;
    Pagos: PagosInfo;
    Modalidad: string;
    Tipo_Conexion: string; 
    Detalles: DetallesCliente;
    TipoCliente: 'Fisica' | 'Moral';
}