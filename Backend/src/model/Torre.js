/**
 * ============================================================================
 * MODELO DE BASE DE DATOS: Torre (src/model/Torre.js)
 * ============================================================================
 * Modelo especializado para las Torres de Antena Inalámbrica.
 * En la base de datos normalizada (3NF), tanto las Torres como las OLTs viven
 * dentro de la tabla `Infraestructura`, diferenciadas por `Tipo = 'Torre'`.
 * Este modelo expone además el alias `TorreId` para mantener compatibilidad
 * con el Frontend.
 * ============================================================================
 */

const Torre = {
    /**
     * Obtiene todas las Torres registradas en la tabla `Infraestructura`.
     */
    findAll: async (db) => {
        const rows = await db.query(
            `SELECT InfraestructuraId, InfraestructuraId AS TorreId, Tipo, Nombre, Ubicacion
             FROM Infraestructura
             WHERE Tipo = 'Torre'`
        );
        return rows;
    },

    /**
     * Busca una Torre específica por su ID.
     */
    findByPk: async (db, id) => {
        const rows = await db.query(
            `SELECT InfraestructuraId, InfraestructuraId AS TorreId, Tipo, Nombre, Ubicacion
             FROM Infraestructura
             WHERE InfraestructuraId = ? AND Tipo = 'Torre'`,
            [id]
        );
        return rows[0];
    },

    /**
     * Inserta una nueva Torre en la tabla `Infraestructura` fijando `Tipo = 'Torre'`.
     */
    create: async (db, data) => {
        const { Nombre, Ubicacion } = data;
        const result = await db.query(
            `INSERT INTO Infraestructura (Tipo, Nombre, Ubicacion) VALUES ('Torre', ?, ?)`,
            [Nombre, Ubicacion || null]
        );
        const insertId = Number(result.insertId);
        return {
            InfraestructuraId: insertId,
            TorreId: insertId,
            Tipo: 'Torre',
            Nombre,
            Ubicacion: Ubicacion || null
        };
    },

    /**
     * Actualiza el nombre o ubicación de una Torre existente.
     */
    update: async (db, id, data) => {
        const { Nombre, Ubicacion } = data;
        await db.query(
            `UPDATE Infraestructura SET Nombre = ?, Ubicacion = ? WHERE InfraestructuraId = ? AND Tipo = 'Torre'`,
            [Nombre, Ubicacion || null, id]
        );
        return {
            InfraestructuraId: Number(id),
            TorreId: Number(id),
            Tipo: 'Torre',
            Nombre,
            Ubicacion: Ubicacion || null
        };
    },

    /**
     * Elimina una Torre de la tabla `Infraestructura`.
     */
    remove: async (db, id) => {
        const result = await db.query(
            `DELETE FROM Infraestructura WHERE InfraestructuraId = ? AND Tipo = 'Torre'`,
            [id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Torre;