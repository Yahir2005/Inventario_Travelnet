const db = require('../config/database');

const Pago = {
    
    findAll: async (db) => {
        const rows = await db.query('SELECT * FROM Pago');
        return rows
    },

    findByPk: async (db,id) => {
        const rows = await db.query('SELECT * FROM Pago WHERE PagoId = ?',[id]);
        return rows[0];
    },

    create: async (db,data) => {
        const {InstalacionId,UsuarioId,Modalidad_Servicio,Otro_Modalidad,Tipo_Pago,Otro_Pago,Numero_cuenta,Estado_Pago,Monto,Plan,Ultima_modificacion} = data;
        const result = await db.query(
            'INSERT INTO Pago (InstalacionId,UsuarioId,Modalidad_Servicio,Otro_Modalidad,Tipo_Pago,Otro_Pago,Numero_cuenta,Estado_Pago,Monto,Plan,Ultima_modificacion) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
            [InstalacionId,UsuarioId,Modalidad_Servicio,Otro_Modalidad,Tipo_Pago,Otro_Pago,Numero_cuenta,Estado_Pago,Monto,Plan,Ultima_modificacion]
        );
        return { PagoId: result.insertId,...data};
    },

    update: async (db,id,data) => {
        const {InstalacionId,UsuarioId,Modalidad_Servicio,Otro_Modalidad,Tipo_Pago,Otro_Pago,Numero_cuenta,Estado_Pago,Monto,Plan,Ultima_modificacion} = data;
        await db.query(
            'UPDATE Pago SET InstalacionId=?,UsuarioId=?,Modalidad_Servicio=?,Otro_Modalidad=?,Tipo_Pago=?,Otro_Pago=?,Numero_cuenta=?,Estado_Pago=?,Monto=?,Plan=?,Ultima_modificacion=? WHERE PagoId = ?',
            [InstalacionId,UsuarioId,Modalidad_Servicio,Otro_Modalidad,Tipo_Pago,Otro_Pago,Numero_cuenta,Estado_Pago,Monto,Plan,Ultima_modificacion,id]
        );
        return { PagoId: id, ...data};
    }
}

module.exports = Pago;