export interface Mensualidad {
    MensualidadId: number;
    InstalacionId: number;
    UsuarioId?: number;
    ClienteId?: number;
    DetalleId?: number | null;
    PagoId?: number | null;
    Monto_Abonado?: number | null;
    Mes: number;
    Anio: number;
    Concepto: string;
    Monto: number;
    Active: boolean;
    Estado: 'Pendiente' | 'Pagado' | 'Vencido' | 'Incompleto';
    Fecha_Pago?: string | null;
    MetodoPagoId?: number | null;
    Metodo_Pago?: string | null;
    Tipo_Pago?: 'Efectivo' | 'Transferencia' | 'Cheque' | 'Trueque' | 'Paypal' | 'MercadoPago' | 'Pagaré' | null;
    CancelacionId?: number | null;
    MotivoId?: number | null;
    Motivo_Descripcion?: string | null;
    Observaciones?: string | null;
    MotivoCancelacion?: string | null;
}

export interface PagoMesCancelado {
    CancelacionId?: number;
    PagoMesCanceladoId?: number;
    PagoId?: number;
    MensualidadId: number;
    UsuarioId?: number;
    MotivoId?: number;
    Motivo: string;
    Observaciones?: string;
    Fecha_Cancelacion?: string;
}