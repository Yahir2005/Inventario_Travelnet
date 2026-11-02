/**
 * ============================================================================
 * MODELO DE BASE DE DATOS: Rol (src/model/rol.js)
 * ============================================================================
 * Gestiona el catálogo `Rol` (Administrador, Mostrador, Instalador), que define
 * el nivel de acceso de cada empleado dentro del sistema y qué pool de
 * conexión de MariaDB utilizará.
 * ============================================================================
 */

const Rol = {
    /**
     * Obtiene todos los roles registrados ordenados por su ID (`RolId`).
     */
    findAll: async (db) => {
        return await db.query('SELECT RolId, Nombre FROM Rol ORDER BY RolId ASC');
    },

    /**
     * Busca un rol específico por su llave primaria (`RolId`).
     */
    findByPk: async (db, id) => {
        const rows = await db.query('SELECT RolId, Nombre FROM Rol WHERE RolId = ?', [id]);
        return rows[0];
    },

    /**
     * Crea un nuevo rol en el catálogo.
     */
    create: async (db, data) => {
        const { Nombre } = data;
        const result = await db.query('INSERT INTO Rol (Nombre) VALUES (?)', [Nombre]);
        return { RolId: Number(result.insertId), Nombre };
    },

    /**
     * Actualiza el nombre de un rol existente.
     */
    update: async (db, id, data) => {
        const { Nombre } = data;
        await db.query('UPDATE Rol SET Nombre = ? WHERE RolId = ?', [Nombre, id]);
        return { RolId: Number(id), Nombre };
    }
};

module.exports = Rol;
