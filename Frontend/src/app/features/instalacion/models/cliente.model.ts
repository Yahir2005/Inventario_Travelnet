export interface Cliente {
  ClienteId: number;
  Nombre_Cliente: string;
  Telefono: string;
  Calle?: string | null;
  Numero?: string | null;
  Colonia?: string | null;
  Codigo_Postal?: string | null;
  Direccion?: string;
  Saldo_Actual?: number;
  Active: boolean;
  TipoCliente: 'Fisica' | 'Moral';
}

