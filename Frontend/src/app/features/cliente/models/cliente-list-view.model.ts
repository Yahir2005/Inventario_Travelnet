export interface ClienteListView {
    idCliente: number;
    Nombre: string;
    Maps: string;
    Pagos :{
        estado: string;
        debe: boolean;
    };
    Modalidad: string;
    Instalacion: string;
}