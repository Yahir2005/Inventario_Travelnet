/**
 * ============================================================================
 * MODELO DE BASE DE DATOS: Cliente (src/model/cliente.js)
 * ============================================================================
 * En una arquitectura MVC (Modelo-Vista-Controlador), los "Modelos" son los
 * únicos archivos que hablan directamente con la base de datos (ejecutando SQL).
 *
 * Este modelo gestiona la tabla `Cliente` en MariaDB, donde se guardan los datos
 * personales y de domicilio de cada suscriptor de Travelnet.
 * ============================================================================
 */

// Importamos la función auxiliar que calcula si un cliente tiene atraso en sus pagos
const { calcularAtraso } = require('./pago');

/**
 * Consulta SQL base para seleccionar los campos de un cliente.
 * Nota: `CONCAT_WS(' ', Calle, Numero, Colonia, Codigo_Postal)` une las partes
 * de la dirección separadas por espacios para formar el campo `Direccion` completo.
 */
const SELECT_CLIENTE = `
    SELECT
        ClienteId,
        Nombre_Cliente,
        Telefono,
        Calle,
        Numero,
        Colonia,
        Codigo_Postal,
        TRIM(CONCAT_WS(' ', Calle, Numero, Colonia, Codigo_Postal)) AS Direccion,
        Saldo_Actual,
        Active,
        TipoCliente
    FROM Cliente
`;

const Cliente = {
    /**
     * Obtiene la lista completa de todos los clientes registrados.
     * @param {object} db - Pool de conexión a MariaDB asignado según el rol del usuario.
     */
    findAll: async (db) => {
        const rows = await db.query(SELECT_CLIENTE);
        return rows;
    },

    /**
     * Busca un único cliente por su llave primaria (`ClienteId`).
     * El signo `?` es un marcador de posición (placeholder) que evita ataques de Inyección SQL.
     */
    findByPk: async (db, id) => {
        const rows = await db.query(`${SELECT_CLIENTE} WHERE ClienteId = ?`, [id]);
        return rows[0];
    },

    /**
     * Inserta un nuevo cliente en la tabla `Cliente`.
     * Una vez insertado, consulta y devuelve el registro recién creado con su nuevo ID.
     */
    create: async (db, data) => {
        const {
            Nombre_Cliente,
            Telefono,
            Calle,
            Numero,
            Colonia,
            Codigo_Postal,
            Direccion,
            Saldo_Actual,
            TipoCliente
        } = data;

        // Si no se especificó `Calle` por separado, usamos `Direccion` como respaldo
        const calleFinal = Calle !== undefined ? Calle : (Direccion || null);

        const result = await db.query(
            `INSERT INTO Cliente (
                Nombre_Cliente, Telefono, Calle, Numero, Colonia, Codigo_Postal, Saldo_Actual, TipoCliente
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                Nombre_Cliente,
                Telefono || null,
                calleFinal,
                Numero || null,
                Colonia || null,
                Codigo_Postal || null,
                Saldo_Actual ?? 0.00,
                TipoCliente || 'Fisica'
            ]
        );
        // `result.insertId` contiene el ID autoincremental generado por MariaDB
        return await Cliente.findByPk(db, Number(result.insertId));
    },

    /**
     * Actualiza dinámicamente solo los campos del cliente que hayan sido enviados en `data`.
     */
    update: async (db, id, data) => {
        const {
            Nombre_Cliente,
            Telefono,
            Calle,
            Numero,
            Colonia,
            Codigo_Postal,
            Direccion,
            Saldo_Actual,
            Active,
            TipoCliente
        } = data;

        // Construimos la cláusula SET de forma dinámica según qué propiedades vengan definidas
        const sets = [];
        const params = [];

        if (Nombre_Cliente !== undefined) {
            sets.push('Nombre_Cliente = ?');
            params.push(Nombre_Cliente);
        }
        if (Telefono !== undefined) {
            sets.push('Telefono = ?');
            params.push(Telefono);
        }
        if (Calle !== undefined || Direccion !== undefined) {
            sets.push('Calle = ?');
            params.push(Calle !== undefined ? Calle : Direccion);
        }
        if (Numero !== undefined) {
            sets.push('Numero = ?');
            params.push(Numero);
        }
        if (Colonia !== undefined) {
            sets.push('Colonia = ?');
            params.push(Colonia);
        }
        if (Codigo_Postal !== undefined) {
            sets.push('Codigo_Postal = ?');
            params.push(Codigo_Postal);
        }
        if (Saldo_Actual !== undefined) {
            sets.push('Saldo_Actual = ?');
            params.push(Saldo_Actual);
        }
        if (Active !== undefined) {
            sets.push('Active = ?');
            params.push(Active ? 1 : 0);
        }
        if (TipoCliente !== undefined) {
            sets.push('TipoCliente = ?');
            params.push(TipoCliente);
        }

        // Solo ejecutamos el UPDATE si realmente hay al menos un campo por modificar
        if (sets.length > 0) {
            params.push(id);
            await db.query(`UPDATE Cliente SET ${sets.join(', ')} WHERE ClienteId = ?`, params);
        }

        return await Cliente.findByPk(db, id);
    },

    /**
     * Realiza un "borrado lógico" (soft delete) marcando `Active = FALSE`.
     * Así no se pierde el historial de pagos ni de instalaciones del cliente.
     */
    remove: async (db, id) => {
        const result = await db.query('UPDATE Cliente SET Active = FALSE WHERE ClienteId = ?', [id]);
        return result.affectedRows > 0;
    },

    /**
     * Obtiene un listado completo uniendo (LEFT JOIN) a cada cliente con:
     * - Su instalación activa (`Instalacion`)
     * - Su plan y tarifa contratada (`Plan_Tarifa`, `Plan`)
     * - Su antena o fibra (`Infraestructura`) y localidad (`Localidad`)
     * - Su último pago completado (`Pago`, `Metodo_Pago`, `Mensualidad`)
     *
     * Si el rol de base de datos (por ejemplo, `Instalador`) no tiene permisos para leer
     * la tabla `Metodo_Pago` (error 1142/1143), ejecuta una consulta alternativa sin esa tabla.
     */
    clientInstallationList: async (db) => {
        let rows;
        try {
            rows = await db.query(`
                SELECT 
                    c.ClienteId,
                    c.Nombre_Cliente,
                    c.Telefono,
                    c.Calle,
                    c.Numero,
                    c.Colonia,
                    c.Codigo_Postal,
                    TRIM(CONCAT_WS(' ', c.Calle, c.Numero, c.Colonia, c.Codigo_Postal)) AS Direccion,
                    c.Saldo_Actual,
                    c.TipoCliente,
                    c.Active,

                    i.InstalacionId,
                    i.TarifaId,
                    pt.PlanId,
                    pl.Nombre AS Plan,
                    pl.Velocidad_Mbps,
                    pt.Modalidad AS Modalidad_Servicio,
                    pt.Precio AS Precio_Tarifa,

                    i.InfraestructuraId,
                    inf.Tipo AS Tipo_Infraestructura,
                    CASE
                        WHEN inf.Tipo = 'OLT' THEN 'Fibra'
                        WHEN inf.Tipo = 'Torre' THEN 'Antena'
                        ELSE NULL
                    END AS Tipo,
                    CASE WHEN inf.Tipo = 'OLT' THEN inf.InfraestructuraId ELSE NULL END AS OLTId,
                    CASE WHEN inf.Tipo = 'OLT' THEN inf.Nombre ELSE NULL END AS Nombre_OLT,
                    CASE WHEN inf.Tipo = 'OLT' THEN inf.Ubicacion ELSE NULL END AS Ubicacion_OLT,
                    CASE WHEN inf.Tipo = 'Torre' THEN inf.InfraestructuraId ELSE NULL END AS TorreId,
                    CASE WHEN inf.Tipo = 'Torre' THEN inf.Nombre ELSE NULL END AS Nombre_Torre,
                    CASE WHEN inf.Tipo = 'Torre' THEN inf.Ubicacion ELSE NULL END AS Ubicacion_Torre,

                    i.LocalidadId,
                    lo.NombreLocalidad AS Localidad,

                    i.Ubicacion_Maps,
                    i.Nombre_Wifi,
                    i.Password_Wifi,
                    i.Active AS Instalacion_Activa,
                    i.Fecha_Instalacion,

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
                    m.Anio AS Ultimo_Anio_Pagado

                FROM Cliente c

                LEFT JOIN Instalacion i 
                    ON c.ClienteId = i.ClienteId
                    AND i.Active = TRUE

                LEFT JOIN Plan_Tarifa pt
                    ON i.TarifaId = pt.TarifaId

                LEFT JOIN Plan pl
                    ON pt.PlanId = pl.PlanId

                LEFT JOIN Infraestructura inf
                    ON i.InfraestructuraId = inf.InfraestructuraId

                LEFT JOIN Localidad lo
                    ON i.LocalidadId = lo.LocalidadId

                LEFT JOIN Pago p 
                    ON i.InstalacionId = p.InstalacionId
                    AND p.Estado_Pago = 'Completado'
                    AND p.PagoId = (
                        SELECT MAX(p2.PagoId) 
                        FROM Pago p2 
                        WHERE p2.InstalacionId = i.InstalacionId
                          AND p2.Estado_Pago = 'Completado'
                    )

                LEFT JOIN Metodo_Pago mp
                    ON p.MetodoPagoId = mp.MetodoPagoId

                LEFT JOIN Mensualidad m
                    ON m.MensualidadId = (
                        SELECT MAX(m2.MensualidadId)
                        FROM Pago_Detalle pd
                        INNER JOIN Mensualidad m2 ON m2.MensualidadId = pd.MensualidadId
                        WHERE pd.PagoId = p.PagoId
                    )
            `);
        } catch (err) {
            // Si el usuario de MariaDB tiene permisos restringidos sobre `Metodo_Pago`, usamos la consulta de respaldo
            if (err && (err.errno === 1142 || err.code === 'ER_TABLEACCESS_DENIED_ERROR' || err.code === 'ER_COLUMNACCESS_DENIED_ERROR')) {
                rows = await db.query(`
                    SELECT 
                        c.ClienteId,
                        c.Nombre_Cliente,
                        c.Telefono,
                        c.Calle,
                        c.Numero,
                        c.Colonia,
                        c.Codigo_Postal,
                        TRIM(CONCAT_WS(' ', c.Calle, c.Numero, c.Colonia, c.Codigo_Postal)) AS Direccion,
                        c.Saldo_Actual,
                        c.TipoCliente,
                        c.Active,

                        i.InstalacionId,
                        i.TarifaId,
                        pt.PlanId,
                        pl.Nombre AS Plan,
                        pl.Velocidad_Mbps,
                        pt.Modalidad AS Modalidad_Servicio,
                        pt.Precio AS Precio_Tarifa,

                        i.InfraestructuraId,
                        inf.Tipo AS Tipo_Infraestructura,
                        CASE
                            WHEN inf.Tipo = 'OLT' THEN 'Fibra'
                            WHEN inf.Tipo = 'Torre' THEN 'Antena'
                            ELSE NULL
                        END AS Tipo,
                        CASE WHEN inf.Tipo = 'OLT' THEN inf.InfraestructuraId ELSE NULL END AS OLTId,
                        CASE WHEN inf.Tipo = 'OLT' THEN inf.Nombre ELSE NULL END AS Nombre_OLT,
                        CASE WHEN inf.Tipo = 'OLT' THEN inf.Ubicacion ELSE NULL END AS Ubicacion_OLT,
                        CASE WHEN inf.Tipo = 'Torre' THEN inf.InfraestructuraId ELSE NULL END AS TorreId,
                        CASE WHEN inf.Tipo = 'Torre' THEN inf.Nombre ELSE NULL END AS Nombre_Torre,
                        CASE WHEN inf.Tipo = 'Torre' THEN inf.Ubicacion ELSE NULL END AS Ubicacion_Torre,

                        i.LocalidadId,
                        lo.NombreLocalidad AS Localidad,

                        i.Ubicacion_Maps,
                        i.Nombre_Wifi,
                        i.Password_Wifi,
                        i.Active AS Instalacion_Activa,
                        i.Fecha_Instalacion,

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
                        m.Anio AS Ultimo_Anio_Pagado

                    FROM Cliente c

                    LEFT JOIN Instalacion i 
                        ON c.ClienteId = i.ClienteId
                        AND i.Active = TRUE

                    LEFT JOIN Plan_Tarifa pt
                        ON i.TarifaId = pt.TarifaId

                    LEFT JOIN Plan pl
                        ON pt.PlanId = pl.PlanId

                    LEFT JOIN Infraestructura inf
                        ON i.InfraestructuraId = inf.InfraestructuraId

                    LEFT JOIN Localidad lo
                        ON i.LocalidadId = lo.LocalidadId

                    LEFT JOIN Pago p 
                        ON i.InstalacionId = p.InstalacionId
                        AND p.Estado_Pago = 'Completado'
                        AND p.PagoId = (
                            SELECT MAX(p2.PagoId) 
                            FROM Pago p2 
                            WHERE p2.InstalacionId = i.InstalacionId
                              AND p2.Estado_Pago = 'Completado'
                        )

                    LEFT JOIN Mensualidad m
                        ON m.MensualidadId = (
                            SELECT MAX(m2.MensualidadId)
                            FROM Pago_Detalle pd
                            INNER JOIN Mensualidad m2 ON m2.MensualidadId = pd.MensualidadId
                            WHERE pd.PagoId = p.PagoId
                        )
                `);
            } else {
                throw err;
            }
        }

        // Calculamos y anexamos en cada fila si el cliente está al corriente o atrasado (`Atrasado`, `Dias_Atraso`)
        return rows.map(row => ({ ...row, ...calcularAtraso(row) }));
    }
};

module.exports = Cliente;