const Localidad = require('../model/localidad');

/**
 * ============================================================================
 * CONTROLADOR DE LOCALIDADES (localidadController.js)
 * ============================================================================
 * Gestiona el catálogo de localidades, municipios y códigos postales donde
 * se instalan los servicios de TravelNet.
 */

/** Obtiene todas las localidades registradas */
const getAll = async (req, res) => {
    try {
        const localidades = await Localidad.findAll(req.db);
        res.json(localidades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Obtiene una localidad específica por su ID */
const getById = async (req, res) => {
    try {
        const localidad = await Localidad.findByPk(req.db, req.params.id);
        if (!localidad) return res.status(404).json({ error: 'Localidad no encontrada' });
        res.json(localidad);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Crea una nueva localidad en la base de datos */
const create = async (req, res) => {
    try {
        const localidad = await Localidad.create(req.db, req.body);
        res.status(201).json(localidad);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Actualiza los datos de una localidad existente */
const update = async (req, res) => {
    try {
        const exist = await Localidad.findByPk(req.db, req.params.id);
        if (!exist) return res.status(404).json({ error: 'Localidad no encontrada' });

        const localidadUpdated = await Localidad.update(req.db, req.params.id, req.body);
        res.json(localidadUpdated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAll, getById, create, update };