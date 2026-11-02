export interface Pago {
    PagoId: number;
    InstalacionId: number;
    UsuarioId: number;
    MetodoPagoId?: number;
    Metodo_Pago?: 'Efectivo' | 'Transferencia' | 'Cheque' | 'Trueque' | 'Paypal' | 'MercadoPago' | 'Pagaré';
    Fecha_Pago: string;
    Tipo_Pago: 'Efectivo' | 'Transferencia' | 'Cheque' | 'Trueque' | 'Paypal' | 'MercadoPago' | 'Pagaré';
    Numero_cuenta: string;
    Referencia_Externa?: string;
    Direccion_IP?: string;
    Descuento: number | null;
    Estado_Pago: 'Completado' | 'Incompleto' | 'Pendiente' | 'Cancelado';
    Monto: number;
    Uuid_local: string;
    Sincronizado: string;
    Ultima_modificacion: string;
}