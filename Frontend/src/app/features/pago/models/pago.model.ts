export interface Pago {
    PagoId: number;
    InstalacionId: number;
    UsuarioId: number;
    Modalidad_Servicio: 'Mensual' | 'Bimestral' | 'Trimestral' | 'Anual' | 'Otro';
    Fecha_Pago: string;
    Tipo_Pago: 'Efectivo' | 'Transferencia' | 'Otro';
    Estado_Pago: 'Completado' | 'Incompleto' | 'Pendiente';
    Monto: number;
    Plan: '20 MEGAS' | '40 MEGAS' | '60 MEGAS' | '80 MEGAS' | '100 MEGAS';
}