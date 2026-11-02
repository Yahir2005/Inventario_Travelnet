export interface CorteCaja {
    CorteId?: number;
    UsuarioId: number;
    AutorizadorId?: number;
    Autorizador: string;
    MontoTotal_Declarado?: number;
    MontoTotal_Calculado?: number;
    MontoTotal: number;
    FechaCorte?: string;
    PagoIds?: number[];
    Pagos?: Array<{ PagoId: number; Cliente?: string; Monto?: number }>;
    Pagos_Incluidos: string;
}