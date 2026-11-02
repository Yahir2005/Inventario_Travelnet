export type ModalidadTarifa =
  | 'Mensual'
  | 'Bimestral'
  | 'Trimestral'
  | 'Cuatrimestral'
  | 'Quinquemestral'
  | 'Semestral'
  | 'Heptamestral'
  | 'Octomestral'
  | 'Nonamestral'
  | 'Decamestral'
  | 'Oncemestral'
  | 'Anual';

export interface PlanTarifa {
  TarifaId?: number;
  PlanId?: number;
  Nombre_Plan?: string;
  Velocidad_Mbps?: number;
  Modalidad: ModalidadTarifa;
  Precio: number;
}

export interface Plan {
  PlanId?: number;
  Nombre: string;
  Velocidad_Mbps: number;
  Active?: boolean;
  Tarifas?: PlanTarifa[];
}
