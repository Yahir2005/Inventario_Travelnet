/**
 * ============================================================================
 * MODELO DE BASE DE DATOS: MetodoPago (src/model/metodoPago.js)
 * ============================================================================
 * Gestiona el catálogo `Metodo_Pago` (Efectivo, Transferencia, Depósito,
 * Tarjeta, etc.) e indica si el método requiere capturar un número de cuenta
 * o referencia bancaria (`Requiere_Cuenta`).
 * ============================================================================
 */

const MetodoPago = {
    /**
     * Obtiene todos los métodos de pago disponibles ordenados por su ID.
     */
    findAll: async (db) => {
        return await db.query('SELECT MetodoPagoId, Nombre, Requiere_Cuenta FROM Metodo_Pago ORDER BY MetodoPagoId ASC');
    },

    /**
     * Busca un método de pago específico por su llave primaria (`MetodoPagoId`).
     */
    findByPk: async (db, id) => {
        const rows = await db.query('SELECT MetodoPagoId, Nombre, Requiere_Cuenta FROM Metodo_Pago WHERE MetodoPagoId = ?', [id]);
        return rows[0];
    },

    /**
     * Registra un nuevo método de pago en el catálogo.
     */
    create: async (db, data) => {
        const { Nombre, Requiere_Cuenta } = data;
        const result = await db.query(
            'INSERT INTO Metodo_Pago (Nombre, Requiere_Cuenta) VALUES (?, ?)',
            [Nombre, Requiere_Cuenta ? 1 : 0]
        );
        return {
            MetodoPagoId: Number(result.insertId),
            Nombre,
            Requiere_Cuenta: Boolean(Requiere_Cuenta)
        };
    },

    /**
     * Actualiza el nombre o el indicador `Requiere_Cuenta` de un método de pago.
     */
    update: async (db, id, data) => {
        const { Nombre, Requiere_Cuenta } = data;
        await db.query(
            'UPDATE Metodo_Pago SET Nombre = ?, Requiere_Cuenta = ? WHERE MetodoPagoId = ?',
            [Nombre, Requiere_Cuenta ? 1 : 0, id]
        );
        return {
            MetodoPagoId: Number(id),
            Nombre,
            Requiere_Cuenta: Boolean(Requiere_Cuenta)
        };
    }
};

module.exports = MetodoPago;
