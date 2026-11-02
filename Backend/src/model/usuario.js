/**
 * ============================================================================
 * MODELO DE BASE DE DATOS: Usuario (src/model/usuario.js)
 * ============================================================================
 * Gestiona la tabla `Usuario` (empleados del sistema: Administradores,
 * Mostrador e Instaladores).
 * - Encripta contraseñas usando `bcrypt` antes de guardarlas en la base de datos.
 * - Verifica credenciales durante el inicio de sesión (`login`).
 * - Elimina el campo `Password` (`sanitize`) antes de devolver cualquier usuario
 *   hacia el controlador o el Frontend.
 * ============================================================================
 */

const bcrypt = require('bcrypt');

// Coste de encriptación para bcrypt (10 rondas es el estándar seguro y rápido)
const SALT_ROUNDS = 10;

/**
 * Función de seguridad que remueve el hash `Password` de un objeto usuario
 * para que nunca sea enviado en las respuestas JSON de la API.
 */
const sanitize = (row) => {
    if (!row) return row;
    const { Password, ...safe } = row;
    return safe;
};

// Consulta completa para roles con acceso a todas las columnas de `Usuario`
const BASE_SELECT = `
    SELECT
        u.UsuarioId,
        u.RolId,
        r.Nombre AS Rol,
        r.Nombre AS Ocupacion,
        u.Nombre,
        u.Usuario,
        u.Email,
        u.Telefono,
        u.Active,
        u.accesos_count,
        u.ultimo_acceso
    FROM Usuario u
    INNER JOIN Rol r ON u.RolId = r.RolId
`;

// Consulta restringida para roles de MariaDB (como Mostrador/Instalador) que solo
// tienen permiso SELECT sobre columnas básicas (`UsuarioId`, `RolId`, `Nombre`, `Usuario`, `Active`)
const RESTRICTED_SELECT = `
    SELECT
        u.UsuarioId,
        u.RolId,
        r.Nombre AS Rol,
        r.Nombre AS Ocupacion,
        u.Nombre,
        u.Usuario,
        NULL AS Email,
        NULL AS Telefono,
        u.Active,
        NULL AS accesos_count,
        NULL AS ultimo_acceso
    FROM Usuario u
    INNER JOIN Rol r ON u.RolId = r.RolId
`;

// Verifica si MariaDB rechazó la consulta por permisos de columna (errno 1143)
const isColumnAccessDenied = (err) =>
    err && (err.errno === 1143 || err.code === 'ER_COLUMNACCESS_DENIED_ERROR');

/**
 * Obtiene el `RolId` numérico a partir de `data.RolId` o buscando por nombre (`data.Rol` / `data.Ocupacion`).
 */
const resolveRolId = async (db, data) => {
    if (data.RolId !== undefined && data.RolId !== null && data.RolId !== '') {
        return Number(data.RolId);
    }
    const nombreRol = data.Rol || data.Ocupacion;
    if (!nombreRol) return null;

    const rows = await db.query('SELECT RolId FROM Rol WHERE Nombre = ? LIMIT 1', [nombreRol]);
    if (rows.length > 0) {
        return rows[0].RolId;
    }
    throw new Error(`El rol '${nombreRol}' no existe en el catálogo Rol.`);
};

const Usuario = {
    /**
     * Obtiene todos los usuarios registrados (sin exponer su contraseña).
     */
    findAll: async (db) => {
        try {
            const rows = await db.query(BASE_SELECT);
            return rows.map(sanitize);
        } catch (err) {
            if (isColumnAccessDenied(err)) {
                const rows = await db.query(RESTRICTED_SELECT);
                return rows.map(sanitize);
            }
            throw err;
        }
    },

    /**
     * Busca un usuario por su llave primaria (`UsuarioId`).
     */
    findByPk: async (db, id) => {
        try {
            const rows = await db.query(`${BASE_SELECT} WHERE u.UsuarioId = ?`, [id]);
            return sanitize(rows[0]);
        } catch (err) {
            if (isColumnAccessDenied(err)) {
                const rows = await db.query(`${RESTRICTED_SELECT} WHERE u.UsuarioId = ?`, [id]);
                return sanitize(rows[0]);
            }
            throw err;
        }
    },

    /**
     * Obtiene únicamente los usuarios activos (`Active = TRUE`).
     */
    findByActive: async (db) => {
        try {
            const rows = await db.query(`${BASE_SELECT} WHERE u.Active = TRUE`);
            return rows.map(sanitize);
        } catch (err) {
            if (isColumnAccessDenied(err)) {
                const rows = await db.query(`${RESTRICTED_SELECT} WHERE u.Active = TRUE`);
                return rows.map(sanitize);
            }
            throw err;
        }
    },

    /**
     * Crea un nuevo usuario encriptando su contraseña con `bcrypt.hashSync`.
     */
    create: async (db, data) => {
        const { Nombre, Usuario: nombreUsuario, Password, Email, Telefono } = data;
        const rolId = await resolveRolId(db, data);
        if (!rolId) {
            throw new Error('RolId (o Rol/Ocupacion) es obligatorio para crear un usuario.');
        }

        const passwordHash = bcrypt.hashSync(Password, SALT_ROUNDS);
        const result = await db.query(
            'INSERT INTO Usuario (RolId, Nombre, Usuario, Password, Email, Telefono) VALUES (?, ?, ?, ?, ?, ?)',
            [rolId, Nombre, nombreUsuario, passwordHash, Email || null, Telefono || null]
        );
        return await Usuario.findByPk(db, Number(result.insertId));
    },

    /**
     * Actualiza los datos de un usuario existente.
     * Si se envía una nueva `Password`, vuelve a generar su hash con `bcrypt`.
     */
    update: async (db, id, data) => {
        const camposEditables = ['Nombre', 'Usuario', 'Email', 'Telefono'];
        const sets = [];
        const params = [];

        for (const campo of camposEditables) {
            if (data[campo] !== undefined) {
                sets.push(`${campo} = ?`);
                params.push(data[campo]);
            }
        }

        if (data.RolId !== undefined || data.Rol !== undefined || data.Ocupacion !== undefined) {
            const rolId = await resolveRolId(db, data);
            if (rolId) {
                sets.push('RolId = ?');
                params.push(rolId);
            }
        }

        if (data.Active !== undefined) {
            sets.push('Active = ?');
            params.push(data.Active ? 1 : 0);
        }

        if (data.Password) {
            sets.push('Password = ?');
            params.push(bcrypt.hashSync(data.Password, SALT_ROUNDS));
        }

        if (sets.length > 0) {
            params.push(id);
            await db.query(
                `UPDATE Usuario SET ${sets.join(', ')} WHERE UsuarioId = ?`,
                params
            );
        }

        return await Usuario.findByPk(db, id);
    },

    /**
     * Desactiva lógicamente a un usuario (`Active = FALSE`).
     */
    remove: async (db, id) => {
        const result = await db.query('UPDATE Usuario SET Active = FALSE WHERE UsuarioId = ?', [id]);
        return result.affectedRows > 0;
    },

    /**
     * Autentica a un usuario comparando la contraseña recibida con el hash guardado en BD
     * usando `bcrypt.compareSync`. Si es válido, incrementa su contador de accesos (`accesos_count`)
     * y actualiza la fecha de `ultimo_acceso`.
     */
    login: async (db, credentials) => {
        const { Usuario: nombreUsuario, Password } = credentials;

        const rows = await db.query(
            `SELECT
                u.UsuarioId,
                u.RolId,
                r.Nombre AS Rol,
                r.Nombre AS Ocupacion,
                u.Nombre,
                u.Usuario,
                u.Email,
                u.Telefono,
                u.Active,
                u.accesos_count,
                u.ultimo_acceso,
                u.Password
            FROM Usuario u
            INNER JOIN Rol r ON u.RolId = r.RolId
            WHERE u.Usuario = ? AND u.Active = TRUE`,
            [nombreUsuario]
        );

        if (rows.length === 0) {
            return null;
        }

        const user = rows[0];

        if (!bcrypt.compareSync(Password || '', user.Password)) {
            return null;
        }

        try {
            await db.query(
                'UPDATE Usuario SET accesos_count = COALESCE(accesos_count, 0) + 1, ultimo_acceso = NOW() WHERE UsuarioId = ?',
                [user.UsuarioId]
            );
            user.accesos_count = (user.accesos_count || 0) + 1;
            user.ultimo_acceso = new Date();
        } catch (_) {
            // Ignorar si el usuario de login tiene permisos de solo lectura (SELECT)
        }

        return sanitize(user);
    }
};

module.exports = Usuario;