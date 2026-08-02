export interface ClienteDetallado {
  ClienteId: number;
  Nombre_Cliente: string;
  Telefono: string;
  Active: boolean; 
  Direccion?: string; 
  TipoCliente?: 'Fisica' | 'Moral'; 

  Instalacion_Activa?: boolean | null;
  Ubicacion_Maps?: string | null;
  Nombre_Wifi?: string | null;
  Password_Wifi?: string | null;
  Tipo?: 'Fibra' | 'Antena' | null;
  Localidad?: string | null;
  Fecha_Instalacion?: string | null; 

  OLTId?: number | null;
  Nombre_OLT?: string | null;
  Ubicacion_OLT?: string | null;

  TorreId?: number | null;
  Nombre_Torre?: string | null;
  Ubicacion_Torre?: string | null;

  Modalidad_Servicio?: 'Mensual' | 'Bimestral' | 'Trimestral' | 'Anual' | 'Otro' | null;
  Fecha_Pago?: string | null;
  Estado_Pago?: 'Completado' | 'Incompleto' | 'Pendiente' | null;
  Monto?: string | number | null;
  Plan?: '20 MEGAS' | '40 MEGAS' | '60 MEGAS' | '80 MEGAS' | '100 MEGAS' | null;
}