const Infraestructura = require('../model/infraestructura');

/**
 * ============================================================================
 * CONTROLADOR DE INFRAESTRUCTURA (infraestructuraController.js)
 * ============================================================================
 * Administra los registros de la tabla `Infraestructura`, que relacionan
 * el tipo de tecnología (`Fibra` o `Antena`) con una OLT o una Torre.
 */

/** Lista todos los registros de infraestructura (opcionalmente filtrados por `?tipo=Fibra|Antena`) */
const getAll = async (req, res) => {
    try {
        const items = await Infraestructura.findAll(req.db, req.query.tipo || null);
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Obtiene un registro de infraestructura por su ID */
const getById = async (req, res) => {
    try {
        const item = await Infraestructura.findByPk(req.db, req.params.id);
        if (!item) return res.status(404).json({ error: 'Infraestructura no encontrada' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Crea o reutiliza una combinación de infraestructura (Tipo + OLTId/TorreId) */
const create = async (req, res) => {
    try {
        const item = await Infraestructura.create(req.db, req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Actualiza un registro de infraestructura existente */
const update = async (req, res) => {
    try {
        const exist = await Infraestructura.findByPk(req.db, req.params.id);
        if (!exist) return res.status(404).json({ error: 'Infraestructura no encontrada' });

        const updated = await Infraestructura.update(req.db, req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Elimina un registro de infraestructura por su ID */
const remove = async (req, res) => {
    try {
        const deleted = await Infraestructura.remove(req.db, req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Infraestructura no encontrada' });
        res.json({ message: 'Infraestructura eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAll, getById, create, update, remove };
