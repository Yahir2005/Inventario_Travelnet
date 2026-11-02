/**
 * MODELO BÁSICO DE CLIENTE (cliente.model.ts)
 * -------------------------------------------
 * Una `interface` en TypeScript funciona como un "molde" o contrato que define
 * qué propiedades tiene un objeto Cliente y de qué tipo es cada dato (número, texto, booleano).
 * El símbolo `?` indica que esa propiedad es opcional (puede venir vacía o nula).
 */
export interface Cliente {
  ClienteId: number;                 // Identificador único del cliente en la base de datos
  Nombre_Cliente: string;            // Nombre completo o razón social del cliente
  Telefono: string;                  // Número telefónico de contacto
  Calle?: string | null;             // Nombre de la calle del domicilio
  Numero?: string | null;            // Número exterior/interior del domicilio
  Colonia?: string | null;           // Colonia o barrio
  Codigo_Postal?: string | null;     // Código postal de 5 dígitos
  Direccion?: string;                // Dirección concatenada para compatibilidad con vistas generales
  Saldo_Actual?: number;             // Saldo a favor acumulado del cliente
  Active: boolean;                   // Indica si el cliente está activo (true) o dado de baja (false)
  TipoCliente: 'Fisica' | 'Moral';   // Tipo de persona fiscal: Física o Moral
}

