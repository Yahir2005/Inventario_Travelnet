export type MetodoPagoNombre = 'Efectivo' | 'Transferencia' | 'Cheque' | 'Trueque' | 'Paypal' | 'MercadoPago' | 'Pagaré';

export interface Pago {
    PagoId: number;
    InstalacionId: number;
    UsuarioId: number;
    MetodoPagoId?: number;
    Metodo_Pago?: MetodoPagoNombre;
    Tipo_Pago: MetodoPagoNombre;
    Fecha_Pago: string;
    Numero_cuenta: string;
    Referencia_Externa?: string | null;
    Direccion_IP?: string | null;
    Descuento: number | null;
    Estado_Pago: 'Completado' | 'Incompleto' | 'Pendiente' | 'Cancelado';
    Monto: number;
    Uuid_local?: string | null;
    Sincronizado?: number | boolean;
    Ultima_modificacion?: string;
}

export interface PagoDetallado {
    InstalacionId: number;
    TarifaId?: number | null;
    PlanId?: number | null;
    Plan?: string | null;
    Velocidad_Mbps?: number | null;
    Modalidad_Servicio: 'Mensual' | 'Bimestral' | 'Trimestral' | 'Cuatrimestral' | 'Quinquemestral' | 'Semestral' | 'Heptamestral' | 'Octomestral' | 'Nonamestral' | 'Decamestral' | 'Oncemestral' | 'Anual' | null;
    Precio_Tarifa?: number | null;
    Fecha_Instalacion: string;
    Instalacion_Activa?: boolean | null;
    Pago_UsuarioId?: number;

    ClienteId: number;
    Nombre_Cliente: string;
    Telefono: string;
    Saldo_Actual?: number;
    Localidad?: string | null;

    PagoId?: number | null;
    MetodoPagoId?: number | null;
    Metodo_Pago?: MetodoPagoNombre | null;
    Fecha_Pago?: string | null;
    Estado_Pago?: 'Completado' | 'Incompleto' | 'Pendiente' | 'Cancelado' | null;
    Monto?: string | number | null;
    Descuento?: string | number | null;
    Tipo_Pago?: MetodoPagoNombre | null;

    Ultimo_Mes_Pagado?: number | null;
    Ultimo_Anio_Pagado?: number | null;
    Concepto_Ultimo_Pago?: string | null;

    Atrasado: boolean;
    Dias_Atraso?: number;
}

export type PagoForm = {
    InstalacionId: number;
    UsuarioId: number | null;
    MetodoPagoId?: number | null;
    Tipo_Pago: MetodoPagoNombre;
    Numero_cuenta: string;
    Referencia_Externa?: string;
    Descuento: number | null;
    Monto: number | null;
    Estado_Pago: 'Completado' | 'Incompleto' | 'Pendiente';
    Mes: number;
    Anio: number;
    Cantidad_Meses: number;
    Concepto: string;
    Uuid_local?: string;
    AplicarSaldoFavor?: boolean;
};