export interface InstalacionDetallada {
    InstalacionId: number;
    UsuarioId: number;
    ClienteId: number | null;
    OLTId: number | null;
    TorreId: number | null;
    LocalidadId: number | null;
    Ubicacion_Maps: string;
    Nombre_Wifi: string;
    Password_Wifi: string;
    Instalacion_Activa: boolean;
    Tipo: 'Fibra' | 'Antena' | null;
    Plan?: '20 MEGAS' | '40 MEGAS' | '60 MEGAS' | '80 MEGAS' | '100 MEGAS' | null;
    Modalidad_Servicio?: 'Mensual' | 'Bimestral' | 'Trimestral' | 'Cuatrimestral' | 'Quinquemestral' | 'Semestral' | 'Heptamestral' | 'Octomestral' | 'Nonamestral' | 'Decamestral' | 'Oncemestral' | 'Anual' | null;
    Fecha_Instalacion: string;
    Nombre_Cliente?: string | null;
    Telefono?: string | null;
    Localidad_Nombre?: string | null;
    Nombre_OLT?: string | null;
    Nombre_Torre?: string | null;
    Cantidad_Imagenes?: number;
    Ultima_Imagen?: string | null;
}
