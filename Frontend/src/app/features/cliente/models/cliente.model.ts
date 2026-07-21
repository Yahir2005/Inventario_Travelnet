export interface Cliente {
    ClienteId: number;
    Nombre_Cliente: string;
    Telefono: string;
    Direccion: string;
    Active: Boolean;
    TipoCliente: 'Fisica' | 'Moral';
}