export interface CorteCaja{
    CorteId?: number;
    UsuarioId: number;
    Autorizador: string;
    MontoTotal: number;
    FechaCorte?: string;
    Pagos_Incluidos: string;
}