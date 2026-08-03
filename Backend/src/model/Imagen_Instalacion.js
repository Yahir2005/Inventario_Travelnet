const db = require('../config/database');

const Imagen_Instalacion = {
    findAll: async (db) => {
        const rows = await db.query('SELECT * FROM Imagen_Instalacion');
        return rows;
    },

    findByPk: async (db, id) => {
        const rows = await db.query('SELECT * FROM Imagen_Instalacion WHERE Imagen_InstalacionId = ?', [id]);
        return rows[0];
    },

    create: async (db, data) => {
        const { InstalacionId, Ruta_Imagen } = data;
        const result = await db.query(
            // Corregido: Instalacion -> InstalacionId
            'INSERT INTO Imagen_Instalacion(InstalacionId, Ruta_Imagen) VALUES (?,?)',
            [InstalacionId, Ruta_Imagen]
        );
        return { Imagen_InstalacionId: result.insertId, ...data, Active: true };
    },

    update: async (db, id, data) => {
        const { InstalacionId, Ruta_Imagen } = data;
        await db.query(
            'UPDATE Imagen_Instalacion SET InstalacionId = ?, Ruta_Imagen = ? WHERE Imagen_InstalacionId = ?',
            [InstalacionId, Ruta_Imagen, id]
        );
        // Agregado el return para que el controlador tenga qué responder
        return { Imagen_InstalacionId: id, ...data };
    },
};

module.exports = Imagen_Instalacion;