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

const NOMBRES_MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

const calcularAtraso = (row) => {
    const modalidad = row.Modalidad_Servicio;
    const mesesModalidad = MODALIDAD_MESES[modalidad] || 1;
    
    let fechaBase;
    if (row.Ultimo_Anio_Pagado && row.Ultimo_Mes_Pagado) {
        fechaBase = new Date(row.Ultimo_Anio_Pagado, row.Ultimo_Mes_Pagado, 1);
    } else if (row.Fecha_Pago) {
        fechaBase = addMonths(new Date(row.Fecha_Pago), mesesModalidad);
    } else if (row.Fecha_Instalacion) {
        fechaBase = new Date(row.Fecha_Instalacion);
    } else {
        return { Atrasado: false, Dias_Atraso: 0 };
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diffMs = hoy.getTime() - fechaBase.getTime();
    const diasAtraso = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return { Atrasado: diasAtraso > 0, Dias_Atraso: diasAtraso > 0 ? diasAtraso : 0 };
};

const Pago = {
    
    findAll: async (db) => {
        const rows = await db.query('SELECT * FROM Pago');
        return rows;
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
                p.Tipo_Pago,
                m.Mes AS Ultimo_Mes_Pagado,
                m.Anio AS Ultimo_Anio_Pagado,
                m.Concepto AS Concepto_Ultimo_Pago
            FROM Instalacion i
            INNER JOIN Cliente c ON i.ClienteId = c.ClienteId
            LEFT JOIN Localidad lo ON i.LocalidadId = lo.LocalidadId
            LEFT JOIN Pago p ON p.InstalacionId = i.InstalacionId
                AND p.PagoId = (SELECT MAX(p2.PagoId) FROM Pago p2 WHERE p2.InstalacionId = i.InstalacionId)
            LEFT JOIN Mensualidad m ON m.MensualidadId = (
                SELECT MAX(m2.MensualidadId) FROM Mensualidad m2 WHERE m2.InstalacionId = i.InstalacionId AND m2.Estado = 'Pagado'
            )
            WHERE i.Active = TRUE
        `);
        return rows.map(r => ({ ...r, ...calcularAtraso(r) }));
    },

    findByPk: async (db, id) => {
        const rows = await db.query('SELECT * FROM Pago WHERE PagoId = ?', [id]);
        return rows[0];
    },

    create: async (db, data) => {
        const {
            InstalacionId,
            UsuarioId,
            Tipo_Pago,
            Numero_cuenta,
            Descuento,
            Estado_Pago,
            Monto,
            Ultima_modificacion,
            Mes,
            Anio,
            Cantidad_Meses,
            Concepto
        } = data;

        const result = await db.query(
            'INSERT INTO Pago (InstalacionId,UsuarioId,Tipo_Pago,Numero_cuenta,Descuento,Estado_Pago,Monto,Ultima_modificacion) VALUES (?,?,?,?,?,?,?,?)',
            [InstalacionId, UsuarioId, Tipo_Pago, Numero_cuenta || 'Efectivo', Descuento || 0, Estado_Pago || 'Completado', Monto, Ultima_modificacion || new Date()]
        );
        const pagoId = result.insertId;

        const numMeses = parseInt(Cantidad_Meses) || 1;
        const hoy = new Date();
        const startMes = parseInt(Mes) || (hoy.getMonth() + 1);
        const startAnio = parseInt(Anio) || hoy.getFullYear();
        const montoPorMes = parseFloat((parseFloat(Monto) / numMeses).toFixed(2));

        const mensualidadesCreadas = [];

        for (let i = 0; i < numMeses; i++) {
            const indexMes = (startMes - 1 + i) % 12;
            const currentMes = indexMes + 1;
            const currentAnio = startAnio + Math.floor((startMes - 1 + i) / 12);
            const mesNombre = NOMBRES_MESES[indexMes];
            const conceptoMes = numMeses === 1 && Concepto ? Concepto : `Mensualidad ${mesNombre} ${currentAnio}`;
            const estadoMensualidad = (Estado_Pago === 'Completado' || Estado_Pago === 'Incompleto') ? 'Pagado' : 'Pendiente';

            const existing = await db.query(
                'SELECT MensualidadId FROM Mensualidad WHERE InstalacionId = ? AND Mes = ? AND Anio = ?',
                [InstalacionId, currentMes, currentAnio]
            );

            let mensualidadId;
            if (existing && existing.length > 0) {
                mensualidadId = existing[0].MensualidadId;
                await db.query(
                    'UPDATE Mensualidad SET Estado = ?, Monto = ?, Concepto = ? WHERE MensualidadId = ?',
                    [estadoMensualidad, montoPorMes, conceptoMes, mensualidadId]
                );
            } else {
                const insertMensualidad = await db.query(
                    'INSERT INTO Mensualidad (InstalacionId, Mes, Anio, Concepto, Monto, Estado) VALUES (?, ?, ?, ?, ?, ?)',
                    [InstalacionId, currentMes, currentAnio, conceptoMes, montoPorMes, estadoMensualidad]
                );
                mensualidadId = insertMensualidad.insertId;
            }

            await db.query(
                'INSERT INTO Pago_Detalle (PagoId, MensualidadId, Monto_Abonado) VALUES (?, ?, ?)',
                [pagoId, mensualidadId, montoPorMes]
            );

            mensualidadesCreadas.push({ MensualidadId: mensualidadId, Mes: currentMes, Anio: currentAnio, Concepto: conceptoMes });
        }

        return { PagoId: pagoId, ...data, Mensualidades: mensualidadesCreadas };
    },

    update: async (db, id, data) => {
        const { InstalacionId, UsuarioId, Tipo_Pago, Numero_cuenta, Descuento, Estado_Pago, Monto, Ultima_modificacion } = data;
        await db.query(
            'UPDATE Pago SET InstalacionId=?,UsuarioId=?,Tipo_Pago=?,Numero_cuenta=?,Descuento=?,Estado_Pago=?,Monto=?,Ultima_modificacion=? WHERE PagoId = ?',
            [InstalacionId, UsuarioId, Tipo_Pago, Numero_cuenta, Descuento, Estado_Pago, Monto, Ultima_modificacion, id]
        );
        return { PagoId: id, ...data };
    }
};

module.exports = Pago;