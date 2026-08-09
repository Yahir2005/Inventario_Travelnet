const db = require('../config/database');

const Localidad = {
    findAll: async (db) => {
        const rows = await db.query('SELECT * FROM Localidad');
        return rows;
    },

    findByPk: async (db, id) => {
        const rows = await db.query('SELECT * FROM Localidad WHERE LocalidadId = ?', [id]);
        return rows[0];
    },

    create: async (db, data) => {
        const { NombreLocalidad } = data;
        const result = await db.query(
            'INSERT INTO Localidad (NombreLocalidad) VALUES (?)',
            [NombreLocalidad]
        );
        return { LocalidadId: result.insertId, ...data };
    },

    update: async (db, id, data) => {
        const { NombreLocalidad } = data;
        const result = await db.query(
            'UPDATE Localidad SET NombreLocalidad = ? WHERE LocalidadId = ?',
            [NombreLocalidad, id]
        );
        return { LocalidadId: id, ...data };
    }
};

module.exports = Localidad;