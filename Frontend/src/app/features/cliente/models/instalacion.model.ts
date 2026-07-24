import { Usuario } from "./usuario.model";
import { Cliente } from "./cliente.model";
import { Olt } from "./olt.model"; 
import { Torre } from "./torre.model";

export interface Instalacion{
    InstalacionId: number;
    UsuarioId: number;
    ClienteId: number;
    OLTId?: number;
    TorreId?: number;
    Ubicacion_Maps: string;
    Nombre_Wifi: string;
    Password_Wifi: string;
    Active: boolean;
    Tipo: 'Fibra' | 'Antena';
    Uuid_local?: string;
    Sincronizado: boolean;
    Fecha_Instalacion: Date;

    Usuario?: Usuario;
    Cliente?: Cliente;
    OLT?: Olt;
    Torre?: Torre;
}

export const InstalacionHelpers = {
  isValidTipo: (tipo: string): boolean => 
    tipo === 'Fibra' || tipo === 'Antena',
  
  hasValidRelation: (instalacion: Instalacion): boolean => {
    if (instalacion.Tipo === 'Fibra') {
      return !!instalacion.OLTId && !instalacion.TorreId;
    }
    if (instalacion.Tipo === 'Antena') {
      return !!instalacion.TorreId && !instalacion.OLTId;
    }
    return false;
  }
};