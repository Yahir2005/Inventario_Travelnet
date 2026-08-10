const db = require('../config/database');

const PagoMesCancelado = {
    findAll: async (db) => {
        const rows = await db.query('SELECT * FROM PagoMesCancelado');
        return rows;
    },

    findByPk: async (db,id) => {
        const rows = await db.query('SELECT * FROM  PagoMesCancelado Where PagoMesCanceladoId = ?',[id]);
        return rows[0];
    },

    create: async(db,data) => {
        const {MensualidadId,Motivo} = data;
        const result = await db.query(
            'INSERT INTO PagoMesCancelado( MensualidadId,Motivo) VALUES (?,?)',
            [MensualidadId,Motivo]
        );
        return {PagoMesCanceladoId: result.insertId, ...data};
    },
    update: async (db,id,data) => {
        const {MensualidadId,Motivo} = data;
        await db.query(
            'UPDATE PagoMesCancelado SET MensualidadId = ?, Motivo = ? WHERE PagoMesCanceladoId = ?',
            [MensualidadId,Motivo,id]
        );
        return {PagoMesCanceladoId: id, ...data};
    }
};

module.exports = PagoMesCancelado;