export interface Torre {
    InfraestructuraId?: number;
    TorreId: number;
    Tipo?: 'OLT' | 'Torre';
    Nombre: string;
    Ubicacion: string;
}