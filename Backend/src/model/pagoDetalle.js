const db = require('../config/database');

const PagoDetalle = {
    findAll: async (db) => {
        const rows = await db.query('SELECT * FROM Pago_Detalle');
        return rows;
    },

    findByPk: async (db, id) => {
        const rows = await db.query('SELECT * FROM Pago_Detalle WHERE DetalleId = ?', [id]);
        return rows[0];
    },

    create: async (db, data) => {
        const { PagoId, MensualidadId, Monto_Abonado } = data;
        const result = await db.query(
            'INSERT INTO Pago_Detalle (PagoId, MensualidadId, Monto_Abonado) VALUES (?, ?, ?)',
            [PagoId, MensualidadId, Monto_Abonado]
        );
        return { DetalleId: result.insertId, ...data };
    },

    update: async (db, id, data) => {
        const { PagoId, MensualidadId, Monto_Abonado } = data;
        await db.query(
            'UPDATE Pago_Detalle SET PagoId=?, MensualidadId=?, Monto_Abonado=? WHERE DetalleId = ?',
            [PagoId, MensualidadId, Monto_Abonado, id]
        );
        return { DetalleId: id, ...data };
    },

    remove: async (db, id) => {
        const result = await db.query('DELETE FROM Pago_Detalle WHERE DetalleId = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = PagoDetalle;