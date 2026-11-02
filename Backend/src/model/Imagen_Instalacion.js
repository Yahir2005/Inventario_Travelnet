/**
 * ============================================================================
 * MODELO DE BASE DE DATOS: Imagen_Instalacion (src/model/Imagen_Instalacion.js)
 * ============================================================================
 * Gestiona la tabla `Imagen_Instalacion`, donde se guardan las fotografías
 * de evidencia tomadas durante la instalación de un cliente (en formato Base64
 * o ruta de archivo) junto con su `Uuid_local` para sincronización offline.
 * ============================================================================
 */

const Imagen_Instalacion = {
    /**
     * Obtiene todas las imágenes de todas las instalaciones.
     */
    findAll: async (db) => {
        const rows = await db.query(
            'SELECT Imagen_InstalacionId, InstalacionId, Ruta_Imagen, Uuid_local, Sincronizado FROM Imagen_Instalacion'
        );
        return rows;
    },

    /**
     * Busca una imagen específica por su llave primaria (`Imagen_InstalacionId`).
     */
    findByPk: async (db, id) => {
        const rows = await db.query(
            'SELECT Imagen_InstalacionId, InstalacionId, Ruta_Imagen, Uuid_local, Sincronizado FROM Imagen_Instalacion WHERE Imagen_InstalacionId = ?',
            [id]
        );
        return rows[0];
    },

    /**
     * Obtiene todas las fotos asociadas a una instalación en particular (`InstalacionId`).
     */
    findByInstalacion: async (db, instalacionId) => {
        return await db.query(
            'SELECT Imagen_InstalacionId, InstalacionId, Ruta_Imagen, Uuid_local, Sincronizado FROM Imagen_Instalacion WHERE InstalacionId = ?',
            [instalacionId]
        );
    },

    /**
     * Inserta una nueva imagen de instalación.
     * Si viene con `Uuid_local` (desde el modo Offline), primero verifica que no se haya
     * subido antes (idempotencia) para evitar duplicar fotos cuando la red es inestable.
     */
    create: async (db, data) => {
        const { InstalacionId, Ruta_Imagen, Uuid_local, Sincronizado } = data;
        if (Uuid_local) {
            const dup = await db.query(
                'SELECT Imagen_InstalacionId FROM Imagen_Instalacion WHERE Uuid_local = ? LIMIT 1',
                [Uuid_local]
            );
            if (dup.length > 0) {
                return await Imagen_Instalacion.findByPk(db, dup[0].Imagen_InstalacionId);
            }
        }
        const result = await db.query(
            'INSERT INTO Imagen_Instalacion (InstalacionId, Ruta_Imagen, Uuid_local, Sincronizado) VALUES (?, ?, ?, ?)',
            [
                InstalacionId,
                Ruta_Imagen,
                Uuid_local || null,
                Sincronizado !== undefined ? (Sincronizado ? 1 : 0) : 1
            ]
        );
        return await Imagen_Instalacion.findByPk(db, Number(result.insertId));
    },

    /**
     * Actualiza los datos de una imagen existente por su `Imagen_InstalacionId`.
     */
    update: async (db, id, data) => {
        const { InstalacionId, Ruta_Imagen, Uuid_local, Sincronizado } = data;
        const sets = [];
        const params = [];

        if (InstalacionId !== undefined) {
            sets.push('InstalacionId = ?');
            params.push(InstalacionId);
        }
        if (Ruta_Imagen !== undefined) {
            sets.push('Ruta_Imagen = ?');
            params.push(Ruta_Imagen);
        }
        if (Uuid_local !== undefined) {
            sets.push('Uuid_local = ?');
            params.push(Uuid_local);
        }
        if (Sincronizado !== undefined) {
            sets.push('Sincronizado = ?');
            params.push(Sincronizado ? 1 : 0);
        }

        if (sets.length > 0) {
            params.push(id);
            await db.query(
                `UPDATE Imagen_Instalacion SET ${sets.join(', ')} WHERE Imagen_InstalacionId = ?`,
                params
            );
        }
        return await Imagen_Instalacion.findByPk(db, id);
    },

    /**
     * Elimina físicamente una imagen de la base de datos.
     */
    remove: async (db, id) => {
        const result = await db.query('DELETE FROM Imagen_Instalacion WHERE Imagen_InstalacionId = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Imagen_Instalacion;