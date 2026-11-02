/**
 * ============================================================================
 * MODELO DE BASE DE DATOS: PagoMesCancelado (src/model/PagoMesCancelado.js)
 * ============================================================================
 * Gestiona las tablas normalizadas `Cancelacion_Pago` y `Motivo_Cancelacion`,
 * donde se guarda la bitácora de auditoría cada vez que un pago o mensualidad
 * es cancelado (quién lo canceló, en qué fecha, el motivo del catálogo y
 * observaciones detalladas).
 * ============================================================================
 */

// Consulta que une la cancelación (`Cancelacion_Pago`) con su motivo (`Motivo_Cancelacion`) y mensualidad (`Pago_Detalle`)
const SELECT_CANCELACION = `
    SELECT
        cp.CancelacionId,
        cp.CancelacionId AS PagoMesCanceladoId,
        cp.PagoId,
        pd.MensualidadId,
        cp.UsuarioId,
        cp.MotivoId,
        mc.Descripcion AS Motivo_Descripcion,
        cp.Observaciones,
        COALESCE(cp.Observaciones, mc.Descripcion) AS Motivo,
        cp.Fecha_Cancelacion
    FROM Cancelacion_Pago cp
    INNER JOIN Motivo_Cancelacion mc ON cp.MotivoId = mc.MotivoId
    LEFT JOIN Pago_Detalle pd ON pd.PagoId = cp.PagoId
`;

const isTableAccessDenied = (err) =>
    err && (err.errno === 1142 || err.code === 'ER_TABLEACCESS_DENIED_ERROR' || err.code === 'ER_COLUMNACCESS_DENIED_ERROR');

/**
 * Busca o inserta un motivo en el catálogo `Motivo_Cancelacion` y devuelve su `MotivoId`.
 * Si el usuario de MariaDB no tiene permiso de inserción en `Motivo_Cancelacion`,
 * devuelve el ID del motivo `'Otro'`.
 */
const resolveMotivoId = async (db, motivoId, descripcion) => {
    if (motivoId !== undefined && motivoId !== null && motivoId !== '') {
        return Number(motivoId);
    }
    const texto = (descripcion || 'Cancelación de pago').substring(0, 100);
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

const PagoMesCancelado = {
    /**
     * Obtiene todos los registros de cancelación de pagos.
     */
    findAll: async (db) => {
        return await db.query(SELECT_CANCELACION);
    },

    /**
     * Busca una cancelación específica por su llave primaria (`CancelacionId`).
     */
    findByPk: async (db, id) => {
        const rows = await db.query(`${SELECT_CANCELACION} WHERE cp.CancelacionId = ?`, [id]);
        return rows[0];
    },

    /**
     * Registra la cancelación de un pago:
     * 1. Localiza el `PagoId` (directamente o a través de `MensualidadId`).
     * 2. Marca el pago como `'Cancelado'` en la tabla `Pago`.
     * 3. Inserta o actualiza el registro de auditoría en `Cancelacion_Pago`.
     */
    create: async (db, data) => {
        const { PagoId, MensualidadId, UsuarioId, MotivoId, Motivo, Observaciones } = data;

        let targetPagoId = PagoId || null;
        if (!targetPagoId && MensualidadId) {
            const pdRows = await db.query(
                'SELECT PagoId FROM Pago_Detalle WHERE MensualidadId = ? ORDER BY DetalleId DESC LIMIT 1',
                [MensualidadId]
            );
            if (pdRows.length > 0) {
                targetPagoId = pdRows[0].PagoId;
            }
        }

        if (!targetPagoId) {
            throw new Error('PagoId (o una MensualidadId con pago asociado) es requerido para registrar la cancelación.');
        }

        let targetUsuarioId = UsuarioId || null;
        if (!targetUsuarioId) {
            const pRows = await db.query('SELECT UsuarioId FROM Pago WHERE PagoId = ?', [targetPagoId]);
            targetUsuarioId = pRows[0]?.UsuarioId || 1;
        }

        const resolvedMotivoId = await resolveMotivoId(db, MotivoId, Motivo || Observaciones);
        const obs = Observaciones !== undefined ? Observaciones : (Motivo || null);

        try {
            await db.query('UPDATE Pago SET Estado_Pago = ? WHERE PagoId = ?', ['Cancelado', targetPagoId]);
        } catch (err) {
            if (!isTableAccessDenied(err)) throw err;
        }

        const existingCancelacion = await db.query(
            'SELECT CancelacionId FROM Cancelacion_Pago WHERE PagoId = ? LIMIT 1',
            [targetPagoId]
        );

        let cancelacionId;
        if (existingCancelacion.length > 0) {
            cancelacionId = Number(existingCancelacion[0].CancelacionId);
            try {
                await db.query(
                    `UPDATE Cancelacion_Pago
                     SET UsuarioId = ?, MotivoId = ?, Observaciones = ?, Fecha_Cancelacion = CURRENT_TIMESTAMP
                     WHERE CancelacionId = ?`,
                    [targetUsuarioId, resolvedMotivoId, obs, cancelacionId]
                );
            } catch (err) {
                if (!isTableAccessDenied(err)) throw err;
            }
        } else {
            const result = await db.query(
                'INSERT INTO Cancelacion_Pago (PagoId, UsuarioId, MotivoId, Observaciones) VALUES (?, ?, ?, ?)',
                [targetPagoId, targetUsuarioId, resolvedMotivoId, obs]
            );
            cancelacionId = Number(result.insertId);
        }

        return await PagoMesCancelado.findByPk(db, cancelacionId);
    },

    /**
     * Actualiza el motivo o las observaciones de una cancelación existente.
     */
    update: async (db, id, data) => {
        const { PagoId, UsuarioId, MotivoId, Motivo, Observaciones } = data;
        const sets = [];
        const params = [];

        if (PagoId !== undefined) {
            sets.push('PagoId = ?');
            params.push(PagoId);
        }
        if (UsuarioId !== undefined) {
            sets.push('UsuarioId = ?');
            params.push(UsuarioId);
        }
        if (MotivoId !== undefined || Motivo !== undefined) {
            const resolvedMotivoId = await resolveMotivoId(db, MotivoId, Motivo);
            sets.push('MotivoId = ?');
            params.push(resolvedMotivoId);
        }
        if (Observaciones !== undefined || Motivo !== undefined) {
            sets.push('Observaciones = ?');
            params.push(Observaciones !== undefined ? Observaciones : Motivo);
        }

        if (sets.length > 0) {
            params.push(id);
            await db.query(`UPDATE Cancelacion_Pago SET ${sets.join(', ')} WHERE CancelacionId = ?`, params);
        }

        return await PagoMesCancelado.findByPk(db, id);
    },

    /**
     * Lista todos los motivos de cancelación predefinidos en el catálogo `Motivo_Cancelacion`.
     */
    findAllMotivos: async (db) => {
        return await db.query('SELECT MotivoId, Descripcion FROM Motivo_Cancelacion ORDER BY MotivoId ASC');
    }
};

module.exports = PagoMesCancelado;