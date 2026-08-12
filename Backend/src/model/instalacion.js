const db = require('../config/database');

const Instalacion = {
    findAll: async (db) => {
        const rows = await db.query('SELECT * FROM Instalacion');
        return rows;
    },

    findAllDetallado: async (db) => {
        const rows = await db.query(`
            SELECT
                i.InstalacionId,
                i.UsuarioId,
                i.ClienteId,
                i.OLTId,
                i.TorreId,
                i.LocalidadId,
                i.Ubicacion_Maps,
                i.Nombre_Wifi,
                i.Password_Wifi,
                i.Active AS Instalacion_Activa,
                i.Tipo,
                i.Plan,
                i.Modalidad_Servicio,
                i.Fecha_Instalacion,
                c.Nombre_Cliente,
                c.Telefono,
                lo.NombreLocalidad AS Localidad_Nombre,
                o.Nombre AS Nombre_OLT,
                t.Nombre AS Nombre_Torre,
                (SELECT COUNT(*) FROM Imagen_Instalacion ii WHERE ii.InstalacionId = i.InstalacionId) AS Cantidad_Imagenes,
                (SELECT ii.Ruta_Imagen FROM Imagen_Instalacion ii WHERE ii.InstalacionId = i.InstalacionId ORDER BY ii.Imagen_InstalacionId DESC LIMIT 1) AS Ultima_Imagen
            FROM Instalacion i
            LEFT JOIN Cliente c ON i.ClienteId = c.ClienteId
            LEFT JOIN Localidad lo ON i.LocalidadId = lo.LocalidadId
            LEFT JOIN OLT o ON i.OLTId = o.OLTId
            LEFT JOIN Torre t ON i.TorreId = t.TorreId
            WHERE i.Active = TRUE
        `);
        return rows;
    },

    findByPk: async (db, id) => {
        const rows = await db.query('SELECT * FROM Instalacion WHERE InstalacionId = ?', [id]);
        return rows[0];
    },

    create: async (db, data) => {
        const { UsuarioId, ClienteId, OLTId, TorreId, LocalidadId, Ubicacion_Maps, Nombre_Wifi, Password_Wifi, Tipo, Plan, Modalidad_Servicio } = data;
        const result = await db.query(
            'INSERT INTO Instalacion (UsuarioId, ClienteId, OLTId, TorreId, LocalidadId, Ubicacion_Maps, Nombre_Wifi, Password_Wifi, Tipo, Plan, Modalidad_Servicio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [UsuarioId, ClienteId, OLTId, TorreId, LocalidadId, Ubicacion_Maps, Nombre_Wifi, Password_Wifi, Tipo, Plan, Modalidad_Servicio]
        );
        return { InstalacionId: result.insertId, ...data, Active: true };
    },

    update: async (db, id, data) => {
        const { UsuarioId, ClienteId, OLTId, TorreId, LocalidadId, Ubicacion_Maps, Nombre_Wifi, Password_Wifi, Tipo, Plan, Modalidad_Servicio } = data;
        await db.query(
            'UPDATE Instalacion SET UsuarioId = ?, ClienteId = ?, OLTId = ?, TorreId = ?, LocalidadId = ?, Ubicacion_Maps = ?, Nombre_Wifi = ?, Password_Wifi = ?, Tipo = ?, Plan = ?, Modalidad_Servicio = ? WHERE InstalacionId = ?',
            [UsuarioId, ClienteId, OLTId, TorreId, LocalidadId, Ubicacion_Maps, Nombre_Wifi, Password_Wifi, Tipo, Plan, Modalidad_Servicio, id]
        );
        return { InstalacionId: id, ...data };
    },

    remove: async (db, id) => {
        const result = await db.query('UPDATE Instalacion SET Active = FALSE WHERE InstalacionId = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Instalacion;