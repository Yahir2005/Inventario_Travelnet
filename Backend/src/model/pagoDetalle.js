/**
 * ============================================================================
 * MODELO DE BASE DE DATOS: PagoDetalle (src/model/pagoDetalle.js)
 * ============================================================================
 * Gestiona la tabla `Pago_Detalle`, que vincula un recibo de pago (`PagoId`)
 * con cada mes específico que se está pagando (`MensualidadId`) y cuánto dinero
 * se abonó a ese mes (`Monto_Abonado`).
 * ============================================================================
 */

const PagoDetalle = {
    /**
     * Obtiene todos los registros de desglose de pago.
     */
    findAll: async (db) => {
        const rows = await db.query('SELECT DetalleId, PagoId, MensualidadId, Monto_Abonado FROM Pago_Detalle');
        return rows;
    },

    /**
     * Busca un detalle de pago específico por su llave primaria (`DetalleId`).
     */
    findByPk: async (db, id) => {
        const rows = await db.query(
            'SELECT DetalleId, PagoId, MensualidadId, Monto_Abonado FROM Pago_Detalle WHERE DetalleId = ?',
            [id]
        );
        return rows[0];
    },

    /**
     * Obtiene todos los meses abonados dentro de un mismo recibo de pago (`PagoId`).
     */
    findByPago: async (db, pagoId) => {
        return await db.query(
            'SELECT DetalleId, PagoId, MensualidadId, Monto_Abonado FROM Pago_Detalle WHERE PagoId = ?',
            [pagoId]
        );
    },

    /**
     * Inserta un nuevo detalle de pago vinculando un `PagoId` con una `MensualidadId`.
     * Si esa combinación ya existe (por ejemplo, creada automáticamente por `Pago.create`
     * o durante una retransmisión Offline), actualiza el monto o devuelve el registro existente.
     */
    create: async (db, data) => {
        const { PagoId, MensualidadId, Monto_Abonado } = data;
        const existing = await db.query(
            'SELECT DetalleId FROM Pago_Detalle WHERE PagoId = ? AND MensualidadId = ? LIMIT 1',
            [PagoId, MensualidadId]
        );
        if (existing.length > 0) {
            try {
                await db.query(
                    'UPDATE Pago_Detalle SET Monto_Abonado = ? WHERE DetalleId = ?',
                    [Monto_Abonado, existing[0].DetalleId]
                );
            } catch (_) {
                // Si el rol solo tiene INSERT en Pago_Detalle (ej. mysql_mostrador), conservar registro existente
            }
            return { DetalleId: Number(existing[0].DetalleId), PagoId, MensualidadId, Monto_Abonado };
        }
        const result = await db.query(
            'INSERT INTO Pago_Detalle (PagoId, MensualidadId, Monto_Abonado) VALUES (?, ?, ?)',
            [PagoId, MensualidadId, Monto_Abonado]
        );
        return { DetalleId: Number(result.insertId), PagoId, MensualidadId, Monto_Abonado };
    },

    /**
     * Actualiza un registro de detalle de pago existente.
     */
    update: async (db, id, data) => {
        const { PagoId, MensualidadId, Monto_Abonado } = data;
        await db.query(
            'UPDATE Pago_Detalle SET PagoId = ?, MensualidadId = ?, Monto_Abonado = ? WHERE DetalleId = ?',
            [PagoId, MensualidadId, Monto_Abonado, id]
        );
        return { DetalleId: Number(id), PagoId, MensualidadId, Monto_Abonado };
    },

    /**
     * Elimina un registro de detalle de pago por su ID (`DetalleId`).
     */
    remove: async (db, id) => {
        const result = await db.query('DELETE FROM Pago_Detalle WHERE DetalleId = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = PagoDetalle;