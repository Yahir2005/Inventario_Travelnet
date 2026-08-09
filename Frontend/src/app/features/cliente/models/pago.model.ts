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
    Uuid_local: string;
    Sincronizado: string;
    Ultima_modificacion: string;
}