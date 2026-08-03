const db = require('../config/database');

const Instalacion = {
    findAll: async (db) => {
        const rows = await db.query('SELECT * FROM Instalacion');
        return rows;
    },

    findByPk: async (db, id) => {
        const rows = await db.query('SELECT * FROM Instalacion WHERE InstalacionId = ?', [id]);
        return rows[0];
    },

    create: async (db, data) => {
        const { UsuarioId, ClienteId, OLTId, TorreId, Ubicacion_Maps, Nombre_Wifi, Password_Wifi, Tipo, Localidad } = data;
        const result = await db.query(
            'INSERT INTO Instalacion (UsuarioId, ClienteId, OLTId, TorreId, Ubicacion_Maps, Nombre_Wifi, Password_Wifi, Tipo, Localidad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [UsuarioId, ClienteId, OLTId, TorreId, Ubicacion_Maps, Nombre_Wifi, Password_Wifi, Tipo, Localidad]
        );
        return { InstalacionId: result.insertId, ...data, Active: true };
    },

    update: async (db, id, data) => {
        const { UsuarioId, ClienteId, OLTId, TorreId, Ubicacion_Maps, Nombre_Wifi, Password_Wifi, Tipo, Localidad } = data;
        await db.query(
            'UPDATE Instalacion SET UsuarioId = ?, ClienteId = ?, OLTId = ?, TorreId = ?, Ubicacion_Maps = ?, Nombre_Wifi = ?, Password_Wifi = ?, Tipo = ?, Localidad = ? WHERE InstalacionId = ?',
            [UsuarioId, ClienteId, OLTId, TorreId, Ubicacion_Maps, Nombre_Wifi, Password_Wifi, Tipo, Localidad, id]
        );
        return { InstalacionId: id, ...data };
    },

    remove: async (db, id) => {
        const result = await db.query('UPDATE Instalacion SET Active = FALSE WHERE InstalacionId = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Instalacion;