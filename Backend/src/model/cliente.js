const db = require('../config/database');
const { findByPk, create } = require('./usuario');

const Cliente = {
    findAll: async (db) => {
        const rows = await db.query('SELECT * FROM Cliente');
        return rows;
    },

    findByPk: async (db,id) => {
        const rows = await db.query('SELECT * FROM Cliente WHERE ClienteId = ?',[id]);
        return rows[0];
    },

    create: async (db,data) => {
        const { Nombre_Cliente, Telefono, Direccion, TipoCliente } = data;
        const result = await db.query(
            'INSERT INTO Cliente (Nombre_Cliente, Telefono, Direccion, TipoCliente) VALUES (?, ?, ?, ?)',
            [Nombre_Cliente, Telefono, Direccion, TipoCliente]
        );
        return { ClienteId: result.insertId, ...data, Active: true };
    },

    update: async (db,id, data) => {
        const { Nombre_Cliente, Telefono, Direccion, TipoCliente } = data;
        await db.query(
        'UPDATE Cliente SET Nombre_Cliente = ?, Telefono = ?, Direccion = ?, TipoCliente = ? WHERE ClienteId = ?',
        [Nombre_Cliente, Telefono, Direccion, TipoCliente, id]
        );
        return { ClienteId: id, ...data };
    },

    remove: async (db,id) => {    
        const result = await db.query('UPDATE Cliente SET Active = FALSE WHERE ClienteId = ?', [id]);
        return result.affectedRows > 0;
    },
    
    clientInstallationList: async (db,id) => {
        const rows = await db.query( `SELECT 
            c.ClienteId,
            c.Nombre_Cliente,
            c.Telefono,
            c.Active,

            i.OLTId,
            o.Nombre AS Nombre_OLT,
            o.Ubicacion AS Ubicacion_OLT,

            i.TorreId,
            t.Nombre AS Nombre_Torre,
            t.Ubicacion AS Ubicacion_Torre,

            i.Ubicacion_Maps,
            i.Nombre_Wifi,
            i.Password_Wifi,
            i.Active AS Instalacion_Activa,
            i.Tipo,
            i.Localidad,
            i.Fecha_Instalacion,

            p.Modalidad_Servicio,
            p.Fecha_Pago,
            p.Estado_Pago,
            p.Monto,
            p.Plan

            FROM Instalacion i

            INNER JOIN Cliente c 
                ON i.ClienteId = c.ClienteId

            LEFT JOIN OLT o 
                ON i.OLTId = o.OLTId

            LEFT JOIN Torre t 
                ON i.TorreId = t.TorreId

            LEFT JOIN Pago p 
                ON i.InstalacionId = p.InstalacionId;`);
                
            return rows;
    }

};

module.exports = Cliente;