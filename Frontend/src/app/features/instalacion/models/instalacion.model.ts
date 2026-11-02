export interface Instalacion {
    InstalacionId: number;
    UsuarioId: number;
    ClienteId: number;
    TarifaId?: number | null;
    PlanId?: number | null;
    InfraestructuraId?: number | null;
    OLTId: number | null;
    TorreId: number | null;
    LocalidadId: number | null;
    Ubicacion_Maps: string;
    Nombre_Wifi: string;
    Password_Wifi: string;
    Active: boolean;
    Uuid_local?: string | null;
    Sincronizado?: number | boolean;
    Tipo: 'Fibra' | 'Antena';
    Tipo_Infraestructura?: 'OLT' | 'Torre';
    Nombre_Infraestructura?: string;
    Plan?: string;
    Velocidad_Mbps?: number;
    Modalidad_Servicio?: 'Mensual' | 'Bimestral' | 'Trimestral' | 'Cuatrimestral' | 'Quinquemestral' | 'Semestral' | 'Heptamestral' | 'Octomestral' | 'Nonamestral' | 'Decamestral' | 'Oncemestral' | 'Anual';
    Precio_Tarifa?: number;
    Fecha_Instalacion: string;
}