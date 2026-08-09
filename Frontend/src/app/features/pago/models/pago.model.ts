export interface Pago {
    PagoId: number;
    InstalacionId: number;
    UsuarioId: number;
    Fecha_Pago: string;
    Tipo_Pago: 'Efectivo' | 'Transferencia' | 'Cheque' | 'Trueque' | 'Paypal' | 'MercadoPago' | 'Pagaré';
    Numero_cuenta: string;
    Descuento: number | null;
    Estado_Pago: 'Completado' | 'Incompleto' | 'Pendiente';
    Monto: number;
}

export interface PagoDetallado {
    InstalacionId: number;
    Plan?: '20 MEGAS' | '40 MEGAS' | '60 MEGAS' | '80 MEGAS' | '100 MEGAS' | null;
    Modalidad_Servicio: 'Mensual' | 'Bimestral' | 'Trimestral' | 'Cuatrimestral' | 'Quinquemestral' | 'Semestral' | 'Heptamestral' | 'Octomestral' | 'Nonamestral' | 'Decamestral' | 'Oncemestral' | 'Anual' | null;
    Fecha_Instalacion: string;
    Instalacion_Activa?: boolean | null;

    ClienteId: number;
    Nombre_Cliente: string;
    Telefono: string;
    Localidad?: string | null;

    PagoId?: number | null;
    Fecha_Pago?: string | null;
    Estado_Pago?: 'Completado' | 'Incompleto' | 'Pendiente' | null;
    Monto?: string | number | null;
    Descuento?: string | number | null;
    Tipo_Pago?: 'Efectivo' | 'Transferencia' | 'Cheque' | 'Trueque' | 'Paypal' | 'MercadoPago' | 'Pagaré' | null;

    Ultimo_Mes_Pagado?: number | null;
    Ultimo_Anio_Pagado?: number | null;
    Concepto_Ultimo_Pago?: string | null;

    Atrasado: boolean;
    Dias_Atraso?: number;
}

export type PagoForm = {
    InstalacionId: number;
    UsuarioId: number | null;
    Tipo_Pago: 'Efectivo' | 'Transferencia' | 'Cheque' | 'Trueque' | 'Paypal' | 'MercadoPago' | 'Pagaré';
    Numero_cuenta: string;
    Descuento: number | null;
    Monto: number | null;
    Estado_Pago: 'Completado' | 'Incompleto' | 'Pendiente';
    Mes: number;
    Anio: number;
    Cantidad_Meses: number;
    Concepto: string;
};