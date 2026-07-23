export interface Instalacion{
    InstalacionId: number;
    UsuarioId: number;
    ClienteId: number;
    OLTId: number | null;
    TorreId: number | null;
    Ubicacion_Maps: string;
    Nombre_Wifi: string;
    Password_Wifi: string;
    Active: boolean;
    Tipo: 'Fibra' | 'Antena';
    Fecha_Instalacion: string;
}