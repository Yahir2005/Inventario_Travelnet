/**
 * ============================================================================
 * MODELO DE BASE DE DATOS: Mensualidad (src/model/mensualidad.js)
 * ============================================================================
 * Gestiona la tabla `Mensualidad`, que representa cada mes/año facturado o
 * cobrado a una instalación (`Estado`: 'Pagado', 'Pendiente', 'Incompleto', 'Vencido').
 * También coordina la cancelación de mensualidades registrando la auditoría
 * en `Cancelacion_Pago` y `Motivo_Cancelacion`.
 * ============================================================================
 */

// Detecta si un error de MariaDB se debe a falta de permisos de lectura/escritura sobre alguna tabla
const isTableAccessDenied = (err) =>
    err && (err.errno === 1142 || err.code === 'ER_TABLEACCESS_DENIED_ERROR' || err.code === 'ER_COLUMNACCESS_DENIED_ERROR');

/**
 * Busca o crea el motivo de cancelación en el catálogo `Motivo_Cancelacion`.
 * Si el rol de base de datos no tiene permiso para insertar nuevos motivos,
 * selecciona el motivo genérico `'Otro'` como respaldo.
 */
const resolveMotivoId = async (db, motivoId, descripcion) => {
    if (motivoId !== undefined && motivoId !== null && motivoId !== '') {
        return Number(motivoId);
    }
    const texto = (descripcion || 'Cancelación de mensualidad').substring(0, 100);
    const existing = await db.query(
        'SELECT MotivoId FROM Motivo_Cancelacion WHERE Descripcion = ? LIMIT 1',
        [texto]
    );
    if (existing.length > 0) {
        return existing[0].MotivoId;
    }
    try {
        const inserted = await db.query(
            'INSERT INTO Motivo_Cancelacion (Descripcion) VALUES (?)',
            [texto]
        );
        return Number(inserted.insertId);
    } catch (err) {
        if (isTableAccessDenied(err)) {
            const fallback = await db.query(
                `SELECT MotivoId FROM Motivo_Cancelacion
                 ORDER BY CASE WHEN Descripcion = 'Otro' THEN 0 ELSE 1 END, MotivoId ASC
                 LIMIT 1`
            );
            if (fallback.length > 0) {
                return fallback[0].MotivoId;
            }
        }
        throw err;
    }
};

const Mensualidad = {
    /**
     * Lista todas las mensualidades registradas en el sistema.
     */
    findAll: async (db) => {
        const rows = await db.query(
            'SELECT MensualidadId, InstalacionId, Mes, Anio, Concepto, Monto, Active, Estado FROM Mensualidad'
        );
        return rows;
    },

    /**
     * Busca una mensualidad específica por su ID (`MensualidadId`).
     */
    findByPk: async (db, id) => {
        const rows = await db.query(
            'SELECT MensualidadId, InstalacionId, Mes, Anio, Concepto, Monto, Active, Estado FROM Mensualidad WHERE MensualidadId = ?',
            [id]
        );
        return rows[0];
    },

    /**
     * Obtiene el historial completo de mensualidades de una instalación (`InstalacionId`),
     * uniendo cada mes con su recibo de pago (`Pago_Detalle`, `Pago`) y, si fue cancelado,
     * con los datos de su cancelación (`Cancelacion_Pago`, `Motivo_Cancelacion`).
     */
    findByInstalacion: async (db, instalacionId) => {
        try {
            return await db.query(`
                SELECT 
                    m.MensualidadId,
                    m.InstalacionId,
                    m.Mes,
                    m.Anio,
                    m.Concepto,
                    m.Monto,
                    m.Active,
                    m.Estado,
                    pd.DetalleId,
                    pd.PagoId,
                    pd.Monto_Abonado,
                    p.Fecha_Pago,
                    p.MetodoPagoId,
                    mp.Nombre AS Metodo_Pago,
                    mp.Nombre AS Tipo_Pago,
                    p.Estado_Pago,
                    cp.CancelacionId,
                    cp.MotivoId,
                    mc.Descripcion AS Motivo_Descripcion,
                    cp.Observaciones,
                    COALESCE(cp.Observaciones, mc.Descripcion) AS MotivoCancelacion
                FROM Mensualidad m
                LEFT JOIN Pago_Detalle pd ON pd.MensualidadId = m.MensualidadId
                LEFT JOIN Pago p ON p.PagoId = pd.PagoId
                LEFT JOIN Metodo_Pago mp ON mp.MetodoPagoId = p.MetodoPagoId
                LEFT JOIN Cancelacion_Pago cp ON cp.PagoId = p.PagoId
                LEFT JOIN Motivo_Cancelacion mc ON mc.MotivoId = cp.MotivoId
                WHERE m.InstalacionId = ?
                ORDER BY m.Anio DESC, m.Mes DESC
            `, [instalacionId]);
        } catch (err) {
            // Consulta de respaldo si el rol de BD no tiene permisos sobre `Metodo_Pago` o `Cancelacion_Pago`
            if (isTableAccessDenied(err)) {
                return await db.query(`
                    SELECT 
                        m.MensualidadId,
                        m.InstalacionId,
                        m.Mes,
                        m.Anio,
                        m.Concepto,
                        m.Monto,
                        m.Active,
                        m.Estado,
                        pd.DetalleId,
                        pd.PagoId,
                        pd.Monto_Abonado,
                        p.Fecha_Pago,
                        p.MetodoPagoId,
                        NULL AS Metodo_Pago,
                        NULL AS Tipo_Pago,
                        p.Estado_Pago,
                        NULL AS CancelacionId,
                        NULL AS MotivoId,
                        NULL AS Motivo_Descripcion,
                        NULL AS Observaciones,
                        NULL AS MotivoCancelacion
                    FROM Mensualidad m
                    LEFT JOIN Pago_Detalle pd ON pd.MensualidadId = m.MensualidadId
                    LEFT JOIN Pago p ON p.PagoId = pd.PagoId
                    WHERE m.InstalacionId = ?
                    ORDER BY m.Anio DESC, m.Mes DESC
                `, [instalacionId]);
            }
            throw err;
        }
    },

    /**
     * Crea un nuevo registro de mensualidad para una instalación.
     */
    create: async (db, data) => {
        const { InstalacionId, Mes, Anio, Concepto, Monto, Estado } = data;
        const result = await db.query(
            'INSERT INTO Mensualidad (InstalacionId, Mes, Anio, Concepto, Monto, Active, Estado) VALUES (?, ?, ?, ?, ?, TRUE, ?)',
            [InstalacionId, Mes, Anio, Concepto, Monto, Estado || 'Pendiente']
        );
        return await Mensualidad.findByPk(db, Number(result.insertId));
    },

    /**
     * Actualiza los campos de una mensualidad existente.
     */
    update: async (db, id, data) => {
        const { InstalacionId, Mes, Anio, Concepto, Monto, Active, Estado } = data;
        const sets = [];
        const params = [];

        if (InstalacionId !== undefined) {
            sets.push('InstalacionId = ?');
            params.push(InstalacionId);
        }
        if (Mes !== undefined) {
            sets.push('Mes = ?');
            params.push(Mes);
        }
        if (Anio !== undefined) {
            sets.push('Anio = ?');
            params.push(Anio);
        }
        if (Concepto !== undefined) {
            sets.push('Concepto = ?');
            params.push(Concepto);
        }
        if (Monto !== undefined) {
            sets.push('Monto = ?');
            params.push(Monto);
        }
        if (Active !== undefined) {
            sets.push('Active = ?');
            params.push(Active ? 1 : 0);
        }
        if (Estado !== undefined) {
            sets.push('Estado = ?');
            params.push(Estado);
        }

        if (sets.length > 0) {
            params.push(id);
            await db.query(
                `UPDATE Mensualidad SET ${sets.join(', ')} WHERE MensualidadId = ?`,
                params
            );
        }
        return await Mensualidad.findByPk(db, id);
    },

    /**
     * Cancela una mensualidad pagada:
     * 1. Marca la mensualidad como inactiva (`Active = FALSE`) y con estado `'Vencido'`.
     * 2. Si tiene un pago asociado, cambia `Estado_Pago = 'Cancelado'`.
     * 3. Registra quién y por qué se canceló en la tabla `Cancelacion_Pago`.
     */
    cancelar: async (db, mensualidadId, motivo, extra = {}) => {
        await db.query(
            'UPDATE Mensualidad SET Active = FALSE, Estado = ? WHERE MensualidadId = ?',
            ['Vencido', mensualidadId]
        );

        let pagoId = extra.PagoId || null;
        if (!pagoId) {
            const pdRows = await db.query(
                'SELECT PagoId FROM Pago_Detalle WHERE MensualidadId = ? ORDER BY DetalleId DESC LIMIT 1',
                [mensualidadId]
            );
            if (pdRows.length > 0) {
                pagoId = pdRows[0].PagoId;
            }
        }

        let cancelacionId = null;
        if (pagoId) {
            try {
                await db.query(
                    'UPDATE Pago SET Estado_Pago = ? WHERE PagoId = ?',
                    ['Cancelado', pagoId]
                );
            } catch (err) {
                if (!isTableAccessDenied(err)) throw err;
            }

            let usuarioId = extra.UsuarioId || null;
            if (!usuarioId) {
                const pagoRows = await db.query('SELECT UsuarioId FROM Pago WHERE PagoId = ?', [pagoId]);
                usuarioId = pagoRows[0]?.UsuarioId || 1;
            }

            const motivoId = await resolveMotivoId(db, extra.MotivoId, motivo);
            const observaciones = extra.Observaciones !== undefined ? extra.Observaciones : motivo;

            const existingCancelacion = await db.query(
                'SELECT CancelacionId FROM Cancelacion_Pago WHERE PagoId = ? LIMIT 1',
                [pagoId]
            );
            if (existingCancelacion.length > 0) {
                cancelacionId = Number(existingCancelacion[0].CancelacionId);
                try {
                    await db.query(
                        `UPDATE Cancelacion_Pago
                         SET UsuarioId = ?, MotivoId = ?, Observaciones = ?, Fecha_Cancelacion = CURRENT_TIMESTAMP
                         WHERE CancelacionId = ?`,
                        [usuarioId, motivoId, observaciones || null, cancelacionId]
                    );
                } catch (err) {
                    if (!isTableAccessDenied(err)) throw err;
                }
            } else {
                const result = await db.query(
                    'INSERT INTO Cancelacion_Pago (PagoId, UsuarioId, MotivoId, Observaciones) VALUES (?, ?, ?, ?)',
                    [pagoId, usuarioId, motivoId, observaciones || null]
                );
                cancelacionId = Number(result.insertId);
            }
        }

        return {
            CancelacionId: cancelacionId,
            PagoMesCanceladoId: cancelacionId,
            PagoId: pagoId,
            MensualidadId: Number(mensualidadId),
            Motivo: motivo
        };
    },

    /**
     * Desactiva lógicamente una mensualidad (`Active = FALSE`, `Estado = 'Vencido'`).
     */
    remove: async (db, id) => {
        const result = await db.query(
            'UPDATE Mensualidad SET Active = FALSE, Estado = ? WHERE MensualidadId = ?',
            ['Vencido', id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Mensualidad;