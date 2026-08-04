const db = require('../config/database');

const Torre = {
    findAll: async (db) => {
        const rows = await db.query('SELECT * FROM Torre');
        return rows;
    },
    findByPk: async (db,id) => {
        const rows = await db.query('SELECT * FROM Torre WHERE TorreId =?',[id]);
        return rows[0];
    },
    create: async (db,data) => {
        const {Nombre,Ubicacion} = data;
        const result = await db.query(
            'INSERT INTO Torre (Nombre,Ubicacion) VALUES (?,?)',
            [Nombre,Ubicacion]
        );
        return { TorreId: result.insertId,...data};
    },
    update: async (db,id,data) => {
        const {Nombre,Ubicacion} = data;
        const result = await db.query(
            'UPDATE Torre SET Nombre = ?,Ubicacion = ? WHERE TorreId = ?',
            [Nombre,Ubicacion,id]
        );
        return { TorreId: id,...data};
    }
}

module.exports = Torre;