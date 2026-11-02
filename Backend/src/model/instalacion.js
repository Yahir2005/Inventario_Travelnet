/**
 * ============================================================================
 * MODELO DE BASE DE DATOS: Instalacion (src/model/instalacion.js)
 * ============================================================================
 * Gestiona la tabla `Instalacion`, que representa el servicio técnico instalado
 * en el domicilio de un cliente (a qué Torre/OLT está conectado, qué tarifa/plan
 * tiene contratado, credenciales de su red Wi-Fi y coordenadas de Google Maps).
 * ============================================================================
 */

// Consulta SQL base que une `Instalacion` con su tarifa (`Plan_Tarifa`), `Plan` e `Infraestructura`
const SELECT_INSTALACION_BASE = `
    SELECT
        i.InstalacionId,
        i.UsuarioId,
        i.ClienteId,
        i.TarifaId,
        pt.PlanId,
        i.InfraestructuraId,
        CASE WHEN inf.Tipo = 'OLT' THEN inf.InfraestructuraId ELSE NULL END AS OLTId,
        CASE WHEN inf.Tipo = 'Torre' THEN inf.InfraestructuraId ELSE NULL END AS TorreId,
        i.LocalidadId,
        i.Ubicacion_Maps,
        i.Nombre_Wifi,
        i.Password_Wifi,
        i.Active,
        i.Active AS Instalacion_Activa,
        i.Uuid_local,
        i.Sincronizado,
        i.Fecha_Instalacion,
        CASE
            WHEN inf.Tipo = 'OLT' THEN 'Fibra'
            WHEN inf.Tipo = 'Torre' THEN 'Antena'
            ELSE NULL
        END AS Tipo,
        inf.Tipo AS Tipo_Infraestructura,
        inf.Nombre AS Nombre_Infraestructura,
        pl.Nombre AS Plan,
        pl.Velocidad_Mbps,
        pt.Modalidad AS Modalidad_Servicio,
        pt.Precio AS Precio_Tarifa
    FROM Instalacion i
    LEFT JOIN Plan_Tarifa pt ON i.TarifaId = pt.TarifaId
    LEFT JOIN Plan pl ON pt.PlanId = pl.PlanId
    LEFT JOIN Infraestructura inf ON i.InfraestructuraId = inf.InfraestructuraId
`;

/**
 * Función auxiliar que obtiene el `TarifaId` correspondiente.
 * Permite que el Frontend envíe directamente `TarifaId`, o bien una combinación
 * de `PlanId`/`Plan` y `Modalidad_Servicio` (por ejemplo: Plan 30 Mbps + Mensual).
 */
const resolveTarifaId = async (db, data) => {
    if (data.TarifaId !== undefined && data.TarifaId !== null && data.TarifaId !== '') {
        return Number(data.TarifaId);
    }

    const planRef = data.PlanId || data.Plan;
    const modalidad = data.Modalidad || data.Modalidad_Servicio || 'Mensual';

    if (planRef) {
        const exactRows = await db.query(
            `SELECT pt.TarifaId
             FROM Plan_Tarifa pt
             INNER JOIN Plan p ON pt.PlanId = p.PlanId
             WHERE (p.PlanId = ? OR p.Nombre = ?) AND pt.Modalidad = ?
             LIMIT 1`,
            [planRef, planRef, modalidad]
        );
        if (exactRows.length > 0) {
            return exactRows[0].TarifaId;
        }

        const planRows = await db.query(
            `SELECT pt.TarifaId
             FROM Plan_Tarifa pt
             INNER JOIN Plan p ON pt.PlanId = p.PlanId
             WHERE p.PlanId = ? OR p.Nombre = ?
             ORDER BY pt.TarifaId ASC
             LIMIT 1`,
            [planRef, planRef]
        );
        if (planRows.length > 0) {
            return planRows[0].TarifaId;
        }
    }

    return null;
};

/**
 * Unifica los campos `InfraestructuraId`, `OLTId` o `TorreId` en un solo ID numérico
 * hacia la tabla `Infraestructura`.
 */
const resolveInfraestructuraId = (data) => {
    if (data.InfraestructuraId !== undefined && data.InfraestructuraId !== null && data.InfraestructuraId !== '') {
        return Number(data.InfraestructuraId);
    }
    if (data.OLTId !== undefined && data.OLTId !== null && data.OLTId !== '') {
        return Number(data.OLTId);
    }
    if (data.TorreId !== undefined && data.TorreId !== null && data.TorreId !== '') {
        return Number(data.TorreId);
    }
    return null;
};

const Instalacion = {
    /**
     * Obtiene todas las instalaciones registradas.
     */
    findAll: async (db) => {
        const rows = await db.query(SELECT_INSTALACION_BASE);
        return rows;
    },

    /**
     * Obtiene todas las instalaciones activas enriquecidas con el nombre del cliente,
     * nombre de la localidad y conteo de fotografías (`Cantidad_Imagenes` y `Ultima_Imagen`).
     */
    findAllDetallado: async (db) => {
        const rows = await db.query(`
            SELECT
                i.InstalacionId,
                i.UsuarioId,
                i.ClienteId,
                i.TarifaId,
                pt.PlanId,
                i.InfraestructuraId,
                CASE WHEN inf.Tipo = 'OLT' THEN inf.InfraestructuraId ELSE NULL END AS OLTId,
                CASE WHEN inf.Tipo = 'Torre' THEN inf.InfraestructuraId ELSE NULL END AS TorreId,
                i.LocalidadId,
                i.Ubicacion_Maps,
                i.Nombre_Wifi,
                i.Password_Wifi,
                i.Active,
                i.Active AS Instalacion_Activa,
                i.Uuid_local,
                i.Sincronizado,
                i.Fecha_Instalacion,
                CASE
                    WHEN inf.Tipo = 'OLT' THEN 'Fibra'
                    WHEN inf.Tipo = 'Torre' THEN 'Antena'
                    ELSE NULL
                END AS Tipo,
                inf.Tipo AS Tipo_Infraestructura,
                inf.Nombre AS Nombre_Infraestructura,
                pl.Nombre AS Plan,
                pl.Velocidad_Mbps,
                pt.Modalidad AS Modalidad_Servicio,
                pt.Precio AS Precio_Tarifa,
                c.Nombre_Cliente,
                c.Telefono,
                lo.NombreLocalidad AS Localidad_Nombre,
                CASE WHEN inf.Tipo = 'OLT' THEN inf.Nombre ELSE NULL END AS Nombre_OLT,
                CASE WHEN inf.Tipo = 'Torre' THEN inf.Nombre ELSE NULL END AS Nombre_Torre,
                (SELECT COUNT(*) FROM Imagen_Instalacion ii WHERE ii.InstalacionId = i.InstalacionId) AS Cantidad_Imagenes,
                (SELECT ii.Ruta_Imagen FROM Imagen_Instalacion ii WHERE ii.InstalacionId = i.InstalacionId ORDER BY ii.Imagen_InstalacionId DESC LIMIT 1) AS Ultima_Imagen
            FROM Instalacion i
            LEFT JOIN Cliente c ON i.ClienteId = c.ClienteId
            LEFT JOIN Localidad lo ON i.LocalidadId = lo.LocalidadId
            LEFT JOIN Plan_Tarifa pt ON i.TarifaId = pt.TarifaId
            LEFT JOIN Plan pl ON pt.PlanId = pl.PlanId
            LEFT JOIN Infraestructura inf ON i.InfraestructuraId = inf.InfraestructuraId
            WHERE i.Active = TRUE
        `);
        return rows;
    },

    /**
     * Busca una instalación por su llave primaria (`InstalacionId`).
     */
    findByPk: async (db, id) => {
        const rows = await db.query(`${SELECT_INSTALACION_BASE} WHERE i.InstalacionId = ?`, [id]);
        return rows[0];
    },

    /**
     * Registra una nueva instalación para un cliente.
     * Verifica `Uuid_local` para evitar duplicados cuando se sincronizan registros creados sin internet.
     */
    create: async (db, data) => {
        const {
            UsuarioId,
            ClienteId,
            LocalidadId,
            Ubicacion_Maps,
            Nombre_Wifi,
            Password_Wifi,
            Uuid_local,
            Sincronizado,
            Fecha_Instalacion
        } = data;

        // Idempotencia para sincronización Offline
        if (Uuid_local) {
            const dup = await db.query(
                'SELECT InstalacionId FROM Instalacion WHERE Uuid_local = ? LIMIT 1',
                [Uuid_local]
            );
            if (dup.length > 0) {
                return await Instalacion.findByPk(db, dup[0].InstalacionId);
            }
        }

        const tarifaId = await resolveTarifaId(db, data);
        const infraestructuraId = resolveInfraestructuraId(data);

        if (!tarifaId) {
            throw new Error('TarifaId (o Plan y Modalidad_Servicio válidos) es requerido.');
        }
        if (!infraestructuraId) {
            throw new Error('InfraestructuraId (o OLTId / TorreId) es requerido.');
        }

        const campos = [
            'UsuarioId',
            'ClienteId',
            'TarifaId',
            'InfraestructuraId',
            'LocalidadId',
            'Ubicacion_Maps',
            'Nombre_Wifi',
            'Password_Wifi',
            'Uuid_local',
            'Sincronizado'
        ];
        const params = [
            UsuarioId,
            ClienteId,
            tarifaId,
            infraestructuraId,
            LocalidadId,
            Ubicacion_Maps || null,
            Nombre_Wifi || null,
            Password_Wifi || null,
            Uuid_local || null,
            Sincronizado !== undefined ? (Sincronizado ? 1 : 0) : 1
        ];

        if (Fecha_Instalacion) {
            campos.push('Fecha_Instalacion');
            params.push(Fecha_Instalacion);
        }

        const placeholders = campos.map(() => '?').join(', ');
        const result = await db.query(
            `INSERT INTO Instalacion (${campos.join(', ')}) VALUES (${placeholders})`,
            params
        );

        return await Instalacion.findByPk(db, Number(result.insertId));
    },

    /**
     * Actualiza los datos técnicos o de plan de una instalación existente.
     */
    update: async (db, id, data) => {
        const sets = [];
        const params = [];

        if (data.UsuarioId !== undefined) {
            sets.push('UsuarioId = ?');
            params.push(data.UsuarioId);
        }
        if (data.ClienteId !== undefined) {
            sets.push('ClienteId = ?');
            params.push(data.ClienteId);
        }

        if (data.TarifaId !== undefined || data.Plan !== undefined || data.PlanId !== undefined || data.Modalidad_Servicio !== undefined || data.Modalidad !== undefined) {
            const tarifaId = await resolveTarifaId(db, data);
            if (tarifaId) {
                sets.push('TarifaId = ?');
                params.push(tarifaId);
            }
        }

        if (data.InfraestructuraId !== undefined || data.OLTId !== undefined || data.TorreId !== undefined) {
            const infraestructuraId = resolveInfraestructuraId(data);
            if (infraestructuraId) {
                sets.push('InfraestructuraId = ?');
                params.push(infraestructuraId);
            }
        }

        if (data.LocalidadId !== undefined) {
            sets.push('LocalidadId = ?');
            params.push(data.LocalidadId);
        }
        if (data.Ubicacion_Maps !== undefined) {
            sets.push('Ubicacion_Maps = ?');
            params.push(data.Ubicacion_Maps);
        }
        if (data.Nombre_Wifi !== undefined) {
            sets.push('Nombre_Wifi = ?');
            params.push(data.Nombre_Wifi);
        }
        if (data.Password_Wifi !== undefined) {
            sets.push('Password_Wifi = ?');
            params.push(data.Password_Wifi);
        }
        if (data.Active !== undefined) {
            sets.push('Active = ?');
            params.push(data.Active ? 1 : 0);
        }
        if (data.Uuid_local !== undefined) {
            sets.push('Uuid_local = ?');
            params.push(data.Uuid_local);
        }
        if (data.Sincronizado !== undefined) {
            sets.push('Sincronizado = ?');
            params.push(data.Sincronizado ? 1 : 0);
        }
        if (data.Fecha_Instalacion !== undefined) {
            sets.push('Fecha_Instalacion = ?');
            params.push(data.Fecha_Instalacion);
        }

        if (sets.length > 0) {
            params.push(id);
            await db.query(
                `UPDATE Instalacion SET ${sets.join(', ')} WHERE InstalacionId = ?`,
                params
            );
        }

        return await Instalacion.findByPk(db, id);
    },

    /**
     * Desactiva lógicamente una instalación (`Active = FALSE`).
     */
    remove: async (db, id) => {
        const result = await db.query('UPDATE Instalacion SET Active = FALSE WHERE InstalacionId = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Instalacion;