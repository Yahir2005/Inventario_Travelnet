/**
 * ============================================================================
 * MODELO DE BASE DE DATOS: Localidad (src/model/localidad.js)
 * ============================================================================
 * Gestiona el catálogo de localidades o comunidades (`Localidad`) donde
 * Travelnet ofrece cobertura de servicio.
 * ============================================================================
 */

const Localidad = {
    /**
     * Obtiene todas las localidades ordenadas alfabéticamente por nombre.
     */
    findAll: async (db) => {
        const rows = await db.query('SELECT LocalidadId, NombreLocalidad FROM Localidad ORDER BY NombreLocalidad ASC');
        return rows;
    },

    /**
     * Busca una localidad específica por su ID (`LocalidadId`).
     */
    findByPk: async (db, id) => {
        const rows = await db.query('SELECT LocalidadId, NombreLocalidad FROM Localidad WHERE LocalidadId = ?', [id]);
        return rows[0];
    },

    /**
     * Crea una nueva localidad en el catálogo.
     */
    create: async (db, data) => {
        const { NombreLocalidad } = data;
        const result = await db.query(
            'INSERT INTO Localidad (NombreLocalidad) VALUES (?)',
            [NombreLocalidad]
        );
        return { LocalidadId: Number(result.insertId), NombreLocalidad };
    },

    /**
     * Actualiza el nombre de una localidad existente.
     */
    update: async (db, id, data) => {
        const { NombreLocalidad } = data;
        await db.query(
            'UPDATE Localidad SET NombreLocalidad = ? WHERE LocalidadId = ?',
            [NombreLocalidad, id]
        );
        return { LocalidadId: Number(id), NombreLocalidad };
    }
};

module.exports = Localidad;