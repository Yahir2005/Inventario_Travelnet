import { Usuario } from "./usuario.model";
import { Cliente } from "./cliente.model";
import { Olt } from "./olt.model";
import { Torre } from "./torre.model";

export interface Instalacion {
  InstalacionId?: number;
  UsuarioId: number;
  ClienteId?: number;
  OLTId?: number;
  TorreId?: number;
  Ubicacion_Maps: string;
  Nombre_Wifi: string;
  Password_Wifi: string;
  Active?: boolean | number;
  Tipo: 'Fibra' | 'Antena';
  LocalidadId?: number;
  Plan?: '20 MEGAS' | '40 MEGAS' | '60 MEGAS' | '80 MEGAS' | '100 MEGAS' | null;
  Modalidad_Servicio?: 'Mensual' | 'Bimestral' | 'Trimestral' | 'Cuatrimestral' | 'Quinquemestral' | 'Semestral' | 'Heptamestral' | 'Octomestral' | 'Nonamestral' | 'Decamestral' | 'Oncemestral' | 'Anual' | null;
  Localidad?: string;
  Uuid_local?: string | null;
  Sincronizado?: boolean | number;
  Fecha_Instalacion?: string; 
  
  Usuario?: Usuario;
  Cliente?: Cliente;
  OLT?: Olt;
  Torre?: Torre;  
}

export const InstalacionHelpers = {
  isValidTipo: (tipo: string): boolean => 
    tipo === 'Fibra' || tipo === 'Antena',
  
  hasValidRelation: (instalacion: Partial<Instalacion>): boolean => {
    if (instalacion.Tipo === 'Fibra') {
      return !!instalacion.OLTId && !instalacion.TorreId;
    }
    if (instalacion.Tipo === 'Antena') {
      return !!instalacion.TorreId && !instalacion.OLTId;
    }
    return false;
  }
};