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

    create: async (db, data) => {
        const { InstalacionId, Mes, Anio, Concepto, Monto, Estado } = data;
        const result = await db.query(
            'INSERT INTO Mensualidad (InstalacionId, Mes, Anio, Concepto, Monto, Estado) VALUES (?, ?, ?, ?, ?, ?)',
            [InstalacionId, Mes, Anio, Concepto, Monto, Estado]
        );
        return { MensualidadId: result.insertId, ...data };
    },

    update: async (db, id, data) => {
        const { InstalacionId, Mes, Anio, Concepto, Monto, Estado } = data;
        await db.query(
            'UPDATE Mensualidad SET InstalacionId=?, Mes=?, Anio=?, Concepto=?, Monto=?, Estado=? WHERE MensualidadId = ?',
            [InstalacionId, Mes, Anio, Concepto, Monto, Estado, id]
        );
        return { MensualidadId: id, ...data };
    },

    remove: async (db, id) => {
        const result = await db.query('UPDATE Mensualidad SET Estado = ? WHERE MensualidadId = ?', ['Pendiente', id]);
        return result.affectedRows > 0;
    }
};

module.exports = Mensualidad;