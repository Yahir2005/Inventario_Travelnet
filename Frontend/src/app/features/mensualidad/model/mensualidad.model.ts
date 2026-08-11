export interface Mensualidad {
    MensualidadId: number;
    InstalacionId: number;
    UsuarioId?: number;
    ClienteId?: number;
    PagoId?: number | null;
    Mes: number;
    Anio: number;
    Concepto: string;
    Monto: number;
    Active: boolean;
    Estado: 'Pendiente' | 'Pagado' | 'Vencido';
    Fecha_Pago?: string | null;
    Tipo_Pago?: 'Efectivo' | 'Transferencia' | 'Cheque' | 'Trueque' | 'Paypal' | 'MercadoPago' | 'Pagaré' | null;
    MotivoCancelacion?: string | null;
}

export interface PagoMesCancelado {
    PagoMesCanceladoId?: number;
    MensualidadId: number;
    Motivo: string;
}