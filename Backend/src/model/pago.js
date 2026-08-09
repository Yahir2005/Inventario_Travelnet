const db = require('../config/database');

const MODALIDAD_MESES = {
    'Mensual': 1,
    'Bimestral': 2,
    'Trimestral': 3,
    'Cuatrimestral': 4,
    'Quinquemestral': 5,
    'Semestral': 6,
    'Heptamestral': 7,
    'Octomestral': 8,
    'Nonamestral': 9,
    'Decamestral': 10,
    'Oncemestral': 11,
    'Anual': 12
};

const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

const calcularAtraso = (row) => {
    const modalidad = row.Modalidad_Servicio;
    const meses = MODALIDAD_MESES[modalidad] || 1;
    const fechaBase = row.Fecha_Pago ? new Date(row.Fecha_Pago) : new Date(row.Fecha_Instalacion);
    if (!(fechaBase instanceof Date && !isNaN(fechaBase))) {
        return { Atrasado: false, Dias_Atraso: 0 };
    }
    const fechaEsperada = addMonths(fechaBase, meses);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diffMs = hoy.getTime() - fechaEsperada.getTime();
    const diasAtraso = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return { Atrasado: diasAtraso > 0, Dias_Atraso: diasAtraso > 0 ? diasAtraso : 0 };
};

const Pago = {
    
    findAll: async (db) => {
        const rows = await db.query('SELECT * FROM Pago');
        return rows
    },

    findAllDetallado: async (db) => {
        const rows = await db.query(`
            SELECT
                i.InstalacionId,
                i.Plan,
                i.Modalidad_Servicio,
                i.Fecha_Instalacion,
                i.Active AS Instalacion_Activa,
                c.ClienteId,
                c.Nombre_Cliente,
                c.Telefono,
                lo.NombreLocalidad AS Localidad,
                p.PagoId,
                p.Fecha_Pago,
                p.Estado_Pago,
                p.Monto,
                p.Descuento,
                p.Tipo_Pago
            FROM Instalacion i
            INNER JOIN Cliente c ON i.ClienteId = c.ClienteId
            LEFT JOIN Localidad lo ON i.LocalidadId = lo.LocalidadId
            LEFT JOIN Pago p ON p.InstalacionId = i.InstalacionId
                AND p.PagoId = (SELECT MAX(p2.PagoId) FROM Pago p2 WHERE p2.InstalacionId = i.InstalacionId)
            WHERE i.Active = TRUE
        `);
        return rows.map(r => ({ ...r, ...calcularAtraso(r) }));
    },

    findByPk: async (db,id) => {
        const rows = await db.query('SELECT * FROM Pago WHERE PagoId = ?',[id]);
        return rows[0];
    },

    create: async (db,data) => {
        const {InstalacionId,UsuarioId,Tipo_Pago,Numero_cuenta,Descuento,Estado_Pago,Monto,Ultima_modificacion} = data;
        const result = await db.query(
            'INSERT INTO Pago (InstalacionId,UsuarioId,Tipo_Pago,Numero_cuenta,Descuento,Estado_Pago,Monto,Ultima_modificacion) VALUES (?,?,?,?,?,?,?,?)',
            [InstalacionId,UsuarioId,Tipo_Pago,Numero_cuenta,Descuento,Estado_Pago,Monto,Ultima_modificacion]
        );
        return { PagoId: result.insertId,...data};
    },

    update: async (db,id,data) => {
        const {InstalacionId,UsuarioId,Tipo_Pago,Numero_cuenta,Descuento,Estado_Pago,Monto,Ultima_modificacion} = data;
        await db.query(
            'UPDATE Pago SET InstalacionId=?,UsuarioId=?,Tipo_Pago=?,Numero_cuenta=?,Descuento=?,Estado_Pago=?,Monto=?,Ultima_modificacion=? WHERE PagoId = ?',
            [InstalacionId,UsuarioId,Tipo_Pago,Numero_cuenta,Descuento,Estado_Pago,Monto,Ultima_modificacion,id]
        );
        return { PagoId: id, ...data};
    }
}

module.exports = Pago;