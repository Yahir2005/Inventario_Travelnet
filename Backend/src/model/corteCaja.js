/**
 * ============================================================================
 * MODELO DE BASE DE DATOS: CorteCaja (src/model/corteCaja.js)
 * ============================================================================
 * Gestiona los cortes de caja diarios en la tabla `CorteCaja` y su relación
 * muchos-a-muchos con los pagos incluidos en ese corte (`Corte_Pago`).
 * ============================================================================
 */

// Consulta base que une el corte de caja con el usuario cajero (`u`) y el administrador autorizador (`ua`)
const SELECT_CORTE_BASE = `
    SELECT
        c.CorteId,
        c.UsuarioId,
        c.AutorizadorId,
        c.MontoTotal_Declarado,
        c.MontoTotal_Calculado,
        c.MontoTotal_Calculado AS MontoTotal,
        c.FechaCorte,
        u.Nombre AS Nombre_Usuario,
        ua.Nombre AS Autorizador,
        ua.Nombre AS Nombre_Autorizador
    FROM CorteCaja c
    LEFT JOIN Usuario u ON c.UsuarioId = u.UsuarioId
    LEFT JOIN Usuario ua ON c.AutorizadorId = ua.UsuarioId
`;

/**
 * Función auxiliar que determina el `UsuarioId` del Administrador que autoriza el corte.
 * Acepta tanto un ID numérico (`AutorizadorId`) como el nombre del autorizador (`Autorizador`),
 * y si no se especifica, asigna por defecto al primer Administrador activo.
 */
const resolveAutorizadorId = async (conn, data) => {
    if (data.AutorizadorId !== undefined && data.AutorizadorId !== null && data.AutorizadorId !== '') {
        const adminById = await conn.query(
            `SELECT u.UsuarioId
             FROM Usuario u
             INNER JOIN Rol r ON u.RolId = r.RolId
             WHERE u.UsuarioId = ? AND r.Nombre = 'Administrador' AND u.Active = TRUE
             LIMIT 1`,
            [Number(data.AutorizadorId)]
        );
        if (adminById.length > 0) {
            return adminById[0].UsuarioId;
        }
    }

    if (data.Autorizador) {
        if (!Number.isNaN(Number(data.Autorizador))) {
            return Number(data.Autorizador);
        }
        const rows = await conn.query(
            `SELECT u.UsuarioId
             FROM Usuario u
             INNER JOIN Rol r ON u.RolId = r.RolId
             WHERE (u.Nombre = ? OR u.Usuario = ?) AND r.Nombre = 'Administrador' AND u.Active = TRUE
             LIMIT 1`,
            [data.Autorizador, data.Autorizador]
        );
        if (rows.length > 0) {
            return rows[0].UsuarioId;
        }
    }

    const adminRows = await conn.query(
        `SELECT u.UsuarioId
         FROM Usuario u
         INNER JOIN Rol r ON u.RolId = r.RolId
         WHERE r.Nombre = 'Administrador' AND u.Active = TRUE
         ORDER BY u.UsuarioId ASC
         LIMIT 1`
    );
    return adminRows[0]?.UsuarioId || 1;
};

/**
 * Extrae y limpia el arreglo de IDs de pagos (`PagoId`) enviados desde el Frontend.
 * Soporta que vengan como arreglo de números, arreglo de objetos o cadena JSON.
 */
const extractPagoIds = (data) => {
    let source = data.PagoIds || data.Pagos || data.Pagos_Incluidos;
    if (!source) return [];

    if (typeof source === 'string') {
        try {
            source = JSON.parse(source);
        } catch (_) {
            return [];
        }
    }

    if (!Array.isArray(source)) return [];

    const ids = source
        .map(item => (typeof item === 'object' && item !== null ? item.PagoId : item))
        .map(id => Number(id))
        .filter(id => Number.isInteger(id) && id > 0);

    // `new Set(ids)` elimina IDs duplicados
    return [...new Set(ids)];
};

/**
 * Consulta la tabla puente `Corte_Pago` para agregar a cada corte la lista detallada
 * de los pagos que fueron incluidos en él (ID del pago, nombre del cliente y monto).
 */
const attachPagosIncluidos = async (db, cortes) => {
    if (!cortes || cortes.length === 0) return [];

    const corteIds = cortes.map(c => c.CorteId);
    const placeholders = corteIds.map(() => '?').join(',');

    const pagosRows = await db.query(
        `SELECT
            cp.CorteId,
            cp.PagoId,
            cl.Nombre_Cliente AS Cliente,
            (
                SELECT COALESCE(SUM(pd.Monto_Abonado), 0.00)
                FROM Pago_Detalle pd
                WHERE pd.PagoId = p.PagoId
            ) AS Monto
         FROM Corte_Pago cp
         INNER JOIN Pago p ON cp.PagoId = p.PagoId
         INNER JOIN Instalacion i ON p.InstalacionId = i.InstalacionId
         INNER JOIN Cliente cl ON i.ClienteId = cl.ClienteId
         WHERE cp.CorteId IN (${placeholders})
         ORDER BY cp.PagoId ASC`,
        corteIds
    );

    const pagosPorCorte = new Map();
    for (const row of pagosRows) {
        if (!pagosPorCorte.has(row.CorteId)) {
            pagosPorCorte.set(row.CorteId, []);
        }
        pagosPorCorte.get(row.CorteId).push({
            PagoId: row.PagoId,
            Cliente: row.Cliente,
            Monto: row.Monto
        });
    }

    return cortes.map(c => {
        const pagos = pagosPorCorte.get(c.CorteId) || [];
        return {
            ...c,
            Pagos: pagos,
            PagoIds: pagos.map(p => p.PagoId),
            Pagos_Incluidos: JSON.stringify(pagos)
        };
    });
};

const corteCaja = {
    /**
     * Lista todos los cortes de caja del más reciente al más antiguo, incluyendo sus pagos.
     */
    findAll: async (db) => {
        const rows = await db.query(`${SELECT_CORTE_BASE} ORDER BY c.FechaCorte DESC`);
        return await attachPagosIncluidos(db, rows);
    },

    /**
     * Busca un corte de caja específico por su ID (`CorteId`) junto con sus pagos asociados.
     */
    findByPk: async (db, id) => {
        const rows = await db.query(`${SELECT_CORTE_BASE} WHERE c.CorteId = ?`, [id]);
        if (!rows[0]) return undefined;
        const enriched = await attachPagosIncluidos(db, rows);
        return enriched[0];
    },

    /**
     * Crea un nuevo corte de caja y vincula sus pagos dentro de una **Transacción SQL**.
     * Una transacción (`beginTransaction` -> `commit` / `rollback`) garantiza que o se guarda
     * el corte completo con todos sus pagos en `Corte_Pago`, o no se guarda nada si ocurre un error.
     */
    create: async (db, data) => {
        const {
            UsuarioId,
            MontoTotal_Declarado,
            MontoTotal_Calculado,
            MontoTotal,
            FechaCorte
        } = data;

        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const autorizadorId = await resolveAutorizadorId(conn, data);
            const montoCalculado = MontoTotal_Calculado ?? MontoTotal ?? MontoTotal_Declarado ?? 0.00;
            const montoDeclarado = MontoTotal_Declarado ?? MontoTotal ?? MontoTotal_Calculado ?? 0.00;

            let sql;
            let params;
            if (FechaCorte) {
                sql = `INSERT INTO CorteCaja (
                    UsuarioId, AutorizadorId, MontoTotal_Declarado, MontoTotal_Calculado, FechaCorte
                ) VALUES (?, ?, ?, ?, ?)`;
                params = [UsuarioId, autorizadorId, montoDeclarado, montoCalculado, FechaCorte];
            } else {
                sql = `INSERT INTO CorteCaja (
                    UsuarioId, AutorizadorId, MontoTotal_Declarado, MontoTotal_Calculado
                ) VALUES (?, ?, ?, ?)`;
                params = [UsuarioId, autorizadorId, montoDeclarado, montoCalculado];
            }

            const result = await conn.query(sql, params);
            const corteId = Number(result.insertId);

            // Insertamos cada pago incluido en la tabla intermedia `Corte_Pago`
            const pagoIds = extractPagoIds(data);
            for (const pagoId of pagoIds) {
                const exists = await conn.query(
                    'SELECT 1 FROM Corte_Pago WHERE CorteId = ? AND PagoId = ? LIMIT 1',
                    [corteId, pagoId]
                );
                if (exists.length === 0) {
                    await conn.query(
                        'INSERT INTO Corte_Pago (CorteId, PagoId) VALUES (?, ?)',
                        [corteId, pagoId]
                    );
                }
            }

            await conn.commit();
            return await corteCaja.findByPk(db, corteId);
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    /**
     * Actualiza un corte de caja existente y, si se envía una nueva lista de pagos,
     * reemplaza las relaciones en la tabla `Corte_Pago`.
     */
    update: async (db, id, data) => {
        const {
            UsuarioId,
            MontoTotal_Declarado,
            MontoTotal_Calculado,
            MontoTotal,
            FechaCorte
        } = data;

        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const sets = [];
            const params = [];

            if (UsuarioId !== undefined) {
                sets.push('UsuarioId = ?');
                params.push(UsuarioId);
            }
            if (data.AutorizadorId !== undefined || data.Autorizador !== undefined) {
                const autorizadorId = await resolveAutorizadorId(conn, data);
                sets.push('AutorizadorId = ?');
                params.push(autorizadorId);
            }
            if (MontoTotal_Declarado !== undefined || MontoTotal !== undefined) {
                sets.push('MontoTotal_Declarado = ?');
                params.push(MontoTotal_Declarado ?? MontoTotal);
            }
            if (MontoTotal_Calculado !== undefined || MontoTotal !== undefined) {
                sets.push('MontoTotal_Calculado = ?');
                params.push(MontoTotal_Calculado ?? MontoTotal);
            }
            if (FechaCorte !== undefined && FechaCorte !== null && FechaCorte !== '') {
                sets.push('FechaCorte = ?');
                params.push(FechaCorte);
            }

            if (sets.length > 0) {
                params.push(id);
                await conn.query(`UPDATE CorteCaja SET ${sets.join(', ')} WHERE CorteId = ?`, params);
            }

            if (data.PagoIds !== undefined || data.Pagos !== undefined || data.Pagos_Incluidos !== undefined) {
                await conn.query('DELETE FROM Corte_Pago WHERE CorteId = ?', [id]);
                const pagoIds = extractPagoIds(data);
                for (const pagoId of pagoIds) {
                    await conn.query(
                        'INSERT IGNORE INTO Corte_Pago (CorteId, PagoId) VALUES (?, ?)',
                        [id, pagoId]
                    );
                }
            }

            await conn.commit();
            return await corteCaja.findByPk(db, id);
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    /**
     * Elimina un corte de caja únicamente si tiene más de 60 días de antigüedad
     * (política de retención de auditoría contable).
     */
    remove: async (db, id) => {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const eligible = await conn.query(
                'SELECT CorteId FROM CorteCaja WHERE CorteId = ? AND FechaCorte < DATE_SUB(NOW(), INTERVAL 60 DAY)',
                [id]
            );
            if (eligible.length === 0) {
                await conn.rollback();
                return false;
            }

            await conn.query('DELETE FROM Corte_Pago WHERE CorteId = ?', [id]);
            const result = await conn.query('DELETE FROM CorteCaja WHERE CorteId = ?', [id]);

            await conn.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
};

module.exports = corteCaja;