export interface Instalacion{
    InstalacionId: number;
    UsuarioId: number;
    ClienteId: number;
    OLTId: number | null;
    TorreId: number | null;
    LocalidadId: number | null;
    Ubicacion_Maps: string;
    Nombre_Wifi: string;
    Password_Wifi: string;
    Active: boolean;
    Tipo: 'Fibra' | 'Antena';
    Plan?: '20 MEGAS' | '40 MEGAS' | '60 MEGAS' | '80 MEGAS' | '100 MEGAS';
    Modalidad_Servicio?: 'Mensual' | 'Bimestral' | 'Trimestral' | 'Cuatrimestral' | 'Quinquemestral' | 'Semestral' | 'Heptamestral' | 'Octomestral' | 'Nonamestral' | 'Decamestral' | 'Oncemestral' | 'Anual';
    Fecha_Instalacion: string;
}