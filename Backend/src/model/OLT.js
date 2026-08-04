const db  = require('../config/database');

const OLT = {
    findAll: async (db) => {
        const rows = await db.query('SELECT * FROM OLT');
        return rows;
    },
    
    findByPk: async (db,id) => {
        const rows = await db.query('SELECT * FROM OLT WHERE OLTId = ?',[id]);
        return rows[0];
    },

    create: async (db,data) => {
        const {Nombre,Ubicacion} = data;
        const result = await db.query(
            'INSERT INTO OLT (Nombre,Ubicacion) VALUES (?,?)',
            [Nombre,Ubicacion]
        );
        return { OLTId: result.insertId,...data};
    },

    update: async (db,id,data) => {
        const {Nombre,Ubicacion} = data;
        const result = await db.query(
            'UPDATE OLT SET Nombre = ?,Ubicacion = ? WHERE OLTId = ?',
            [Nombre,Ubicacion,id]
        );
        return { OLTId: id,...data};
    },
    
}

module.exports = OLT;