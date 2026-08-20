const db = require('../config/database');

const corteCaja = {
    findAll: async (db) => {
        const rows = await db.query('SELECT * FROM CorteCaja');
        return rows;
    },

    findByPk: async (db,id) => {
        const rows = await db.query('SELECT * FROM CorteCaja WHERE CorteId = ?',[id]);
        return rows[0];
    },

    create: async (db,data) => {
        const {UsuarioId,Autorizador,MontoTotal,FechaCorte,Pagos_Incluidos} = data;
        let sql;
        let params;
        if (FechaCorte) {
            sql = 'INSERT INTO CorteCaja(UsuarioId,Autorizador,MontoTotal,FechaCorte,Pagos_Incluidos) VALUES (?,?,?,?,?)';
            params = [UsuarioId,Autorizador,MontoTotal,FechaCorte,Pagos_Incluidos];
        } else {
            sql = 'INSERT INTO CorteCaja(UsuarioId,Autorizador,MontoTotal,Pagos_Incluidos) VALUES (?,?,?,?)';
            params = [UsuarioId,Autorizador,MontoTotal,Pagos_Incluidos];
        }
        const result = await db.query(sql, params);
        return {CorteId: result.insertId,...data};
    },

    update: async (db,id,data) => {
        const {UsuarioId,Autorizador,MontoTotal,FechaCorte,Pagos_Incluidos} = data;
        const result = await db.query(
            'UPDATE CorteCaja SET UsuarioId = ?,Autorizador = ?,MontoTotal = ?,FechaCorte = ?,Pagos_Incluidos = ? WHERE CorteId = ?',
            [UsuarioId,Autorizador,MontoTotal,FechaCorte,Pagos_Incluidos,id]
        );
        return {CorteId:  id,...data};
    },

    remove: async (db,id) => {
        const result = await db.query(
            'DELETE FROM CorteCaja WHERE CorteId = ? AND CorteId < DATE_SUB(NOW(), INTERVAL 60 DAY)',
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = corteCaja;