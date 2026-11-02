/**
 * ============================================================================
 * MODELO DE BASE DE DATOS: Plan y Plan_Tarifa (src/model/plan.js)
 * ============================================================================
 * Gestiona el catálogo de planes de internet (`Plan`, donde se define el nombre
 * y la velocidad en Mbps) y sus modalidades de cobro (`Plan_Tarifa`, donde se
 * define el precio según si es Mensual, Bimestral, Semestral, Anual, etc.).
 * ============================================================================
 */

const Plan = {
    /**
     * Obtiene todos los planes de internet junto con su arreglo de `Tarifas` asociadas.
     */
    findAll: async (db) => {
        const planes = await db.query('SELECT PlanId, Nombre, Velocidad_Mbps, Active FROM Plan');
        const tarifas = await db.query(
            `SELECT pt.TarifaId, pt.PlanId, pt.Modalidad, pt.Precio, p.Nombre AS Nombre_Plan, p.Velocidad_Mbps
             FROM Plan_Tarifa pt
             INNER JOIN Plan p ON pt.PlanId = p.PlanId`
        );

        // Agrupamos las tarifas por `PlanId` usando un Map para unirlas en memoria rápidamente
        const tarifasPorPlan = new Map();
        for (const t of tarifas) {
            if (!tarifasPorPlan.has(t.PlanId)) {
                tarifasPorPlan.set(t.PlanId, []);
            }
            tarifasPorPlan.get(t.PlanId).push(t);
        }

        return planes.map(p => ({
            ...p,
            Tarifas: tarifasPorPlan.get(p.PlanId) || []
        }));
    },

    /**
     * Busca un plan específico por su ID (`PlanId`) e incluye sus tarifas.
     */
    findByPk: async (db, id) => {
        const rows = await db.query(
            'SELECT PlanId, Nombre, Velocidad_Mbps, Active FROM Plan WHERE PlanId = ?',
            [id]
        );
        if (!rows[0]) return undefined;

        const tarifas = await db.query(
            'SELECT TarifaId, PlanId, Modalidad, Precio FROM Plan_Tarifa WHERE PlanId = ?',
            [id]
        );

        return {
            ...rows[0],
            Tarifas: tarifas
        };
    },

    /**
     * Crea un nuevo plan en la tabla `Plan` y, si se incluye un arreglo `Tarifas`,
     * inserta también cada modalidad/precio en `Plan_Tarifa`.
     */
    create: async (db, data) => {
        const { Nombre, Velocidad_Mbps, Active, Tarifas } = data;
        const result = await db.query(
            'INSERT INTO Plan (Nombre, Velocidad_Mbps, Active) VALUES (?, ?, ?)',
            [Nombre, Number(Velocidad_Mbps), Active !== undefined ? (Active ? 1 : 0) : 1]
        );
        const planId = Number(result.insertId);

        if (Array.isArray(Tarifas)) {
            for (const t of Tarifas) {
                if (t && t.Modalidad && t.Precio !== undefined) {
                    await db.query(
                        'INSERT INTO Plan_Tarifa (PlanId, Modalidad, Precio) VALUES (?, ?, ?)',
                        [planId, t.Modalidad, t.Precio]
                    );
                }
            }
        }

        return await Plan.findByPk(db, planId);
    },

    /**
     * Actualiza el nombre, velocidad o estado activo de un plan.
     */
    update: async (db, id, data) => {
        const { Nombre, Velocidad_Mbps, Active } = data;
        const sets = [];
        const params = [];

        if (Nombre !== undefined) {
            sets.push('Nombre = ?');
            params.push(Nombre);
        }
        if (Velocidad_Mbps !== undefined) {
            sets.push('Velocidad_Mbps = ?');
            params.push(Number(Velocidad_Mbps));
        }
        if (Active !== undefined) {
            sets.push('Active = ?');
            params.push(Active ? 1 : 0);
        }

        if (sets.length > 0) {
            params.push(id);
            await db.query(`UPDATE Plan SET ${sets.join(', ')} WHERE PlanId = ?`, params);
        }

        return await Plan.findByPk(db, id);
    },

    /**
     * Desactiva lógicamente un plan (`Active = FALSE`).
     */
    remove: async (db, id) => {
        const result = await db.query('UPDATE Plan SET Active = FALSE WHERE PlanId = ?', [id]);
        return result.affectedRows > 0;
    },

    // --- Operaciones para Plan_Tarifa ---
    /**
     * Obtiene todas las tarifas disponibles unidas con los datos de su plan.
     */
    findAllTarifas: async (db) => {
        return await db.query(
            `SELECT
                pt.TarifaId,
                pt.PlanId,
                p.Nombre AS Nombre_Plan,
                p.Velocidad_Mbps,
                p.Active AS Plan_Activo,
                pt.Modalidad,
                pt.Precio
             FROM Plan_Tarifa pt
             INNER JOIN Plan p ON pt.PlanId = p.PlanId
             ORDER BY p.Velocidad_Mbps ASC, pt.TarifaId ASC`
        );
    },

    /**
     * Busca una tarifa específica por su llave primaria (`TarifaId`).
     */
    findTarifaByPk: async (db, tarifaId) => {
        const rows = await db.query(
            `SELECT
                pt.TarifaId,
                pt.PlanId,
                p.Nombre AS Nombre_Plan,
                p.Velocidad_Mbps,
                pt.Modalidad,
                pt.Precio
             FROM Plan_Tarifa pt
             INNER JOIN Plan p ON pt.PlanId = p.PlanId
             WHERE pt.TarifaId = ?`,
            [tarifaId]
        );
        return rows[0];
    },

    /**
     * Agrega una nueva modalidad/precio (`Plan_Tarifa`) a un plan existente.
     */
    createTarifa: async (db, data) => {
        const { PlanId, Modalidad, Precio } = data;
        const result = await db.query(
            'INSERT INTO Plan_Tarifa (PlanId, Modalidad, Precio) VALUES (?, ?, ?)',
            [PlanId, Modalidad || 'Mensual', Precio]
        );
        return await Plan.findTarifaByPk(db, Number(result.insertId));
    },

    /**
     * Actualiza la modalidad o el precio de una tarifa específica.
     */
    updateTarifa: async (db, tarifaId, data) => {
        const { PlanId, Modalidad, Precio } = data;
        const sets = [];
        const params = [];

        if (PlanId !== undefined) {
            sets.push('PlanId = ?');
            params.push(PlanId);
        }
        if (Modalidad !== undefined) {
            sets.push('Modalidad = ?');
            params.push(Modalidad);
        }
        if (Precio !== undefined) {
            sets.push('Precio = ?');
            params.push(Precio);
        }

        if (sets.length > 0) {
            params.push(tarifaId);
            await db.query(`UPDATE Plan_Tarifa SET ${sets.join(', ')} WHERE TarifaId = ?`, params);
        }

        return await Plan.findTarifaByPk(db, tarifaId);
    },

    /**
     * Elimina una tarifa por su ID (`TarifaId`).
     */
    removeTarifa: async (db, tarifaId) => {
        const result = await db.query('DELETE FROM Plan_Tarifa WHERE TarifaId = ?', [tarifaId]);
        return result.affectedRows > 0;
    }
};

module.exports = Plan;
