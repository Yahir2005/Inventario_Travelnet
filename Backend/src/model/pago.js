/**
 * ============================================================================
 * MODELO DE BASE DE DATOS: Pago (src/model/pago.js)
 * ============================================================================
 * Es uno de los modelos principales del sistema. Gestiona:
 * 1. El cálculo de días de atraso de cada instalación (`calcularAtraso`).
 * 2. El registro transaccional de cobros (`create`), generando automáticamente
 *    las filas en `Mensualidad` y `Pago_Detalle` para 1 o varios meses adelantados.
 * 3. La invocación del procedimiento almacenado `sp_ProcesarPago`.
 * 4. Las consultas de estado de pagos, exportación a Excel y pagos en efectivo
 *    pendientes de incluir en un Corte de Caja (`findPendientesCorte`).
 * ============================================================================
 */

// Mapa que traduce cada modalidad de facturación al número de meses que cubre
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

// Nombres de los meses en español para construir el concepto automático (ej. "Mensualidad Marzo 2026")
const NOMBRES_MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Suma una cantidad determinada de meses a una fecha dada
const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

/**
 * Calcula si la instalación de un cliente presenta atraso de pago al día de hoy.
 * @param {object} row - Fila con `Ultimo_Anio_Pagado`, `Ultimo_Mes_Pagado`, `Fecha_Pago` o `Fecha_Instalacion`.
 * @returns {{ Atrasado: boolean, Dias_Atraso: number }}
 */
const calcularAtraso = (row) => {
    const modalidad = row.Modalidad_Servicio;
    const mesesModalidad = MODALIDAD_MESES[modalidad] || 1;

    let fechaBase;
    if (row.Ultimo_Anio_Pagado && row.Ultimo_Mes_Pagado) {
        // Nota: En JavaScript los meses van de 0 (Enero) a 11 (Diciembre), por lo que
        // `new Date(anio, mes_1_a_12, 1)` apunta al día 1 del mes SIGUIENTE al último mes pagado.
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

/**
 * Resuelve el identificador `MetodoPagoId` a partir de un ID numérico o del nombre
 * del método (`'Efectivo'`, `'Transferencia'`, etc.).
 */
const resolveMetodoPagoId = async (conn, data) => {
    if (data.MetodoPagoId !== undefined && data.MetodoPagoId !== null && data.MetodoPagoId !== '') {
        return Number(data.MetodoPagoId);
    }
    const nombreMetodo = data.Metodo_Pago || data.Tipo_Pago || 'Efectivo';
    const rows = await conn.query(
        'SELECT MetodoPagoId FROM Metodo_Pago WHERE Nombre = ? LIMIT 1',
        [nombreMetodo]
    );
    if (rows.length > 0) {
        return rows[0].MetodoPagoId;
    }
    const fallback = await conn.query('SELECT MetodoPagoId FROM Metodo_Pago ORDER BY MetodoPagoId ASC LIMIT 1');
    if (fallback.length > 0) {
        return fallback[0].MetodoPagoId;
    }
    throw new Error(`El método de pago '${nombreMetodo}' no existe en Metodo_Pago.`);
};

/**
 * Normaliza el estado del pago a los valores permitidos por el ENUM de la tabla `Pago`:
 * `'Completado'`, `'Pendiente'` o `'Cancelado'`.
 */
const normalizeEstadoPago = (estadoPago) => {
    if (estadoPago === 'Pendiente' || estadoPago === 'Cancelado') {
        return estadoPago;
    }
    return 'Completado';
};

// Consulta base de un pago calculando su `Monto` total mediante la suma de `Pago_Detalle`
const SELECT_PAGO_BASE = `
    SELECT
        p.PagoId,
        p.InstalacionId,
        p.UsuarioId,
        p.MetodoPagoId,
        mp.Nombre AS Metodo_Pago,
        mp.Nombre AS Tipo_Pago,
        p.Fecha_Pago,
        p.Numero_cuenta,
        p.Referencia_Externa,
        p.Direccion_IP,
        p.Descuento,
        p.Estado_Pago,
        p.Uuid_local,
        p.Sincronizado,
        p.Ultima_modificacion,
        (
            SELECT COALESCE(SUM(pd.Monto_Abonado), 0.00)
            FROM Pago_Detalle pd
            WHERE pd.PagoId = p.PagoId
        ) AS Monto
    FROM Pago p
    LEFT JOIN Metodo_Pago mp ON p.MetodoPagoId = mp.MetodoPagoId
`;

// Consulta alternativa cuando el usuario de BD no tiene permisos de lectura en `Metodo_Pago`
const SELECT_PAGO_SIN_METODO = `
    SELECT
        p.PagoId,
        p.InstalacionId,
        p.UsuarioId,
        p.MetodoPagoId,
        NULL AS Metodo_Pago,
        NULL AS Tipo_Pago,
        p.Fecha_Pago,
        p.Numero_cuenta,
        p.Referencia_Externa,
        p.Direccion_IP,
        p.Descuento,
        p.Estado_Pago,
        p.Uuid_local,
        p.Sincronizado,
        p.Ultima_modificacion,
        (
            SELECT COALESCE(SUM(pd.Monto_Abonado), 0.00)
            FROM Pago_Detalle pd
            WHERE pd.PagoId = p.PagoId
        ) AS Monto
    FROM Pago p
`;

const isTableAccessDenied = (err) =>
    err && (err.errno === 1142 || err.code === 'ER_TABLEACCESS_DENIED_ERROR' || err.code === 'ER_COLUMNACCESS_DENIED_ERROR');

const Pago = {
    /**
     * Obtiene todos los recibos de pago registrados.
     */
    findAll: async (db) => {
        try {
            return await db.query(SELECT_PAGO_BASE);
        } catch (err) {
            if (isTableAccessDenied(err)) {
                return await db.query(SELECT_PAGO_SIN_METODO);
            }
            throw err;
        }
    },

    /**
     * Obtiene la matriz de clientes activos con sus mensualidades pagadas para generar
     * el reporte de exportación a Excel.
     */
    findAllParaExportar: async (db) => {
        const rows = await db.query(`
            SELECT
                i.InstalacionId,
                c.Nombre_Cliente AS Cliente,
                c.Telefono,
                lo.NombreLocalidad AS Ubicacion,
                i.Fecha_Instalacion,
                CASE
                    WHEN inf.Tipo = 'OLT' THEN 'Fibra'
                    WHEN inf.Tipo = 'Torre' THEN 'Antena'
                    ELSE inf.Tipo
                END AS Antena_AP,
                pl.Nombre AS Plan,
                m.Mes,
                m.Anio,
                m.Monto
            FROM Instalacion i
            INNER JOIN Cliente c ON i.ClienteId = c.ClienteId
            LEFT JOIN Localidad lo ON i.LocalidadId = lo.LocalidadId
            LEFT JOIN Infraestructura inf ON i.InfraestructuraId = inf.InfraestructuraId
            LEFT JOIN Plan_Tarifa pt ON i.TarifaId = pt.TarifaId
            LEFT JOIN Plan pl ON pt.PlanId = pl.PlanId
            LEFT JOIN Mensualidad m ON m.InstalacionId = i.InstalacionId 
                AND m.Active = TRUE 
                AND (m.Estado = 'Pagado' OR m.Estado = 'Incompleto')
            WHERE i.Active = TRUE
            ORDER BY c.Nombre_Cliente ASC, m.Anio ASC, m.Mes ASC
        `);
        return rows;
    },

    /**
     * Obtiene el tablero detallado de todas las instalaciones activas junto con
     * su último pago válido, su último mes pagado y su estado de atraso calculado.
     */
    findAllDetallado: async (db) => {
        let rows;
        try {
            rows = await db.query(`
                SELECT
                    i.InstalacionId,
                    i.TarifaId,
                    pt.PlanId,
                    pl.Nombre AS Plan,
                    pl.Velocidad_Mbps,
                    pt.Modalidad AS Modalidad_Servicio,
                    pt.Precio AS Precio_Tarifa,
                    i.Fecha_Instalacion,
                    i.Active AS Instalacion_Activa,
                    c.ClienteId,
                    c.Nombre_Cliente,
                    c.Telefono,
                    c.Saldo_Actual,
                    lo.NombreLocalidad AS Localidad,
                    p.UsuarioId AS Pago_UsuarioId,
                    p.PagoId,
                    p.Fecha_Pago,
                    p.Estado_Pago,
                    (
                        SELECT COALESCE(SUM(pd_s.Monto_Abonado), 0.00)
                        FROM Pago_Detalle pd_s
                        WHERE pd_s.PagoId = p.PagoId
                    ) AS Monto,
                    p.Descuento,
                    p.MetodoPagoId,
                    mp.Nombre AS Metodo_Pago,
                    mp.Nombre AS Tipo_Pago,
                    m.Mes AS Ultimo_Mes_Pagado,
                    m.Anio AS Ultimo_Anio_Pagado,
                    m.Concepto AS Concepto_Ultimo_Pago
                FROM Instalacion i
                INNER JOIN Cliente c ON i.ClienteId = c.ClienteId
                LEFT JOIN Localidad lo ON i.LocalidadId = lo.LocalidadId
                LEFT JOIN Plan_Tarifa pt ON i.TarifaId = pt.TarifaId
                LEFT JOIN Plan pl ON pt.PlanId = pl.PlanId

                LEFT JOIN Pago p ON p.InstalacionId = i.InstalacionId
                    AND p.PagoId = (
                        SELECT MAX(p2.PagoId) 
                        FROM Pago p2 
                        WHERE p2.InstalacionId = i.InstalacionId
                        AND p2.Estado_Pago != 'Cancelado'
                        AND EXISTS (
                            SELECT 1 FROM Pago_Detalle pd 
                            INNER JOIN Mensualidad m3 ON m3.MensualidadId = pd.MensualidadId 
                            WHERE pd.PagoId = p2.PagoId AND m3.Active = TRUE
                        )
                    )

                LEFT JOIN Metodo_Pago mp ON p.MetodoPagoId = mp.MetodoPagoId

                LEFT JOIN Mensualidad m ON m.MensualidadId = (
                    SELECT MAX(m2.MensualidadId)
                    FROM Mensualidad m2
                    WHERE m2.InstalacionId = i.InstalacionId
                      AND m2.Estado = 'Pagado'
                      AND (m2.Active = TRUE OR m2.Active IS NULL)
                )
                WHERE i.Active = TRUE
            `);
        } catch (err) {
            if (!isTableAccessDenied(err)) throw err;
            rows = await db.query(`
                SELECT
                    i.InstalacionId,
                    i.TarifaId,
                    pt.PlanId,
                    pl.Nombre AS Plan,
                    pl.Velocidad_Mbps,
                    pt.Modalidad AS Modalidad_Servicio,
                    pt.Precio AS Precio_Tarifa,
                    i.Fecha_Instalacion,
                    i.Active AS Instalacion_Activa,
                    c.ClienteId,
                    c.Nombre_Cliente,
                    c.Telefono,
                    c.Saldo_Actual,
                    lo.NombreLocalidad AS Localidad,
                    p.UsuarioId AS Pago_UsuarioId,
                    p.PagoId,
                    p.Fecha_Pago,
                    p.Estado_Pago,
                    (
                        SELECT COALESCE(SUM(pd_s.Monto_Abonado), 0.00)
                        FROM Pago_Detalle pd_s
                        WHERE pd_s.PagoId = p.PagoId
                    ) AS Monto,
                    p.Descuento,
                    p.MetodoPagoId,
                    NULL AS Metodo_Pago,
                    NULL AS Tipo_Pago,
                    m.Mes AS Ultimo_Mes_Pagado,
                    m.Anio AS Ultimo_Anio_Pagado,
                    m.Concepto AS Concepto_Ultimo_Pago
                FROM Instalacion i
                INNER JOIN Cliente c ON i.ClienteId = c.ClienteId
                LEFT JOIN Localidad lo ON i.LocalidadId = lo.LocalidadId
                LEFT JOIN Plan_Tarifa pt ON i.TarifaId = pt.TarifaId
                LEFT JOIN Plan pl ON pt.PlanId = pl.PlanId

                LEFT JOIN Pago p ON p.InstalacionId = i.InstalacionId
                    AND p.PagoId = (
                        SELECT MAX(p2.PagoId) 
                        FROM Pago p2 
                        WHERE p2.InstalacionId = i.InstalacionId
                        AND p2.Estado_Pago != 'Cancelado'
                        AND EXISTS (
                            SELECT 1 FROM Pago_Detalle pd 
                            INNER JOIN Mensualidad m3 ON m3.MensualidadId = pd.MensualidadId 
                            WHERE pd.PagoId = p2.PagoId AND m3.Active = TRUE
                        )
                    )

                LEFT JOIN Mensualidad m ON m.MensualidadId = (
                    SELECT MAX(m2.MensualidadId)
                    FROM Mensualidad m2
                    WHERE m2.InstalacionId = i.InstalacionId
                      AND m2.Estado = 'Pagado'
                      AND (m2.Active = TRUE OR m2.Active IS NULL)
                )
                WHERE i.Active = TRUE
            `);
        }
        return rows.map(r => ({ ...r, ...calcularAtraso(r) }));
    },

    /**
     * Busca un recibo de pago por su ID (`PagoId`).
     */
    findByPk: async (db, id) => {
        try {
            const rows = await db.query(`${SELECT_PAGO_BASE} WHERE p.PagoId = ?`, [id]);
            return rows[0];
        } catch (err) {
            if (isTableAccessDenied(err)) {
                const rows = await db.query(`${SELECT_PAGO_SIN_METODO} WHERE p.PagoId = ?`, [id]);
                return rows[0];
            }
            throw err;
        }
    },

    /**
     * Obtiene los pagos en `'Efectivo'` realizados el día de hoy (`CURDATE()`) con estado
     * `'Completado'` que todavía NO han sido incluidos en ningún corte de caja (`Corte_Pago`).
     */
    findPendientesCorte: async (db, usuarioId = null) => {
        const params = [];
        let filtroUsuario = '';
        if (usuarioId !== null && usuarioId !== undefined && usuarioId !== '') {
            filtroUsuario = 'AND p.UsuarioId = ?';
            params.push(Number(usuarioId));
        }

        const rows = await db.query(`
            SELECT
                p.PagoId,
                p.InstalacionId,
                p.UsuarioId AS Pago_UsuarioId,
                p.Fecha_Pago,
                p.Estado_Pago,
                p.Descuento,
                p.MetodoPagoId,
                mp.Nombre AS Metodo_Pago,
                mp.Nombre AS Tipo_Pago,
                c.ClienteId,
                c.Nombre_Cliente,
                (
                    SELECT COALESCE(SUM(pd.Monto_Abonado), 0.00)
                    FROM Pago_Detalle pd
                    WHERE pd.PagoId = p.PagoId
                ) AS Monto,
                (
                    SELECT m.Mes
                    FROM Pago_Detalle pd2
                    INNER JOIN Mensualidad m ON m.MensualidadId = pd2.MensualidadId
                    WHERE pd2.PagoId = p.PagoId
                    ORDER BY m.Anio DESC, m.Mes DESC
                    LIMIT 1
                ) AS Ultimo_Mes_Pagado,
                (
                    SELECT m.Anio
                    FROM Pago_Detalle pd2
                    INNER JOIN Mensualidad m ON m.MensualidadId = pd2.MensualidadId
                    WHERE pd2.PagoId = p.PagoId
                    ORDER BY m.Anio DESC, m.Mes DESC
                    LIMIT 1
                ) AS Ultimo_Anio_Pagado,
                (
                    SELECT m.Concepto
                    FROM Pago_Detalle pd2
                    INNER JOIN Mensualidad m ON m.MensualidadId = pd2.MensualidadId
                    WHERE pd2.PagoId = p.PagoId
                    ORDER BY m.Anio DESC, m.Mes DESC
                    LIMIT 1
                ) AS Concepto_Ultimo_Pago
            FROM Pago p
            INNER JOIN Instalacion i ON p.InstalacionId = i.InstalacionId
            INNER JOIN Cliente c ON i.ClienteId = c.ClienteId
            LEFT JOIN Metodo_Pago mp ON p.MetodoPagoId = mp.MetodoPagoId
            WHERE DATE(p.Fecha_Pago) = CURDATE()
              AND p.Estado_Pago = 'Completado'
              AND mp.Nombre = 'Efectivo'
              ${filtroUsuario}
              AND NOT EXISTS (
                  SELECT 1 FROM Corte_Pago cp WHERE cp.PagoId = p.PagoId
              )
            ORDER BY p.PagoId ASC
        `, params);

        return rows;
    },

    /**
     * Obtiene el desglose mes por mes (`Pago_Detalle` + `Mensualidad`) de una lista de IDs de pago,
     * usado en la vista de detalles del Corte de Caja.
     */
    findDesgloseByPagoIds: async (db, pagoIds) => {
        if (!pagoIds || !Array.isArray(pagoIds) || pagoIds.length === 0) {
            return [];
        }
        const placeholders = pagoIds.map(() => '?').join(',');
        try {
            return await db.query(`
                SELECT 
                    p.PagoId, 
                    c.Nombre_Cliente AS Cliente, 
                    m.Mes, 
                    m.Anio, 
                    m.Concepto, 
                    pd.Monto_Abonado AS MontoMes,
                    p.Descuento,
                    p.MetodoPagoId,
                    mp.Nombre AS Metodo_Pago,
                    mp.Nombre AS Tipo_Pago
                FROM Pago p
                INNER JOIN Instalacion i ON p.InstalacionId = i.InstalacionId
                INNER JOIN Cliente c ON i.ClienteId = c.ClienteId
                INNER JOIN Pago_Detalle pd ON pd.PagoId = p.PagoId
                INNER JOIN Mensualidad m ON m.MensualidadId = pd.MensualidadId
                LEFT JOIN Metodo_Pago mp ON mp.MetodoPagoId = p.MetodoPagoId
                WHERE p.PagoId IN (${placeholders})
                ORDER BY p.PagoId, m.Anio, m.Mes
            `, pagoIds);
        } catch (err) {
            if (isTableAccessDenied(err)) {
                return await db.query(`
                    SELECT 
                        p.PagoId, 
                        c.Nombre_Cliente AS Cliente, 
                        m.Mes, 
                        m.Anio, 
                        m.Concepto, 
                        pd.Monto_Abonado AS MontoMes,
                        p.Descuento,
                        p.MetodoPagoId,
                        NULL AS Metodo_Pago,
                        NULL AS Tipo_Pago
                    FROM Pago p
                    INNER JOIN Instalacion i ON p.InstalacionId = i.InstalacionId
                    INNER JOIN Cliente c ON i.ClienteId = c.ClienteId
                    INNER JOIN Pago_Detalle pd ON pd.PagoId = p.PagoId
                    INNER JOIN Mensualidad m ON m.MensualidadId = pd.MensualidadId
                    WHERE p.PagoId IN (${placeholders})
                    ORDER BY p.PagoId, m.Anio, m.Mes
                `, pagoIds);
            }
            throw err;
        }
    },

    /**
     * Ejecuta el procedimiento almacenado `sp_ProcesarPago` en MariaDB, el cual
     * procesa abonos, aplica saldo a favor si corresponde y devuelve `@p_CodigoResultado` y `@p_Mensaje`.
     */
    procesarPagoSP: async (db, data) => {
        const {
            InstalacionId,
            UsuarioId,
            MensualidadId,
            MontoRecibido,
            Monto,
            Numero_cuenta,
            Referencia_Externa,
            Direccion_IP,
            Uuid_local,
            AplicarSaldoFavor
        } = data;

        const conn = await db.getConnection();
        try {
            const metodoPagoId = await resolveMetodoPagoId(conn, data);
            const montoFinal = MontoRecibido !== undefined ? Number(MontoRecibido) : Number(Monto || 0);

            await conn.query(
                'CALL sp_ProcesarPago(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_CodigoResultado, @p_Mensaje)',
                [
                    InstalacionId,
                    UsuarioId,
                    metodoPagoId,
                    MensualidadId,
                    montoFinal,
                    Numero_cuenta || null,
                    Referencia_Externa || null,
                    Direccion_IP || null,
                    Uuid_local || null,
                    AplicarSaldoFavor ? 1 : 0
                ]
            );

            const [outRow] = await conn.query(
                'SELECT @p_CodigoResultado AS CodigoResultado, @p_Mensaje AS Mensaje'
            );

            return outRow;
        } finally {
            conn.release();
        }
    },

    /**
     * Registra un pago completo dentro de una **Transacción SQL**:
     * 1. Verifica `Uuid_local` para evitar cobros duplicados al sincronizar desde modo Offline.
     * 2. Inserta el encabezado del recibo en la tabla `Pago`.
     * 3. Recorre `Cantidad_Meses` para crear o actualizar cada mes en `Mensualidad` y su abono en `Pago_Detalle`.
     */
    create: async (db, data) => {
        const {
            InstalacionId,
            UsuarioId,
            Numero_cuenta,
            Referencia_Externa,
            Direccion_IP,
            Descuento,
            Estado_Pago,
            Monto,
            Uuid_local,
            Sincronizado,
            Mes,
            Anio,
            Cantidad_Meses,
            Concepto
        } = data;

        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // Idempotencia para pagos sincronizados desde el modo Offline
            if (Uuid_local) {
                const dup = await conn.query('SELECT PagoId FROM Pago WHERE Uuid_local = ? LIMIT 1', [Uuid_local]);
                if (dup.length > 0) {
                    await conn.rollback();
                    return await Pago.findByPk(db, dup[0].PagoId);
                }
            }

            const metodoPagoId = await resolveMetodoPagoId(conn, data);
            const estadoPagoDB = normalizeEstadoPago(Estado_Pago);

            const result = await conn.query(
                `INSERT INTO Pago (
                    InstalacionId, UsuarioId, MetodoPagoId, Numero_cuenta,
                    Referencia_Externa, Direccion_IP, Descuento, Estado_Pago,
                    Uuid_local, Sincronizado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    InstalacionId,
                    UsuarioId,
                    metodoPagoId,
                    Numero_cuenta || null,
                    Referencia_Externa || null,
                    Direccion_IP || null,
                    Descuento || 0.00,
                    estadoPagoDB,
                    Uuid_local || null,
                    Sincronizado !== undefined ? (Sincronizado ? 1 : 0) : 1
                ]
            );
            const pagoId = Number(result.insertId);

            // Calculamos cuántos meses se están pagando y cuánto corresponde a cada mes
            const numMeses = parseInt(Cantidad_Meses, 10) || 1;
            const hoy = new Date();
            const startMes = parseInt(Mes, 10) || (hoy.getMonth() + 1);
            const startAnio = parseInt(Anio, 10) || hoy.getFullYear();
            const montoTotal = parseFloat(Monto) || 0;
            const montoPorMes = parseFloat((montoTotal / numMeses).toFixed(2));

            const estadoMensualidad = Estado_Pago === 'Incompleto'
                ? 'Incompleto'
                : (estadoPagoDB === 'Completado' ? 'Pagado' : 'Pendiente');

            const mensualidadesCreadas = [];

            for (let i = 0; i < numMeses; i++) {
                // Si el pago abarca cambio de año (ej. Noviembre, Diciembre, Enero), incrementa el año automáticamente
                const indexMes = (startMes - 1 + i) % 12;
                const currentMes = indexMes + 1;
                const currentAnio = startAnio + Math.floor((startMes - 1 + i) / 12);
                const mesNombre = NOMBRES_MESES[indexMes];
                const conceptoMes = numMeses === 1 && Concepto ? Concepto : `Mensualidad ${mesNombre} ${currentAnio}`;

                const existing = await conn.query(
                    'SELECT MensualidadId FROM Mensualidad WHERE InstalacionId = ? AND Mes = ? AND Anio = ?',
                    [InstalacionId, currentMes, currentAnio]
                );

                let mensualidadId;
                if (existing && existing.length > 0) {
                    mensualidadId = existing[0].MensualidadId;

                    await conn.query(
                        'UPDATE Mensualidad SET Estado = ?, Monto = ?, Concepto = ?, Active = TRUE WHERE MensualidadId = ?',
                        [estadoMensualidad, montoPorMes, conceptoMes, mensualidadId]
                    );
                } else {
                    const insertMensualidad = await conn.query(
                        'INSERT INTO Mensualidad (InstalacionId, Mes, Anio, Concepto, Monto, Estado) VALUES (?, ?, ?, ?, ?, ?)',
                        [InstalacionId, currentMes, currentAnio, conceptoMes, montoPorMes, estadoMensualidad]
                    );
                    mensualidadId = Number(insertMensualidad.insertId);
                }

                await conn.query(
                    'INSERT INTO Pago_Detalle (PagoId, MensualidadId, Monto_Abonado) VALUES (?, ?, ?)',
                    [pagoId, mensualidadId, montoPorMes]
                );

                mensualidadesCreadas.push({
                    MensualidadId: mensualidadId,
                    Mes: currentMes,
                    Anio: currentAnio,
                    Concepto: conceptoMes,
                    Monto_Abonado: montoPorMes
                });
            }

            await conn.commit();

            const pagoCreado = await Pago.findByPk(db, pagoId);
            return {
                ...pagoCreado,
                Mensualidades: mensualidadesCreadas
            };
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    /**
     * Actualiza un recibo de pago existente y, si el monto total cambió,
     * recalcula proporcionalmente los montos en `Pago_Detalle` y `Mensualidad`.
     */
    update: async (db, id, data) => {
        const {
            InstalacionId,
            UsuarioId,
            Numero_cuenta,
            Referencia_Externa,
            Direccion_IP,
            Descuento,
            Estado_Pago,
            Monto,
            Uuid_local,
            Sincronizado
        } = data;

        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const sets = [];
            const params = [];

            if (InstalacionId !== undefined) {
                sets.push('InstalacionId = ?');
                params.push(InstalacionId);
            }
            if (UsuarioId !== undefined) {
                sets.push('UsuarioId = ?');
                params.push(UsuarioId);
            }
            if (data.MetodoPagoId !== undefined || data.Metodo_Pago !== undefined || data.Tipo_Pago !== undefined) {
                const metodoPagoId = await resolveMetodoPagoId(conn, data);
                sets.push('MetodoPagoId = ?');
                params.push(metodoPagoId);
            }
            if (Numero_cuenta !== undefined) {
                sets.push('Numero_cuenta = ?');
                params.push(Numero_cuenta);
            }
            if (Referencia_Externa !== undefined) {
                sets.push('Referencia_Externa = ?');
                params.push(Referencia_Externa);
            }
            if (Direccion_IP !== undefined) {
                sets.push('Direccion_IP = ?');
                params.push(Direccion_IP);
            }
            if (Descuento !== undefined) {
                sets.push('Descuento = ?');
                params.push(Descuento ?? 0.00);
            }
            if (Estado_Pago !== undefined) {
                sets.push('Estado_Pago = ?');
                params.push(normalizeEstadoPago(Estado_Pago));
            }
            if (Uuid_local !== undefined) {
                sets.push('Uuid_local = ?');
                params.push(Uuid_local);
            }
            if (Sincronizado !== undefined) {
                sets.push('Sincronizado = ?');
                params.push(Sincronizado ? 1 : 0);
            }

            if (sets.length > 0) {
                params.push(id);
                await conn.query(`UPDATE Pago SET ${sets.join(', ')} WHERE PagoId = ?`, params);
            }

            if (Monto !== undefined && Monto !== null) {
                const detalles = await conn.query('SELECT DetalleId, MensualidadId FROM Pago_Detalle WHERE PagoId = ?', [id]);
                if (detalles.length > 0) {
                    const montoPorDetalle = parseFloat((parseFloat(Monto) / detalles.length).toFixed(2));
                    await conn.query('UPDATE Pago_Detalle SET Monto_Abonado = ? WHERE PagoId = ?', [montoPorDetalle, id]);
                    for (const d of detalles) {
                        await conn.query('UPDATE Mensualidad SET Monto = ? WHERE MensualidadId = ?', [montoPorDetalle, d.MensualidadId]);
                    }
                }
            }

            await conn.commit();
            return await Pago.findByPk(db, id);
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
};

module.exports = { ...Pago, calcularAtraso };