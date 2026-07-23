export interface Servicios{
    ServicioId: number;
    InstalacionId: number;
    UsuarioId: number;
    Tipo_Servicio: 'Mantenimiento' | 'Migracion' | 'Otro';
    Detalle_Otro: string;
    Estado: 'Realizado' | 'Pospuesto';
    Fecha_Levantamiento: string;
    Fecha_Finalizado: string;
}