/**
 * ============================================================================
 * MODELO DE BASE DE DATOS: OLT (src/model/OLT.js)
 * ============================================================================
 * Modelo especializado para las Terminales de Línea Óptica (Fibra Óptica).
 * En la base de datos normalizada (3NF), tanto las OLTs como las Torres viven
 * dentro de la tabla `Infraestructura`, diferenciadas por la columna `Tipo = 'OLT'`.
 * Este modelo expone además el alias `OLTId` para mantener compatibilidad total
 * con el Frontend.
 * ============================================================================
 */

const OLT = {
    /**
     * Obtiene todas las OLTs registradas en la tabla `Infraestructura`.
     */
    findAll: async (db) => {
        const rows = await db.query(
            `SELECT InfraestructuraId, InfraestructuraId AS OLTId, Tipo, Nombre, Ubicacion
             FROM Infraestructura
             WHERE Tipo = 'OLT'`
        );
        return rows;
    },

    /**
     * Busca una OLT específica por su ID.
     */
    findByPk: async (db, id) => {
        const rows = await db.query(
            `SELECT InfraestructuraId, InfraestructuraId AS OLTId, Tipo, Nombre, Ubicacion
             FROM Infraestructura
             WHERE InfraestructuraId = ? AND Tipo = 'OLT'`,
            [id]
        );
        return rows[0];
    },

    /**
     * Inserta una nueva OLT en la tabla `Infraestructura` fijando `Tipo = 'OLT'`.
     */
    create: async (db, data) => {
        const { Nombre, Ubicacion } = data;
        const result = await db.query(
            `INSERT INTO Infraestructura (Tipo, Nombre, Ubicacion) VALUES ('OLT', ?, ?)`,
            [Nombre, Ubicacion || null]
        );
        const insertId = Number(result.insertId);
        return {
            InfraestructuraId: insertId,
            OLTId: insertId,
            Tipo: 'OLT',
            Nombre,
            Ubicacion: Ubicacion || null
        };
    },

    /**
     * Actualiza el nombre o la ubicación de una OLT existente.
     */
    update: async (db, id, data) => {
        const { Nombre, Ubicacion } = data;
        await db.query(
            `UPDATE Infraestructura SET Nombre = ?, Ubicacion = ? WHERE InfraestructuraId = ? AND Tipo = 'OLT'`,
            [Nombre, Ubicacion || null, id]
        );
        return {
            InfraestructuraId: Number(id),
            OLTId: Number(id),
            Tipo: 'OLT',
            Nombre,
            Ubicacion: Ubicacion || null
        };
    },

    /**
     * Elimina una OLT de la tabla `Infraestructura`.
     */
    remove: async (db, id) => {
        const result = await db.query(
            `DELETE FROM Infraestructura WHERE InfraestructuraId = ? AND Tipo = 'OLT'`,
            [id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = OLT;