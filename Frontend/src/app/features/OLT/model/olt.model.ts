export interface Olt {
    InfraestructuraId?: number;
    OLTId: number;
    Tipo?: 'OLT' | 'Torre';
    Nombre: string;
    Ubicacion: string;
}