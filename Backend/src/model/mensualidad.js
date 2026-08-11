const db = require('../config/database');

const Mensualidad = {
    findAll: async (db) => {
        const rows = await db.query('SELECT * FROM Mensualidad');
        return rows;
    },

    findByPk: async (db, id) => {
        const rows = await db.query('SELECT * FROM Mensualidad WHERE MensualidadId = ?', [id]);
        return rows[0];
    },

    findByInstalacion: async (db, instalacionId) => {
        const rows = await db.query(`
            SELECT 
                m.MensualidadId,
                m.InstalacionId,
                m.Mes,
                m.Anio,
                m.Concepto,
                m.Monto,
                m.Active,
                m.Estado,
                pd.PagoId,
                p.Fecha_Pago,
                p.Tipo_Pago,
                pmc.Motivo AS MotivoCancelacion
            FROM Mensualidad m
            LEFT JOIN Pago_Detalle pd ON pd.MensualidadId = m.MensualidadId
            LEFT JOIN Pago p ON p.PagoId = pd.PagoId
            LEFT JOIN PagoMesCancelado pmc ON pmc.MensualidadId = m.MensualidadId
            WHERE m.InstalacionId = ?
            ORDER BY m.Anio DESC, m.Mes DESC
        `, [instalacionId]);
        return rows;
    },

    create: async (db, data) => {
        const { InstalacionId, Mes, Anio, Concepto, Monto, Estado } = data;
        const result = await db.query(
            'INSERT INTO Mensualidad (InstalacionId, Mes, Anio, Concepto, Monto, Active, Estado) VALUES (?, ?, ?, ?, ?, TRUE, ?)',
            [InstalacionId, Mes, Anio, Concepto, Monto, Estado]
        );
        return { MensualidadId: result.insertId, ...data, Active: true };
    },

    update: async (db, id, data) => {
        const { InstalacionId, Mes, Anio, Concepto, Monto, Active, Estado } = data;
        await db.query(
            'UPDATE Mensualidad SET InstalacionId=?, Mes=?, Anio=?, Concepto=?, Monto=?, Active=?, Estado=? WHERE MensualidadId = ?',
            [InstalacionId, Mes, Anio, Concepto, Monto, Active ?? true, Estado, id]
        );
        return { MensualidadId: id, ...data };
    },

    cancelar: async (db, mensualidadId, motivo) => {
        await db.query(
            'UPDATE Mensualidad SET Active = FALSE, Estado = ? WHERE MensualidadId = ?',
            ['Vencido', mensualidadId]
        );
        const result = await db.query(
            'INSERT INTO PagoMesCancelado (MensualidadId, Motivo) VALUES (?, ?)',
            [mensualidadId, motivo]
        );
        return { PagoMesCanceladoId: result.insertId, MensualidadId: mensualidadId, Motivo: motivo };
    },

    remove: async (db, id) => {
        const result = await db.query('UPDATE Mensualidad SET Active = FALSE, Estado = ? WHERE MensualidadId = ?', ['Vencido', id]);
        return result.affectedRows > 0;
    }
};

module.exports = Mensualidad;