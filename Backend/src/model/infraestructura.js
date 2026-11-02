/**
 * ============================================================================
 * MODELO DE BASE DE DATOS: Infraestructura (src/model/infraestructura.js)
 * ============================================================================
 * Gestiona la tabla unificada `Infraestructura` (3NF), la cual almacena tanto
 * los equipos de Fibra Óptica (`Tipo = 'OLT'`) como las Torres de Antena
 * (`Tipo = 'Torre'`).
 * ============================================================================
 */

const Infraestructura = {
    /**
     * Obtiene todos los registros de infraestructura.
     * Si se pasa el parámetro `tipo` ('OLT' o 'Torre'), filtra solo los de ese tipo.
     */
    findAll: async (db, tipo = null) => {
        if (tipo) {
            return await db.query(
                'SELECT InfraestructuraId, Tipo, Nombre, Ubicacion FROM Infraestructura WHERE Tipo = ?',
                [tipo]
            );
        }
        return await db.query('SELECT InfraestructuraId, Tipo, Nombre, Ubicacion FROM Infraestructura');
    },

    /**
     * Busca un equipo de infraestructura por su ID (`InfraestructuraId`).
     */
    findByPk: async (db, id) => {
        const rows = await db.query(
            'SELECT InfraestructuraId, Tipo, Nombre, Ubicacion FROM Infraestructura WHERE InfraestructuraId = ?',
            [id]
        );
        return rows[0];
    },

    /**
     * Registra una nueva OLT o Torre en la tabla `Infraestructura`.
     */
    create: async (db, data) => {
        const { Tipo, Nombre, Ubicacion } = data;
        const result = await db.query(
            'INSERT INTO Infraestructura (Tipo, Nombre, Ubicacion) VALUES (?, ?, ?)',
            [Tipo, Nombre, Ubicacion || null]
        );
        return {
            InfraestructuraId: Number(result.insertId),
            Tipo,
            Nombre,
            Ubicacion: Ubicacion || null
        };
    },

    /**
     * Actualiza el tipo, nombre o ubicación de un elemento de infraestructura.
     */
    update: async (db, id, data) => {
        const { Tipo, Nombre, Ubicacion } = data;
        const sets = [];
        const params = [];

        if (Tipo !== undefined) {
            sets.push('Tipo = ?');
            params.push(Tipo);
        }
        if (Nombre !== undefined) {
            sets.push('Nombre = ?');
            params.push(Nombre);
        }
        if (Ubicacion !== undefined) {
            sets.push('Ubicacion = ?');
            params.push(Ubicacion);
        }

        if (sets.length > 0) {
            params.push(id);
            await db.query(`UPDATE Infraestructura SET ${sets.join(', ')} WHERE InfraestructuraId = ?`, params);
        }

        return await Infraestructura.findByPk(db, id);
    },

    /**
     * Elimina un registro de infraestructura por su ID.
     */
    remove: async (db, id) => {
        const result = await db.query('DELETE FROM Infraestructura WHERE InfraestructuraId = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Infraestructura;
