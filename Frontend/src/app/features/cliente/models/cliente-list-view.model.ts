/**
 * MODELO DETALLADO DE CLIENTE (cliente-list-view.model.ts)
 * --------------------------------------------------------
 * Representa la información combinada que devuelve el Backend en la ruta `/api/cliente/lista-detallada`.
 * Une en un solo objeto:
 *  1. Los datos personales del cliente.
 *  2. Los datos de su instalación (plan contratado, fibra/antena, Wi-Fi, GPS).
 *  3. El estado de su último pago y si presenta días de atraso.
 */
export interface ClienteDetallado {
  // --- 1. Datos personales del Cliente ---
  ClienteId: number;
  Nombre_Cliente: string;
  Telefono: string;
  Calle?: string | null;
  Numero?: string | null;
  Colonia?: string | null;
  Codigo_Postal?: string | null;
  Direccion?: string;
  Saldo_Actual?: number;
  Active: boolean;
  TipoCliente?: 'Fisica' | 'Moral';

  // --- 2. Datos de la Instalación y Plan contratado ---
  InstalacionId?: number | null;
  TarifaId?: number | null;
  PlanId?: number | null;
  InfraestructuraId?: number | null;
  Instalacion_Activa?: boolean | null;
  Ubicacion_Maps?: string | null;
  Nombre_Wifi?: string | null;
  Password_Wifi?: string | null;
  Tipo_Infraestructura?: 'OLT' | 'Torre' | null;
  Tipo?: 'Fibra' | 'Antena' | null;
  LocalidadId?: number | null;
  Localidad?: string | null;
  Plan?: string | null;
  Velocidad_Mbps?: number | null;
  Modalidad_Servicio?: 'Mensual' | 'Bimestral' | 'Trimestral' | 'Cuatrimestral' | 'Quinquemestral' | 'Semestral' | 'Heptamestral' | 'Octomestral' | 'Nonamestral' | 'Decamestral' | 'Oncemestral' | 'Anual' | null;
  Precio_Tarifa?: number | null;
  Fecha_Instalacion?: string | null;

  // --- 3. Datos de Infraestructura (OLT o Torre asignada) ---
  OLTId?: number | null;
  Nombre_OLT?: string | null;
  Ubicacion_OLT?: string | null;

  TorreId?: number | null;
  Nombre_Torre?: string | null;
  Ubicacion_Torre?: string | null;

  // --- 4. Datos del Último Pago y Estado de Adeudo ---
  PagoId?: number | null;
  MetodoPagoId?: number | null;
  Metodo_Pago?: string | null;
  Fecha_Pago?: string | null;
  Estado_Pago?: 'Completado' | 'Incompleto' | 'Pendiente' | 'Cancelado' | null;
  Monto?: string | number | null;
  Descuento?: string | number | null;
  Tipo_Pago?: 'Efectivo' | 'Transferencia' | 'Cheque' | 'Trueque' | 'Paypal' | 'MercadoPago' | 'Pagaré' | null;

  Ultimo_Mes_Pagado?: number | null;
  Ultimo_Anio_Pagado?: number | null;
  Atrasado?: boolean;
  Dias_Atraso?: number;
}