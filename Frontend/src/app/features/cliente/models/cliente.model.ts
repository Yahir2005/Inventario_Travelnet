export interface Cliente{
  ClienteId: number;
  Nombre_Cliente: number;
  Telefono: string;
  Direccion: string;
  Active: boolean;
  TipoCliente: 'Fisica' | 'Moral'
}

